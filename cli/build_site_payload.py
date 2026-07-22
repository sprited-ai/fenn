#!/usr/bin/env python3
"""Build the compact JSON payload that tenn.sprited.ai serves.

Reads data/portfolio.json (produced by `fenn sync`) and writes a summarized
payload: per-account balances plus positions aggregated by symbol. Run from
the cli/ directory:

    python build_site_payload.py [-o payload.json]
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

PORTFOLIO_DB = Path(__file__).parent.parent / "data" / "portfolio.json"


def _f(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def build_payload(portfolio: dict) -> dict:
    accounts_out = []
    by_symbol: dict = {}
    total_value = 0.0
    total_open_pnl = 0.0

    for account in portfolio.get("accounts", []):
        info = account.get("info", {})
        name = info.get("name", "Unknown")
        balance = _f(((info.get("balance") or {}).get("total") or {}).get("amount"))
        positions = account.get("positions", []) or []
        total_value += balance
        institution = info.get("institution_name") or ""
        accounts_out.append(
            {
                "name": name,
                "institution": institution,
                "balance": balance,
                "positions_count": len(positions),
            }
        )

        for pos in positions:
            if not isinstance(pos, dict):
                continue
            sym_wrap = pos.get("symbol") or {}
            sym = sym_wrap.get("symbol") or {}
            ticker = sym.get("symbol") or sym.get("raw_symbol")
            if not ticker:
                continue
            units = _f(pos.get("units")) or _f(pos.get("fractional_units"))
            price = pos.get("price")
            value = units * _f(price) if price is not None else 0.0
            open_pnl = pos.get("open_pnl")
            if open_pnl is not None:
                total_open_pnl += _f(open_pnl)
            avg_price = pos.get("average_purchase_price")

            agg = by_symbol.setdefault(
                ticker,
                {
                    "symbol": ticker,
                    "description": sym.get("description") or "",
                    "units": 0.0,
                    "price": _f(price) if price is not None else None,
                    "value": 0.0,
                    "open_pnl": None,
                    "cost_basis": None,
                    "avg_cost": None,
                    "accounts": [],
                    "institutions": [],
                },
            )
            agg["units"] += units
            agg["value"] += value
            if price is not None:
                agg["price"] = _f(price)
            if open_pnl is not None:
                agg["open_pnl"] = (agg["open_pnl"] or 0.0) + _f(open_pnl)
            if avg_price is not None and units:
                agg["cost_basis"] = (agg["cost_basis"] or 0.0) + _f(avg_price) * units
            if name not in agg["accounts"]:
                agg["accounts"].append(name)
            if institution and institution not in agg["institutions"]:
                agg["institutions"].append(institution)

    positions_out = sorted(by_symbol.values(), key=lambda x: -x["value"])
    total_cost_basis = 0.0
    for p in positions_out:
        if p["cost_basis"] is not None:
            p["cost_basis"] = round(p["cost_basis"], 2)
            total_cost_basis += p["cost_basis"]
            if p["units"]:
                p["avg_cost"] = round(p["cost_basis"] / p["units"], 4)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "synced_at": portfolio.get("synced_at"),
        "total_value": round(total_value, 2),
        "total_open_pnl": round(total_open_pnl, 2),
        "total_cost_basis": round(total_cost_basis, 2),
        "accounts": accounts_out,
        "positions": positions_out,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-i", "--input", type=Path, default=PORTFOLIO_DB)
    parser.add_argument("-o", "--output", type=Path, help="Write to file instead of stdout")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"error: {args.input} not found — run `fenn sync` first", file=sys.stderr)
        return 1

    payload = build_payload(json.loads(args.input.read_text()))
    # Refuse to publish an empty snapshot — a silent upstream failure (e.g. an
    # SDK change) must fail the pipeline, not blank out the dashboard.
    if not payload["accounts"] or payload["total_value"] <= 0 or not payload["positions"]:
        print(
            f"error: empty/suspicious payload (accounts={len(payload['accounts'])}, "
            f"positions={len(payload['positions'])}) — refusing to publish",
            file=sys.stderr,
        )
        return 2
    out = json.dumps(payload, indent=1)
    if args.output:
        args.output.write_text(out)
        print(
            f"✓ payload: {len(payload['positions'])} symbols, "
            f"${payload['total_value']:,.0f} → {args.output}",
            file=sys.stderr,
        )
    else:
        print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())

# Introducing Fenn: Your Portfolio Housekeeper

**February 2026** • *Internal Development Preview*

Fenn is a portfolio aggregation tool that runs entirely on your Mac. No cloud, no subscriptions, no data leaving your machine.

## What Fenn Does

Three things:

1. **Connects** to your brokerages (Fidelity, Robinhood, E-Trade)
2. **Aggregates** all your holdings into a single view
3. **Caches** everything locally for instant access

That's it.

## Why Fenn Exists

If you have accounts across multiple brokerages, you know the problem:

- Fidelity shows your Fidelity holdings
- Robinhood shows your Robinhood holdings
- E-Trade shows your E-Trade holdings

But nobody shows you **everything**.

You end up:
- Opening multiple tabs
- Adding numbers manually
- Creating spreadsheets
- Losing track of what you actually own

Fenn solves this by giving you one command:

```bash
fenn portfolio
```

You see everything. Every account. Every symbol. Total allocation.

## Current State

Fenn works. Right now.

Connected accounts: **11 accounts across 3 brokerages**
- 5 Fidelity accounts
- 4 Robinhood accounts  
- 2 E-Trade accounts

Total tracked: **$2.79M** across **333 unique holdings**

### What Works

**Portfolio Viewing**
```bash
# See everything
fenn portfolio

# Group by account
fenn portfolio --by-account

# Force refresh
fenn portfolio --refresh
```

Output shows:
- Symbol
- Which broker(s) hold it
- Description
- Quantity
- Value
- Allocation %

**Smart Caching**

First run: fetches from all accounts (~50 seconds)
Same-day runs: instant from cache (~0.7 seconds)

70x faster.

**Error Handling**

Some accounts have weird data (looking at you, 401k plans). Fenn skips the bad positions and shows the rest.

**Read-Only**

Fenn never trades. Never modifies. Just reads and displays.

OAuth means it gets read-only tokens. Even if you wanted to trade, you couldn't.

## What It Looks Like

```
$ fenn portfolio

Using cached holdings from today...

=====================================================================
Symbol   Broker       Description                  Quantity      Value Allocation
=====================================================================
FNILX    Fidelity     Fidelity Concord Street   20782.301000 $507,503.79  18.17%
QQQ      E-Trade, Fid Invesco Capital Mgmt        447.773109 $271,089.42   9.70%
SPY      E-Trade, Fid SPDR S&P 500 ETF            267.369170 $184,028.86   6.58%
BRKB     Fidelity     Berkshire Hathaway B         340.281000 $169,099.24   6.05%
...
=====================================================================
TOTAL                                                        $2,791,967.31 100.00%
=====================================================================

Portfolio Summary:
  Total Holdings: 333 unique symbols
  Total Value: $2,791,967.31
```

Clean. Fast. Accurate.

## Technical Details

### Stack

- **Language**: Python 3.9+
- **API**: SnapTrade (broker aggregator)
- **Storage**: Local JSON files
- **Platform**: macOS only (for now)

### Architecture

```
Brokerages (Fidelity/Robinhood/E-Trade)
        ↓
    SnapTrade API
        ↓
    Fenn CLI
        ↓
Local Cache (data/holdings_cache.json)
```

Simple. No databases. No servers. No complexity.

### Key Decisions

**Why SnapTrade?**

Direct broker APIs are:
- Inconsistent
- Undocumented
- Rate-limited
- Change without notice

SnapTrade normalizes everything. One API, all brokers.

**Why Local Storage?**

Your portfolio data is sensitive. Keeping it local means:
- No cloud breaches
- No company going under
- Complete ownership
- Works offline (after first fetch)

**Why CLI?**

GUIs are slow to build and maintain. CLI is:
- Fast to develop
- Easy to script
- Composable with other tools
- Exactly what the user (me) wants

There's a web frontend planned for `fenn.sprited.ai`, but CLI comes first.

## What's Next

### Immediate

- [ ] Add CSV export for holdings
- [ ] Cost basis tracking
- [ ] Historical snapshots comparison
- [ ] Performance calculations

### Future

- [ ] Linux support
- [ ] Web interface at fenn.sprited.ai
- [ ] Mobile view (read-only)
- [ ] Dividend tracking
- [ ] Tax lot inspection

### Not Planned

- Trading features (use your broker)
- Investment advice (get a professional)
- Social features (absolutely not)
- Cloud sync (defeats the purpose)

## Installation

Not public yet. Currently installed via:

```bash
cd cli
pip install -e .
```

Requires:
- SnapTrade API credentials
- Connected brokerage accounts
- macOS (Python 3.9+)

Future: Homebrew tap for easy installation.

## The Name

Fenn is older sister of Pixel, an energetic and lively free-minded spirit.

Fenn is a more responsible and mature spirit, who loves to count and organize things.

She is also CFO of Sprited.

The name comes from "Penelope" (Greek: weaver), reflecting the spirit's role in weaving together financial data.

## Status

**Current version**: 0.1.0  
**Status**: Working, but not public  
**URL**: fenn.sprited.ai (coming soon)

Fenn works for what it was built to do: give you a complete, accurate, instant view of your portfolio across all your brokerages.

Everything else is extra.

---

*This is an internal development blog post. Fenn is not yet ready for public release.*

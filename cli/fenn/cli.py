"""Command-line interface for Fenn"""
import json
import click
from datetime import datetime
from pathlib import Path

from .config import Config
from .snaptrade_client import SnapTradeClient


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """Fenn - Portfolio Download and Archive System
    
    Maintain an accurate local snapshot of your brokerage portfolio data.
    """
    pass


@cli.command()
def sync():
    """Download and sync portfolio data from all connected brokers"""
    try:
        Config.ensure_data_dir()
        
        # Initialize SnapTrade client
        client = SnapTradeClient()
        
        # Sync all data
        portfolio_data = client.sync_all_data()
        
        # Add timestamp
        portfolio_data["synced_at"] = datetime.utcnow().isoformat()
        
        # Save to file
        output_file = Config.PORTFOLIO_DB
        with open(output_file, 'w') as f:
            json.dump(portfolio_data, f, indent=2, default=str)
        
        print(f"\n✓ Portfolio data saved to {output_file}")
        
        # Display summary
        total_accounts = len(portfolio_data.get("accounts", []))
        print(f"\n📊 Summary:")
        print(f"  Accounts: {total_accounts}")
        
        for account in portfolio_data.get("accounts", []):
            account_info = account.get("info", {})
            account_name = account_info.get("name", "Unknown")
            positions = account.get("positions", [])
            print(f"  - {account_name}: {len(positions)} position(s)")
        
    except ValueError as e:
        click.echo(f"❌ Configuration error: {e}", err=True)
        click.echo("\nTo get started:", err=True)
        click.echo("1. Copy .env.example to .env", err=True)
        click.echo("2. Get API keys from https://dashboard.snaptrade.com/api-key", err=True)
        click.echo("3. Fill in your credentials in .env", err=True)
        raise click.Abort()
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        raise click.Abort()


@cli.command()
def status():
    """Show current portfolio status from local archive"""
    try:
        data_file = Config.PORTFOLIO_DB
        
        if not data_file.exists():
            click.echo("No portfolio data found. Run 'fenn sync' first.")
            return
        
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        synced_at = data.get("synced_at", "Unknown")
        accounts = data.get("accounts", [])
        connections = data.get("connections", [])
        
        click.echo(f"📊 Portfolio Status")
        click.echo(f"Last synced: {synced_at}")
        click.echo(f"Connections: {len(connections)}")
        click.echo(f"Accounts: {len(accounts)}")
        click.echo()
        
        for account in accounts:
            account_info = account.get("info", {})
            account_name = account_info.get("name", "Unknown")
            positions = account.get("positions", [])
            
            click.echo(f"Account: {account_name}")
            
            # Show balance - check both locations
            balance_info = account_info.get("balance", {})
            if balance_info:
                total = balance_info.get("total", {})
                if isinstance(total, dict) and total.get("amount") is not None:
                    amount = total.get("amount", 0)
                    currency = total.get("currency", "USD")
                    click.echo(f"  Balance: ${amount:,.2f} {currency}")
            
            click.echo(f"  Positions: {len(positions)}")
            
            # Show positions
            for position in positions[:5]:  # Show first 5
                if isinstance(position, dict):
                    symbol_info = position.get("symbol", {})
                    if isinstance(symbol_info, dict):
                        symbol = symbol_info.get("symbol", "Unknown")
                    else:
                        symbol = str(symbol_info)
                    
                    quantity = position.get("quantity", 0)
                    click.echo(f"    - {symbol}: {quantity}")
            
            if len(positions) > 5:
                click.echo(f"    ... and {len(positions) - 5} more")
            
            click.echo()
            
    except Exception as e:
        click.echo(f"❌ Error reading portfolio data: {e}", err=True)
        raise click.Abort()


@cli.command()
@click.option('--output', '-o', type=click.Path(), help='Output file path')
def export(output):
    """Export portfolio data to JSON"""
    try:
        data_file = Config.PORTFOLIO_DB
        
        if not data_file.exists():
            click.echo("No portfolio data found. Run 'fenn sync' first.")
            return
        
        if not output:
            output = f"portfolio_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        with open(output, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        click.echo(f"✓ Portfolio data exported to {output}")
        
    except Exception as e:
        click.echo(f"❌ Error exporting data: {e}", err=True)
        raise click.Abort()


def main():
    """Entry point for the CLI"""
    cli()


@cli.command()
@click.option('--by-account', '-a', is_flag=True, help='Group holdings by account')
@click.option('--refresh', '-r', is_flag=True, help='Fetch latest data from brokerages')
def portfolio(by_account, refresh):
    """Show aggregated portfolio holdings across all accounts"""
    try:
        from collections import defaultdict
        from decimal import Decimal
        from datetime import date
        
        client = SnapTradeClient()
        Config.ensure_data_dir()
        
        # Check cache
        holdings_cache_path = Config.DATA_DIR / 'holdings_cache.json'
        use_cache = False
        cached_data = None
        
        if not refresh and holdings_cache_path.exists():
            try:
                with open(holdings_cache_path, 'r') as f:
                    cached_data = json.load(f)
                    cache_date = datetime.fromisoformat(cached_data.get('cached_at', '')).date()
                    if cache_date == date.today():
                        use_cache = True
                        click.echo("Using cached holdings from today...")
            except (json.JSONDecodeError, ValueError, KeyError):
                pass
        
        if use_cache:
            aggregated = {k: {**v, 'total_quantity': Decimal(str(v['total_quantity'])), 
                              'total_value': Decimal(str(v['total_value'])),
                              'brokers': set(v.get('brokers', []))}
                          for k, v in cached_data['holdings'].items()}
            total_portfolio_value = Decimal(str(cached_data['total_value']))
            accounts_with_errors = cached_data.get('errors', [])
        else:
            if refresh:
                click.echo("Fetching latest holdings from brokerages...")
            else:
                click.echo("Fetching holdings from all accounts...")
        
            # Get all accounts
            accounts = client.get_all_accounts()
            
            if not accounts:
                click.echo("No accounts found")
                return
            
            # Parse holdings data
            aggregated = defaultdict(lambda: {
                'symbol': '',
                'description': '',
                'total_quantity': Decimal('0'),
                'total_value': Decimal('0'),
                'accounts': [],
                'brokers': set(),
                'currency': 'USD'
            })
            
            total_portfolio_value = Decimal('0')
            accounts_with_errors = []
            
            # Fetch holdings for each account
            for account in accounts:
                account_id = account.get('id')
                account_name = account.get('name', 'Unknown Account')
                institution_name = account.get('institution_name', 'Unknown')
                
                click.echo(f"  {account_name}...", nl=False)
                
                try:
                    # Use get_user_holdings which works reliably
                    response = client.client.account_information.get_user_holdings(
                        user_id=client.user_id,
                        user_secret=client.user_secret,
                        account_id=account_id
                    )
                    
                    # Extract holdings data
                    if hasattr(response, 'body'):
                        holdings_data = response.body
                        if hasattr(holdings_data, 'to_dict'):
                            holdings_data = holdings_data.to_dict()
                    elif hasattr(response, 'to_dict'):
                        holdings_data = response.to_dict().get('body', {})
                    else:
                        holdings_data = response
                    
                    # Get positions array
                    positions = holdings_data.get('positions', [])
                    positions_processed = 0
                    positions_skipped = 0
                    
                    for position in positions:
                        try:
                            # Handle both dict and object types
                            if hasattr(position, 'to_dict'):
                                pos = position.to_dict()
                            else:
                                pos = position
                            
                            # Extract symbol data
                            symbol_data = pos.get('symbol', {})
                            if isinstance(symbol_data, dict):
                                symbol_info = symbol_data.get('symbol', {})
                            else:
                                symbol_info = symbol_data
                            
                            if isinstance(symbol_info, dict):
                                symbol = symbol_info.get('symbol', 'UNKNOWN')
                                description = symbol_info.get('description', '')
                            else:
                                symbol = 'UNKNOWN'
                                description = ''
                            
                            # Get quantity and price with error handling - catch ALL exceptions
                            try:
                                quantity = Decimal(str(pos.get('units', 0)))
                            except Exception:
                                quantity = Decimal('0')
                            
                            try:
                                price = Decimal(str(pos.get('price', 0)))
                            except Exception:
                                price = Decimal('0')
                            
                            try:
                                avg_cost = Decimal(str(pos.get('average_purchase_price', 0)))
                            except Exception:
                                avg_cost = Decimal('0')
                            
                            # Calculate value
                            value = quantity * price
                            
                            # Aggregate by symbol
                            agg = aggregated[symbol]
                            agg['symbol'] = symbol
                            agg['description'] = description
                            agg['total_quantity'] += quantity
                            agg['total_value'] += value
                            agg['brokers'].add(institution_name)
                            agg['accounts'].append({
                                'account_id': account_id,
                                'account_name': account_name,
                                'quantity': float(quantity),
                                'price': float(price),
                                'avg_cost': float(avg_cost),
                                'value': float(value)
                            })
                            
                            # Track total
                            total_portfolio_value += value
                            positions_processed += 1
                            
                        except Exception as pos_error:
                            # Skip positions with bad data
                            positions_skipped += 1
                            continue
                    
                    # Report results
                    if positions_skipped > 0:
                        click.echo(f" {positions_processed} positions ({positions_skipped} skipped)")
                    else:
                        click.echo(f" {positions_processed} positions")
                        
                except Exception as e:
                    click.echo(f" ERROR: {e}")
                    accounts_with_errors.append(account_name)
                    continue
            
            # Save to cache (after all accounts processed)
            cache_data = {
                'cached_at': datetime.now().isoformat(),
                'total_value': float(total_portfolio_value),
                'holdings': {k: {**v, 'total_quantity': float(v['total_quantity']),
                                  'total_value': float(v['total_value']),
                                  'brokers': list(v['brokers'])}
                            for k, v in aggregated.items()},
                'errors': accounts_with_errors
            }
            with open(holdings_cache_path, 'w') as f:
                json.dump(cache_data, f, indent=2)
        
        click.echo()
        
        # Display results
        if by_account:
            # Group by account
            accounts_data = defaultdict(lambda: {'holdings': [], 'total': Decimal('0')})
            
            for symbol, data in aggregated.items():
                for acct in data['accounts']:
                    account_name = acct['account_name']
                    accounts_data[account_name]['holdings'].append({
                        'symbol': symbol,
                        'description': data['description'],
                        'quantity': acct['quantity'],
                        'price': acct['price'],
                        'value': acct['value']
                    })
                    accounts_data[account_name]['total'] += Decimal(str(acct['value']))
            
            # Display each account
            for account_name, account_data in sorted(accounts_data.items()):
                click.echo(f"\n{account_name}")
                click.echo("-" * 100)
                click.echo(f"{'Symbol':<8} {'Description':<40} {'Quantity':>15} {'Price':>12} {'Value':>15}")
                click.echo("-" * 100)
                
                for holding in sorted(account_data['holdings'], key=lambda x: x['value'], reverse=True):
                    desc = holding['description'][:40] if len(holding['description']) > 40 else holding['description']
                    click.echo(f"{holding['symbol']:<8} {desc:<40} {holding['quantity']:>15.6f} ${holding['price']:>11,.2f} ${holding['value']:>14,.2f}")
                
                click.echo("-" * 100)
                click.echo(f"{'Account Total:':<49} ${float(account_data['total']):>14,.2f}")
        else:
            # Display aggregated view
            click.echo("=" * 135)
            click.echo(f"{'Symbol':<8} {'Broker':<12} {'Description':<35} {'Quantity':>15} {'Value':>15} {'Allocation':>10}")
            click.echo("=" * 135)
            
            # Sort by value descending
            sorted_holdings = sorted(aggregated.items(), key=lambda x: x[1]['total_value'], reverse=True)
            
            for symbol, data in sorted_holdings:
                quantity = data['total_quantity']
                value = data['total_value']
                allocation = (value / total_portfolio_value * 100) if total_portfolio_value > 0 else Decimal('0')
                
                desc = data['description'][:35] if len(data['description']) > 35 else data['description']
                brokers = ', '.join(sorted(data['brokers']))[:12] if data['brokers'] else ''
                
                click.echo(f"{symbol:<8} {brokers:<12} {desc:<35} {float(quantity):>15.6f} ${float(value):>14,.2f} {float(allocation):>9.2f}%")
            
            click.echo("=" * 135)
            click.echo(f"{'TOTAL':<8} {'':12} {'':35} {'':>15} ${float(total_portfolio_value):>14,.2f} {'100.00%':>10}")
            click.echo("=" * 135)
        
        # Summary
        click.echo()
        click.echo(f"Portfolio Summary:")
        click.echo(f"  Total Holdings: {len(aggregated)} unique symbols")
        click.echo(f"  Total Value: ${float(total_portfolio_value):,.2f}")
        
        if accounts_with_errors:
            click.echo()
            click.echo(f"⚠️  Errors fetching {len(accounts_with_errors)} account(s): {', '.join(accounts_with_errors)}")
        
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        import traceback
        traceback.print_exc()
        raise click.Abort()


@cli.command()
@click.argument('chart_type', type=click.Choice(['allocation', 'top-holdings', 'by-broker', 'concentration'], case_sensitive=False))
@click.option('--top', '-t', default=10, help='Number of top holdings to show (for allocation/top-holdings)')
@click.option('--output', '-o', help='Output file path (default: temp file)')
@click.option('--no-browser', is_flag=True, help="Don't auto-open in browser")
def plot(chart_type, top, output, no_browser):
    """Generate portfolio visualization charts
    
    Chart types:
      allocation      - Donut chart of top holdings
      top-holdings    - Bar chart of largest positions
      by-broker       - Treemap of broker distribution
      concentration   - Cumulative allocation curve
    """
    try:
        from decimal import Decimal
        from datetime import date
        from .plotting import (
            create_allocation_chart,
            create_top_holdings_chart,
            create_broker_distribution_chart,
            create_concentration_chart,
            save_and_open_chart
        )
        
        client = SnapTradeClient()
        Config.ensure_data_dir()
        
        # Load data from cache
        holdings_cache_path = Config.DATA_DIR / 'holdings_cache.json'
        
        if not holdings_cache_path.exists():
            click.echo("No portfolio data found. Run 'fenn portfolio' first to fetch data.")
            raise click.Abort()
        
        try:
            with open(holdings_cache_path, 'r') as f:
                cached_data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            click.echo(f"Error reading cache: {e}")
            click.echo("Run 'fenn portfolio --refresh' to fetch fresh data.")
            raise click.Abort()
        
        # Convert cached data back to proper types
        aggregated = {k: {**v, 'total_quantity': Decimal(str(v['total_quantity'])), 
                          'total_value': Decimal(str(v['total_value'])),
                          'brokers': set(v.get('brokers', []))}
                      for k, v in cached_data['holdings'].items()}
        total_portfolio_value = Decimal(str(cached_data['total_value']))
        
        if not aggregated:
            click.echo("No holdings data found.")
            raise click.Abort()
        
        click.echo(f"Generating {chart_type} chart...")
        
        # Create the appropriate chart
        if chart_type == 'allocation':
            fig = create_allocation_chart(aggregated, total_portfolio_value, top_n=top)
        elif chart_type == 'top-holdings':
            fig = create_top_holdings_chart(aggregated, limit=top)
        elif chart_type == 'by-broker':
            fig = create_broker_distribution_chart(aggregated)
        elif chart_type == 'concentration':
            fig = create_concentration_chart(aggregated, total_portfolio_value)
        else:
            click.echo(f"Unknown chart type: {chart_type}")
            raise click.Abort()
        
        # Save and optionally open
        output_path = save_and_open_chart(fig, output_path=output, auto_open=not no_browser)
        
        click.echo(f"✓ Chart saved to: {output_path}")
        if not no_browser:
            click.echo("✓ Opening in browser...")
        
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        import traceback
        traceback.print_exc()
        raise click.Abort()


if __name__ == "__main__":
    main()

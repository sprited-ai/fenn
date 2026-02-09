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
            balances = account.get("balances", {})
            positions = account.get("positions", [])
            
            click.echo(f"Account: {account_name}")
            
            # Show balance if available
            if isinstance(balances, dict):
                total = balances.get("total", {})
                if isinstance(total, dict):
                    amount = total.get("amount", "N/A")
                    currency = total.get("currency", "")
                    click.echo(f"  Balance: {amount} {currency}")
            
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


if __name__ == "__main__":
    main()

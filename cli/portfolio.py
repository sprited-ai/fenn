#!/usr/bin/env python3
"""Portfolio aggregator - shows consolidated view across all accounts"""
from fenn.snaptrade_client import SnapTradeClient
from collections import defaultdict
from decimal import Decimal
import json


def get_aggregated_portfolio(client):
    """Fetch and aggregate holdings across all accounts"""
    print("Fetching holdings from all accounts...")
    
    try:
        # Get all accounts
        accounts = client.get_all_accounts()
        
        if not accounts:
            print("No accounts found")
            return None
        
        # Parse holdings data
        aggregated = defaultdict(lambda: {
            'symbol': '',
            'description': '',
            'total_quantity': Decimal('0'),
            'total_value': Decimal('0'),
            'accounts': [],
            'currency': 'USD'
        })
        
        total_portfolio_value = Decimal('0')
        
        # Fetch holdings for each account
        for account in accounts:
            account_id = account.get('id')
            account_name = account.get('name', 'Unknown Account')
            
            print(f"  Fetching {account_name}...")
            
            try:
                # Use get_user_holdings which works (not get_user_account_positions which hangs)
                response = client.client.account_information.get_user_holdings(
                    user_id=client.user_id,
                    user_secret=client.user_secret,account_id=account_id
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
                
                for position in positions:
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
                    
                    # Get quantity and price
                    try:
                        quantity = Decimal(str(pos.get('units', 0)))
                    except (ValueError, TypeError):
                        quantity = Decimal('0')
                    
                    try:
                        price = Decimal(str(pos.get('price', 0)))
                    except (ValueError, TypeError):
                        price = Decimal('0')
                    
                    try:
                        avg_cost = Decimal(str(pos.get('average_purchase_price', 0)))
                    except (ValueError, TypeError):
                        avg_cost = Decimal('0')
                    
                    # Calculate value
                    value = quantity * price
                    
                    # Aggregate by symbol
                    agg = aggregated[symbol]
                    agg['symbol'] = symbol
                    agg['description'] = description
                    agg['total_quantity'] += quantity
                    agg['total_value'] += value
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
                    
            except Exception as e:
                print(f"    Error fetching holdings for {account_name}: {e}")
                continue
        
        return {
            'holdings': dict(aggregated),
            'total_value': float(total_portfolio_value),
            'currency': 'USD'
        }
        
    except Exception as e:
        print(f"Error fetching holdings: {e}")
        import traceback
        traceback.print_exc()
        return None


def display_portfolio(portfolio_data):
    """Display aggregated portfolio in readable format"""
    if not portfolio_data:
        print("No portfolio data to display")
        return
    
    holdings = portfolio_data['holdings']
    total_value = Decimal(str(portfolio_data['total_value']))
    
    if not holdings:
        print("No holdings found")
        return
    
    print("\n" + "="*100)
    print(f"{'Symbol':<8} {'Description':<40} {'Quantity':>15} {'Value':>15} {'Allocation':>10}")
    print("="*100)
    
    # Sort by value descending
    sorted_holdings = sorted(holdings.items(), key=lambda x: x[1]['total_value'], reverse=True)
    
    for symbol, data in sorted_holdings:
        quantity = data['total_quantity']
        value = data['total_value']
        allocation = (value / total_value * 100) if total_value > 0 else Decimal('0')
        
        desc = data['description'][:40] if len(data['description']) > 40 else data['description']
        
        print(f"{symbol:<8} {desc:<40} {float(quantity):>15.6f} ${float(value):>14,.2f} {float(allocation):>9.2f}%")
    
    print("="*100)
    print(f"{'TOTAL':<8} {'':40} {'':>15} ${float(total_value):>14,.2f} {'100.00%':>10}")
    print("="*100)
    print()


def display_by_account(portfolio_data):
    """Display portfolio grouped by account"""
    if not portfolio_data:
        return
    
    holdings = portfolio_data['holdings']
    
    # Group by account
    accounts_data = defaultdict(lambda: {'holdings': [], 'total': Decimal('0')})
    
    for symbol, data in holdings.items():
        for account in data['accounts']:
            account_name = account['account_name']
            accounts_data[account_name]['holdings'].append({
                'symbol': symbol,
                'description': data['description'],
                'quantity': account['quantity'],
                'price': account['price'],
                'value': account['value']
            })
            accounts_data[account_name]['total'] += Decimal(str(account['value']))
    
    # Display each account
    for account_name, account_data in sorted(accounts_data.items()):
        print(f"\n{account_name}")
        print("-" * 100)
        print(f"{'Symbol':<8} {'Description':<40} {'Quantity':>15} {'Price':>12} {'Value':>15}")
        print("-" * 100)
        
        for holding in sorted(account_data['holdings'], key=lambda x: x['value'], reverse=True):
            desc = holding['description'][:40] if len(holding['description']) > 40 else holding['description']
            print(f"{holding['symbol']:<8} {desc:<40} {holding['quantity']:>15.6f} ${holding['price']:>11,.2f} ${holding['value']:>14,.2f}")
        
        print("-" * 100)
        print(f"{'Account Total:':<49} ${float(account_data['total']):>14,.2f}")
        print()


def main():
    import sys
    
    client = SnapTradeClient()
    
    # Determine display mode
    by_account = '--by-account' in sys.argv or '-a' in sys.argv
    
    # Fetch portfolio
    portfolio = get_aggregated_portfolio(client)
    
    if portfolio:
        if by_account:
            display_by_account(portfolio)
        else:
            display_portfolio(portfolio)
        
        # Show summary
        print(f"\nPortfolio Summary:")
        print(f"  Total Holdings: {len(portfolio['holdings'])} unique symbols")
        print(f"  Total Value: ${portfolio['total_value']:,.2f}")
    else:
        print("Failed to fetch portfolio data")


if __name__ == '__main__':
    main()

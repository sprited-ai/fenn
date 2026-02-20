"""Test if positions are being returned by SnapTrade API"""
from fenn.snaptrade_client import SnapTradeClient
import json

client = SnapTradeClient()
accounts = client.get_all_accounts()

# Try to get positions for first account with balance
for account in accounts:
    account_id = account.get('id')
    account_name = account.get('name', 'Unknown')
    balance = account.get('balance', {}).get('total', {}).get('amount', 0)
    
    if balance > 0:
        print(f'\nChecking positions for: {account_name} (${balance:,.2f})')
        print(f'Account ID: {account_id}')
        positions = client.get_account_positions(account_id)
        print(f'Positions returned: {len(positions)}')
        if positions:
            print('\nFirst few positions:')
            print(json.dumps(positions[:3], indent=2, default=str))
        else:
            print('No positions data returned from API')
        break

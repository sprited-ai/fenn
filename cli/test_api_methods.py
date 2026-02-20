#!/usr/bin/env python3
"""Quick test to explore SnapTrade account info methods"""
from fenn.snaptrade_client import SnapTradeClient

client = SnapTradeClient()

print("Available methods on account_information:")
methods = [m for m in dir(client.client.account_information) if not m.startswith('_')]
for method in sorted(methods):
    print(f"  - {method}")

# Try get_user_holdings
print("\n\nTesting get_user_holdings...")
try:
    accounts = client.get_all_accounts()
    if accounts:
        account_id = accounts[0]['id']
        account_name = accounts[0].get('name', 'Unknown')
        print(f"Using account: {account_name} (ID: {account_id})")
        
        holdings = client.client.account_information.get_user_holdings(
            user_id=client.user_id,
            user_secret=client.user_secret,
            account_id=account_id
        )
        
        print(f"\nResponse type: {type(holdings)}")
        
        if hasattr(holdings, 'to_dict'):
            holdings_dict = holdings.to_dict()
        elif hasattr(holdings, '__dict__'):
            holdings_dict = holdings.__dict__
        else:
            holdings_dict = holdings
        
        import json
        print(f"Holdings structure:")
        print(json.dumps(holdings_dict, indent=2, default=str))
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

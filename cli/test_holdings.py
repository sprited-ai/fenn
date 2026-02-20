"""Test holdings endpoint instead of positions"""
from fenn.snaptrade_client import SnapTradeClient
import json

client = SnapTradeClient()

print("Testing get_all_user_holdings...")
try:
    response = client.client.account_information.get_all_user_holdings(
        user_id=client.user_id,
        user_secret=client.user_secret
    )
    
    print(f"\nResponse type: {type(response)}")
    
    if isinstance(response, list):
        print(f"Number of holdings: {len(response)}")
        if response:
            print("\nFirst few holdings:")
            for holding in response[:5]:
                if hasattr(holding, 'to_dict'):
                    h = holding.to_dict()
                else:
                    h = holding
                print(json.dumps(h, indent=2, default=str))
                print()
    else:
        print("Response:")
        if hasattr(response, 'to_dict'):
            print(json.dumps(response.to_dict(), indent=2, default=str))
        else:
            print(json.dumps(response, indent=2, default=str))
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

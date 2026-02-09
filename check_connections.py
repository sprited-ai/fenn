"""Check SnapTrade connections and accounts"""
from fenn.snaptrade_client import SnapTradeClient
import json

def main():
    print("Checking SnapTrade connections...\n")
    
    client = SnapTradeClient()
    
    # Check connections
    print("=" * 60)
    print("CONNECTIONS (Brokerage Authorizations)")
    print("=" * 60)
    try:
        connections = client.list_connections()
        print(f"Found {len(connections)} connection(s)\n")
        
        if connections:
            for i, conn in enumerate(connections, 1):
                print(f"Connection {i}:")
                print(json.dumps(conn, indent=2, default=str))
                print()
        else:
            print("No connections found.")
    except Exception as e:
        print(f"Error getting connections: {e}")
    
    # Check accounts
    print("\n" + "=" * 60)
    print("ACCOUNTS")
    print("=" * 60)
    try:
        accounts = client.get_all_accounts()
        print(f"Found {len(accounts)} account(s)\n")
        
        if accounts:
            for i, account in enumerate(accounts, 1):
                print(f"Account {i}:")
                print(json.dumps(account, indent=2, default=str))
                print()
        else:
            print("No accounts found.")
            print("\nIf you just connected Robinhood, try:")
            print("1. Wait a few minutes for sync")
            print("2. Get a new connection URL: python get_connection_url.py")
            print("3. Check SnapTrade dashboard: https://dashboard.snaptrade.com")
    except Exception as e:
        print(f"Error getting accounts: {e}")

if __name__ == "__main__":
    main()

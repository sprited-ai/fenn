"""Debug SnapTrade user and connection info"""
from fenn.config import Config
from snaptrade_client import SnapTrade

def main():
    Config.validate()
    
    client = SnapTrade(
        consumer_key=Config.SNAPTRADE_CONSUMER_KEY,
        client_id=Config.SNAPTRADE_CLIENT_ID
    )
    
    print("SnapTrade Debug Info")
    print("=" * 60)
    
    # List all users
    print("\n1. Listing all users under this API key:")
    try:
        users = client.authentication.list_snap_trade_users()
        if users:
            print(f"   Found {len(users)} user(s):")
            for user in users:
                if hasattr(user, 'to_dict'):
                    print(f"   - {user.to_dict()}")
                else:
                    print(f"   - {user}")
        else:
            print("   No users found")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Check current user
    print(f"\n2. Current user from .env:")
    print(f"   SNAPTRADE_USER_ID: {Config.SNAPTRADE_USER_ID}")
    print(f"   SNAPTRADE_USER_SECRET: {Config.SNAPTRADE_USER_SECRET[:8]}...")
    
    # Try to get connections for current user
    print(f"\n3. Checking connections for user '{Config.SNAPTRADE_USER_ID}':")
    try:
        connections = client.connections.list_brokerage_authorizations(
            user_id=Config.SNAPTRADE_USER_ID,
            user_secret=Config.SNAPTRADE_USER_SECRET
        )
        print(f"   Found {len(connections) if connections else 0} connection(s)")
        if connections:
            for conn in connections:
                print(f"   - {conn}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Get a new connection URL
    print(f"\n4. Generate fresh connection URL:")
    try:
        response = client.authentication.login_snap_trade_user(
            user_id=Config.SNAPTRADE_USER_ID,
            user_secret=Config.SNAPTRADE_USER_SECRET
        )
        if hasattr(response, 'body') and isinstance(response.body, dict):
            url = response.body.get('redirectURI')
        elif isinstance(response, dict):
            url = response.get('redirectURI')
        else:
            url = None
        
        if url:
            print(f"\n   🔗 Connection URL:")
            print(f"   {url}")
        else:
            print(f"   Response: {response}")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    main()

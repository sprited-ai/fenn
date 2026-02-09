"""Test SnapTrade API connection"""
from fenn.config import Config
from fenn.snaptrade_client import SnapTradeClient

def test_connection():
    """Test SnapTrade API connection"""
    print("Testing SnapTrade API connection...")
    
    try:
        # Validate config
        Config.validate()
        print("✓ Configuration valid")
        
        # Initialize client
        client = SnapTradeClient()
        print("✓ Client initialized")
        
        # Ensure user exists (this validates API connectivity)
        user_info = client.ensure_user()
        print(f"✓ User registered: {user_info['user_id']}")
        
        # List connections
        connections = client.list_connections()
        print(f"✓ Connections found: {len(connections)}")
        
        if connections:
            print("\nConnected brokers:")
            for conn in connections:
                if isinstance(conn, dict):
                    name = conn.get('brokerage', {}).get('name', 'Unknown')
                    status = conn.get('status', 'Unknown')
                    print(f"  - {name} ({status})")
        else:
            print("\n⚠️  No brokers connected yet.")
            print("   Run: python get_connection_url.py")
            print("   to get a URL for connecting your brokers.")
        
        print("\n✅ SnapTrade API connection successful!")
        return 0
        
    except ValueError as e:
        print(f"\n❌ Configuration error: {e}")
        print("\nTo fix:")
        print("1. Copy .env.example to .env")
        print("2. Get API keys from https://dashboard.snaptrade.com/api-key")
        print("3. Fill in your credentials in .env")
        return 1
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1

if __name__ == "__main__":
    exit(test_connection())

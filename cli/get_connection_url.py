"""Helper script to get SnapTrade connection portal URL"""
from fenn.config import Config
from fenn.snaptrade_client import SnapTradeClient

def main():
    """Generate a connection portal URL"""
    try:
        Config.validate()
        
        client = SnapTradeClient()
        
        # Ensure user exists
        user_info = client.ensure_user()
        print(f"✓ User configured: {user_info['user_id']}")
        
        # Generate connection portal URL
        response = client.client.authentication.login_snap_trade_user(
            user_id=client.user_id,
            user_secret=client.user_secret
        )
        
        # Extract URL from response
        url = None
        if hasattr(response, 'redirect_uri'):
            url = response.redirect_uri
        elif hasattr(response, 'body') and isinstance(response.body, dict):
            url = response.body.get('redirectURI')
        elif isinstance(response, dict):
            url = response.get('redirectURI') or response.get('redirect_uri')
        
        if not url:
            print(f"Raw response: {response}")
            raise ValueError("Could not extract redirect URL from response")
        
        print("\n🔗 Connection Portal URL:")
        print(url)
        print("\nOpen this URL in your browser to connect your brokerage accounts.")
        print("Supported brokers: Fidelity, Robinhood, E-Trade, and more.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

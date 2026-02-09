"""SnapTrade client wrapper for Fenn"""
import json
from typing import Dict, List, Any
from snaptrade_client import SnapTrade
from snaptrade_client.models import UserIDandSecret

from .config import Config


class SnapTradeClient:
    """Wrapper around SnapTrade SDK"""
    
    def __init__(self):
        Config.validate()
        
        self.client = SnapTrade(
            consumer_key=Config.SNAPTRADE_CONSUMER_KEY,
            client_id=Config.SNAPTRADE_CLIENT_ID
        )
        self.user_id = Config.SNAPTRADE_USER_ID
        self.user_secret = Config.SNAPTRADE_USER_SECRET
    
    def ensure_user(self) -> Dict[str, str]:
        """Ensure SnapTrade user exists, creating if necessary"""
        # If we already have user_secret from config, use it
        if self.user_secret:
            return {
                "user_id": self.user_id,
                "user_secret": self.user_secret
            }
        
        # Otherwise, try to register a new user
        try:
            response = self.client.authentication.register_snap_trade_user(
                body={"userId": self.user_id}
            )
            
            if isinstance(response, UserIDandSecret):
                self.user_secret = response.user_secret
                print(f"\n⚠️  IMPORTANT: Save this user_secret to your .env file:")
                print(f"SNAPTRADE_USER_SECRET={response.user_secret}")
                return {
                    "user_id": response.user_id,
                    "user_secret": response.user_secret
                }
            else:
                # Handle dict response
                self.user_secret = response.get("userSecret")
                print(f"\n⚠️  IMPORTANT: Save this user_secret to your .env file:")
                print(f"SNAPTRADE_USER_SECRET={self.user_secret}")
                return {
                    "user_id": response.get("userId"),
                    "user_secret": response.get("userSecret")
                }
        except Exception as e:
            error_str = str(e)
            
            if "already exist" in error_str.lower():
                raise ValueError(
                    f"User '{self.user_id}' already exists but SNAPTRADE_USER_SECRET is not in .env. \n"
                    f"Please add the user_secret to your .env file or use a different SNAPTRADE_USER_ID."
                )
            
            print(f"Error ensuring user: {e}")
            raise
    
    def list_connections(self) -> List[Dict[str, Any]]:
        """List all brokerage connections for the user"""
        if not self.user_secret:
            self.ensure_user()
        
        try:
            response = self.client.connections.list_brokerage_authorizations(
                user_id=self.user_id,
                user_secret=self.user_secret
            )
            
            # Handle ApiResponseFor200 objects
            if hasattr(response, 'body'):
                data = response.body
            else:
                data = response
            
            # Convert to list if it's a list-like object
            if isinstance(data, list):
                return data
            elif hasattr(data, '__iter__') and not isinstance(data, (str, dict)):
                return list(data)
            
            return []
        except Exception as e:
            print(f"Error listing connections: {e}")
            return []
    
    def get_all_accounts(self) -> List[Dict[str, Any]]:
        """Get all accounts across all connections"""
        if not self.user_secret:
            self.ensure_user()
        
        try:
            response = self.client.account_information.list_user_accounts(
                user_id=self.user_id,
                user_secret=self.user_secret
            )
            
            # Handle ApiResponseFor200 objects
            if hasattr(response, 'body'):
                data = response.body
            else:
                data = response
            
            accounts = []
            if isinstance(data, list):
                for account in data:
                    if hasattr(account, 'to_dict'):
                        accounts.append(account.to_dict())
                    elif isinstance(account, dict):
                        accounts.append(account)
                    else:
                        accounts.append(str(account))
            elif hasattr(data, '__iter__') and not isinstance(data, (str, dict)):
                for account in data:
                    if hasattr(account, 'to_dict'):
                        accounts.append(account.to_dict())
                    elif isinstance(account, dict):
                        accounts.append(account)
                    else:
                        accounts.append(str(account))
            
            return accounts
        except Exception as e:
            print(f"Error getting accounts: {e}")
            return []
    
    def get_account_balances(self, account_id: str) -> Dict[str, Any]:
        """Get balance information for a specific account"""
        if not self.user_secret:
            self.ensure_user()
        
        try:
            response = self.client.account_information.get_user_account_balance(
                user_id=self.user_id,
                user_secret=self.user_secret,
                account_id=account_id
            )
            
            if hasattr(response, 'to_dict'):
                return response.to_dict()
            return response if isinstance(response, dict) else {}
        except Exception as e:
            print(f"Error getting balance for account {account_id}: {e}")
            return {}
    
    def get_account_positions(self, account_id: str) -> List[Dict[str, Any]]:
        """Get positions for a specific account"""
        if not self.user_secret:
            self.ensure_user()
        
        try:
            response = self.client.account_information.get_user_account_positions(
                user_id=self.user_id,
                user_secret=self.user_secret,
                account_id=account_id
            )
            
            positions = []
            if isinstance(response, list):
                for position in response:
                    if hasattr(position, 'to_dict'):
                        positions.append(position.to_dict())
                    else:
                        positions.append(position)
            
            return positions
        except Exception as e:
            print(f"Error getting positions for account {account_id}: {e}")
            return []
    
    def sync_all_data(self) -> Dict[str, Any]:
        """Sync all portfolio data from all connected brokers"""
        print("🔄 Syncing portfolio data...")
        
        # Ensure user exists
        user_info = self.ensure_user()
        print(f"✓ User configured: {user_info['user_id']}")
        
        # Get connections
        connections = self.list_connections()
        print(f"✓ Found {len(connections)} brokerage connection(s)")
        
        # Get all accounts
        accounts = self.get_all_accounts()
        print(f"✓ Found {len(accounts)} account(s)")
        
        # Get detailed data for each account
        portfolio_data = {
            "user": user_info,
            "connections": connections,
            "accounts": []
        }
        
        for account in accounts:
            account_id = account.get("id") if isinstance(account, dict) else getattr(account, "id", None)
            
            if account_id:
                print(f"  Syncing account: {account_id}")
                
                balances = self.get_account_balances(account_id)
                positions = self.get_account_positions(account_id)
                
                portfolio_data["accounts"].append({
                    "info": account,
                    "balances": balances,
                    "positions": positions
                })
        
        return portfolio_data

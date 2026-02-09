"""Configuration management for Fenn"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Application configuration"""
    
    # SnapTrade API credentials
    SNAPTRADE_CLIENT_ID = os.getenv("SNAPTRADE_CLIENT_ID")
    SNAPTRADE_CONSUMER_KEY = os.getenv("SNAPTRADE_CONSUMER_KEY")
    SNAPTRADE_USER_ID = os.getenv("SNAPTRADE_USER_ID", "jin_portfolio")
    SNAPTRADE_USER_SECRET = os.getenv("SNAPTRADE_USER_SECRET")
    
    # Data storage
    DATA_DIR = Path("../data")
    PORTFOLIO_DB = DATA_DIR / "portfolio.json"
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        missing = []
        
        if not cls.SNAPTRADE_CLIENT_ID:
            missing.append("SNAPTRADE_CLIENT_ID")
        if not cls.SNAPTRADE_CONSUMER_KEY:
            missing.append("SNAPTRADE_CONSUMER_KEY")
            
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                f"Please copy .env.example to .env and fill in your credentials."
            )
    
    @classmethod
    def ensure_data_dir(cls):
        """Ensure data directory exists"""
        cls.DATA_DIR.mkdir(exist_ok=True)

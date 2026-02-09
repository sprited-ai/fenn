# Getting Started with Fenn

This guide will help you set up Fenn to download and archive your portfolio data from Fidelity, Robinhood, E-Trade, and other brokers.

## Step 1: Get SnapTrade API Keys

1. Go to [https://dashboard.snaptrade.com/home](https://dashboard.snaptrade.com/home)
2. Create a free account
3. Verify your email (required before creating API keys)
4. Navigate to [API Keys page](https://dashboard.snaptrade.com/api-key)
5. Click "Generate API Key"
6. Save your credentials:
   - **Client ID** (looks like: `YOUR_CLIENT_ID`)
   - **Consumer Key** (looks like: `YOUR_CONSUMER_KEY`)

⚠️ Keep your Consumer Key secure! It's sensitive information.

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your favorite editor
nano .env  # or: vim .env, code .env, etc.
```

Add your credentials to `.env`:

```bash
SNAPTRADE_CLIENT_ID=your_client_id_here
SNAPTRADE_CONSUMER_KEY=your_consumer_key_here
SNAPTRADE_USER_ID=jin_portfolio
```

## Step 3: Connect Your Brokers

### Generate Connection URL

```bash
python get_connection_url.py
```

This will output a URL like:
```
https://app.snaptrade.com/login/?token=...
```

### Connect Brokers

1. Open the URL in your browser
2. You'll see the SnapTrade connection portal
3. Click "Connect Brokerage"
4. Choose your broker (Fidelity, Robinhood, or E-Trade)
5. Log in with your broker credentials
6. Authorize SnapTrade to access your account data (read-only)
7. Repeat for each broker you want to connect

### Verify Connections

After connecting your brokers, verify they're linked:

```bash
python fenn.py sync
```

You should see output like:
```
🔄 Syncing portfolio data...
✓ User configured: jin_portfolio
✓ Found 2 brokerage connection(s)
✓ Found 3 account(s)
  Syncing account: acc_123...
  Syncing account: acc_456...

✓ Portfolio data saved to data/portfolio.json

📊 Summary:
  Accounts: 3
  - Robinhood Individual: 5 position(s)
  - Fidelity 401k: 12 position(s)
  - E-Trade Individual: 3 position(s)
```

## Step 4: Use Fenn

### Sync Portfolio Data

Download latest data from all connected brokers:

```bash
python fenn.py sync
```

### View Status

See your current portfolio summary:

```bash
python fenn.py status
```

### Export Data

Export to a timestamped JSON file:

```bash
python fenn.py export
```

Or specify an output file:

```bash
python fenn.py export -o my_portfolio.json
```

## Troubleshooting

### Missing Environment Variables

If you see:
```
❌ Configuration error: Missing required environment variables: SNAPTRADE_CLIENT_ID, SNAPTRADE_CONSUMER_KEY
```

Make sure:
1. You copied `.env.example` to `.env`
2. You filled in your actual API credentials (not placeholders)
3. You're running commands from the `/Users/jin/dev/fenn` directory

### No Connections Found

If `fenn sync` shows 0 connections:
1. Run `python get_connection_url.py` to get a new connection URL
2. Open the URL and connect your brokers
3. Try running `fenn sync` again

### API Errors

If you see SnapTrade API errors:
1. Verify your API credentials are correct
2. Check that your email is verified in the SnapTrade dashboard
3. Ensure you're using the free tier key (paid key is optional)

## Data Storage

All portfolio data is stored locally in `data/portfolio.json`. This file contains:
- Account information
- Current balances
- Holdings/positions
- Timestamp of last sync

The data directory is gitignored, so your financial data stays private.

## Security Best Practices

1. ✅ Never commit `.env` to git (already in .gitignore)
2. ✅ Don't share your Consumer Key
3. ✅ Keep your `data/` directory private
4. ✅ Use read-only SnapTrade access (no trading)
5. ✅ Regularly update your SnapTrade password

## Next Steps

- Set up a cron job or scheduled task to run `fenn sync` daily
- Build custom analysis tools using the JSON data
- Extend Fenn with SQLite storage for historical tracking
- Add reporting and visualization tools

## Resources

- [SnapTrade Documentation](https://docs.snaptrade.com/)
- [SnapTrade Python SDK](https://pypi.org/project/snaptrade-python-sdk/)
- [Fenn Portfolio Download Proposal](portfolio-download.md)

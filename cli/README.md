# Fenn - Number counting spirit

> Fenn is older sister of Pixel, an energetic and lively free-minded spirit. Fenn is a more responsible and mature spirit, who loves to count and organize things.

She is also CFO of Sprited.

## About the name

Penelope is a name of Greek origin, meaning "weaver". In Greek mythology, Penelope was the wife of Odysseus, known for her loyalty and cleverness. The name "Fenn" is derived from "Penelope", reflecting the spirit's role in weaving together financial data and insights.

---

## Portfolio Download and Archive System

Fenn maintains an accurate local snapshot of your brokerage portfolio data from Fidelity, Robinhood, E-Trade, and other brokers via SnapTrade.

**Purpose**: Read-only portfolio visibility and inspection. No trading, no modifications—just clean, reliable data.

**Platform**: macOS only

### Features

- 📊 Download portfolio data from multiple brokers
- 💾 Maintain local JSON archive with historical snapshots
- 🔍 Cross-broker portfolio view with aggregated holdings
- 📈 Real-time position values and portfolio allocations
- 📉 Interactive visualizations (allocation, top holdings, distribution, concentration)
- 🏦 See which brokers hold each symbol
- ⚡ Smart caching - fetches data once per day, instant on subsequent runs
- 🔒 Secure credential management via environment variables

## Installation

### Homebrew (Recommended)

```bash
brew tap sprited-ai/fenn
brew install fenn
```

### Manual Installation

See [INSTALL.md](../INSTALL.md) for alternative installation methods.

## Quick Start

### 1. Get SnapTrade API Keys

1. Create a free account at [SnapTrade Dashboard](https://dashboard.snaptrade.com/home)
2. Verify your email
3. Generate your API key from the [API Key page](https://dashboard.snaptrade.com/api-key)
4. You'll receive:
   - `clientId` (Client ID)
   - `consumerKey` (Consumer Key)

### 2. Configure Fenn

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials:
# SNAPTRADE_CLIENT_ID=your_client_id_here
# SNAPTRADE_CONSUMER_KEY=your_consumer_key_here
# SNAPTRADE_USER_ID=jin_portfolio
```

### 3. Connect Your Brokers

Since you're using the free tier, you'll need to connect your brokers through SnapTrade:

1. Run the first sync (it will create your user):
   ```bash
   fenn sync
   ```

2. Get your connection URL by using the SnapTrade dashboard or API
3. Open the connection portal and link Fidelity, Robinhood, and/or E-Trade
4. Run sync again to download your data

### 4. Use Fenn

```bash
# Download and sync portfolio data
fenn sync

# View current portfolio status
fenn status

# View aggregated portfolio (cached for the day)
fenn portfolio

# View portfolio grouped by account
fenn portfolio --by-account

# Force refresh holdings data
fenn portfolio --refresh

# Generate portfolio visualizations
fenn plot allocation              # Donut chart of top holdings
fenn plot top-holdings --top 20   # Bar chart of top 20 positions
fenn plot by-broker               # Treemap of broker distribution
fenn plot concentration           # Cumulative allocation curve

# Save chart to file
fenn plot allocation -o my-allocation.html --no-browser

# Export data to a file
fenn export -o my_portfolio.json
```

**Note**: The `portfolio` command caches holdings data for the current day. It will automatically fetch fresh data if:
- This is the first run of the day
- You use the `--refresh` flag
- The cache file doesn't exist

Example output:
```
$ fenn portfolio
Using cached holdings from today...

========================================================================
Symbol   Broker       Description                      Quantity    Value Allocation
========================================================================
FNILX    Fidelity     Fidelity Concord Street Trust  20782.301000 $507,503.79  18.17%
QQQ      E-Trade, Fid Invesco Capital Management       447.773109 $271,089.42   9.70%
SPY      E-Trade, Fid SPDR S&P 500 ETF Trust           267.369170 $184,028.86   6.58%
...
========================================================================
TOTAL                                                              $2,791,967.31 100.00%
========================================================================

Portfolio Summary:
  Total Holdings: 333 unique symbols
  Total Value: $2,791,967.31
```

### Adding Manual Holdings

Some positions may not be available through SnapTrade (e.g., ESPP shares, RSU accounts, private holdings). You can add these manually by editing `data/manual_holdings.json`:

```json
{
  "comment": "Manual portfolio holdings not tracked by SnapTrade",
  "holdings": [
    {
      "symbol": "AAPL",
      "description": "Apple Inc. - ESPP",
      "quantity": 125.5,
      "price": 263.39,
      "value": 33055.45,
      "account_name": "E*Trade Stock Plan",
      "institution_name": "E-Trade",
      "account_type": "ESPP",
      "notes": "Employee Stock Purchase Plan shares"
    }
  ]
}
```

**Field descriptions:**
- `symbol`: Stock ticker (required)
- `description`: Full position name (optional)
- `quantity`: Number of shares (required)
- `price`: Current price per share (optional, used to calculate value)
- `value`: Total position value (optional, calculated as quantity × price if not provided)
- `account_name`: Display name for the account (required)
- `institution_name`: Broker or institution name (required)
- `account_type`: Account type (e.g., ESPP, RSU, IRA) (optional)
- `notes`: Additional notes (optional)

Manual holdings are automatically merged with SnapTrade data when you run `fenn portfolio`. They will appear in all portfolio views and visualizations.

**Important**: Manual holdings are not cached. Update the JSON file whenever your positions change, and the changes will be reflected immediately on the next `fenn portfolio` run.

## Architecture

```
Broker APIs (Fidelity/Robinhood/E-Trade)
        ↓
    SnapTrade (Aggregator)
        ↓
    Fenn Sync Engine
        ↓
Local Portfolio Store (data/portfolio.json)
        ↓
Inspection & Reporting Tools
```

## Data Storage

Portfolio data is stored locally in:
- `data/portfolio.json` - Account metadata and connection info (synced via `fenn sync`)
- `data/holdings_cache.json` - Daily cached holdings data (refreshed daily or with `--refresh`)
- `data/manual_holdings.json` - Manual position entries not tracked by SnapTrade (optional, user-edited)

Portfolio structure:
```json
{
  "user": { "user_id": "...", "user_secret": "..." },
  "connections": [...],
  "accounts": [
    {
      "info": { "name": "...", "id": "..." },
      "balances": { "total": { "amount": 0, "currency": "USD" } },
      "positions": []
    }
  ],
  "synced_at": "2026-02-09T..."
}
```

**Note**: The `positions` array in `portfolio.json` may be empty. Use the `fenn portfolio` command which fetches live holdings data via a more reliable API endpoint.

## Security

- API credentials stored in `.env` (gitignored)
- No credentials hardcoded in code
- Read-only access to broker data
- Local data storage only

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run CLI
python fenn.py --help
```

## Resources

- [SnapTrade Documentation](https://docs.snaptrade.com/)
- [SnapTrade Python SDK](https://pypi.org/project/snaptrade-python-sdk/)
- [Fenn Documentation](docs/portfolio-download.md)
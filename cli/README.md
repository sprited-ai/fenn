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
- 🔍 Cross-broker portfolio view
- 🔒 Secure credential management via environment variables
- 📈 Risk and allocation analysis ready

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

# Export data to a file
fenn export -o my_portfolio.json
```

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

Portfolio data is stored locally in `data/portfolio.json` with the following structure:

```json
{
  "user": { "user_id": "...", "user_secret": "..." },
  "connections": [...],
  "accounts": [
    {
      "info": { "name": "...", "id": "..." },
      "balances": { "total": { "amount": 0, "currency": "USD" } },
      "positions": [
        { "symbol": "...", "quantity": 0, "..." }
      ]
    }
  ],
  "synced_at": "2026-02-09T..."
}
```

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
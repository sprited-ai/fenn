# Portfolio Visualization Proposal

**February 2026** • *Design Document*

Fenn currently displays portfolio data as text tables. This proposal outlines visualization capabilities to add deeper insight.

## Design Principles

1. **CLI-first** - Visualizations should work in the terminal where possible
2. **Static exports** - Generate HTML/PNG files for sharing
3. **No live dashboards** - Keep it simple, keep it local
4. **Data-driven** - Only implement charts that reveal actionable insights

## Current State

```bash
fenn portfolio
```

Shows:
- Text table with symbols, brokers, quantities, values, allocations
- Summary statistics
- Total portfolio value

Works great for inspection. Lacks visual pattern recognition.

## Proposed Commands

### Phase 1: Basic Visualizations (With Existing Data)

**1. Allocation Chart**
```bash
fenn plot allocation
# or
fenn plot allocation --top 15 --output allocation.html
```

Generates:
- **Donut chart** showing top N holdings + "Other"
- Interactive HTML with hover tooltips
- Click to see account breakdown
- Color-coded by broker

Why: Instantly see concentration risk. If FNILX is 18% of portfolio, you know it immediately.

**2. Top Holdings**
```bash
fenn plot top-holdings
fenn plot top-holdings --limit 30
```

Generates:
- **Horizontal bar chart** of top holdings
- Sorted by value descending
- Color-coded by broker
- Shows allocation % on bars

Why: Better than scrolling through text table. See relative sizes visually.

**3. Broker Distribution**
```bash
fenn plot by-broker
```

Generates:
- **Stacked bar** or **treemap** showing broker → accounts → holdings
- Total value per broker
- Account breakdown

Why: See if too concentrated in one brokerage for FDIC/SIPC purposes.

**4. Concentration Curve**
```bash
fenn plot concentration
```

Generates:
- **Line chart** showing cumulative allocation
- X-axis: number of holdings
- Y-axis: % of total portfolio
- Marked lines at 50%, 80%, 90%

Why: Shows diversification. "Top 10 holdings = 70% of portfolio" is a useful fact.

### Phase 2: Metadata-Enhanced (Requires Symbol Mapping)

**5. Sector Allocation**
```bash
fenn plot sectors
```

Generates:
- **Pie chart** of sector exposure
- Requires symbol → sector mapping
- Can use Yahoo Finance API or static JSON

Example sectors:
- Technology
- Financial
- Healthcare
- Consumer
- Energy
- Real Estate
- Other

Why: See if overweight in tech (common problem).

**6. Asset Class Distribution**
```bash
fenn plot asset-class
```

Generates:
- **Stacked area** or **pie chart**
- Categories: Individual Stocks, ETFs, Index Funds, Cash, Crypto
- Derived from symbol patterns (QQQ = ETF, BTC = Crypto, SPAXX = Cash)

Why: Basic risk assessment. Too much individual stock = higher risk.

**7. Geographic Exposure**
```bash
fenn plot geography
```

Generates:
- **Bar chart** by country/region
- US, International Developed, Emerging Markets
- Derived from symbol metadata

Why: Shows home country bias.

### Phase 3: Historical (Requires Time Series Data)

**8. Portfolio Value Over Time**
```bash
fenn plot performance
fenn plot performance --since 2025-01-01
```

Generates:
- **Line chart** of total portfolio value
- Requires daily snapshots stored in `data/history/`
- Shows growth/decline over time

Why: Most requested chart. Shows if you're making money.

**9. Daily Changes**
```bash
fenn plot daily-change
fenn plot daily-change --last 30
```

Generates:
- **Bar chart** of day-over-day $ or % changes
- Green = up, Red = down
- Shows volatility

Why: See how bumpy the ride is.

**10. Performance vs Benchmark**
```bash
fenn plot vs-spy
fenn plot vs-qqq
```

Generates:
- **Dual line chart** normalized to 100 at start
- Your portfolio vs SPY/QQQ
- Shows relative performance

Why: Are you beating the market? Probably not, but good to know.

**11. Holdings Timeline**
```bash
fenn plot timeline
```

Generates:
- **Stacked area chart** over time
- Each color = one top holding
- Shows composition changes

Why: See how portfolio evolves. When did you buy NVDA?

### Phase 4: Advanced Analytics

**12. Correlation Matrix**
```bash
fenn plot correlation --top 20
```

Generates:
- **Heatmap** showing price correlation between holdings
- Requires price history for each symbol
- Red = highly correlated, Blue = uncorrelated

Why: Diversification check. If all holdings move together, not really diversified.

**13. Risk/Return Scatter**
```bash
fenn plot risk-return
```

Generates:
- **Scatter plot**
- X = volatility (standard deviation)
- Y = annualized return
- Bubble size = position size

Why: Shows risk-adjusted performance. High return + low volatility = ideal.

**14. Drawdown Analysis**
```bash
fenn plot drawdown
```

Generates:
- **Area chart** showing % decline from peak
- Shows worst drops
- Time to recovery

Why: Risk tolerance check. Can you handle a 30% drawdown?

## Implementation Approach

### Technology Stack

**Plotting Library**: `plotly`
- Generates interactive HTML
- Can export static PNG
- Works offline
- Good defaults

**Alternative**: `matplotlib` + `seaborn`
- More control
- Static output
- Familiar to Python users

**Recommendation**: Start with `plotly` for quick wins.

### File Organization

```
cli/fenn/
  cli.py           # Add 'plot' command
  plotting.py      # All plotting logic
  metadata.py      # Symbol → sector/class mapping
  
data/
  holdings_cache.json    # Current data
  history/               # Daily snapshots
    2026-02-20.json
    2026-02-19.json
    ...
  metadata/
    sectors.json         # Symbol → sector map
    asset_classes.json   # Symbol → class map
```

### Command Structure

```bash
fenn plot <chart-type> [options]

Chart types:
  allocation        Donut chart of top holdings
  top-holdings      Bar chart of largest positions
  by-broker         Distribution across brokerages
  concentration     Cumulative allocation curve
  sectors           Sector allocation pie
  asset-class       Asset class distribution
  geography         Geographic exposure
  performance       Value over time
  daily-change      Day-over-day changes
  vs-spy            Compare to benchmark
  timeline          Holdings evolution
  correlation       Correlation matrix
  risk-return       Risk/return scatter
  drawdown          Drawdown analysis

Options:
  --output, -o      Output filename (default: temp file opened in browser)
  --top, -t         Limit to top N holdings (default: 10)
  --since           Start date for time series (default: all)
  --format          Output format: html, png, svg (default: html)
  --no-browser      Don't auto-open in browser
```

### Example Usage

```bash
# Quick view in browser
fenn plot allocation

# Save for sharing
fenn plot allocation -o portfolio-allocation.html

# Top 20 holdings as PNG
fenn plot top-holdings --top 20 --format png -o top-20.png

# Performance since start of year
fenn plot performance --since 2026-01-01
```

## Data Requirements

### Immediate (Phase 1)
- ✅ Holdings cache (already exists)
- ✅ Symbol, value, allocation data (already exists)

### Near-term (Phase 2)
- Symbol metadata JSON
  - Manual curation or one-time API fetch
  - ~333 symbols in current portfolio
  - Update quarterly

### Long-term (Phase 3+)
- Daily snapshots
  - Triggered by `fenn sync` or daily cron
  - Store complete holdings_cache.json with date
  - ~2KB per day = 730KB per year
  - Negligible storage cost

- Price history (optional)
  - Fetch from Yahoo Finance API
  - Cache locally per symbol
  - Only needed for correlation/risk-return

## Implementation Priority

**Week 1: Core Infrastructure**
- Add `fenn plot` command scaffolding
- Install plotly
- Implement basic chart template
- Test with allocation chart

**Week 2: Phase 1 Charts**
- Allocation donut
- Top holdings bar
- Broker distribution
- Concentration curve

**Week 3: Historical Foundation**
- Add daily snapshot save to `fenn sync`
- Create history directory structure
- Implement performance line chart

**Week 4: Phase 2 Charts**
- Create sector mapping
- Implement sector/asset-class charts
- Add geography chart

**Future: Advanced Analytics**
- Price history fetching
- Correlation matrix
- Risk/return analysis
- Only if valuable

## Success Metrics

Visualizations are successful if they:

1. **Reveal hidden patterns** - See concentration/sector risks not obvious in text
2. **Answer common questions** - "What's my biggest position?" → one glance
3. **Enable quick decisions** - "Should I rebalance?" → look at allocation chart
4. **Stay fast** - Generate chart in <2 seconds from cache
5. **Work offline** - No external API calls for basic charts

## Non-Goals

- **Live dashboards** - Keep it static, keep it simple
- **Cloud hosting** - Local files only
- **Real-time updates** - Daily snapshots are enough
- **Strategy backtesting** - Use dedicated tools
- **Mobile apps** - HTML charts work on mobile browsers
- **Collaboration features** - This is personal finance

## Open Questions

1. **Output format preference?**
   - HTML (interactive, large files)
   - PNG (static, shareable)
   - Both?

2. **Auto-open in browser?**
   - Convenient but maybe annoying
   - Make it a flag?

3. **Multiple charts at once?**
   - `fenn plot dashboard` generates all Phase 1 charts?
   - Or keep them separate?

4. **Color scheme?**
   - Match terminal colors?
   - Financial industry standard (green/red)?
   - Accessible color blind-friendly palette?

5. **Historical data retention?**
   - Keep forever?
   - Compress old data?
   - Configurable retention policy?

## Next Steps

1. Validate approach with simple allocation chart prototype
2. Get feedback on which charts are most valuable
3. Decide on plotly vs matplotlib
4. Implement Phase 1 (4 basic charts)
5. Start collecting daily snapshots
6. Iterate based on usage

---

*Proposal Status: Draft - awaiting review*

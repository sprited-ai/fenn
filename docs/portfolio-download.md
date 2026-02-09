# Portfolio Download Proposal

Fenn needs access to the portfolio information from Fidelity, Robinhood, and E-Trade to be able to provide accurate and up-to-date information about Jin’s financial portfolio.

The purpose of this access is **not trading or optimization**, but rather to maintain a reliable local snapshot of portfolio state so Fenn can provide visibility, inspection, and risk awareness.

## Goals

The portfolio download system should enable Fenn to:

- Maintain an accurate representation of holdings, balances, and positions
- Preserve historical snapshots for inspection and comparison
- Provide a consistent cross-broker portfolio view
- Support risk and allocation analysis
- Operate reliably without manual intervention

Fenn acts as a portfolio housekeeper, ensuring Jin always has a clear, inspectable record of financial state.

## Non-Goals

This system explicitly does not:

- Execute trades
- Modify broker account settings
- Perform strategy optimization
- Store broker credentials insecurely
- Replace official broker statements

Fenn is strictly an observatory and archival layer.

## Architecture Overview

Portfolio data flows through a broker connector layer into Fenn’s local archive:

```
Broker APIs
(Fidelity / Robinhood / E-Trade)
        ↓
Connector Layer
(SnapTrade or equivalent aggregator)
        ↓
Fenn Sync Engine
        ↓
Local Portfolio Store
(JSON / SQLite archive)
        ↓
Inspection & Reporting Tools
```

This separation ensures:
- Broker independence
- Clean local ownership of data
- Resilience to API changes
- Extendability

## Data Acquisition Strategy

Because broker APIs are fragmented and inconsistent, Fenn will use an aggregation layer where possible.

Primary approach:

- Use SnapTrade (or similar connector) to securely retrieve:
  - account balances
  - holdings
  - positions
  - historical activity (when available)

## Schema

Let's first download the data and decide later.

## User Experience

Fenn will be a command line utility.

### `fenn sync`

Downloads and sync's the portfolio data from all connected brokers, updating the local archive.

## Implementation Plan
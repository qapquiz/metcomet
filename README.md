# metcomet

Meteora DLMM helper library for Solana

## Installation

```bash
bun add metcomet
```

## Features

- **Position Management** - Get all DLMM positions for a wallet with detailed summaries
- **Unrealized PnL** - Calculate unrealized PnL for positions with fee tracking
- **SOL Price** - Get current and historical SOL prices from DLMM pools
- **OHLCV Data** - Fetch candlestick data for trading analysis
- **Initial Deposits** - Track initial deposit values via Helius
- **DLMM API** - Direct access to Meteora DLMM API for pools, portfolios, positions, and protocol metrics

## Usage

### SDK-based (on-chain data)

```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { getAllUserPositions, getUpnl, getCurrentSolPrice } from "metcomet";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const wallet = new PublicKey("...");

// Get all positions for a wallet
const positions = await getAllUserPositions({
  connection,
  walletAddress: wallet,
});

// Calculate unrealized PnL
const upnl = await getUpnl({
  connection,
  walletAddress: wallet,
  heliusApiKey: "your-helius-api-key",
});

// Get current SOL price
const solPrice = await getCurrentSolPrice({ connection });
```

### API-based (pre-computed data)

```typescript
import { fetchOpenPortfolio, fetchClosedPortfolio, fetchProtocolMetrics } from "metcomet";

const wallet = "<your-solana-wallet>";

// Get user's open positions with USD/SOL values
const openPortfolio = await fetchOpenPortfolio({ user: wallet });

// Get user's closed positions with PnL
const closedPortfolio = await fetchClosedPortfolio({ user: wallet });

// Get protocol-wide metrics
const metrics = await fetchProtocolMetrics();
```

## API Reference

### SDK-based Functions (On-chain)

#### Positions

- `getAllUserPositions(params)` - Get all DLMM positions for a wallet
- `getPositionSummaries(params)` - Get detailed position summaries with values

#### PnL

- `getUpnl(params)` - Calculate unrealized PnL including fees
- `getUpnlPerPosition(params)` - Calculate PnL per position

#### Price

- `getCurrentSolPrice(params)` - Get current SOL price from DLMM pool
- `getSolPriceByTimestamp(params)` - Get SOL price at a specific timestamp

#### OHLCV

- `fetchOHLCV(params)` - Fetch candlestick data for analysis
- `getPairPriceByTimestamp(params)` - Get pair price at a specific timestamp

### API-based Functions (DLMM API)

#### Pools

- `fetchPools(params?)` - List pools with filtering/sorting/pagination
- `fetchPool(address)` - Get single pool details
- `fetchPoolOHLCV(params)` - Fetch candlestick data
- `getLatestOHLCVCandle(data)` - Get the latest candle from OHLCV data
- `fetchVolumeHistory(params)` - Fetch historical volume
- `fetchGroups(params?)` - List pool groups
- `fetchGroup(lexicalOrderMints)` - Get single pool group

#### Portfolio

- `fetchOpenPortfolio(params)` - Get user's open positions with balances and fees
- `fetchClosedPortfolio(params)` - Get user's closed positions with PnL
- `fetchPortfolioTotal(user)` - Get total portfolio PnL across all pools
- `fetchPositionPnL(params)` - Get per-position PnL data for a pool
- `fetchPositionHistory(params)` - Get historical events for a position
- `fetchProtocolMetrics()` - Get protocol-wide metrics
- `fetchWalletPoolClaims(params)` - Get total claimed fees and rewards

## Requirements

- Solana web3.js
- Meteora DLMM SDK
- Helius API key (for PnL and initial deposit features)

## How to publish to npmjs

```
bun pm pack && npm publish ./*.tgz --access public
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT

# Pay-Chain Indexer

Blockchain event indexer built with Ponder (TypeScript).

## Tech Stack

- **Framework**: Ponder
- **Language**: TypeScript
- **Database**: PostgreSQL (auto-managed by Ponder)
- **API**: Auto-generated GraphQL

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
├── src/
│   ├── PayChainEVM.ts       # EVM event handlers
│   ├── PayChainSVM.ts       # Solana event handlers
│   └── api/                 # Custom API routes
├── abis/                    # Contract ABIs
├── ponder.config.ts         # Network & contract config
└── ponder.schema.ts         # Database schema
```

## Supported Networks (Phase 1)

| Network | Chain ID (CAIP-2) |
|---------|-------------------|
| Base Sepolia | eip155:84532 |
| BSC Sepolia | eip155:97 |
| Solana Devnet | solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1 |

## Environment Variables

Copy `.env.example` to `.env`:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/ponder
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BSC_SEPOLIA_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

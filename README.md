# NexPredict

A decentralized prediction market platform built on the **Algorand blockchain**. Users browse binary prediction markets, place ALGO bets on outcomes, and earn proportional rewards when they predict correctly.

> Live on Algorand TestNet &nbsp;|&nbsp; [GitHub](https://github.com/S-Rushidhar-1999/NexPredict)

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [Frontend](#frontend)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

NexPredict lets anyone participate in prediction markets powered by smart contracts on Algorand. Each market is a binary question with two possible outcomes. Users stake ALGO on their chosen side, and winners split the entire prize pool proportionally to their stake.

Key characteristics:

- **No platform fees** — 100% of the prize pool goes to winners
- **Trustless** — all logic lives on-chain; no central authority controls outcomes (admin only sets results after market closes)
- **Transparent** — every bet and claim is a public on-chain transaction
- **Refund support** — admin can mark a result as "refund" (option 3) to return all stakes

---

## How It Works

1. **Admin creates a market** — sets a question, two options, start/end timestamps, category, and a thumbnail image URL
2. **Users connect their Algorand wallet** and browse open markets
3. **Users place bets** — choose an option and stake any amount of ALGO during the active window
4. **Bets can be changed** — users can increase, decrease, or switch their option before the market closes
5. **Market closes** — no more bets accepted after the end timestamp
6. **Admin announces result** — calls `endPrediction` with the winning option (1, 2, or 3 for refund)
7. **Winners claim rewards** — proportional payout based on total pool and winning-side shares

**Payout formula:**

```
reward = (totalPool × userStake) / winningOptionTotalStake
```

---

## Tech Stack

### Smart Contract
| Tool | Purpose |
|---|---|
| [TEALScript](https://github.com/algorandfoundation/TEALScript) | TypeScript-like DSL that compiles to Algorand AVM bytecode |
| [AlgoKit](https://github.com/algorandfoundation/algokit-cli) | Toolchain for building, testing, and deploying Algorand apps |
| [algokit-utils](https://github.com/algorandfoundation/algokit-utils-ts) | TypeScript utilities for Algorand interactions |
| [algosdk](https://github.com/algorand/js-algorand-sdk) | Algorand JavaScript SDK |
| Jest | Unit testing |

### Frontend
| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| Lucide React | Icon library |
| [@txnlab/use-wallet-react](https://github.com/TxnLab/use-wallet) | Algorand wallet integration (Pera, Defly, Lute, Exodus, WalletConnect) |
| react-router-dom v6 | Client-side routing (HashRouter for GitHub Pages) |
| react-toastify | Toast notifications |
| algosdk | Blockchain transaction building |
| algokit-utils | Algorand client utilities |

### Infrastructure
| Tool | Purpose |
|---|---|
| Algorand TestNet | Blockchain network |
| [Algonode](https://algonode.io) | Free public Algod + Indexer endpoints |
| GitHub Actions | CI/CD for frontend deployment |
| GitHub Pages | Frontend hosting |

---

## Project Structure

```
NexPredict/
├── .algokit.toml                        # Workspace config
├── .github/
│   └── workflows/main.yml               # GitHub Actions deploy workflow
├── projects/
│   ├── nexpredict-contracts/            # Smart contract project
│   │   ├── contracts/
│   │   │   ├── NexPredict.algo.ts       # Main TEALScript contract
│   │   │   ├── NexPredict.deploy.ts     # Deployment script
│   │   │   ├── NexPredict.demo.ts       # Demo/test interactions script
│   │   │   ├── artifacts/               # Compiled TEAL + ABI artifacts
│   │   │   └── clients/
│   │   │       └── NexPredictClient.ts  # Auto-generated TypeScript client
│   │   ├── __test__/
│   │   │   └── NexPredict.test.ts       # Jest tests
│   │   └── package.json
│   │
│   └── nexpredict-frontend/             # React frontend project
│       ├── src/
│       │   ├── App.jsx                  # Root component, routing
│       │   ├── main.jsx                 # Entry point, wallet providers
│       │   ├── config.js                # App config, Algorand client init
│       │   ├── utils.js                 # Contract read helpers, formatters
│       │   ├── pages/
│       │   │   └── Homepage.jsx
│       │   └── components/
│       │       ├── Header.jsx           # Nav, wallet connect button
│       │       ├── Homebody.jsx         # Hero + markets grid
│       │       ├── Card.jsx             # Market card with live countdown
│       │       ├── Prediction.jsx       # Bet placement + activity feed
│       │       ├── CreatePrediction.jsx # Admin market creation form
│       │       ├── ConnectWalletModal.jsx
│       │       ├── ChatWindow.jsx       # FAQ chatbot
│       │       ├── ChatIcon.jsx
│       │       └── Footer.jsx
│       ├── .env                         # Local env (not committed)
│       ├── .env.template                # Env variable reference
│       └── package.json
```

---

## Smart Contract

The contract is written in **TEALScript** and deployed on Algorand TestNet.

**Deployed contract:**
- App ID: `757968428`
- App Address: `5XP6C5CZ7D5CBA5IPZQ6RC3XYCMCRUQUKV2G5JH2LDQWWH4RROQSIXLHIE`

### Data Structures

**Prediction** (stored in box storage, keyed by `uint64` ID):
```typescript
{
  option1SharesBhougth: uint64   // total ALGO staked on option 1
  option2SharesBhougth: uint64   // total ALGO staked on option 2
  startsAt: uint64               // unix timestamp
  endsAt: uint64                 // unix timestamp
  result: uint8                  // 0=pending, 1=option1 wins, 2=option2 wins, 3=refund
  noOfUsers: uint64
  question: string
  option1: string
  option2: string
  category: string
  image: string                  // thumbnail URL
}
```

**UserPrediction** (stored in box storage, keyed by `address + predictionId`):
```typescript
{
  option: uint8    // which option the user bet on
  amount: uint64   // amount staked in microALGO
  claimed: uint8   // 0=unclaimed, 1=claimed
}
```

### Contract Methods

| Method | Access | Description |
|---|---|---|
| `createApplication()` | Deployer | Initializes contract, sets admin |
| `addPrediction(question, option1Name, option2Name, startsAt, endsAt, category, image)` | Admin only | Creates a new prediction market |
| `buyShares(predictionId, option, amount, payTxn)` | Any user | Places or updates a bet; handles partial refunds on reduction |
| `endPrediction(predictionId, result)` | Admin only | Sets the result after `endsAt` has passed |
| `claimReward(predictionId)` | Winning user | Sends proportional payout via inner transaction |

---

## Frontend

### Pages & Routes

| Route | Component | Description |
|---|---|---|
| `/` | `Homepage` → `Homebody` | Hero section + live markets grid with category filters |
| `/create-prediction` | `CreatePrediction` | Admin-only form to create new markets |
| `/prediction/:id` | `Prediction` | Detailed view with betting UI, payout estimator, activity feed |

### Wallet Support

Supported wallets via `@txnlab/use-wallet-react`:
- Pera Wallet
- Defly Wallet
- Lute Wallet
- Exodus
- WalletConnect

### Market Categories

- Politics
- Movies
- Airdrops

---

## Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) >= v2.0.0
- An Algorand wallet (Pera recommended for TestNet)

### 1. Clone the repository

```bash
git clone https://github.com/S-Rushidhar-1999/NexPredict.git
cd NexPredict
```

### 2. Install dependencies

**Contracts:**
```bash
cd projects/nexpredict-contracts
npm install
```

**Frontend:**
```bash
cd projects/nexpredict-frontend
npm install
```

### 3. Configure environment variables

Copy the template and fill in your values:

```bash
cd projects/nexpredict-frontend
cp .env.template .env
```

Edit `.env` with your deployed contract details (see [Environment Variables](#environment-variables)).

### 4. Run the frontend

```bash
cd projects/nexpredict-frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

All variables are prefixed with `VITE_` and live in `projects/nexpredict-frontend/.env`.

| Variable | Description | Default |
|---|---|---|
| `VITE_ENVIRONMENT` | Network environment | `testnet` |
| `VITE_ALGOD_SERVER` | Algod API endpoint | `https://testnet-api.algonode.cloud` |
| `VITE_ALGOD_TOKEN` | Algod API token | `""` (not needed for Algonode) |
| `VITE_ALGOD_PORT` | Algod port | `""` |
| `VITE_ALGOD_NETWORK` | Network name | `testnet` |
| `VITE_INDEXER_SERVER` | Indexer API endpoint | `https://testnet-idx.algonode.cloud` |
| `VITE_INDEXER_TOKEN` | Indexer API token | `""` (not needed for Algonode) |
| `VITE_INDEXER_PORT` | Indexer port | `""` |
| `VITE_APP_ID` | Deployed contract App ID | `757968428` |
| `VITE_APP_ADDRESS` | Deployed contract address | see `.env.template` |
| `VITE_APP_ADMIN` | Admin wallet address | see `.env.template` |

> The project uses free public [Algonode](https://algonode.io) endpoints — no API key required.

---

## Available Scripts

### Contracts (`projects/nexpredict-contracts`)

```bash
# Compile TEALScript contract to TEAL artifacts
npm run compile-contract

# Generate TypeScript client from ABI artifacts
npm run generate-client

# Build (compile + generate client)
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

### Frontend (`projects/nexpredict-frontend`)

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Regenerate contract client from artifacts
npm run generate:app-clients
```

### Workspace (root)

```bash
# Build both projects
algokit project run build
```

---

## Deployment

### Smart Contract

To deploy a fresh contract to TestNet:

```bash
cd projects/nexpredict-contracts
npx ts-node contracts/NexPredict.deploy.ts
```

This will output the new **App ID** and **App Address**. Update your `.env` accordingly.

### Frontend

The frontend is deployed to **GitHub Pages** via GitHub Actions.

**Manual trigger:**
1. Go to the repository on GitHub
2. Navigate to **Actions** → **Deploy Site**
3. Click **Run workflow**

The workflow builds the Vite app and publishes the `dist` folder to the `gh-pages` branch.

To build locally for production:

```bash
cd projects/nexpredict-frontend
npm run build
# output is in dist/
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT

---

<p align="center">Built on <a href="https://algorand.com">Algorand</a> &nbsp;·&nbsp; <a href="https://github.com/S-Rushidhar-1999/NexPredict">GitHub</a></p>

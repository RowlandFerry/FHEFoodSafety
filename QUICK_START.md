# Quick Start Guide

## Installation

```bash
npm install
```

## Configuration

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Compile Contracts

```bash
npm run compile
```

## Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

## Deployment

### Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local

# Interact with contract
npm run interact:local

# Run simulation
npm run simulate:local
```

### Sepolia Testnet

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Verify contract
npm run verify:sepolia

# Interact with contract
npm run interact:sepolia
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `compile` | `npm run compile` | Compile smart contracts |
| `test` | `npm test` | Run all tests |
| `test:gas` | `npm run test:gas` | Run tests with gas reporting |
| `test:coverage` | `npm run test:coverage` | Run tests with coverage |
| `node` | `npm run node` | Start local Hardhat node |
| `deploy:local` | `npm run deploy:local` | Deploy to localhost |
| `deploy:sepolia` | `npm run deploy:sepolia` | Deploy to Sepolia |
| `verify:sepolia` | `npm run verify:sepolia` | Verify on Etherscan |
| `interact:local` | `npm run interact:local` | Interact with local contract |
| `interact:sepolia` | `npm run interact:sepolia` | Interact with Sepolia contract |
| `simulate:local` | `npm run simulate:local` | Run simulation on localhost |
| `clean` | `npm run clean` | Clean build artifacts |

## Project Structure

```
food-safety-reporting-system/
├── contracts/                  # Smart contracts
│   └── AnonymousFoodSafety.sol
├── scripts/                   # Deployment & interaction
│   ├── deploy.js             # Deploy contract
│   ├── verify.js             # Verify on Etherscan
│   ├── interact.js           # Interact with contract
│   └── simulate.js           # Run full simulation
├── test/                     # Test files
│   └── FoodSafety.test.js
├── hardhat.config.js         # Hardhat configuration
├── package.json              # Dependencies & scripts
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── README.md                # Full documentation
├── DEPLOYMENT.md            # Deployment guide
└── QUICK_START.md          # This file
```

## Common Tasks

### Submit a Report

```javascript
await contract.submitAnonymousReport(
  3,      // Safety level (0-4)
  1001,   // Location code
  5001,   // Food type code
  "Description of the issue"
);
```

### Authorize Investigator

```javascript
await contract.authorizeInvestigator(investigatorAddress);
```

### Start Investigation

```javascript
await contract.startInvestigation(reportId);
```

### Complete Investigation

```javascript
await contract.completeInvestigation(
  reportId,
  3,  // Final safety level
  "Investigation findings"
);
```

### Get Statistics

```javascript
const stats = await contract.getTotalStats();
const locationStats = await contract.getLocationStats(1001);
const reporterStats = await contract.getReporterStats(reporterAddress);
```

## Troubleshooting

### Tests fail to compile
- Run: `npm run clean && npm run compile`
- Delete `node_modules` and run `npm install`

### Deployment fails
- Check `.env` has valid `PRIVATE_KEY` and `SEPOLIA_RPC_URL`
- Ensure you have testnet ETH
- Verify network configuration in `hardhat.config.js`

### Verification fails
- Wait 1-2 minutes after deployment
- Ensure `ETHERSCAN_API_KEY` is set in `.env`
- Manually verify: `npx hardhat verify --network sepolia <CONTRACT_ADDRESS>`

## Next Steps

1. Read [README.md](README.md) for comprehensive documentation
2. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide
3. Run `npm test` to ensure everything works
4. Deploy to local network and test interactions
5. Deploy to Sepolia testnet when ready

## Support

- GitHub Issues: Report bugs or request features
- Documentation: See README.md and DEPLOYMENT.md
- Hardhat Docs: https://hardhat.org/docs

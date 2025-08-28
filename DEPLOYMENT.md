# Deployment Guide

This guide provides step-by-step instructions for deploying and verifying the Food Safety Reporting System smart contract.

## Prerequisites

Before deploying, ensure you have:

- Node.js (v18 or higher)
- A Web3 wallet with testnet ETH (for Sepolia)
- Alchemy/Infura API key
- Etherscan API key (for verification)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add:

```
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Warning**: Never commit your `.env` file or share your private key!

### 3. Get Testnet ETH

For Sepolia testnet, get free test ETH from:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Chainlink Faucet](https://faucets.chain.link/)

## Compilation

Compile the smart contracts:

```bash
npx hardhat compile
```

This will:
- Compile all Solidity contracts in `/contracts`
- Generate artifacts in `/artifacts`
- Generate TypeChain types in `/typechain-types`

## Testing

### Run All Tests

```bash
npx hardhat test
```

### Run Tests with Gas Reporting

```bash
REPORT_GAS=true npx hardhat test
```

### Run Tests with Coverage

```bash
npx hardhat coverage
```

## Deployment

### Deploy to Local Hardhat Network

1. Start a local Hardhat node:

```bash
npx hardhat node
```

2. In a new terminal, deploy:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The deployment script will:
- Deploy the AnonymousFoodSafety contract
- Display the contract address
- Save deployment information to `/deployments`
- Show next steps for verification

### Deployment Output

After successful deployment, you'll see:

```
=== Deployment Summary ===
Contract Name: AnonymousFoodSafety
Contract Address: 0x...
Network: sepolia
Deployer: 0x...
Transaction Hash: 0x...

=== Initial Contract State ===
Owner: 0x...
Regulator: 0x...
Total Reports: 0
```

## Verification

### Verify on Etherscan

After deploying to Sepolia, verify your contract:

```bash
npx hardhat run scripts/verify.js --network sepolia
```

Or manually specify the contract address:

```bash
npx hardhat run scripts/verify.js --network sepolia 0xYourContractAddress
```

Alternatively, use the Hardhat verify task directly:

```bash
npx hardhat verify --network sepolia 0xYourContractAddress
```

### Verification Success

Once verified, you'll see:

```
=== Verification Successful ===
Contract verified on Etherscan!
View on Etherscan: https://sepolia.etherscan.io/address/0x...
```

## Post-Deployment

### 1. Interact with the Contract

Test contract functionality:

```bash
npx hardhat run scripts/interact.js --network sepolia
```

This script will:
- Authorize investigators
- Submit anonymous reports
- Start investigations
- Complete investigations
- Display statistics

### 2. Run Simulations

Run a comprehensive simulation:

```bash
npx hardhat run scripts/simulate.js --network localhost
```

This creates multiple reports and runs through the full investigation workflow.

### 3. Update Frontend

If you have a frontend application:

1. Update the contract address in your frontend configuration
2. Update the ABI from `artifacts/contracts/AnonymousFoodSafety.sol/AnonymousFoodSafety.json`
3. Ensure the network configuration matches your deployment

## Network Information

### Sepolia Testnet

- **Network Name**: Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
- **Block Explorer**: https://sepolia.etherscan.io
- **Currency Symbol**: SepoliaETH

### Hardhat Local Network

- **Network Name**: localhost
- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Currency Symbol**: ETH

## Deployment Information

All deployments are automatically saved to the `/deployments` directory with the following information:

```json
{
  "network": "sepolia",
  "contractName": "AnonymousFoodSafety",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "transactionHash": "0x...",
  "blockNumber": 12345,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "owner": "0x...",
  "regulator": "0x..."
}
```

## Troubleshooting

### Deployment Fails

**Issue**: Transaction fails or times out

**Solutions**:
- Ensure you have enough testnet ETH
- Check your RPC URL is correct
- Try increasing gas limit in hardhat.config.js
- Check network status

### Verification Fails

**Issue**: Etherscan verification fails

**Solutions**:
- Wait 1-2 minutes after deployment before verifying
- Ensure ETHERSCAN_API_KEY is set correctly
- Verify you're on the correct network
- Check if contract is already verified

### Wrong Network

**Issue**: Deployed to wrong network

**Solutions**:
- Always specify `--network <network-name>` flag
- Double-check your .env configuration
- Verify the network in hardhat.config.js

### Out of Gas

**Issue**: Transaction runs out of gas

**Solutions**:
- The contract uses FHE which requires higher gas
- Ensure gas settings in hardhat.config.js are set to "auto"
- Consider increasing gas limit manually if needed

## Security Checklist

Before deploying to mainnet:

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Private keys secured (never in code)
- [ ] .env file in .gitignore
- [ ] Contract verified on Etherscan
- [ ] Owner/regulator addresses verified
- [ ] Test all functions on testnet
- [ ] Gas optimization reviewed
- [ ] Emergency procedures documented

## Gas Optimization

The contract is optimized for gas efficiency:

- FHE operations are minimized
- State variables are packed efficiently
- View functions don't consume gas
- Batch operations available for multiple updates

Expected gas costs (approximate):
- Deploy: ~5,000,000 gas
- Submit Report: ~300,000 gas
- Start Investigation: ~100,000 gas
- Complete Investigation: ~150,000 gas

## Upgrade Path

This contract is not upgradeable by design for security and transparency. If upgrades are needed:

1. Deploy a new contract version
2. Migrate data if necessary
3. Update frontend to point to new contract
4. Communicate changes to users

## Support and Documentation

- **GitHub Repository**: https://github.com/YourUsername/food-safety-reporting
- **Hardhat Documentation**: https://hardhat.org/docs
- **Etherscan**: https://docs.etherscan.io/
- **Zama fhEVM**: https://docs.zama.ai/fhevm

## License

This project is licensed under the MIT License.

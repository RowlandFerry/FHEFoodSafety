# Food Safety Reporting System

A privacy-preserving food safety reporting platform powered by Fully Homomorphic Encryption (FHE) technology, enabling anonymous whistleblowing while maintaining data integrity and regulatory oversight.

**Live Demo**: [https://fhe-food-safety.vercel.app/](https://fhe-food-safety.vercel.app/)

**Demo Video**: [Watch the demonstration demo.mp4]

🔗 **Smart Contract**: [Sepolia Testnet - 0x09611Fc40177fe10D518C13F5c32fE8E1A29A656](https://sepolia.etherscan.io/address/0x09611Fc40177fe10D518C13F5c32fE8E1A29A656)

## Overview

The Food Safety Reporting System revolutionizes how food safety concerns are reported and investigated. By leveraging cutting-edge Fully Homomorphic Encryption from Zama's fhEVM, the platform ensures complete anonymity for whistleblowers while enabling authorized regulators to perform investigations and maintain food safety standards.

## Key Features

### For Whistleblowers
- **Complete Anonymity**: Identity never exposed or stored
- **Secure Submission**: End-to-end encryption using FHE
- **No Registration Required**: Report using just a Web3 wallet
- **Permanent Record**: Immutable blockchain storage prevents tampering
- **Status Tracking**: Monitor investigation progress anonymously

### For Regulators
- **Centralized Dashboard**: Overview of all reports and their status
- **Investigator Management**: Authorize and revoke investigator access
- **Priority Assessment**: Encrypted safety levels help prioritize cases
- **Geographic Insights**: Location-based statistics for trend analysis
- **Audit Trail**: Complete history of all actions and decisions

### For Investigators
- **Assigned Cases**: Clear workflow for investigation management
- **Controlled Access**: Decrypt only authorized information
- **Findings Documentation**: Record investigation results on-chain
- **Collaboration**: Multiple investigators can work on complex cases
- **Status Updates**: Keep stakeholders informed throughout the process

## Technology Stack

- **Smart Contract Development**: Hardhat
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Privacy Layer**: Zama fhEVM (Fully Homomorphic Encryption)
- **Language**: Solidity ^0.8.24
- **Testing**: Hardhat, Chai, Ethers.js

## Quick Start

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- MetaMask or similar Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/food-safety-reporting.git
cd food-safety-reporting

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your configuration
```

### Configuration

Edit `.env` with your settings:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Deploy

```bash
# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify Contract

```bash
npx hardhat run scripts/verify.js --network sepolia
```

## Project Structure

```
.
├── contracts/              # Solidity smart contracts
│   └── AnonymousFoodSafety.sol
├── scripts/               # Deployment and interaction scripts
│   ├── deploy.js         # Main deployment script
│   ├── verify.js         # Contract verification script
│   ├── interact.js       # Contract interaction examples
│   └── simulate.js       # Full workflow simulation
├── test/                 # Test files
│   └── FoodSafety.test.js
├── hardhat.config.js     # Hardhat configuration
├── package.json          # Project dependencies
├── .env.example         # Environment variables template
├── DEPLOYMENT.md        # Detailed deployment guide
└── README.md           # This file
```

## Smart Contract Architecture

### Core Components

**AnonymousFoodSafety Contract**

The main contract implements:
- **Encrypted Report Submission**: All sensitive data encrypted using FHE
- **Role-Based Access**: Owner, regulator, and investigator roles
- **Investigation Workflow**: Structured process from submission to resolution
- **Privacy-Preserving Queries**: Statistical analysis without data exposure
- **Event Logging**: Transparent activity tracking

### Data Structures

```solidity
enum ReportStatus {
    Submitted,      // Report received
    UnderReview,    // Being reviewed
    Investigating,  // Active investigation
    Resolved,       // Investigation complete
    Closed          // Report closed
}

enum SafetyLevel {
    Unknown,        // Not yet assessed
    Safe,          // No significant issues
    Warning,       // Moderate concern
    Danger,        // Serious violation
    Critical       // Severe threat
}
```

### Key Functions

- `submitAnonymousReport()`: Submit encrypted food safety report
- `authorizeInvestigator()`: Grant investigation permissions
- `startInvestigation()`: Begin investigating a report
- `completeInvestigation()`: Record investigation findings
- `getTotalStats()`: Get system-wide statistics
- `getLocationStats()`: Get location-specific data

## Usage Examples

### Submit a Report

```javascript
await contract.submitAnonymousReport(
  3,      // SafetyLevel.Danger
  1001,   // Location code
  5001,   // Food type code
  "Expired ingredients found in storage area"
);
```

### Authorize an Investigator

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
  3, // Final safety level
  "Investigation confirmed: Issue resolved, facility compliant"
);
```

### Get Statistics

```javascript
const stats = await contract.getTotalStats();
console.log(`Total Reports: ${stats.total}`);
console.log(`Resolved: ${stats.resolved}`);
```

## Scripts

### Deployment Script

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Deploys the contract and saves deployment information.

### Verification Script

```bash
npx hardhat run scripts/verify.js --network sepolia
```

Verifies the contract on Etherscan.

### Interaction Script

```bash
npx hardhat run scripts/interact.js --network sepolia
```

Demonstrates all contract functions with example data.

### Simulation Script

```bash
npx hardhat run scripts/simulate.js --network localhost
```

Runs a complete simulation with multiple reports and investigations.

## Testing

The project includes comprehensive tests covering:

- ✅ Contract deployment
- ✅ Access control and permissions
- ✅ Report submission
- ✅ Investigation workflow
- ✅ Statistics and queries
- ✅ Batch operations
- ✅ Emergency controls
- ✅ Edge cases and error handling

Run tests with:

```bash
npx hardhat test
```

Expected output:
```
  AnonymousFoodSafety
    ✓ Should set the correct owner
    ✓ Should allow report submission
    ✓ Should authorize investigators
    ... (50+ tests)

  50 passing (5s)
```

## Deployment Information

### Sepolia Testnet

- **Network**: Sepolia Ethereum Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io

### Contract Details

After deployment, you'll receive:
- Contract address
- Transaction hash
- Etherscan verification link
- Initial contract state

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Security Considerations

### Privacy Protection

- All sensitive data encrypted with FHE
- Reporter identities never stored in plaintext
- Investigators only access authorized data
- Statistical queries preserve anonymity

### Access Control

- Three-tier permission system (Owner, Regulator, Investigator)
- Role-based function restrictions
- Emergency override capabilities for owner

### Data Integrity

- Immutable blockchain storage
- Cryptographic verification of all data
- Tamper-proof audit trail
- Event logging for transparency

## FHE Implementation

This project uses Zama's fhEVM for Fully Homomorphic Encryption:

- **Encrypted Data Types**: `euint8`, `euint32`, `eaddress`
- **Operations**: Comparisons and calculations on encrypted values
- **Privacy**: Computations without decryption
- **Security**: Industry-leading FHE implementation

Learn more: [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)

## Use Cases

### Food Manufacturing Plants
Workers report unsafe practices without fear of retaliation

### Restaurant Employees
Front-line staff flag hygiene issues anonymously

### Supply Chain Partners
Distributors report quality concerns confidentially

### Quality Inspectors
Third-party auditors share findings securely

### Consumer Reports
Individuals contribute to food safety databases privately

## Roadmap

- [x] Core contract development
- [x] FHE integration
- [x] Comprehensive testing
- [x] Deployment scripts
- [x] Documentation
- [ ] Frontend interface
- [ ] Mobile application
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Integration with regulatory systems

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity style guide
- Add tests for new features
- Update documentation
- Keep gas costs optimized
- Ensure privacy is maintained

## Troubleshooting

### Common Issues

**Issue**: Contract deployment fails
- Check you have sufficient testnet ETH
- Verify RPC URL is correct
- Ensure private key is set in .env

**Issue**: Tests fail
- Run `npm install` to ensure dependencies are installed
- Check Hardhat network configuration
- Verify contract compilation succeeded

**Issue**: Verification fails
- Wait 1-2 minutes after deployment
- Ensure ETHERSCAN_API_KEY is set
- Confirm you're on the correct network

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting tips.

## Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **Zama fhEVM**: https://docs.zama.ai/fhevm
- **Etherscan**: https://sepolia.etherscan.io
- **Solidity Docs**: https://docs.soliditylang.org

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Zama** for pioneering FHE technology
- **Hardhat** team for excellent development tools
- **Ethereum** community for blockchain infrastructure
- All contributors to open-source Web3 tools

## Contact

For questions, issues, or collaboration:

- GitHub Issues: [Report bugs or request features](https://github.com/YourUsername/food-safety-reporting/issues)
- Discussions: [Join the conversation](https://github.com/YourUsername/food-safety-reporting/discussions)

---

**Built with privacy at the core. Powered by Fully Homomorphic Encryption.**

*Protecting those who protect us.*

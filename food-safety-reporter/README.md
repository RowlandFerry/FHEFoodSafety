# Anonymous Food Safety Reporting System

A privacy-preserving food safety reporting platform powered by Fully Homomorphic Encryption (FHE) technology, enabling anonymous whistleblowing while maintaining data integrity and regulatory oversight.

## 🌟 Overview

The Anonymous Food Safety Reporting System revolutionizes how food safety concerns are reported and investigated. By leveraging cutting-edge Fully Homomorphic Encryption, the platform ensures complete anonymity for whistleblowers while enabling authorized regulators to perform investigations and maintain food safety standards.

**Live Demo**: [https://anonymous-food-safety.vercel.app/](https://anonymous-food-safety.vercel.app/)

**Demo Video**: [Watch the demonstration AnonymousFoodSafety.mp4]

## 🔐 Core Concepts

### Fully Homomorphic Encryption (FHE)

This system utilizes FHE technology from Zama's fhEVM, which allows computations to be performed directly on encrypted data without decryption. This groundbreaking approach ensures:

- **Complete Privacy**: Reporter identities, locations, and sensitive details remain encrypted on-chain
- **Verifiable Integrity**: All data is cryptographically secured and tamper-proof
- **Selective Disclosure**: Only authorized investigators can decrypt specific information when necessary
- **Zero-Knowledge Operations**: Statistical analysis and reporting can occur without exposing individual data

### Anonymous Food Safety Reporting

The platform addresses a critical gap in food safety oversight:

- **Whistleblower Protection**: Individuals can report food safety violations without fear of retaliation
- **Encrypted Metadata**: Safety levels, geographic locations, and food types are stored as encrypted values
- **Privacy-Preserving Statistics**: Aggregate data can be analyzed without compromising individual anonymity
- **Regulatory Compliance**: Authorized investigators maintain oversight capabilities while respecting privacy

### Privacy-First Quality Supervision

Traditional food safety reporting systems expose whistleblowers to potential retaliation. Our approach changes this:

- **On-Chain Anonymity**: Blockchain immutability combined with encryption ensures permanent privacy
- **Granular Access Control**: Multi-tier authorization system for regulators and investigators
- **Transparent Process**: Investigation status updates are public, while sensitive details remain private
- **Accountable Oversight**: All regulatory actions are recorded on-chain for auditability

## 🏗️ Architecture

### Smart Contract Features

**Contract Address**: `0x09611Fc40177fe10D518C13F5c32fE8E1A29A656`

The system's smart contract implements:

- **Encrypted Report Submission**: All sensitive data encrypted using FHE before storage
- **Role-Based Access**: Owner, regulator, and investigator roles with specific permissions
- **Investigation Workflow**: Structured process from submission to resolution
- **Privacy-Preserving Queries**: Statistical analysis without data exposure
- **Event Logging**: Transparent activity tracking for accountability

### Data Privacy Model

```
Reporter (Anonymous)
    ↓ [Encrypted Data]
Blockchain Storage
    ↓ [Encrypted Processing]
Authorized Investigators
    ↓ [Controlled Decryption]
Resolution & Statistics
```

## 🎯 Key Features

### For Whistleblowers

- **Complete Anonymity**: Your identity is never exposed or stored
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

## 📊 Use Cases

### Food Manufacturing Plants

Workers can report unsafe practices, contamination, or quality violations without fear of job loss.

### Restaurant Employees

Front-line staff can flag hygiene issues, expired ingredients, or improper food handling.

### Supply Chain Partners

Distributors and suppliers can report concerns about product quality or storage conditions.

### Quality Inspectors

Third-party auditors can anonymously report findings that might otherwise go unreported.

### Consumer Reports

Individuals who experience food-related health issues can contribute to safety databases.

## 🔍 Technical Highlights

### FHE Implementation

- **Encrypted Data Types**: euint8, euint32, eaddress for different data fields
- **Homomorphic Operations**: Perform comparisons and calculations on encrypted values
- **Gas Optimization**: Efficient storage and computation patterns
- **Zama fhEVM**: Built on the leading FHE solution for Ethereum

### Security Features

- **Access Control**: Multi-level permissions with modifier-based restrictions
- **Data Validation**: Input sanitization and boundary checks
- **Emergency Controls**: Owner override capabilities for critical situations
- **Upgrade Path**: Designed for future enhancements and improvements

### Frontend Technology

- **Modern UI**: Clean, intuitive dark-themed interface
- **Web3 Integration**: Seamless MetaMask connection
- **Real-time Updates**: Instant feedback on transaction status
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear, user-friendly error messages

## 🌐 Resources

 
- **Live Application**: [https://anonymous-food-safety.vercel.app/](https://anonymous-food-safety.vercel.app/)
- **Zama Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Smart Contract**: `0x09611Fc40177fe10D518C13F5c32fE8E1A29A656`

## 🎬 Demo Video

Experience the platform in action through our comprehensive demonstration video, showcasing:

- Anonymous report submission workflow
- Investigator authorization and case management
- Privacy-preserving statistical queries
- Real-time investigation status updates

Visit the [live application](https://anonymous-food-safety.vercel.app/) to watch the full demonstration.

## 🤝 Contributing

We welcome contributions to enhance food safety through privacy technology:

- **Feature Suggestions**: Propose new capabilities
- **Bug Reports**: Help us improve reliability
- **Documentation**: Enhance guides and examples
- **Testing**: Validate functionality across scenarios
- **Translation**: Make the platform accessible globally

## 🌍 Impact

This platform represents a paradigm shift in food safety reporting:

- **Empowers Whistleblowers**: Removes barriers to reporting violations
- **Enhances Public Health**: Faster identification and resolution of safety issues
- **Builds Trust**: Transparent processes with privacy guarantees
- **Regulatory Innovation**: New model for privacy-preserving oversight
- **Blockchain for Good**: Practical application of Web3 technology

## 📞 Support

For questions, issues, or collaboration opportunities:

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Share ideas and use cases
- **Community**: Join the conversation about privacy-preserving systems

---

**Built with privacy at the core. Powered by Fully Homomorphic Encryption.**

*Protecting those who protect us.*

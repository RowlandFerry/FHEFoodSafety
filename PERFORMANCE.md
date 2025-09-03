# Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the Food Safety Reporting System, including gas optimization, contract optimization, and development workflow optimization.

## Gas Optimization

### Contract-Level Optimizations

#### 1. Storage Optimization

**Use Appropriate Data Types**
```solidity
// ❌ Bad - wastes storage
uint256 smallNumber;  // Uses 32 bytes for small numbers

// ✅ Good - optimized
uint8 smallNumber;    // Uses 1 byte
uint32 mediumNumber;  // Uses 4 bytes
```

**Pack Struct Variables**
```solidity
// ❌ Bad - uses 3 slots (96 bytes)
struct Report {
    uint256 id;           // slot 1
    uint8 status;         // slot 2
    address reporter;     // slot 2 (20 bytes)
}

// ✅ Good - uses 2 slots (64 bytes)
struct Report {
    uint32 id;            // slot 1 (4 bytes)
    uint8 status;         // slot 1 (1 byte)
    address reporter;     // slot 1 (20 bytes) + slot 2 (5 bytes)
    uint256 timestamp;    // slot 2
}
```

**Minimize Storage Reads/Writes**
```solidity
// ❌ Bad - multiple storage reads
function example() external {
    uint value = storageVar;  // SLOAD (2100 gas)
    value = value + 1;
    storageVar = value;        // SSTORE (20000 gas)
}

// ✅ Good - cache in memory
function example() external {
    uint value = storageVar;  // SLOAD once
    value = value + 1;
    storageVar = value;        // SSTORE once
}
```

#### 2. Function Optimization

**Use External vs Public**
```solidity
// ❌ Bad - more expensive
function getData() public view returns (uint) {
    return data;
}

// ✅ Good - cheaper for external calls
function getData() external view returns (uint) {
    return data;
}
```

**Short-Circuit Evaluation**
```solidity
// ❌ Bad - always evaluates both
require(expensiveCheck() && cheapCheck());

// ✅ Good - stops at first failure
require(cheapCheck() && expensiveCheck());
```

**Custom Errors (Solidity ^0.8.4)**
```solidity
// ❌ Bad - uses more gas
require(condition, "Error message string");

// ✅ Good - uses less gas
error CustomError();
if (!condition) revert CustomError();
```

#### 3. Loop Optimization

**Avoid Unbounded Loops**
```solidity
// ❌ Bad - can run out of gas
for (uint i = 0; i < unboundedArray.length; i++) {
    // operations
}

// ✅ Good - limit iterations
uint limit = unboundedArray.length > 100 ? 100 : unboundedArray.length;
for (uint i = 0; i < limit; i++) {
    // operations
}
```

**Cache Array Length**
```solidity
// ❌ Bad - reads length every iteration
for (uint i = 0; i < array.length; i++) {
    // operations
}

// ✅ Good - cache length
uint length = array.length;
for (uint i = 0; i < length; i++) {
    // operations
}
```

**Use ++i instead of i++**
```solidity
// ❌ Bad - creates temporary variable
for (uint i = 0; i < 10; i++) {
    // operations
}

// ✅ Good - direct increment
for (uint i = 0; i < 10; ++i) {
    // operations
}
```

### Compiler Optimizations

#### Hardhat Configuration

```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,  // Balance between deployment and runtime costs
        details: {
          yul: true,  // Enable Yul optimizer
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      viaIR: false,  // Experimental IR-based code generation
      evmVersion: "paris"  // Target EVM version
    }
  }
};
```

#### Optimizer Runs

| Use Case | Recommended Runs | Rationale |
|----------|-----------------|-----------|
| Frequently called | 800-1000 | Optimize runtime costs |
| Rarely called | 200-400 | Balance deployment and runtime |
| Deploy once | 1 | Minimize deployment cost |

## Gas Reporting

### Generate Gas Reports

```bash
# Enable gas reporting
REPORT_GAS=true npm test

# View gas report
cat gas-report.txt
```

### Sample Gas Report

```
·----------------------------------------|---------------------------|-------------|----------------------------·
|  Solc version: 0.8.24                  ·  Optimizer enabled: true  ·  Runs: 800  ·  Block limit: 30000000 gas  │
·········································|···························|·············|·····························
|  Methods                                                                                                        │
··························|··············|·············|·············|·············|··············|··············
|  Contract               ·  Method      ·  Min        ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
··························|··············|·············|·············|·············|··············|··············
|  AnonymousFoodSafety    ·  submit      ·     250000  ·     280000  ·     265000  ·          10  ·       5.30  │
·                         ·  authorize   ·      45000  ·      48000  ·      46500  ·           3  ·       0.93  │
·                         ·  investigate ·      98000  ·     105000  ·     101500  ·           5  ·       2.03  │
··························|··············|·············|·············|·············|··············|··············
```

### Optimization Targets

- **Submit Report**: < 300,000 gas
- **Authorize Investigator**: < 50,000 gas
- **Start Investigation**: < 120,000 gas
- **Complete Investigation**: < 150,000 gas
- **Batch Operations**: < 50,000 gas per item

## Development Workflow Optimization

### 1. Compilation Speed

**Use Hardhat Cache**
```bash
# First compilation (slow)
npm run compile

# Subsequent compilations (fast - uses cache)
npm run compile

# Clean cache if needed
npm run clean
```

**Selective Compilation**
```bash
# Only compile changed files
npx hardhat compile --force false
```

### 2. Testing Speed

**Run Tests in Parallel**
```bash
# Parallel test execution
npx hardhat test --parallel

# Specify number of workers
npx hardhat test --parallel --workers 4
```

**Skip Slow Tests During Development**
```javascript
// test/Example.test.js
describe.skip("Slow integration tests", function() {
    // These tests are skipped during development
});
```

**Use Fixtures for Faster Setup**
```javascript
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function deployFixture() {
    // Setup code runs once per test
    const contract = await deploy();
    return { contract };
}

it("test 1", async function() {
    const { contract } = await loadFixture(deployFixture);
    // Test logic
});
```

### 3. Pre-Commit Hook Optimization

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Only lint changed files (faster)
npx lint-staged

# Skip tests in pre-commit (run in CI instead)
```

```json
// package.json
{
  "lint-staged": {
    "*.sol": ["solhint", "prettier --write"],
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

## Frontend Optimization

### 1. Contract Interaction

**Batch Read Calls**
```javascript
// ❌ Bad - multiple RPC calls
const total = await contract.totalReports();
const stats = await contract.getTotalStats();
const location = await contract.getLocationStats(1001);

// ✅ Good - use multicall
const results = await Promise.all([
    contract.totalReports(),
    contract.getTotalStats(),
    contract.getLocationStats(1001)
]);
```

**Cache Contract Instances**
```javascript
// ❌ Bad - creates new instance each time
function getContract() {
    return new ethers.Contract(address, abi, provider);
}

// ✅ Good - reuse instance
const contract = new ethers.Contract(address, abi, provider);
```

**Use Events for Updates**
```javascript
// ✅ Good - listen for events instead of polling
contract.on("ReportSubmitted", (reportId, timestamp) => {
    console.log(`New report: ${reportId}`);
    updateUI();
});
```

### 2. Transaction Optimization

**Estimate Gas Before Sending**
```javascript
const gasEstimate = await contract.submitReport.estimateGas(...args);
const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer

await contract.submitReport(...args, { gasLimit });
```

**Use Appropriate Gas Price**
```javascript
// Get current gas price
const gasPrice = await provider.getGasPrice();

// Add priority fee for faster confirmation
const priorityFee = ethers.utils.parseUnits("2", "gwei");

await contract.submitReport(...args, {
    gasPrice: gasPrice.add(priorityFee)
});
```

## Monitoring & Profiling

### 1. Gas Profiling

**Track Gas Usage Over Time**
```bash
# Generate gas report
npm run test:gas

# Store in git (optional)
git add gas-report.txt
git commit -m "chore: update gas report"
```

**Set Gas Alerts**
```javascript
// test/gas-limits.test.js
it("should not exceed gas limits", async function() {
    const tx = await contract.submitReport(...);
    const receipt = await tx.wait();

    expect(receipt.gasUsed).to.be.lt(300000);
});
```

### 2. Performance Metrics

**Measure Test Execution Time**
```bash
# Enable timing
npx hardhat test --reporter mocha-multi-reporters

# View timing report
cat test-results.json
```

**Track Deployment Costs**
```javascript
// scripts/deploy.js
const deployTx = await contract.deployTransaction;
const receipt = await deployTx.wait();

console.log(`Deployment cost: ${receipt.gasUsed.toString()} gas`);
console.log(`At 20 gwei: ${ethers.utils.formatEther(
    receipt.gasUsed.mul(ethers.utils.parseUnits("20", "gwei"))
)} ETH`);
```

## Optimization Checklist

### Before Deployment

- [ ] Optimizer enabled and tuned
- [ ] Gas reports reviewed
- [ ] No unbounded loops
- [ ] Storage optimized
- [ ] Custom errors used
- [ ] Events indexed properly
- [ ] View functions for read operations
- [ ] Batch operations available
- [ ] Contract size < 24KB
- [ ] All tests passing

### Regular Maintenance

- [ ] Monthly gas report review
- [ ] Quarterly optimization review
- [ ] Update dependencies
- [ ] Review new optimization techniques
- [ ] Benchmark against competitors

## Tools

### Analysis Tools

```bash
# Contract size analysis
npm run size

# Gas profiling
REPORT_GAS=true npm test

# Security & performance
npm run analyze
```

### Recommended Tools

- **Hardhat Gas Reporter**: Gas usage tracking
- **Hardhat Contract Sizer**: Contract size limits
- **Tenderly**: Transaction debugging
- **Etherscan**: Gas usage history
- **Dune Analytics**: On-chain metrics

## Performance Targets

### Contract Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Deployment Cost | < 5M gas | TBD |
| Submit Report | < 300K gas | TBD |
| Start Investigation | < 120K gas | TBD |
| Complete Investigation | < 150K gas | TBD |
| Batch Update (10 items) | < 500K gas | TBD |

### Development Metrics

| Metric | Target |
|--------|--------|
| Compilation Time | < 10s |
| Test Execution | < 30s |
| Pre-commit Hooks | < 5s |
| CI Pipeline | < 5min |

## Advanced Optimizations

### 1. Assembly Usage

**When to Use**
- Critical performance paths
- Storage manipulation
- Memory operations

**Example**
```solidity
function optimizedFunction() external pure returns (uint256) {
    assembly {
        mstore(0x00, 0x20)
        return(0x00, 0x20)
    }
}
```

⚠️ **Warning**: Use assembly sparingly and with caution.

### 2. Proxy Patterns

**For Upgradeable Contracts**
- EIP-1967: Transparent Proxy
- EIP-1822: Universal Upgradeable Proxy
- Diamond Standard (EIP-2535)

### 3. Layer 2 Solutions

**Consider for High-Volume Apps**
- Arbitrum
- Optimism
- zkSync
- Polygon

## Resources

- [Solidity Optimizer](https://docs.soliditylang.org/en/latest/internals/optimizer.html)
- [Gas Optimization Tips](https://github.com/kadenzipfel/gas-optimizations)
- [Hardhat Performance](https://hardhat.org/hardhat-runner/docs/guides/optimizing-tests)
- [EVM Gas Costs](https://www.evm.codes/)

## Conclusion

Performance optimization is an ongoing process. Regular monitoring, profiling, and optimization ensure the contract remains efficient and cost-effective for users.

---

**Last Updated**: 2025-10-30
**Version**: 1.0.0

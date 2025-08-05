const fs = require("fs");
const path = require("path");

/**
 * Security checks for smart contracts
 * Checks for common vulnerabilities and best practices
 */

const CHECKS = {
  // Critical security issues
  SELFDESTRUCT: {
    pattern: /selfdestruct\s*\(/gi,
    severity: "CRITICAL",
    message: "Usage of selfdestruct found - potential security risk",
  },
  DELEGATECALL: {
    pattern: /delegatecall\s*\(/gi,
    severity: "HIGH",
    message: "Usage of delegatecall found - ensure proper access control",
  },
  TX_ORIGIN: {
    pattern: /tx\.origin/gi,
    severity: "HIGH",
    message: "Usage of tx.origin found - use msg.sender instead",
  },

  // Medium security issues
  UNCHECKED_CALL: {
    pattern: /\.call\{/gi,
    severity: "MEDIUM",
    message: "Low-level call found - ensure return value is checked",
  },
  TIMESTAMP_DEPENDENCY: {
    pattern: /block\.timestamp|now/gi,
    severity: "MEDIUM",
    message: "Timestamp dependency found - miners can manipulate",
  },

  // Best practices
  FLOATING_PRAGMA: {
    pattern: /pragma\s+solidity\s+\^/gi,
    severity: "LOW",
    message: "Floating pragma found - consider locking to specific version",
  },
  MISSING_NATSPEC: {
    pattern: /function\s+\w+.*\{/gi,
    severity: "INFO",
    message: "Consider adding NatSpec documentation",
  },
};

function analyzeContract(filePath) {
  console.log(`\n🔍 Analyzing: ${path.basename(filePath)}`);
  console.log("=".repeat(60));

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const findings = [];

  // Run all checks
  Object.entries(CHECKS).forEach(([checkName, check]) => {
    const matches = content.match(check.pattern);
    if (matches) {
      matches.forEach((match) => {
        // Find line number
        let lineNum = 0;
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1;
          if (content.substring(0, charCount).includes(match)) {
            lineNum = i + 1;
            break;
          }
        }

        findings.push({
          check: checkName,
          severity: check.severity,
          message: check.message,
          line: lineNum,
          code: match,
        });
      });
    }
  });

  // Display findings
  if (findings.length === 0) {
    console.log("✅ No security issues found!");
    return true;
  }

  const severityCounts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  findings.forEach((finding) => {
    severityCounts[finding.severity]++;
    const icon = {
      CRITICAL: "🚨",
      HIGH: "⚠️",
      MEDIUM: "⚡",
      LOW: "💡",
      INFO: "ℹ️",
    }[finding.severity];

    console.log(`${icon} [${finding.severity}] Line ${finding.line}: ${finding.message}`);
    console.log(`   Code: ${finding.code.trim()}`);
  });

  console.log("\n📊 Summary:");
  console.log(`   Critical: ${severityCounts.CRITICAL}`);
  console.log(`   High: ${severityCounts.HIGH}`);
  console.log(`   Medium: ${severityCounts.MEDIUM}`);
  console.log(`   Low: ${severityCounts.LOW}`);
  console.log(`   Info: ${severityCounts.INFO}`);

  // Fail if critical or high severity issues found
  if (severityCounts.CRITICAL > 0 || severityCounts.HIGH > 0) {
    console.log("\n❌ Security check FAILED - Critical or High severity issues found!");
    return false;
  }

  console.log("\n⚠️ Security check PASSED with warnings");
  return true;
}

// Main execution
function main() {
  console.log("🛡️ Smart Contract Security Checker");
  console.log("=" .repeat(60));

  const contractsDir = path.join(__dirname, "..", "..", "contracts");

  if (!fs.existsSync(contractsDir)) {
    console.error("❌ Contracts directory not found!");
    process.exit(1);
  }

  const files = fs
    .readdirSync(contractsDir)
    .filter((file) => file.endsWith(".sol"))
    .map((file) => path.join(contractsDir, file));

  if (files.length === 0) {
    console.log("No Solidity files found!");
    process.exit(0);
  }

  let allPassed = true;
  files.forEach((file) => {
    const passed = analyzeContract(file);
    if (!passed) {
      allPassed = false;
    }
  });

  console.log("\n" + "=".repeat(60));
  if (allPassed) {
    console.log("✅ All contracts passed security checks!");
    process.exit(0);
  } else {
    console.log("❌ Some contracts failed security checks!");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeContract, CHECKS };

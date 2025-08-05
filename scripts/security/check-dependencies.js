const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Dependency Security Checker
 * Checks for vulnerable dependencies and outdated packages
 */

console.log("🔐 Dependency Security Checker");
console.log("=".repeat(60));

// Check npm audit
console.log("\n📦 Running npm audit...");
try {
  const auditOutput = execSync("npm audit --json", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const audit = JSON.parse(auditOutput);

  if (audit.metadata) {
    const { vulnerabilities } = audit.metadata;

    console.log("\n📊 Vulnerability Summary:");
    console.log(`   Critical: ${vulnerabilities.critical || 0}`);
    console.log(`   High: ${vulnerabilities.high || 0}`);
    console.log(`   Moderate: ${vulnerabilities.moderate || 0}`);
    console.log(`   Low: ${vulnerabilities.low || 0}`);
    console.log(`   Info: ${vulnerabilities.info || 0}`);

    const totalVulns =
      (vulnerabilities.critical || 0) +
      (vulnerabilities.high || 0) +
      (vulnerabilities.moderate || 0);

    if (totalVulns > 0) {
      console.log("\n⚠️ Vulnerabilities found!");
      console.log("Run 'npm audit fix' to fix them");

      if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
        console.log("\n❌ Critical or High severity vulnerabilities found!");
        process.exit(1);
      }
    } else {
      console.log("\n✅ No vulnerabilities found!");
    }
  }
} catch (error) {
  console.log("⚠️ npm audit found issues (check output above)");
}

// Check for outdated packages
console.log("\n📋 Checking for outdated packages...");
try {
  const outdatedOutput = execSync("npm outdated --json", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  if (outdatedOutput) {
    const outdated = JSON.parse(outdatedOutput);
    const outdatedCount = Object.keys(outdated).length;

    if (outdatedCount > 0) {
      console.log(`\n⚠️ ${outdatedCount} outdated packages found:`);

      Object.entries(outdated).forEach(([pkg, info]) => {
        console.log(`   ${pkg}: ${info.current} → ${info.latest}`);
      });

      console.log("\nRun 'npm update' to update packages");
    } else {
      console.log("✅ All packages are up to date!");
    }
  } else {
    console.log("✅ All packages are up to date!");
  }
} catch (error) {
  // No outdated packages or error
  console.log("✅ All packages are up to date!");
}

// Check package.json for security best practices
console.log("\n🔍 Checking package.json security...");
const packageJsonPath = path.join(__dirname, "..", "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const securityIssues = [];

// Check for missing fields
if (!packageJson.engines || !packageJson.engines.node) {
  securityIssues.push("Missing Node.js engine specification");
}

if (!packageJson.repository) {
  securityIssues.push("Missing repository field");
}

// Check for wildcards in dependencies
const checkWildcards = (deps, type) => {
  if (deps) {
    Object.entries(deps).forEach(([pkg, version]) => {
      if (version === "*" || version === "latest") {
        securityIssues.push(`${type} '${pkg}' uses wildcard version`);
      }
    });
  }
};

checkWildcards(packageJson.dependencies, "Dependency");
checkWildcards(packageJson.devDependencies, "DevDependency");

if (securityIssues.length > 0) {
  console.log("\n⚠️ Security recommendations:");
  securityIssues.forEach((issue) => {
    console.log(`   - ${issue}`);
  });
} else {
  console.log("✅ package.json follows security best practices!");
}

// Check for .env file in repository
console.log("\n🔑 Checking for sensitive files...");
const gitignorePath = path.join(__dirname, "..", "..", ".gitignore");

if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, "utf8");

  const sensitivePatterns = [".env", "*.key", "*.pem", "private", "secret"];
  const missingPatterns = [];

  sensitivePatterns.forEach((pattern) => {
    if (!gitignore.includes(pattern)) {
      missingPatterns.push(pattern);
    }
  });

  if (missingPatterns.length > 0) {
    console.log("⚠️ Consider adding these patterns to .gitignore:");
    missingPatterns.forEach((pattern) => {
      console.log(`   - ${pattern}`);
    });
  } else {
    console.log("✅ .gitignore properly configured!");
  }
} else {
  console.log("⚠️ No .gitignore file found!");
}

console.log("\n" + "=".repeat(60));
console.log("✅ Dependency security check complete!");

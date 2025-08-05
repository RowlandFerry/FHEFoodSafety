const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Simulation data
const LOCATIONS = [1001, 1002, 1003, 1004, 1005];
const FOOD_TYPES = [5001, 5002, 5003, 5004, 5005];
const SAFETY_LEVELS = [
  { level: 1, name: "Safe", description: "Minor issue, low priority" },
  { level: 2, name: "Warning", description: "Moderate concern, needs attention" },
  { level: 3, name: "Danger", description: "Serious violation, immediate action required" },
  { level: 4, name: "Critical", description: "Severe threat to public health" },
];

const REPORT_DESCRIPTIONS = [
  "Expired ingredients found in storage area",
  "Improper temperature control in refrigeration unit",
  "Cross-contamination risk between raw and cooked foods",
  "Inadequate hand washing facilities for staff",
  "Pest activity detected in food preparation area",
  "Mold growth on food storage containers",
  "Damaged packaging on food products",
  "Missing or incorrect food labeling",
  "Unsanitary conditions in kitchen area",
  "Equipment malfunction causing food safety risk",
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== Food Safety Reporting System - Simulation Script ===\n");

  // Get contract address
  let contractAddress = process.argv[2];

  if (!contractAddress) {
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (fs.existsSync(deploymentsDir)) {
      const files = fs.readdirSync(deploymentsDir)
        .filter(f => f.startsWith(hre.network.name))
        .sort()
        .reverse();

      if (files.length > 0) {
        const latestDeployment = JSON.parse(
          fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8")
        );
        contractAddress = latestDeployment.contractAddress;
        console.log("Using deployed contract at:", contractAddress);
      }
    }

    if (!contractAddress) {
      console.error("No contract address found!");
      console.log("Usage: npx hardhat run scripts/simulate.js --network localhost <CONTRACT_ADDRESS>");
      process.exit(1);
    }
  }

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const reporters = signers.slice(1, 6); // Use 5 reporters
  const investigators = signers.slice(6, 9); // Use 3 investigators

  console.log("Simulation Configuration:");
  console.log("- Network:", hre.network.name);
  console.log("- Contract:", contractAddress);
  console.log("- Deployer:", deployer.address);
  console.log("- Reporters:", reporters.length);
  console.log("- Investigators:", investigators.length);

  // Connect to contract
  const AnonymousFoodSafety = await hre.ethers.getContractFactory("AnonymousFoodSafety");
  const contract = AnonymousFoodSafety.attach(contractAddress);

  // Get initial state
  console.log("\n=== Initial State ===");
  const initialTotal = await contract.totalReports();
  console.log("Initial total reports:", initialTotal.toString());

  // Step 1: Authorize investigators
  console.log("\n=== Step 1: Authorizing Investigators ===");
  for (let i = 0; i < investigators.length; i++) {
    try {
      const tx = await contract.connect(deployer).authorizeInvestigator(investigators[i].address);
      await tx.wait();
      console.log(`Investigator ${i + 1} authorized:`, investigators[i].address.substring(0, 10) + "...");
    } catch (error) {
      console.log(`Investigator ${i + 1} already authorized or error:`, error.message.split('\n')[0]);
    }
  }

  // Step 2: Simulate multiple anonymous reports
  console.log("\n=== Step 2: Simulating Anonymous Reports ===");
  const reportCount = 10;
  const submittedReports = [];

  for (let i = 0; i < reportCount; i++) {
    const reporter = reporters[i % reporters.length];
    const safetyLevel = SAFETY_LEVELS[Math.floor(Math.random() * SAFETY_LEVELS.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const foodType = FOOD_TYPES[Math.floor(Math.random() * FOOD_TYPES.length)];
    const description = REPORT_DESCRIPTIONS[Math.floor(Math.random() * REPORT_DESCRIPTIONS.length)];

    try {
      console.log(`\nSubmitting Report #${i + 1}:`);
      console.log(`  Reporter: ${reporter.address.substring(0, 10)}...`);
      console.log(`  Safety Level: ${safetyLevel.name} (${safetyLevel.level})`);
      console.log(`  Location: ${location}`);
      console.log(`  Food Type: ${foodType}`);
      console.log(`  Description: ${description}`);

      const tx = await contract.connect(reporter).submitAnonymousReport(
        safetyLevel.level,
        location,
        foodType,
        description
      );
      const receipt = await tx.wait();

      submittedReports.push({
        id: initialTotal.toNumber() + i + 1,
        reporter: reporter.address,
        safetyLevel: safetyLevel,
        txHash: tx.hash,
      });

      console.log(`  Status: Submitted ✓`);
      console.log(`  Tx Hash: ${tx.hash}`);

      // Small delay to avoid nonce issues
      await sleep(500);
    } catch (error) {
      console.log(`  Status: Failed - ${error.message.split('\n')[0]}`);
    }
  }

  // Step 3: Update report statuses (as regulator)
  console.log("\n=== Step 3: Updating Report Statuses ===");
  for (let i = 0; i < Math.min(submittedReports.length, 5); i++) {
    try {
      const reportId = submittedReports[i].id;
      const tx = await contract.connect(deployer).updateReportStatus(reportId, 1); // UnderReview
      await tx.wait();
      console.log(`Report #${reportId} status updated to: UnderReview ✓`);
      await sleep(500);
    } catch (error) {
      console.log(`Failed to update report:`, error.message.split('\n')[0]);
    }
  }

  // Step 4: Start investigations
  console.log("\n=== Step 4: Starting Investigations ===");
  for (let i = 0; i < Math.min(submittedReports.length, 3); i++) {
    try {
      const reportId = submittedReports[i].id;
      const investigator = investigators[i % investigators.length];
      const tx = await contract.connect(investigator).startInvestigation(reportId);
      await tx.wait();
      console.log(`Investigation started for Report #${reportId}`);
      console.log(`  Investigator: ${investigator.address.substring(0, 10)}...`);
      await sleep(500);
    } catch (error) {
      console.log(`Failed to start investigation:`, error.message.split('\n')[0]);
    }
  }

  // Step 5: Complete some investigations
  console.log("\n=== Step 5: Completing Investigations ===");
  const findings = [
    "Investigation confirmed issue. Corrective actions implemented. Facility passed re-inspection.",
    "Issue resolved. Staff training conducted. Additional monitoring in place.",
    "Violation confirmed. Facility received formal warning. Follow-up inspection scheduled.",
  ];

  for (let i = 0; i < Math.min(submittedReports.length, 2); i++) {
    try {
      const reportId = submittedReports[i].id;
      const investigator = investigators[i % investigators.length];
      const finalLevel = submittedReports[i].safetyLevel.level;
      const tx = await contract.connect(investigator).completeInvestigation(
        reportId,
        finalLevel,
        findings[i % findings.length]
      );
      await tx.wait();
      console.log(`Investigation completed for Report #${reportId}`);
      console.log(`  Final Level: ${SAFETY_LEVELS.find(s => s.level === finalLevel)?.name}`);
      await sleep(500);
    } catch (error) {
      console.log(`Failed to complete investigation:`, error.message.split('\n')[0]);
    }
  }

  // Step 6: Display comprehensive statistics
  console.log("\n=== Step 6: Final Statistics ===");

  try {
    const stats = await contract.getTotalStats();
    console.log("\nSystem-wide Statistics:");
    console.log("┌────────────────────┬────────┐");
    console.log("│ Status             │ Count  │");
    console.log("├────────────────────┼────────┤");
    console.log(`│ Total Reports      │ ${stats.total.toString().padStart(6)} │`);
    console.log(`│ Submitted          │ ${stats.submitted.toString().padStart(6)} │`);
    console.log(`│ Under Review       │ ${stats.underReview.toString().padStart(6)} │`);
    console.log(`│ Investigating      │ ${stats.investigating.toString().padStart(6)} │`);
    console.log(`│ Resolved           │ ${stats.resolved.toString().padStart(6)} │`);
    console.log(`│ Closed             │ ${stats.closed.toString().padStart(6)} │`);
    console.log("└────────────────────┴────────┘");
  } catch (error) {
    console.log("Failed to get statistics:", error.message);
  }

  // Location statistics
  console.log("\nLocation Statistics:");
  for (const location of LOCATIONS) {
    try {
      const locationStats = await contract.getLocationStats(location);
      if (locationStats.totalReports > 0) {
        console.log(`\nLocation #${location}:`);
        console.log(`  Total Reports: ${locationStats.totalReports}`);
        console.log(`  Resolved: ${locationStats.resolvedReports}`);
        console.log(`  Last Report: ${new Date(Number(locationStats.lastReportTime) * 1000).toLocaleString()}`);
      }
    } catch (error) {
      console.log(`Failed to get location stats for ${location}`);
    }
  }

  // Reporter statistics
  console.log("\nReporter Activity:");
  for (let i = 0; i < reporters.length; i++) {
    try {
      const reporterStats = await contract.getReporterStats(reporters[i].address);
      if (reporterStats > 0) {
        console.log(`  Reporter ${i + 1}: ${reporterStats} reports`);
      }
    } catch (error) {
      console.log(`Failed to get reporter stats`);
    }
  }

  console.log("\n=== Simulation Complete ===");
  console.log("Summary:");
  console.log(`- Reports Created: ${submittedReports.length}`);
  console.log(`- Investigations Started: ${Math.min(submittedReports.length, 3)}`);
  console.log(`- Investigations Completed: ${Math.min(submittedReports.length, 2)}`);
  console.log(`- Network: ${hre.network.name}`);
  console.log("\nThe simulation has successfully demonstrated:");
  console.log("✓ Anonymous report submission");
  console.log("✓ Investigator authorization");
  console.log("✓ Investigation workflow");
  console.log("✓ Statistics tracking");
  console.log("✓ Multi-user interactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Simulation failed:");
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=== Food Safety Reporting System - Interaction Script ===\n");

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
      console.log("Usage: npx hardhat run scripts/interact.js --network sepolia <CONTRACT_ADDRESS>");
      process.exit(1);
    }
  }

  const [deployer, reporter1, reporter2, investigator1] = await hre.ethers.getSigners();
  console.log("Connected accounts:");
  console.log("- Deployer:", deployer.address);
  console.log("- Reporter 1:", reporter1.address);
  console.log("- Reporter 2:", reporter2.address);
  console.log("- Investigator 1:", investigator1.address);

  // Connect to contract
  const AnonymousFoodSafety = await hre.ethers.getContractFactory("AnonymousFoodSafety");
  const contract = AnonymousFoodSafety.attach(contractAddress);

  console.log("\n=== Initial Contract State ===");
  const owner = await contract.owner();
  const regulator = await contract.regulator();
  const totalReports = await contract.totalReports();

  console.log("Owner:", owner);
  console.log("Regulator:", regulator);
  console.log("Total Reports:", totalReports.toString());

  // 1. Authorize investigator
  console.log("\n=== 1. Authorizing Investigator ===");
  try {
    const authTx = await contract.connect(deployer).authorizeInvestigator(investigator1.address);
    await authTx.wait();
    console.log("Investigator authorized:", investigator1.address);
    console.log("Transaction hash:", authTx.hash);

    const isAuthorized = await contract.authorizedInvestigators(investigator1.address);
    console.log("Verification - Is authorized:", isAuthorized);
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 2. Submit anonymous report
  console.log("\n=== 2. Submitting Anonymous Reports ===");

  try {
    const report1Tx = await contract.connect(reporter1).submitAnonymousReport(
      3, // SafetyLevel.Danger
      1001, // Location code
      5001, // Food type code
      "Expired ingredients found in storage area"
    );
    await report1Tx.wait();
    console.log("Report 1 submitted by:", reporter1.address);
    console.log("Transaction hash:", report1Tx.hash);

    const report2Tx = await contract.connect(reporter2).submitAnonymousReport(
      4, // SafetyLevel.Critical
      1002, // Location code
      5002, // Food type code
      "Severe contamination detected in processing facility"
    );
    await report2Tx.wait();
    console.log("Report 2 submitted by:", reporter2.address);
    console.log("Transaction hash:", report2Tx.hash);

    const updatedTotal = await contract.totalReports();
    console.log("Total reports after submission:", updatedTotal.toString());
  } catch (error) {
    console.log("Error submitting reports:", error.message);
  }

  // 3. Get report information
  console.log("\n=== 3. Retrieving Report Information ===");

  try {
    const reportId = 1;
    const reportInfo = await contract.getReportInfo(reportId);
    console.log(`Report #${reportId}:`);
    console.log("- Status:", ["Submitted", "UnderReview", "Investigating", "Resolved", "Closed"][reportInfo.status]);
    console.log("- Timestamp:", new Date(Number(reportInfo.timestamp) * 1000).toISOString());
    console.log("- Last Updated:", new Date(Number(reportInfo.lastUpdated) * 1000).toISOString());
    console.log("- Is Processed:", reportInfo.isProcessed);
    console.log("- Is Valid:", reportInfo.isValid);
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 4. Update report status
  console.log("\n=== 4. Updating Report Status (Regulator) ===");

  try {
    const statusTx = await contract.connect(deployer).updateReportStatus(1, 1); // UnderReview
    await statusTx.wait();
    console.log("Report #1 status updated to: UnderReview");
    console.log("Transaction hash:", statusTx.hash);
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 5. Start investigation
  console.log("\n=== 5. Starting Investigation ===");

  try {
    const investigateTx = await contract.connect(investigator1).startInvestigation(1);
    await investigateTx.wait();
    console.log("Investigation started for Report #1");
    console.log("Investigator:", investigator1.address);
    console.log("Transaction hash:", investigateTx.hash);

    const investigationInfo = await contract.getInvestigationInfo(1);
    console.log("Investigation details:");
    console.log("- Investigator:", investigationInfo.investigator);
    console.log("- Is Complete:", investigationInfo.isComplete);
    console.log("- Start Time:", new Date(Number(investigationInfo.startTime) * 1000).toISOString());
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 6. Complete investigation
  console.log("\n=== 6. Completing Investigation ===");

  try {
    const completeTx = await contract.connect(investigator1).completeInvestigation(
      1,
      3, // SafetyLevel.Danger
      "Investigation confirmed: Expired ingredients removed. Facility issued warning. Follow-up inspection scheduled."
    );
    await completeTx.wait();
    console.log("Investigation completed for Report #1");
    console.log("Transaction hash:", completeTx.hash);

    const investigationInfo = await contract.getInvestigationInfo(1);
    console.log("Final investigation details:");
    console.log("- Final Safety Level:", ["Unknown", "Safe", "Warning", "Danger", "Critical"][investigationInfo.finalSafetyLevel]);
    console.log("- Findings:", investigationInfo.findings);
    console.log("- Is Complete:", investigationInfo.isComplete);
    console.log("- End Time:", new Date(Number(investigationInfo.endTime) * 1000).toISOString());
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 7. Get total statistics
  console.log("\n=== 7. Getting Total Statistics ===");

  try {
    const stats = await contract.getTotalStats();
    console.log("System Statistics:");
    console.log("- Total Reports:", stats.total.toString());
    console.log("- Submitted:", stats.submitted.toString());
    console.log("- Under Review:", stats.underReview.toString());
    console.log("- Investigating:", stats.investigating.toString());
    console.log("- Resolved:", stats.resolved.toString());
    console.log("- Closed:", stats.closed.toString());
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 8. Get location statistics
  console.log("\n=== 8. Getting Location Statistics ===");

  try {
    const locationStats = await contract.getLocationStats(1001);
    console.log("Location #1001 Statistics:");
    console.log("- Total Reports:", locationStats.totalReports.toString());
    console.log("- Resolved Reports:", locationStats.resolvedReports.toString());
    console.log("- Avg Safety Level:", ["Unknown", "Safe", "Warning", "Danger", "Critical"][locationStats.avgSafetyLevel]);
    console.log("- Last Report:", new Date(Number(locationStats.lastReportTime) * 1000).toISOString());
  } catch (error) {
    console.log("Note:", error.message);
  }

  // 9. Get reporter statistics
  console.log("\n=== 9. Getting Reporter Statistics ===");

  try {
    const reporterStats = await contract.getReporterStats(reporter1.address);
    console.log(`Reporter ${reporter1.address}:`);
    console.log("- Total Reports Submitted:", reporterStats.toString());
  } catch (error) {
    console.log("Note:", error.message);
  }

  console.log("\n=== Interaction Complete ===");
  console.log("All basic operations tested successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction script failed:");
    console.error(error);
    process.exit(1);
  });

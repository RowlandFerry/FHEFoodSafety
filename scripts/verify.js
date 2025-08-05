const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting contract verification...");

  // Get contract address from command line or latest deployment
  let contractAddress = process.argv[2];

  if (!contractAddress) {
    console.log("No contract address provided, looking for latest deployment...");

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      console.error("No deployments directory found!");
      console.log("Usage: npx hardhat run scripts/verify.js --network sepolia <CONTRACT_ADDRESS>");
      process.exit(1);
    }

    const files = fs.readdirSync(deploymentsDir)
      .filter(f => f.startsWith(hre.network.name))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error(`No deployment found for network: ${hre.network.name}`);
      console.log("Usage: npx hardhat run scripts/verify.js --network sepolia <CONTRACT_ADDRESS>");
      process.exit(1);
    }

    const latestDeployment = JSON.parse(
      fs.readFileSync(path.join(deploymentsDir, files[0]), "utf8")
    );
    contractAddress = latestDeployment.contractAddress;
    console.log("Using latest deployment:", contractAddress);
  }

  console.log("Network:", hre.network.name);
  console.log("Contract Address:", contractAddress);

  // Verify the contract
  try {
    console.log("\nVerifying contract on Etherscan...");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("\n=== Verification Successful ===");
    console.log("Contract verified on Etherscan!");
    console.log(`View on Etherscan: https://${hre.network.name}.etherscan.io/address/${contractAddress}`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n=== Already Verified ===");
      console.log("Contract is already verified on Etherscan!");
      console.log(`View on Etherscan: https://${hre.network.name}.etherscan.io/address/${contractAddress}`);
    } else {
      console.error("\n=== Verification Failed ===");
      console.error("Error:", error.message);

      // Provide helpful tips
      console.log("\n=== Troubleshooting Tips ===");
      console.log("1. Ensure ETHERSCAN_API_KEY is set in .env file");
      console.log("2. Wait a few moments after deployment before verifying");
      console.log("3. Check that the contract address is correct");
      console.log("4. Verify you're on the correct network");

      process.exit(1);
    }
  }

  console.log("\nVerification completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification script failed:");
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  console.log("Starting deployment process...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the AnonymousFoodSafety contract
  console.log("\nDeploying AnonymousFoodSafety contract...");
  const AnonymousFoodSafety = await hre.ethers.getContractFactory("AnonymousFoodSafety");

  const foodSafety = await AnonymousFoodSafety.deploy();
  await foodSafety.waitForDeployment();

  const contractAddress = await foodSafety.getAddress();
  console.log("AnonymousFoodSafety deployed to:", contractAddress);

  // Get deployment transaction details
  const deployTx = foodSafety.deploymentTransaction();
  console.log("Deployment transaction hash:", deployTx.hash);

  // Wait for confirmations
  console.log("Waiting for confirmations...");
  await deployTx.wait(5);
  console.log("Contract deployment confirmed!");

  // Display contract information
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Name: AnonymousFoodSafety");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Transaction Hash:", deployTx.hash);

  // Get initial contract state
  const owner = await foodSafety.owner();
  const regulator = await foodSafety.regulator();
  const totalReports = await foodSafety.totalReports();

  console.log("\n=== Initial Contract State ===");
  console.log("Owner:", owner);
  console.log("Regulator:", regulator);
  console.log("Total Reports:", totalReports.toString());

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "AnonymousFoodSafety",
    contractAddress: contractAddress,
    deployer: deployer.address,
    transactionHash: deployTx.hash,
    blockNumber: deployTx.blockNumber,
    timestamp: new Date().toISOString(),
    owner: owner,
    regulator: regulator,
  };

  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n=== Deployment Info Saved ===");
  console.log("File:", `deployments/${filename}`);

  if (hre.network.name === "sepolia") {
    console.log("\n=== Etherscan Verification ===");
    console.log("Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("\nTo verify the contract, run:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Verify the contract on Etherscan (if on testnet/mainnet)");
  console.log("2. Run interaction scripts to test functionality");
  console.log("3. Update frontend with new contract address");
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });

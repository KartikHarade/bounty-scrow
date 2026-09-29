import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const { ethers, network } = hre;
  console.log(`\n========================================`);
  console.log(`🚀 Deploying BountyEscrow to ${network.name}`);
  console.log(`========================================\n`);

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Please check your PRIVATE_KEY in .env");
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Address : ${deployer.address}`);
  console.log(`Deployer Balance : ${ethers.formatEther(balance)} MON`);
  console.log(`Network Name     : ${network.name}`);
  const net = await ethers.provider.getNetwork();
  console.log(`Chain ID         : ${net.chainId.toString()}`);

  console.log(`\nDeploying contract...`);
  const BountyEscrow = await ethers.getContractFactory("BountyEscrow");
  const escrow = await BountyEscrow.deploy();

  await escrow.waitForDeployment();
  const contractAddress = await escrow.getAddress();
  const deployTx = escrow.deploymentTransaction();

  console.log(`\n✅ Contract deployed successfully!`);
  console.log(`Contract Address : ${contractAddress}`);
  if (deployTx) {
    console.log(`Deployment TX    : ${deployTx.hash}`);
    console.log(`Explorer Link    : https://testnet.monadexplorer.com/tx/${deployTx.hash}`);
  }
  console.log(`Explorer Address : https://testnet.monadexplorer.com/address/${contractAddress}`);
  console.log(`\nAdd this to your .env:`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not defined in .env");
  }

  console.log(`Verifying BountyEscrow at ${contractAddress}...`);
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("Verification complete!");
  } catch (error) {
    console.error("Verification error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

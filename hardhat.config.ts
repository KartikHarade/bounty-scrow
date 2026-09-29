import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
      accounts: privateKey ? [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`] : [],
      chainId: 10143,
    },
  },
};

export default config;

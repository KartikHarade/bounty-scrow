import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BountyEscrowModule = buildModule("BountyEscrowModule", (m) => {
  const escrow = m.contract("BountyEscrow", []);

  return { escrow };
});

export default BountyEscrowModule;

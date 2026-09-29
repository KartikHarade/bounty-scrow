# SECURE BOUNTY ESCROW 🛡️⚡

An on-chain escrow platform for security bounties on the **Monad Testnet**. Organizations lock rewards in the `BountyEscrow` smart contract, researchers submit cryptographic vulnerability proofs, and approved findings release native MON directly to the researcher with zero intermediaries.

---

## ⚡ Core Architecture

```text
User (Organization / Security Researcher)
  ↓
Next.js 16 + React 19 Frontend (Tailwind CSS Cyberpunk / Glitch UI)
  ↓
wagmi v2 + viem
  ↓
MetaMask (Monad Testnet Chain ID: 10143)
  ↓
Signed Transaction
  ↓
Monad Testnet
  ↓
BountyEscrow.sol
  ↓
Locked Native MON Escrow
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (Strict typing)
- **Smart Contracts**: Solidity 0.8.28, Hardhat v2 (`^2.29.1`)
- **Web3 Libraries**: Wagmi v3 / v2, Viem v2, `@metamask/connect-evm`
- **Network**: Monad Testnet (Chain ID: 10143)
- **Styling**: Cyberpunk / Glitch Design System (Chamfered polygons, scanlines, neon green/magenta/cyan, terminal telemetry)

---

## 📜 Smart Contract: `BountyEscrow.sol`

Located at [`contracts/BountyEscrow.sol`](file:///c:/Web3-SkillBuildZ/contracts/BountyEscrow.sol):

- `createBounty(string title, uint8 severity, bytes32 detailsHash)` payable:
  - Locks exact `msg.value` MON in smart contract escrow
  - Enforces `msg.value > 0`, non-empty title, valid severity (1-4)
- `submitFinding(uint256 bountyId, bytes32 reportHash)`:
  - Anchors cryptographic hash of the finding
  - Prevents creator self-submissions
  - Zero-knowledge confidentiality: raw exploit payloads are **never** stored on public chain
- `approveFinding(uint256 bountyId)` nonReentrant:
  - Creator only
  - Transfers exact escrowed MON to the researcher
  - Marks status as `PAID` with double-payout protection
- `rejectFinding(uint256 bountyId)`:
  - Creator only
  - Rejects finding and reopens the bounty for revised submissions
- `cancelBounty(uint256 bountyId)` nonReentrant:
  - Creator only
  - Blocked if a submission is pending review
  - Refunds the locked reward back to the creator

---

## 🧪 Testing

Comprehensive test suite with 17 unit tests in [`test/BountyEscrow.ts`](file:///c:/Web3-SkillBuildZ/test/BountyEscrow.ts):

```bash
npx hardhat test
```

### Covered Test Matrix:
1. Bounty creation & exact reward escrow
2. Zero-value rejection
3. Empty title & invalid severity rejection
4. Researcher finding submission & event emission
5. Creator self-submission prevention
6. Duplicate pending submission rejection
7. Approval & exact native MON payout transfer
8. Double payout protection
9. Finding rejection & state reset
10. Reopening after rejection
11. Bounty cancellation & full refund
12. Pending submission blocks cancellation
13. Unauthorized approval revert
14. Unauthorized cancellation revert
15. Unauthorized rejection revert
16. Reuse prevention on paid bounties
17. Reuse prevention on cancelled bounties

---

## 🚀 Deployment to Monad Testnet

1. Configure environment variables in `.env`:
```env
DEPLOYER_PRIVATE_KEY=your_private_key_here
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Deploy to Monad Testnet:
```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

4. Set the returned contract address in your `.env`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

---

## 💻 Running the Frontend

Start the development server:
```bash
npm run dev
```

Build production bundle:
```bash
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 3-Minute Demo Journey

1. **Connect Sponsor Wallet**: Connect MetaMask on Monad Testnet.
2. **Create Bounty**: Enter title `AUTH BYPASS IN PAYMENT API`, severity `CRITICAL`, reward `25 MON`.
3. **Escrow Lock**: Sign transaction; verify MON is locked in escrow contract.
4. **Switch to Researcher Wallet**: Switch account in MetaMask.
5. **Submit Finding**: Submit exploit proof (client hashes payload to `bytes32` Keccak-256 and anchors it on-chain).
6. **Switch to Sponsor Wallet**: Open **Sponsor Dashboard**, view pending finding hash.
7. **Approve & Pay**: Click **APPROVE & PAY**; verify transaction mines and 25 MON is released on Monad Explorer!

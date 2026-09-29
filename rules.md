# Rules.md — Secure Bounty Escrow

## Non-Negotiable Rules

### 1. Real Blockchain

The core functionality MUST use a real Solidity smart contract on Monad Testnet.

Wallet connection alone does not count.

### 2. Required Stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- Solidity
- Hardhat
- wagmi
- viem
- MetaMask
- Monad

### 3. Blockchain Source of Truth

Contract state controls:

- creator
- reward
- escrow
- status
- researcher
- submission
- approval
- rejection
- payout
- cancellation

### 4. No Fake Transactions

Never fake:

- transaction hashes
- confirmation
- wallet balance
- contract state
- payout
- blockchain history

### 5. Escrow

The actual escrow amount is `msg.value`.

Require:

```text
msg.value > 0
```

### 6. Authorization

Only the creator can approve, reject or cancel.

The creator cannot submit to their own bounty.

Cancellation is blocked during a pending submission.

### 7. State Integrity

Valid bounty transitions:

```text
OPEN → PAID
OPEN → CANCELLED
```

Valid submission transitions:

```text
NONE → PENDING
PENDING → APPROVED
PENDING → REJECTED
```

Rejection returns the bounty to OPEN.

### 8. Payment Security

Prevent:

- double payout
- payout after cancellation
- unauthorized payout
- reentrancy

Use checks-effects-interactions.

### 9. Confidentiality

Do not put confidential vulnerability reports on-chain.

Store only the report hash/fingerprint.

### 10. Secrets

Never commit:

- private keys
- seed phrases
- API secrets

The frontend must never contain a deployer private key.

### 11. UI

Follow the provided Cyberpunk / Glitch design system.

Do not produce a generic Web3 dashboard.

### 12. Accessibility

Support keyboard navigation, visible focus states, adequate touch targets and reduced motion.

### 13. Scope

Do not sacrifice the core escrow flow for:

- DAO
- token
- NFT
- multi-chain
- arbitration
- reputation
- social feed
- messaging
- AI vulnerability scanner

### 14. Testing

Hardhat tests are mandatory.

### 15. Agent

The agent must:

1. inspect first
2. implement phase-by-phase
3. test after contract changes
4. build/type-check after frontend changes
5. fix errors
6. keep scope locked
7. never fake Web3 behavior

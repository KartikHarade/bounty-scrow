# SECURE BOUNTY ESCROW — MASTER PROMPT FOR ANTIGRAVITY

You are the lead full-stack Web3 engineer, Solidity smart-contract engineer, UI/UX engineer, and product designer for this Buildathon project.

BUILD the complete working MVP. Do not merely explain it or create mockups.

## 1. Project

Project: SECURE BOUNTY ESCROW

Pitch:
"An on-chain escrow platform for security bounties where organizations lock rewards in a Monad smart contract, researchers submit vulnerability findings, and approved findings release the bounty directly to the researcher."

Core journey:

Company creates bounty
→ company locks MON in smart contract
→ researcher submits finding
→ company reviews
→ approve
→ smart contract releases MON
→ researcher gets paid

The blockchain functionality must be real. Do not fake transactions, wallet state, contract state, payout or blockchain history.

## 2. Required Buildathon Stack

- Next.js
- TypeScript
- Tailwind CSS
- Solidity
- Hardhat
- wagmi
- viem
- MetaMask
- Monad Testnet

Required build flow:

AI Agent
→ Next.js App
→ Solidity Contract
→ Hardhat Tests
→ Deploy
→ wagmi / viem
→ Frontend
→ Demo

## 3. Architecture

```text
User
 ↓
Next.js Frontend
 ↓
wagmi + viem
 ↓
MetaMask
 ↓
Signed Transaction
 ↓
Monad Testnet
 ↓
BountyEscrow.sol
 ↓
Escrowed MON
```

The smart contract is the source of truth for escrow, bounty status, submissions, authorization and payout.

## 4. Smart Contract

Create:

`contracts/BountyEscrow.sol`

Use:

```solidity
enum BountyStatus {
    OPEN,
    PAID,
    CANCELLED
}

enum SubmissionStatus {
    NONE,
    PENDING,
    REJECTED,
    APPROVED
}
```

Recommended structures:

```solidity
struct Bounty {
    uint256 id;
    address payable creator;
    uint256 reward;
    string title;
    uint8 severity;
    bytes32 detailsHash;
    BountyStatus status;
}

struct Submission {
    address payable researcher;
    bytes32 reportHash;
    SubmissionStatus status;
}
```

For MVP, allow ONE ACTIVE submission per bounty.

### Functions

`createBounty(string title, uint8 severity, bytes32 detailsHash)` payable

- `msg.value > 0`
- escrow `msg.value`
- creator = `msg.sender`
- status = OPEN
- emit `BountyCreated`

`submitFinding(uint256 bountyId, bytes32 reportHash)`

- bounty exists
- bounty OPEN
- caller is not creator
- submission not already pending
- set researcher
- set PENDING
- emit `FindingSubmitted`

`approveFinding(uint256 bountyId)`

- only creator
- submission PENDING
- bounty OPEN
- mark APPROVED / PAID
- transfer exact reward
- emit `BountyPaid`
- prevent double payout

`rejectFinding(uint256 bountyId)`

- only creator
- submission PENDING
- mark REJECTED
- bounty returns OPEN
- reward remains escrowed
- emit `FindingRejected`

`cancelBounty(uint256 bountyId)`

- only creator
- bounty OPEN
- no pending submission
- refund reward
- mark CANCELLED
- emit `BountyCancelled`

Use checks-effects-interactions and reentrancy protection where appropriate.

## 5. State Machine

```text
CREATE
  ↓
OPEN
  ↓
SUBMISSION PENDING
  ├── APPROVE → PAID
  └── REJECT  → OPEN

OPEN
  └── CANCEL → CANCELLED
```

Do not add arbitration, DAO, reputation, multi-chain or multiple active submissions to v1.

## 6. Security

The contract holds funds, so treat it as real financial code.

Test and protect:

- unauthorized approval
- unauthorized cancellation
- creator self-submission
- zero-value bounty
- invalid bounty IDs
- invalid state transitions
- double payout
- payout after cancellation
- cancellation while submission is pending
- failed transfer
- reentrancy

Never commit private keys or seed phrases.

Never expose a deployer private key to the frontend.

## 7. Confidentiality

Do NOT store actual confidential vulnerability reports on-chain.

The MVP stores a `bytes32 reportHash`.

The UI may collect report content and hash it client-side.

Clearly warn that public blockchain data is public.

## 8. Hardhat

Create:

- Hardhat config
- deployment script
- tests
- ABI/output needed by frontend

Tests must cover:

1. create bounty
2. exact reward escrow
3. zero-value rejection
4. researcher submission
5. creator cannot submit
6. approval
7. payout
8. double-payout protection
9. rejection
10. reopening after rejection
11. cancellation
12. pending blocks cancellation
13. unauthorized approval
14. unauthorized cancellation
15. paid bounty cannot be reused
16. cancelled bounty cannot be reused

## 9. Monad

Configure Monad Testnet through environment variables.

Use `.env.example`.

Never hardcode private keys.

After deployment, record:

- contract address
- network
- chain ID
- deployment transaction

## 10. Frontend

Build:

- landing page
- bounty board
- create bounty
- bounty details
- company dashboard
- researcher dashboard
- wallet/transaction UI

Use real contract state.

### Wallet

Use MetaMask through wagmi.

Handle:

- disconnected
- wrong network
- connection
- signing
- pending
- confirmed
- failed
- insufficient funds
- rejected transaction

### Transaction lifecycle

```text
IDLE
→ CONFIRM IN WALLET
→ SUBMITTING
→ CONFIRMED
```

Never show success before confirmation.

Show transaction hashes and Monad explorer links.

## 11. Create Bounty

Fields:

- title
- severity
- reward
- optional details metadata/hash

Explain:

"Your reward will be locked in the escrow contract."

After transaction:

- wait for receipt
- refresh contract state
- show success
- show transaction hash
- show explorer link

## 12. Submit Finding

Researcher:

- opens bounty
- enters finding/report content
- browser generates cryptographic hash
- submits hash on-chain
- sees PENDING REVIEW

Do not store sensitive report contents directly on-chain.

## 13. Review

Creator sees:

```text
SUBMISSION RECEIVED
Researcher: 0x...
Report Hash: 0x...
Status: PENDING
```

Actions:

`APPROVE & PAY`
`REJECT FINDING`

Approval must execute the real contract transaction.

After approval:

```text
BOUNTY PAID
25 MON
PAID TO 0x...
```

## 14. UI / Design System

Use the supplied Cyberpunk / Glitch design system as the source of truth.

Colors:

- background `#0a0a0f`
- foreground `#e0e0e0`
- card `#12121a`
- muted `#1c1c2e`
- mutedForeground `#6b7280`
- accent `#00ff88`
- accentSecondary `#ff00ff`
- accentTertiary `#00d4ff`
- border `#2a2a3a`
- destructive `#ff3366`

Typography:

- headings: Orbitron / Share Tech Mono / monospace
- body: JetBrains Mono / Fira Code / Consolas / monospace

Required visual signatures:

- chamfered corners
- neon glow
- scanlines
- circuit/grid background
- chromatic aberration
- glitch headline
- terminal section
- blinking cursor
- technical monospace labels
- dark void background

Do NOT make a generic rounded Web3/SaaS dashboard.

## 15. Responsive and Accessibility

Mobile-first.

Minimum 44px touch targets.

Use visible focus states.

Support `prefers-reduced-motion`.

Keep contrast readable despite neon effects.

## 16. Recommended Frontend Structure

```text
frontend/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── wallet/
│   ├── bounty/
│   ├── dashboard/
│   └── effects/
├── lib/
│   ├── contract/
│   ├── wagmi/
│   └── utils/
├── types/
├── public/
├── .env.example
└── README.md
```

## 17. Backend / Blockchain Structure

```text
backend/
├── config/
└── README.md

contracts/
└── BountyEscrow.sol

scripts/
├── deploy.ts
└── verify.ts

test/
└── BountyEscrow.ts
```

The traditional backend must NOT simulate escrow. Blockchain logic belongs in Solidity.

## 18. Development Order

Follow `phases.md`.

1. initialize
2. design system
3. Solidity
4. Hardhat tests
5. deploy Monad
6. wagmi/viem
7. wallet
8. reads
9. create
10. submit
11. approve
12. reject
13. cancel
14. dashboards
15. transaction UX
16. end-to-end test
17. polish
18. demo

## 19. Agent Behavior

Before changing anything:

- inspect the repository
- understand existing files
- preserve useful existing work
- keep architecture coherent

After every major phase:

- run relevant tests
- run build/type checks
- fix errors
- continue

Do not stop at file generation.

Do not leave core functionality as TODOs.

Do not replace blockchain operations with mock functions.

## 20. Demo

The complete 3-minute demo:

1. Company connects wallet.
2. Creates `AUTH BYPASS IN PAYMENT API`.
3. Severity = CRITICAL.
4. Reward = 25 MON.
5. Confirm transaction.
6. Show OPEN bounty.
7. Switch researcher wallet.
8. Submit finding.
9. Confirm transaction.
10. Show PENDING REVIEW.
11. Switch company wallet.
12. Approve.
13. Confirm transaction.
14. Show 25 MON paid to researcher.
15. Show Monad transaction.
16. Explain:

```text
Next.js
→ wagmi
→ viem
→ MetaMask
→ Monad
→ Solidity Escrow
```

## 21. Definition of Done

- frontend builds
- TypeScript passes
- Solidity compiles
- Hardhat tests pass
- contract deployed
- MetaMask connects
- correct network works
- bounty creation works
- escrow works
- submission works
- approval works
- payout works
- rejection works
- cancellation works
- unauthorized actions revert
- UI reflects real state
- transaction hashes visible
- explorer links work
- responsive UI works
- no secrets committed

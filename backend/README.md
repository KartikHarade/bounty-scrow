# Backend / Blockchain Structure

For this MVP, the blockchain layer is the backend.

```text
backend/
├── config/
│   └── networks.md
└── README.md

contracts/
└── BountyEscrow.sol

scripts/
├── deploy.ts
└── verify.ts

test/
└── BountyEscrow.ts
```

### Responsibilities

`BountyEscrow.sol` owns:

- bounty creation
- escrow
- submission state
- access control
- approval
- rejection
- payout
- cancellation
- events

Hardhat owns:

- compilation
- testing
- deployment

Do not create a traditional backend just to simulate blockchain state.

If off-chain report storage is added later, keep it separate from escrow.

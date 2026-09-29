# Phases.md — Secure Bounty Escrow

## Phase 0 — Scope Lock

Freeze the MVP:

```text
CREATE BOUNTY
→ LOCK MON
→ SUBMIT FINDING
→ REVIEW
→ APPROVE / REJECT
→ PAY
```

One active submission per bounty.

## Phase 1 — Initialize

Create the Next.js + TypeScript + Tailwind application and Hardhat/Solidity workspace.

## Phase 2 — Design System

Implement the Cyberpunk / Glitch visual system before blockchain polish.

Required:

- void black
- neon green
- magenta
- cyan
- monospace typography
- chamfered panels
- scanlines
- circuit grid
- glitch headline
- terminal UI
- blinking cursor

## Phase 3 — Solidity

Implement `BountyEscrow.sol` with create, submit, approve, reject and cancel.

## Phase 4 — Tests

Write and pass Hardhat tests for all core happy/error paths.

## Phase 5 — Deploy

Deploy tested contract to Monad Testnet.

## Phase 6 — Wallet

Configure wagmi, viem and MetaMask.

## Phase 7 — Reads

Connect bounty list, details and dashboard to real contract state.

## Phase 8 — Writes

Implement:

- create
- submit
- approve
- reject
- cancel

## Phase 9 — Transaction UX

Implement wallet confirmation, pending, confirmed and failed states.

## Phase 10 — Dashboard

Build company and researcher views.

## Phase 11 — Security

Verify access control, escrow, payout, cancellation and no double-spend.

## Phase 12 — End-to-End Demo

Run the complete company → researcher → company → payout journey on Monad Testnet.

## Phase 13 — Polish

Only after the real flow works:

- animation
- responsive polish
- loading states
- errors
- explorer links
- typography
- terminal effects

## Phase 14 — Final Verification

```text
[ ] Build passes
[ ] Tests pass
[ ] Contract deployed
[ ] Wallet works
[ ] Create works
[ ] Escrow works
[ ] Submit works
[ ] Approve works
[ ] Payout works
[ ] Reject works
[ ] Cancel works
[ ] Unauthorized actions revert
[ ] UI reflects blockchain
[ ] Explorer links work
[ ] No secrets committed
```

# Deployment.md — Secure Bounty Escrow

## Goal

Deploy the tested `BountyEscrow.sol` contract to Monad Testnet and connect its address to the Next.js frontend.

## Before Deployment

Confirm:

- Solidity compiles
- Hardhat tests pass
- deployer wallet has Monad Testnet MON
- `.env` is configured
- private key is NOT committed
- frontend does NOT contain the private key

## Environment Variables

Create the appropriate environment file.

Example:

```env
MONAD_TESTNET_RPC_URL=
DEPLOYER_PRIVATE_KEY=

NEXT_PUBLIC_MONAD_CHAIN_ID=
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_MONAD_EXPLORER_URL=
```

Never commit real secrets.

## Deployment Flow

```text
Solidity
   ↓
Hardhat Compile
   ↓
Hardhat Test
   ↓
Deploy Script
   ↓
Monad Testnet
   ↓
Contract Address
   ↓
Frontend Environment
   ↓
wagmi + viem
```

## Deploy Script

Use:

```text
scripts/deploy.ts
```

The script should:

1. load environment variables
2. obtain the deployer
3. deploy `BountyEscrow`
4. wait for deployment
5. print contract address
6. print deployment transaction
7. print network information

## After Deployment

Record:

```text
Contract:
0x...

Network:
Monad Testnet

Chain ID:
...

Deployment TX:
0x...
```

Set:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## ABI

Make the deployed contract ABI available to the frontend.

Recommended:

```text
frontend/lib/contract/abi.ts
```

Do not manually rewrite the ABI if it can be generated/copied from the Hardhat artifact reliably.

## Frontend Verification

After configuring the contract address:

1. start frontend
2. connect MetaMask
3. verify Monad network
4. read existing bounty state
5. create a small test bounty
6. confirm MON is escrowed
7. submit a test finding
8. approve it
9. confirm researcher receives MON
10. verify the transaction on Monad explorer

## Transaction UX

Every write must display:

```text
CONFIRM IN WALLET
      ↓
SUBMITTING
      ↓
CONFIRMED
```

If rejected:

```text
TRANSACTION ABORTED
```

If reverted:

```text
TRANSACTION FAILED
```

Never show success before confirmation.

## Final Deployment Checklist

- [ ] Contract tests pass
- [ ] Contract deployed
- [ ] Contract address recorded
- [ ] ABI connected
- [ ] Frontend points to deployed contract
- [ ] MetaMask connects
- [ ] Correct network detected
- [ ] Create bounty works
- [ ] Escrow balance changes
- [ ] Submit finding works
- [ ] Approve works
- [ ] Researcher receives payout
- [ ] Reject works
- [ ] Cancel works
- [ ] Explorer links work
- [ ] No secrets committed

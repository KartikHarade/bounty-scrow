# Frontend Structure

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── bounties/page.tsx
│   ├── bounties/[id]/page.tsx
│   ├── create/page.tsx
│   ├── dashboard/company/page.tsx
│   ├── dashboard/researcher/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── wallet/
│   ├── bounty/
│   ├── dashboard/
│   └── effects/
├── lib/
│   ├── contract/
│   │   ├── abi.ts
│   │   ├── address.ts
│   │   ├── reads.ts
│   │   └── writes.ts
│   ├── wagmi/config.ts
│   └── utils/
├── types/
├── public/
├── .env.example
├── package.json
└── tsconfig.json
```

### Responsibilities

Frontend owns:

- UI
- forms
- wallet UX
- transaction UX
- report hashing
- contract reads/writes

Frontend does not own:

- escrow truth
- authorization
- payout logic
- state transition security

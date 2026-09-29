export const bountyEscrowAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "refundAmount", type: "uint256" }
    ],
    name: "BountyCancelled",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "uint8", name: "severity", type: "uint8" },
      { indexed: false, internalType: "bytes32", name: "detailsHash", type: "bytes32" }
    ],
    name: "BountyCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "researcher", type: "address" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" }
    ],
    name: "BountyPaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "researcher", type: "address" }
    ],
    name: "FindingRejected",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bountyId", type: "uint256" },
      { indexed: true, internalType: "address", name: "researcher", type: "address" },
      { indexed: false, internalType: "bytes32", name: "reportHash", type: "bytes32" }
    ],
    name: "FindingSubmitted",
    type: "event"
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "approveFinding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "bounties",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address payable", name: "creator", type: "address" },
      { internalType: "uint256", name: "reward", type: "uint256" },
      { internalType: "string", name: "title", type: "string" },
      { internalType: "uint8", name: "severity", type: "uint8" },
      { internalType: "bytes32", name: "detailsHash", type: "bytes32" },
      { internalType: "enum BountyEscrow.BountyStatus", name: "status", type: "uint8" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "bountyCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "cancelBounty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "uint8", name: "severity", type: "uint8" },
      { internalType: "bytes32", name: "detailsHash", type: "bytes32" }
    ],
    name: "createBounty",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllBounties",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address payable", name: "creator", type: "address" },
          { internalType: "uint256", name: "reward", type: "uint256" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "uint8", name: "severity", type: "uint8" },
          { internalType: "bytes32", name: "detailsHash", type: "bytes32" },
          { internalType: "enum BountyEscrow.BountyStatus", name: "status", type: "uint8" }
        ],
        internalType: "struct BountyEscrow.Bounty[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "getBounty",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address payable", name: "creator", type: "address" },
          { internalType: "uint256", name: "reward", type: "uint256" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "uint8", name: "severity", type: "uint8" },
          { internalType: "bytes32", name: "detailsHash", type: "bytes32" },
          { internalType: "enum BountyEscrow.BountyStatus", name: "status", type: "uint8" }
        ],
        internalType: "struct BountyEscrow.Bounty",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getBountiesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "getSubmission",
    outputs: [
      {
        components: [
          { internalType: "address payable", name: "researcher", type: "address" },
          { internalType: "bytes32", name: "reportHash", type: "bytes32" },
          { internalType: "enum BountyEscrow.SubmissionStatus", name: "status", type: "uint8" }
        ],
        internalType: "struct BountyEscrow.Submission",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "bountyId", type: "uint256" }],
    name: "rejectFinding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "submissions",
    outputs: [
      { internalType: "address payable", name: "researcher", type: "address" },
      { internalType: "bytes32", name: "reportHash", type: "bytes32" },
      { internalType: "enum BountyEscrow.SubmissionStatus", name: "status", type: "uint8" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "bountyId", type: "uint256" },
      { internalType: "bytes32", name: "reportHash", type: "bytes32" }
    ],
    name: "submitFinding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

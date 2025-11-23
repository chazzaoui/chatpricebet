export const PriceBetABI = [
  {
    inputs: [
      { internalType: 'address', name: '_pyth', type: 'address' },
      {
        internalType: 'bytes32',
        name: '_priceFeedId',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'betId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bettor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'prediction',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'targetPrice',
        type: 'uint256',
      },
    ],
    name: 'BetPlaced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'betId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bettor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'won',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'payout',
        type: 'uint256',
      },
    ],
    name: 'BetResolved',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BET_DURATION',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MIN_BET',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'bets',
    outputs: [
      { internalType: 'address', name: 'bettor', type: 'address' },
      { internalType: 'bool', name: 'prediction', type: 'bool' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      {
        internalType: 'uint256',
        name: 'targetPrice',
        type: 'uint256',
      },
      { internalType: 'bool', name: 'resolved', type: 'bool' },
      { internalType: 'bool', name: 'won', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'betCounter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_betId', type: 'uint256' },
    ],
    name: 'getBet',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'bettor',
            type: 'address',
          },
          { internalType: 'bool', name: 'prediction', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'targetPrice',
            type: 'uint256',
          },
          { internalType: 'bool', name: 'resolved', type: 'bool' },
          { internalType: 'bool', name: 'won', type: 'bool' },
        ],
        internalType: 'struct PriceBet.Bet',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
    ],
    name: 'getUserBets',
    outputs: [
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: '_prediction', type: 'bool' },
    ],
    name: 'placeBet',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'priceFeedId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pyth',
    outputs: [
      { internalType: 'contract IPyth', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_betId', type: 'uint256' },
      {
        internalType: 'bytes[]',
        name: '_priceUpdateData',
        type: 'bytes[]',
      },
    ],
    name: 'resolveBet',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'userBets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

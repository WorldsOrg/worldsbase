export const marketplaceAbi = [
  {
    type: 'event',
    name: 'BuyerApprovedForListing',
    inputs: [
      {
        type: 'uint256',
        name: 'listingId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'buyer',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'bool',
        name: 'approved',
        indexed: false,
        internalType: 'bool',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CancelledListing',
    inputs: [
      {
        type: 'address',
        name: 'listingCreator',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'listingId',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CurrencyApprovedForListing',
    inputs: [
      {
        type: 'uint256',
        name: 'listingId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'currency',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'pricePerToken',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewListing',
    inputs: [
      {
        type: 'address',
        name: 'listingCreator',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'listingId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'tuple',
        name: 'listing',
        components: [
          {
            type: 'uint256',
            name: 'listingId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'address',
            name: 'listingCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IDirectListings.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IDirectListings.Status',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct IDirectListings.Listing',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewSale',
    inputs: [
      {
        type: 'address',
        name: 'listingCreator',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'listingId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'buyer',
        indexed: false,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'quantityBought',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'totalPricePaid',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'UpdatedListing',
    inputs: [
      {
        type: 'address',
        name: 'listingCreator',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'listingId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'tuple',
        name: 'listing',
        components: [
          {
            type: 'uint256',
            name: 'listingId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'address',
            name: 'listingCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IDirectListings.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IDirectListings.Status',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct IDirectListings.Listing',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'function',
    name: '_msgData',
    inputs: [],
    outputs: [
      {
        type: 'bytes',
        name: '',
        internalType: 'bytes',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: '_msgSender',
    inputs: [],
    outputs: [
      {
        type: 'address',
        name: 'sender',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approveBuyerForListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_buyer',
        internalType: 'address',
      },
      {
        type: 'bool',
        name: '_toApprove',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approveCurrencyForListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_currency',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_pricePerTokenInCurrency',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'buyFromListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_buyFor',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_quantity',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_currency',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_expectedTotalPrice',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'cancelListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createListing',
    inputs: [
      {
        type: 'tuple',
        name: '_params',
        components: [
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        internalType: 'struct IDirectListings.ListingParameters',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'listingId',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'currencyPriceForListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_currency',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllListings',
    inputs: [
      {
        type: 'uint256',
        name: '_startId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_endId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: '_allListings',
        components: [
          {
            type: 'uint256',
            name: 'listingId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'address',
            name: 'listingCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IDirectListings.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IDirectListings.Status',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        internalType: 'struct IDirectListings.Listing[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllValidListings',
    inputs: [
      {
        type: 'uint256',
        name: '_startId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_endId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: '_validListings',
        components: [
          {
            type: 'uint256',
            name: 'listingId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'address',
            name: 'listingCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IDirectListings.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IDirectListings.Status',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        internalType: 'struct IDirectListings.Listing[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple',
        name: 'listing',
        components: [
          {
            type: 'uint256',
            name: 'listingId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'address',
            name: 'listingCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IDirectListings.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IDirectListings.Status',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        internalType: 'struct IDirectListings.Listing',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isBuyerApprovedForListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_buyer',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isCurrencyApprovedForListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_currency',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalListings',
    inputs: [],
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateListing',
    inputs: [
      {
        type: 'uint256',
        name: '_listingId',
        internalType: 'uint256',
      },
      {
        type: 'tuple',
        name: '_params',
        components: [
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'pricePerToken',
            internalType: 'uint256',
          },
          {
            type: 'uint128',
            name: 'startTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'uint128',
            name: 'endTimestamp',
            internalType: 'uint128',
          },
          {
            type: 'bool',
            name: 'reserved',
            internalType: 'bool',
          },
        ],
        internalType: 'struct IDirectListings.ListingParameters',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AuctionClosed',
    inputs: [
      {
        type: 'uint256',
        name: 'auctionId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'closer',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'auctionCreator',
        indexed: false,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'winningBidder',
        indexed: false,
        internalType: 'address',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CancelledAuction',
    inputs: [
      {
        type: 'address',
        name: 'auctionCreator',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'auctionId',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewAuction',
    inputs: [
      {
        type: 'address',
        name: 'auctionCreator',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'auctionId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'tuple',
        name: 'auction',
        components: [
          {
            type: 'uint256',
            name: 'auctionId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'minimumBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'buyoutBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint64',
            name: 'timeBufferInSeconds',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'bidBufferBps',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'startTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'endTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'address',
            name: 'auctionCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IEnglishAuctions.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IEnglishAuctions.Status',
          },
        ],
        indexed: false,
        internalType: 'struct IEnglishAuctions.Auction',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewBid',
    inputs: [
      {
        type: 'uint256',
        name: 'auctionId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'bidder',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'bidAmount',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'tuple',
        name: 'auction',
        components: [
          {
            type: 'uint256',
            name: 'auctionId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'minimumBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'buyoutBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint64',
            name: 'timeBufferInSeconds',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'bidBufferBps',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'startTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'endTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'address',
            name: 'auctionCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IEnglishAuctions.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IEnglishAuctions.Status',
          },
        ],
        indexed: false,
        internalType: 'struct IEnglishAuctions.Auction',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'bidInAuction',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_bidAmount',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'cancelAuction',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'collectAuctionPayout',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'collectAuctionTokens',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createAuction',
    inputs: [
      {
        type: 'tuple',
        name: '_params',
        components: [
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'minimumBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'buyoutBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint64',
            name: 'timeBufferInSeconds',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'bidBufferBps',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'startTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'endTimestamp',
            internalType: 'uint64',
          },
        ],
        internalType: 'struct IEnglishAuctions.AuctionParameters',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'auctionId',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllAuctions',
    inputs: [
      {
        type: 'uint256',
        name: '_startId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_endId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: '_allAuctions',
        components: [
          {
            type: 'uint256',
            name: 'auctionId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'minimumBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'buyoutBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint64',
            name: 'timeBufferInSeconds',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'bidBufferBps',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'startTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'endTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'address',
            name: 'auctionCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IEnglishAuctions.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IEnglishAuctions.Status',
          },
        ],
        internalType: 'struct IEnglishAuctions.Auction[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllValidAuctions',
    inputs: [
      {
        type: 'uint256',
        name: '_startId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_endId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: '_validAuctions',
        components: [
          {
            type: 'uint256',
            name: 'auctionId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'minimumBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'buyoutBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint64',
            name: 'timeBufferInSeconds',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'bidBufferBps',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'startTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'endTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'address',
            name: 'auctionCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IEnglishAuctions.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IEnglishAuctions.Status',
          },
        ],
        internalType: 'struct IEnglishAuctions.Auction[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAuction',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '_auction',
        components: [
          {
            type: 'uint256',
            name: 'auctionId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'minimumBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'buyoutBidAmount',
            internalType: 'uint256',
          },
          {
            type: 'uint64',
            name: 'timeBufferInSeconds',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'bidBufferBps',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'startTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'endTimestamp',
            internalType: 'uint64',
          },
          {
            type: 'address',
            name: 'auctionCreator',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IEnglishAuctions.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IEnglishAuctions.Status',
          },
        ],
        internalType: 'struct IEnglishAuctions.Auction',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWinningBid',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'address',
        name: '_bidder',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '_currency',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_bidAmount',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAuctionExpired',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isNewWinningBid',
    inputs: [
      {
        type: 'uint256',
        name: '_auctionId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_bidAmount',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalAuctions',
    inputs: [],
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'AcceptedOffer',
    inputs: [
      {
        type: 'address',
        name: 'offeror',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'offerId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'seller',
        indexed: false,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'quantityBought',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'totalPricePaid',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CancelledOffer',
    inputs: [
      {
        type: 'address',
        name: 'offeror',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'offerId',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewOffer',
    inputs: [
      {
        type: 'address',
        name: 'offeror',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'offerId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'assetContract',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'tuple',
        name: 'offer',
        components: [
          {
            type: 'uint256',
            name: 'offerId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'totalPrice',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'expirationTimestamp',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'offeror',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IOffers.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IOffers.Status',
          },
        ],
        indexed: false,
        internalType: 'struct IOffers.Offer',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'function',
    name: 'acceptOffer',
    inputs: [
      {
        type: 'uint256',
        name: '_offerId',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelOffer',
    inputs: [
      {
        type: 'uint256',
        name: '_offerId',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllOffers',
    inputs: [
      {
        type: 'uint256',
        name: '_startId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_endId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: '_allOffers',
        components: [
          {
            type: 'uint256',
            name: 'offerId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'totalPrice',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'expirationTimestamp',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'offeror',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IOffers.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IOffers.Status',
          },
        ],
        internalType: 'struct IOffers.Offer[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllValidOffers',
    inputs: [
      {
        type: 'uint256',
        name: '_startId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_endId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple[]',
        name: '_validOffers',
        components: [
          {
            type: 'uint256',
            name: 'offerId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'totalPrice',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'expirationTimestamp',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'offeror',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IOffers.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IOffers.Status',
          },
        ],
        internalType: 'struct IOffers.Offer[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOffer',
    inputs: [
      {
        type: 'uint256',
        name: '_offerId',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '_offer',
        components: [
          {
            type: 'uint256',
            name: 'offerId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'totalPrice',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'expirationTimestamp',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'offeror',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint8',
            name: 'tokenType',
            internalType: 'enum IOffers.TokenType',
          },
          {
            type: 'uint8',
            name: 'status',
            internalType: 'enum IOffers.Status',
          },
        ],
        internalType: 'struct IOffers.Offer',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'makeOffer',
    inputs: [
      {
        type: 'tuple',
        name: '_params',
        components: [
          {
            type: 'address',
            name: 'assetContract',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'tokenId',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'quantity',
            internalType: 'uint256',
          },
          {
            type: 'address',
            name: 'currency',
            internalType: 'address',
          },
          {
            type: 'uint256',
            name: 'totalPrice',
            internalType: 'uint256',
          },
          {
            type: 'uint256',
            name: 'expirationTimestamp',
            internalType: 'uint256',
          },
        ],
        internalType: 'struct IOffers.OfferParams',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: '_offerId',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'totalOffers',
    inputs: [],
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'constructor',
    name: '',
    inputs: [
      {
        type: 'tuple',
        name: '_marketplaceV3Params',
        components: [
          {
            type: 'tuple[]',
            name: 'extensions',
            components: [
              {
                components: [
                  {
                    internalType: 'string',
                    name: 'name',
                    type: 'string',
                  },
                  {
                    internalType: 'string',
                    name: 'metadataURI',
                    type: 'string',
                  },
                  {
                    internalType: 'address',
                    name: 'implementation',
                    type: 'address',
                  },
                ],
                internalType: 'struct IExtension.ExtensionMetadata',
                name: 'metadata',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'bytes4',
                    name: 'functionSelector',
                    type: 'bytes4',
                  },
                  {
                    internalType: 'string',
                    name: 'functionSignature',
                    type: 'string',
                  },
                ],
                internalType: 'struct IExtension.ExtensionFunction[]',
                name: 'functions',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct IExtension.Extension[]',
          },
          {
            type: 'address',
            name: 'royaltyEngineAddress',
            internalType: 'address',
          },
          {
            type: 'address',
            name: 'nativeTokenWrapper',
            internalType: 'address',
          },
        ],
        internalType: 'struct MarketplaceV3.MarketplaceConstructorParams',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    name: 'InvalidCodeAtRange',
    inputs: [
      {
        type: 'uint256',
        name: '_size',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_start',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_end',
        internalType: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    type: 'error',
    name: 'WriteError',
    inputs: [],
    outputs: [],
  },
  {
    type: 'event',
    name: 'ContractURIUpdated',
    inputs: [
      {
        type: 'string',
        name: 'prevURI',
        indexed: false,
        internalType: 'string',
      },
      {
        type: 'string',
        name: 'newURI',
        indexed: false,
        internalType: 'string',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExtensionAdded',
    inputs: [
      {
        type: 'string',
        name: 'name',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'address',
        name: 'implementation',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'tuple',
        name: 'extension',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        indexed: false,
        internalType: 'struct IExtension.Extension',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExtensionRemoved',
    inputs: [
      {
        type: 'string',
        name: 'name',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'tuple',
        name: 'extension',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        indexed: false,
        internalType: 'struct IExtension.Extension',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ExtensionReplaced',
    inputs: [
      {
        type: 'string',
        name: 'name',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'address',
        name: 'implementation',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'tuple',
        name: 'extension',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        indexed: false,
        internalType: 'struct IExtension.Extension',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FlatPlatformFeeUpdated',
    inputs: [
      {
        type: 'address',
        name: 'platformFeeRecipient',
        indexed: false,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'flatFee',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FunctionDisabled',
    inputs: [
      {
        type: 'string',
        name: 'name',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'bytes4',
        name: 'functionSelector',
        indexed: true,
        internalType: 'bytes4',
      },
      {
        type: 'tuple',
        name: 'extMetadata',
        components: [
          {
            type: 'string',
            name: 'name',
            internalType: 'string',
          },
          {
            type: 'string',
            name: 'metadataURI',
            internalType: 'string',
          },
          {
            type: 'address',
            name: 'implementation',
            internalType: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct IExtension.ExtensionMetadata',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FunctionEnabled',
    inputs: [
      {
        type: 'string',
        name: 'name',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'bytes4',
        name: 'functionSelector',
        indexed: true,
        internalType: 'bytes4',
      },
      {
        type: 'tuple',
        name: 'extFunction',
        components: [
          {
            type: 'bytes4',
            name: 'functionSelector',
            internalType: 'bytes4',
          },
          {
            type: 'string',
            name: 'functionSignature',
            internalType: 'string',
          },
        ],
        indexed: false,
        internalType: 'struct IExtension.ExtensionFunction',
      },
      {
        type: 'tuple',
        name: 'extMetadata',
        components: [
          {
            type: 'string',
            name: 'name',
            internalType: 'string',
          },
          {
            type: 'string',
            name: 'metadataURI',
            internalType: 'string',
          },
          {
            type: 'address',
            name: 'implementation',
            internalType: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct IExtension.ExtensionMetadata',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        type: 'uint8',
        name: 'version',
        indexed: false,
        internalType: 'uint8',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlatformFeeInfoUpdated',
    inputs: [
      {
        type: 'address',
        name: 'platformFeeRecipient',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'platformFeeBps',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PlatformFeeTypeUpdated',
    inputs: [
      {
        type: 'uint8',
        name: 'feeType',
        indexed: false,
        internalType: 'enum IPlatformFee.PlatformFeeType',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        type: 'bytes32',
        name: 'previousAdminRole',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        type: 'bytes32',
        name: 'newAdminRole',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'sender',
        indexed: true,
        internalType: 'address',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'sender',
        indexed: true,
        internalType: 'address',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoyaltyEngineUpdated',
    inputs: [
      {
        type: 'address',
        name: 'previousAddress',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'newAddress',
        indexed: true,
        internalType: 'address',
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: 'fallback',
    name: '',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        type: 'bytes32',
        name: '',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: '_disableFunctionInExtension',
    inputs: [
      {
        type: 'string',
        name: '_extensionName',
        internalType: 'string',
      },
      {
        type: 'bytes4',
        name: '_functionSelector',
        internalType: 'bytes4',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addExtension',
    inputs: [
      {
        type: 'tuple',
        name: '_extension',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        internalType: 'struct IExtension.Extension',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'contractType',
    inputs: [],
    outputs: [
      {
        type: 'bytes32',
        name: '',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'contractURI',
    inputs: [],
    outputs: [
      {
        type: 'string',
        name: '',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'contractVersion',
    inputs: [],
    outputs: [
      {
        type: 'uint8',
        name: '',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'defaultExtensions',
    inputs: [],
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'disableFunctionInExtension',
    inputs: [
      {
        type: 'string',
        name: '_extensionName',
        internalType: 'string',
      },
      {
        type: 'bytes4',
        name: '_functionSelector',
        internalType: 'bytes4',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'enableFunctionInExtension',
    inputs: [
      {
        type: 'string',
        name: '_extensionName',
        internalType: 'string',
      },
      {
        type: 'tuple',
        name: '_function',
        components: [
          {
            type: 'bytes4',
            name: 'functionSelector',
            internalType: 'bytes4',
          },
          {
            type: 'string',
            name: 'functionSignature',
            internalType: 'string',
          },
        ],
        internalType: 'struct IExtension.ExtensionFunction',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllExtensions',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        name: 'allExtensions',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        internalType: 'struct IExtension.Extension[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExtension',
    inputs: [
      {
        type: 'string',
        name: 'extensionName',
        internalType: 'string',
      },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        internalType: 'struct IExtension.Extension',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFlatPlatformFeeInfo',
    inputs: [],
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getImplementationForFunction',
    inputs: [
      {
        type: 'bytes4',
        name: '_functionSelector',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMetadataForFunction',
    inputs: [
      {
        type: 'bytes4',
        name: 'functionSelector',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          {
            type: 'string',
            name: 'name',
            internalType: 'string',
          },
          {
            type: 'string',
            name: 'metadataURI',
            internalType: 'string',
          },
          {
            type: 'address',
            name: 'implementation',
            internalType: 'address',
          },
        ],
        internalType: 'struct IExtension.ExtensionMetadata',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPlatformFeeInfo',
    inputs: [],
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'uint16',
        name: '',
        internalType: 'uint16',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPlatformFeeType',
    inputs: [],
    outputs: [
      {
        type: 'uint8',
        name: '',
        internalType: 'enum IPlatformFee.PlatformFeeType',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleAdmin',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        type: 'bytes32',
        name: '',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleMember',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
      {
        type: 'uint256',
        name: 'index',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'address',
        name: 'member',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleMemberCount',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        type: 'uint256',
        name: 'count',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoyalty',
    inputs: [
      {
        type: 'address',
        name: 'tokenAddress',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'tokenId',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'value',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'address[]',
        name: 'recipients',
        internalType: 'address payable[]',
      },
      {
        type: 'uint256[]',
        name: 'amounts',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getRoyaltyEngineAddress',
    inputs: [],
    outputs: [
      {
        type: 'address',
        name: 'royaltyEngineAddress',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasRoleWithSwitch',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        type: 'address',
        name: '_defaultAdmin',
        internalType: 'address',
      },
      {
        type: 'string',
        name: '_contractURI',
        internalType: 'string',
      },
      {
        type: 'address[]',
        name: '_trustedForwarders',
        internalType: 'address[]',
      },
      {
        type: 'address',
        name: '_platformFeeRecipient',
        internalType: 'address',
      },
      {
        type: 'uint16',
        name: '_platformFeeBps',
        internalType: 'uint16',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isTrustedForwarder',
    inputs: [
      {
        type: 'address',
        name: 'forwarder',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'multicall',
    inputs: [
      {
        type: 'bytes[]',
        name: 'data',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        type: 'bytes[]',
        name: 'results',
        internalType: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'onERC1155BatchReceived',
    inputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'uint256[]',
        name: '',
        internalType: 'uint256[]',
      },
      {
        type: 'uint256[]',
        name: '',
        internalType: 'uint256[]',
      },
      {
        type: 'bytes',
        name: '',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        type: 'bytes4',
        name: '',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'onERC1155Received',
    inputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'bytes',
        name: '',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        type: 'bytes4',
        name: '',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'onERC721Received',
    inputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'bytes',
        name: '',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        type: 'bytes4',
        name: '',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeExtension',
    inputs: [
      {
        type: 'string',
        name: '_extensionName',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'replaceExtension',
    inputs: [
      {
        type: 'tuple',
        name: '_extension',
        components: [
          {
            type: 'tuple',
            name: 'metadata',
            components: [
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'metadataURI',
                type: 'string',
              },
              {
                internalType: 'address',
                name: 'implementation',
                type: 'address',
              },
            ],
            internalType: 'struct IExtension.ExtensionMetadata',
          },
          {
            type: 'tuple[]',
            name: 'functions',
            components: [
              {
                internalType: 'bytes4',
                name: 'functionSelector',
                type: 'bytes4',
              },
              {
                internalType: 'string',
                name: 'functionSignature',
                type: 'string',
              },
            ],
            internalType: 'struct IExtension.ExtensionFunction[]',
          },
        ],
        internalType: 'struct IExtension.Extension',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      {
        type: 'bytes32',
        name: 'role',
        internalType: 'bytes32',
      },
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setContractURI',
    inputs: [
      {
        type: 'string',
        name: '_uri',
        internalType: 'string',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setFlatPlatformFeeInfo',
    inputs: [
      {
        type: 'address',
        name: '_platformFeeRecipient',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_flatFee',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPlatformFeeInfo',
    inputs: [
      {
        type: 'address',
        name: '_platformFeeRecipient',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_platformFeeBps',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setPlatformFeeType',
    inputs: [
      {
        type: 'uint8',
        name: '_feeType',
        internalType: 'enum IPlatformFee.PlatformFeeType',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setRoyaltyEngine',
    inputs: [
      {
        type: 'address',
        name: '_royaltyEngineAddress',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        type: 'bytes4',
        name: 'interfaceId',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'receive',
    name: '',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
];

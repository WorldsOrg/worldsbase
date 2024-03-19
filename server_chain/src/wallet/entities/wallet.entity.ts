import { ApiProperty } from '@nestjs/swagger';

export class Value {
  @ApiProperty({
    example: '4.00',
    description: 'Total Networth in USD',
  })
  total_networth_usd: string;

  @ApiProperty({
    example: [
      {
        chain: 'eth',
        native_balance: '3',
        native_balance_formatted: '0',
        native_balance_usd: '4.00',
        token_balance_usd: '12.00',
        networth_usd: '3.00',
      },
    ],
    description: 'Chains',
  })
  chains: [
    {
      chain: string;
      native_balance: string;
      native_balance_formatted: string;
      native_balance_usd: string;
      token_balance_usd: string;
      networth_usd: string;
    },
  ];
}

export class Stats {
  @ApiProperty({
    example: '4',
    description: 'NFT Count',
  })
  nfts: string;

  @ApiProperty({
    example: '5',
    description: 'Collection Count',
  })
  collections: string;

  @ApiProperty({
    example: {
      total: '4',
    },
    description: 'Total Transactions',
  })
  transactions: {
    total: string;
  };

  @ApiProperty({
    example: {
      total: '1',
    },
    description: 'Total NFT Transfers',
  })
  nft_transfers: {
    total: string;
  };

  @ApiProperty({
    example: {
      total: '2',
    },
    description: 'Total Token Transfers',
  })
  token_transfers: {
    total: string;
  };
}

export class TokenResult {
  @ApiProperty({ example: '0x350845DD3f03F1355233a3A7CEBC24b5aAD05eC5' })
  token_address: string;

  @ApiProperty({ example: 'APE' })
  name: string;

  @ApiProperty({ example: 'APE' })
  symbol: string;

  @ApiProperty({ example: null, nullable: true })
  logo: string | null;

  @ApiProperty({ example: null, nullable: true })
  thumbnail: string | null;

  @ApiProperty({ example: 18 })
  decimals: number;

  @ApiProperty({ example: '101715701444169451516503179' })
  balance: string;
}

export class NFTResult {
  @ApiProperty({ example: 'SYNCING' })
  status: string;

  @ApiProperty({ example: '2000' })
  total: string;

  @ApiProperty({ example: '2' })
  page: string;

  @ApiProperty({ example: '100' })
  page_size: string;

  @ApiProperty({ example: '' })
  cursor: string;

  @ApiProperty({
    example: {
      token_address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
      token_id: '15',
      contract_type: 'ERC721',
      owner_of: '0x057Ec652A4F150f7FF94f089A38008f49a0DF88e',
      block_number: '88256',
      block_number_minted: '88256',
      token_uri: '',
      metadata: '',
      normalized_metadata: '',
      media: '',
      amount: '1',
      name: 'CryptoKitties',
      symbol: 'RARI',
      token_hash: '502cee781b0fb40ea02508b21d319ced',
      last_token_uri_sync: '2021-02-24T00:47:26.647Z',
      last_metadata_sync: '2021-02-24T00:47:26.647Z',
      possible_spam: 'false',
      verified_collection: 'false',
    },
  })
  result: {
    token_address: string;
    token_id: string;
    contract_type: string;
    owner_of: string;
    block_number: string;
    block_number_minted: string;
    token_uri: string;
    metadata: string;
    normalized_metadata: string;
    media: string;
    amount: string;
    name: string;
    symbol: string;
    token_hash: string;
    last_token_uri_sync: string;
    last_metadata_sync: string;
    possible_spam: string;
    verified_collection: string;
  };
}

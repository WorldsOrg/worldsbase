import { ApiProperty } from '@nestjs/swagger';

export class EthWallet {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  address: string;

  @ApiProperty({
    example:
      '0x4183218ccfd27764021e644abe56571c873c6a8f7b88783ab52c68f6fb44ce55',
    description: 'Private Key',
  })
  privateKey: string;

  @ApiProperty({
    example: '1',
    description: 'User ID',
  })
  user_id: string;
}

export class TurnkeyWallet {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  address: string;
}

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

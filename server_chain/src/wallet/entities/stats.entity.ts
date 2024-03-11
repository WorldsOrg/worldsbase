import { ApiProperty } from '@nestjs/swagger';

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

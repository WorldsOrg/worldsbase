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

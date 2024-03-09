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

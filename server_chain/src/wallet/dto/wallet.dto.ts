import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({
    example: '1234',
    description: 'User ID',
  })
  @IsString()
  readonly user_id: string;
}

export class TurnkeyWalletDto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  address: string;
}

export class EthWalletDto {
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

export class WalletInformationDto {
  @ApiProperty()
  @IsString()
  readonly address: string;
}

export class EncryptWalletDto {
  @ApiProperty({
    example:
      '0x4183218ccfd27764021e644abe56571c873c6a8f7b88783ab52c68f6fb44ce55',
    description: 'Private Key',
  })
  @IsString()
  readonly key: string;
  @ApiProperty({
    example: 'my_super_secret_password',
    description: 'Encryption Password',
  })
  @IsString()
  readonly pass: string;
}

export class EncryptedKeyDto {
  @ApiProperty({
    example: 'U2FsdGVkX1+g8zYXJjg4rXZ5Y3',
    description: 'Encrypted Private Key',
  })
  @IsString()
  readonly encrypted: string;
}

export class DecryptWalletDto {
  @ApiProperty({
    example: 'my_super_secret_password',
    description: 'Encryption Password',
  })
  @IsString()
  readonly pass: string;
  @ApiProperty({
    example: 'U2FsdGVkX1+g8zYXJjg4rXZ5Y3',
    description: 'Encrypted Private Key',
  })
  @IsString()
  readonly encryptedData: string;
}

export class DecryptedKeyDto {
  @ApiProperty({
    example:
      '0x4183218ccfd27764021e644abe56571c873c6a8f7b88783ab52c68f6fb44ce55',
    description: 'Private Key',
  })
  @IsString()
  readonly decrypted: string;
}

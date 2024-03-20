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

export class AwsKmsWalletDto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  address: string;

  @ApiProperty({
    example: '0cea4c6e-738b-4c6d-ba7c-541111f9402a',
    description: 'Key ID',
  })
  key_id: string;

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

export class StatsDto {
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

export class ValueDto {
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

export class TokenResultDto {
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

export class NFTResultDto {
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

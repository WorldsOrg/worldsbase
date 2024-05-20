import { ApiProperty } from '@nestjs/swagger';
import { StandardTxData } from '../ethers.service';

export class SendEthRequestDto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  senderAddress: string;
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  receiverAddress: string;
  @ApiProperty({
    example: '1',
    description: 'Amount of ether to send',
  })
  amount: string;
  @ApiProperty({
    example: 1,
    description: 'Chain ID',
  })
  chainId: number;
}

export class MintERC20Dto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Erc20 Contract Address',
  })
  contractAddress: string;
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address of mint receipient',
  })
  to: string;
  @ApiProperty({
    example: '1',
    description: 'Amount of tokens to mint in ether',
  })
  amount: string;
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address of the minter',
  })
  minter: string;
  @ApiProperty({
    example: 1,
    description: 'Chain ID',
  })
  chainId: number;
}

export class EthersTxResponseDto {
  @ApiProperty({
    example:
      '0x0365e3dba99587c1aee7d1cadba6b007727e0e54f0bace71d3bea6f88ead2afe',
    description: 'Transaction Hash',
  })
  txHash: string;
}

export class WalletBalanceResponseDto {
  @ApiProperty({
    example: '0.145',
    description: 'wallet balance in ether',
  })
  balance: string;
}

export class BuyFromListingMarketplaceDto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Contract Address',
  })
  contractAddress: string;

  @ApiProperty({
    example: '1',
    description: 'Listing ID on the Marketplace',
  })
  listingId: string;

  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address that is buying on the Marketplace',
  })
  buyerAddress: string;

  @ApiProperty({
    example: '1',
    description: 'quantity',
  })
  quantity: string;

  @ApiProperty({
    example: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    description: 'address of the currency used to purchase',
  })
  currency: string;

  @ApiProperty({
    example: '1',
    description: 'price of the item on the marketplace',
  })
  price: string;

  @ApiProperty({
    example: 1,
    description: 'Chain ID for the network being used',
  })
  chainId: number;
}

export class SignAndSendAwsKmsDto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Ethereum Address of the transaction sender',
  })
  senderAddress: string;

  @ApiProperty({
    example: '0cea4c6e-738b-4c6d-ba7c-541111f9402a',
    description: 'Key ID that corresponds to the Eth address',
  })
  key_id: string;

  @ApiProperty({
    example: {
      type: 2,
      chainId: 11155111,
      nonce: 16,
      maxPriorityFeePerGas: '2000000000',
      maxFeePerGas: '100000000000',
      gasLimit: '250000',
      to: '0xb6a470c31DC33E898B6fcadA53D97473fd852c35',
      value: '100000000000000',
      data: '0x704232dc0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000fd6ed4a795192283d666265fae6ffca6a9d134240000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee00000000000000000000000000000000000000000000000000005af3107a4000',
    },
    description: 'The transaction data to be signed using Aws Kms',
  })
  txData: StandardTxData;
}

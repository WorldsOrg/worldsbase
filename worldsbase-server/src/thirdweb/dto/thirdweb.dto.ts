import { ApiProperty } from '@nestjs/swagger';

export class MintERC20Dto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  minter: string;
  @ApiProperty({
    example: '1',
    description: 'Chain ID or RPC URL',
  })
  chainIdOrRpc: string;
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Contract Address',
  })
  contractAddress: string;
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  to: string;
  @ApiProperty({
    example: '1000000000000000000',
    description: 'Amount of tokens to mint in wei',
  })
  amount: string;
}

export class BurnERC20Dto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  tokenOwner: string;
  @ApiProperty({
    example: '1',
    description: 'Chain ID or RPC URL',
  })
  chainIdOrRpc: string;
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address',
  })
  contractAddress: string;
  @ApiProperty({
    example: '1000000000000000000',
    description: 'Amount of tokens to burn in wei',
  })
  amount: string;
}

export class ThirdwebResponseDto {
  @ApiProperty({
    example:
      '0x0365e3dba99587c1aee7d1cadba6b007727e0e54f0bace71d3bea6f88ead2afe',
    description: 'Transaction Hash',
  })
  txHash: string;
}

export interface TxReceipt {
  txHash: string;
}

export class QueueReceipt {
  @ApiProperty({
    example: '343354f9-26dc-40b1-955b-76fe413fcdec',
    description: 'Queue ID returned by the engine',
  })
  queueId: string;
}

export class ThirdwebEngineTransferErc1155RequestDto {
  @ApiProperty({ example: '0x1234abcd...', description: 'The wallet address' })
  wallet: string;

  @ApiProperty({ example: '1', description: 'The token ID' })
  tokenId: string;

  @ApiProperty({
    example: '100',
    description: 'The amount to transfer in ether',
  })
  amount: string;

  @ApiProperty({ example: '1', description: 'The chain ID' })
  chainId: string;

  @ApiProperty({
    example: '0x1234abcd...',
    description: 'The contract address',
  })
  contractAddress: string;

  @ApiProperty({
    example: '0x1234abcd...',
    description: 'The backend wallet address',
  })
  backendWalletAddress: string;
}

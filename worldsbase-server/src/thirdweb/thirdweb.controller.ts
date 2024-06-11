import { Body, Controller, Post } from '@nestjs/common';
import {
  BurnERC20Dto,
  MintERC20Dto,
  QueueReceipt,
  ThirdwebEngineBurnErc1155RequestDto,
  ThirdwebEngineBurnErc20RequestDto,
  ThirdwebEngineTransferErc1155RequestDto,
  ThirdwebResponseDto,
  TxReceipt,
} from './dto/thirdweb.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThirdwebService } from './thirdweb.service';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Thirdweb')
@Controller('thirdweb')
export class ThirdwebController {
  constructor(private readonly thirdwebService: ThirdwebService) {}

  @Post('/mint_erc20_vault')
  @ApiOperation({ summary: 'Mints erc20 token(s) to a wallet' })
  @ApiResponse({
    status: 200,
    description: 'Token(s) minted',
    type: ThirdwebResponseDto,
  })
  mintErc20Vault(@Body() mintERC20: MintERC20Dto): Promise<TxReceipt> {
    return this.thirdwebService.mintErc20Vault(
      mintERC20.minter,
      mintERC20.chainIdOrRpc,
      mintERC20.contractAddress,
      mintERC20.to,
      mintERC20.amount,
    );
  }

  @Post('/burn_erc20_vault')
  @ApiOperation({ summary: 'Burns erc20 token(s) from a wallet' })
  @ApiResponse({
    status: 200,
    description: 'Token(s) burned',
    type: ThirdwebResponseDto,
  })
  burnErc20Vault(@Body() burnErc20: BurnERC20Dto): Promise<TxReceipt> {
    return this.thirdwebService.burnERC20Vault(
      burnErc20.tokenOwner,
      burnErc20.chainIdOrRpc,
      burnErc20.contractAddress,
      burnErc20.amount,
    );
  }

  @Post('/transfer_erc1155_engine')
  @ApiOperation({
    summary: 'Transfers erc1155 tokens to a wallet using engine',
  })
  @ApiResponse({
    status: 200,
    description: 'Token(s) transferred',
    type: QueueReceipt,
  })
  transferErc1155Engine(
    @Body() transferErc1155: ThirdwebEngineTransferErc1155RequestDto,
  ): Promise<QueueReceipt> {
    return this.thirdwebService.transferErc1155Engine(
      transferErc1155.wallet,
      transferErc1155.tokenId,
      transferErc1155.amount,
      transferErc1155.chainId,
      transferErc1155.contractAddress,
      transferErc1155.backendWalletAddress,
    );
  }

  @Post('/burn_erc1155_engine')
  @ApiOperation({
    summary: 'Burns an erc1155 token(s) from a wallet using engine',
  })
  @ApiResponse({
    status: 200,
    description: 'Token(s) burned',
    type: QueueReceipt,
  })
  burnErc1155Engine(
    @Body() burnErc1155: ThirdwebEngineBurnErc1155RequestDto,
  ): Promise<QueueReceipt> {
    return this.thirdwebService.burnErc1155Engine(
      burnErc1155.wallet,
      burnErc1155.tokenId,
      burnErc1155.amount,
      burnErc1155.chainId,
      burnErc1155.contractAddress,
    );
  }

  @Post('/burn_erc20_engine')
  @ApiOperation({
    summary: 'Burns erc20 token(s) from a wallet using engine',
  })
  @ApiResponse({
    status: 200,
    description: 'Token(s) burned',
    type: QueueReceipt,
  })
  burnErc20Engine(
    @Body() burnErc20: ThirdwebEngineBurnErc20RequestDto,
  ): Promise<QueueReceipt> {
    return this.thirdwebService.burnErc20Engine(
      burnErc20.wallet,
      burnErc20.amount,
      burnErc20.chainId,
      burnErc20.contractAddress,
    );
  }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EthersService } from './ethers.service';
import {
  EthersTxResponseDto,
  SendEthRequestDto,
  WalletBalanceResponseDto,
  MintERC20Dto,
  MultiMintERC20Dto,
  MultiEthersTxResponseDto,
  BurnERC20Dto,
} from './dto/ethers.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Chain')
@Controller('ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}

  @Post('/send_eth_vault')
  @ApiOperation({
    summary:
      'Signs and sends a tx that sends eth from one address to another using a private key stored in vault',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: EthersTxResponseDto,
  })
  async sendEthVault(@Body() sendEthData: SendEthRequestDto): Promise<string> {
    return this.ethersService.sendEthVault(
      sendEthData.senderAddress,
      sendEthData.receiverAddress,
      sendEthData.amount,
      sendEthData.chainId,
    );
  }

  @Post('/mint_erc20_vault')
  @ApiOperation({
    summary:
      'Creates, signs and sends a tx that mints erc20 tokens to a receiver address using a private key stored in vault',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: EthersTxResponseDto,
  })
  async mintErc20Vault(@Body() mintErc20: MintERC20Dto): Promise<string> {
    return this.ethersService.mintErc20Vault(
      mintErc20.contractAddress,
      mintErc20.to,
      mintErc20.amount,
      mintErc20.minter,
      mintErc20.chainId,
    );
  }

  @Post('/multi_mint_erc20_vault')
  @ApiOperation({
    summary:
      'Creates, signs and sends txs that mint erc20 tokens to multiple recipients using a private key stored in vault given different amounts to mint and waits for each tx to complete before starting the next one',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: MultiEthersTxResponseDto,
  })
  async multiMintErc20Vault(
    @Body() multiMintErc20: MultiMintERC20Dto,
  ): Promise<string> {
    return this.ethersService.multiMintErc20Vault(
      multiMintErc20.contractAddress,
      multiMintErc20.data,
      multiMintErc20.minter,
      multiMintErc20.chainId,
    );
  }

  @Post('/burn_erc20_vault')
  @ApiOperation({
    summary:
      'Creates, signs and sends a tx that burns erc20 tokens from a wallet with the private key stored in vault',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: EthersTxResponseDto,
  })
  async burnErc20Vault(@Body() burnErc20: BurnERC20Dto): Promise<string> {
    return this.ethersService.burnErc20Vault(
      burnErc20.contractAddress,
      burnErc20.tokenOwner,
      burnErc20.amount,
      burnErc20.chainId,
    );
  }

  @Get('/wallet_balance')
  @ApiOperation({ summary: 'Returns a wallets eth balance in ether' })
  @ApiResponse({
    status: 200,
    description: 'Returns a wallets eth balance in ether',
    type: WalletBalanceResponseDto,
  })
  getNFTs(
    @Query('address') address: string,
    @Query('chainId') chainId: number,
  ): Promise<string> {
    return this.ethersService.getBalance(address, chainId);
  }

  /**
   * Should we delete these endpoints since we are not using aws kms for now?
   */
  // @Post('/create_buy_from_listing_tx')
  // @ApiOperation({
  //   summary:
  //     'Creates the transaction for buying from a marketplace contract listing',
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Tx created',
  //   type: StandardTxData,
  // })
  // async createBuyFromListingTx(
  //   @Body() buyFromListingMarketplaceDto: BuyFromListingMarketplaceDto,
  // ): Promise<StandardTxData> {
  //   return this.ethersService.createBuyFromListingTx(
  //     buyFromListingMarketplaceDto.contractAddress,
  //     buyFromListingMarketplaceDto.listingId,
  //     buyFromListingMarketplaceDto.buyerAddress,
  //     buyFromListingMarketplaceDto.quantity,
  //     buyFromListingMarketplaceDto.currency,
  //     buyFromListingMarketplaceDto.price,
  //     buyFromListingMarketplaceDto.chainId,
  //   );
  // }

  // @Post('/sign_send_tx_aws_kms_sepolia')
  // @ApiOperation({
  //   summary:
  //     'signs a tx using aws kms and then sends the signed tx on the sepolia network',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'success',
  //   type: String,
  // })
  // async signAndSend(
  //   @Body() signAndSendAwsKmsDto: SignAndSendAwsKmsDto,
  // ): Promise<StandardTxData> {
  //   return this.ethersService.signAndSendTxAwsKms(
  //     signAndSendAwsKmsDto.senderAddress,
  //     signAndSendAwsKmsDto.key_id,
  //     signAndSendAwsKmsDto.txData,
  //   );
  // }
}

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EthersService } from './ethers.service';
import {
  EthersTxResponseDto,
  SendEthRequestDto,
  WalletBalanceResponseDto,
  MintERC20Dto,
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

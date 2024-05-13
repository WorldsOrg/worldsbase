import { Body, Controller, Post } from '@nestjs/common';
import { EthersService, SendEthRequest, SignRequest } from './ethers.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardTxData } from './ethers.service';
import {
  BuyFromListingMarketplaceDto,
  SignAndSendAwsKmsDto,
} from './dto/ethers.dto';

@ApiTags('Chain')
@Controller('ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}

  @Post('/create_buy_from_listing_tx')
  @ApiOperation({
    summary:
      'Creates the transaction for buying from a marketplace contract listing',
  })
  @ApiResponse({
    status: 201,
    description: 'Tx created',
    type: StandardTxData,
  })
  async createBuyFromListingTx(
    @Body() buyFromListingMarketplaceDto: BuyFromListingMarketplaceDto,
  ): Promise<StandardTxData> {
    return this.ethersService.createBuyFromListingTx(
      buyFromListingMarketplaceDto.contractAddress,
      buyFromListingMarketplaceDto.listingId,
      buyFromListingMarketplaceDto.buyerAddress,
      buyFromListingMarketplaceDto.quantity,
      buyFromListingMarketplaceDto.currency,
      buyFromListingMarketplaceDto.price,
      buyFromListingMarketplaceDto.chainId,
    );
  }

  @Post('/sign_send_tx_aws_kms_sepolia')
  @ApiOperation({
    summary:
      'signs a tx using aws kms and then sends the signed tx on the sepolia network',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
  })
  async signAndSend(
    @Body() signAndSendAwsKmsDto: SignAndSendAwsKmsDto,
  ): Promise<StandardTxData> {
    return this.ethersService.signAndSendTxAwsKms(
      signAndSendAwsKmsDto.senderAddress,
      signAndSendAwsKmsDto.key_id,
      signAndSendAwsKmsDto.txData,
    );
  }

  @Post('/sign_tx_vault')
  @ApiOperation({
    summary:
      'signs a tx using private key stored in vault and returns the signed tx',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
  })
  async vaultSign(@Body() vaultSignData: SignRequest): Promise<string> {
    return this.ethersService.signTxVault(
      vaultSignData.signerPubKey,
      vaultSignData.transaction,
    );
  }

  @Post('/send_eth_vault')
  @ApiOperation({
    summary:
      'Signs and sends a tx that sends eth from one address to another using a private key stored in vault',
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    type: String,
  })
  async sendEthVault(@Body() sendEthData: SendEthRequest): Promise<string> {
    return this.ethersService.sendEthVault(
      sendEthData.senderAddress,
      sendEthData.receiverAddress,
      sendEthData.amount,
      sendEthData.chainId,
    );
  }
}

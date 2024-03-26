import { Body, Controller, Post } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandardTxData } from './ethers.service';
import {
  BuyFromListingMarketplaceDto,
  SignAndSendAwsKmsDto,
} from './dto/ethers.dto';

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
    return this.ethersService.signAndSendTxAwsKmsSepolia(
      signAndSendAwsKmsDto.senderAddress,
      signAndSendAwsKmsDto.key_id,
      signAndSendAwsKmsDto.txData,
    );
  }
}

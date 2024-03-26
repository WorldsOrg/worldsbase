import { Body, Controller, Post } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandardTxData } from './ethers.service';
import { BuyFromListingMarketplaceDto } from './dto/ethers.dto';

@Controller('ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}

  @Post('/create_buy_from_listing_tx')
  @ApiOperation({ summary: 'Creates a wallet using AWS KMS' })
  @ApiResponse({
    status: 201,
    description: 'Tx created',
    type: StandardTxData,
  })
  async makeTx(
    @Body() buyFromListingMarketplaceDto: BuyFromListingMarketplaceDto,
  ): Promise<string> {
    const txData = await this.ethersService.createBuyFromListingTx(
      buyFromListingMarketplaceDto.contractAddress,
      buyFromListingMarketplaceDto.listingId,
      buyFromListingMarketplaceDto.buyerAddress,
      buyFromListingMarketplaceDto.quantity,
      buyFromListingMarketplaceDto.currency,
      buyFromListingMarketplaceDto.price,
    );

    return this.ethersService.signAndSendTxSepolia(
      buyFromListingMarketplaceDto.buyerAddress,
      buyFromListingMarketplaceDto.keyId,
      txData,
    );

    // return this.ethersService.createBuyFromListingTx(
    //   buyFromListingMarketplaceDto.contractAddress,
    //   buyFromListingMarketplaceDto.listingId,
    //   buyFromListingMarketplaceDto.buyerAddress,
    //   buyFromListingMarketplaceDto.quantity,
    //   buyFromListingMarketplaceDto.currency,
    //   buyFromListingMarketplaceDto.price,
    // );
  }
}

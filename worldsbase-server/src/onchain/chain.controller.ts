import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ApiHeader, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AuctionListingDto,
  DirectListingDto,
  MintToDto,
  ReceiptDto,
} from './dto/onchain.dto';
import { DirectListingV3, EnglishAuction } from '@thirdweb-dev/sdk';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Chain')
@Controller('chain')
export class ChainController {
  constructor(private readonly controllerService: ChainService) {}

  @ApiOperation({ summary: 'Mints NFT to the given address' })
  @ApiResponse({
    status: 201,
    description: 'NFT minted to the given address',
    type: ReceiptDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error minting NFT',
  })
  @Post('/mintto')
  mintTo(@Body() mintToDto: MintToDto): Promise<ReceiptDto> {
    return this.controllerService.mintTo(mintToDto.toAddress);
  }

  @Get('/marketplace_direct')
  @ApiResponse({
    status: 200,
    description: 'Marketplace listings',
    type: DirectListingDto,
  })
  @ApiOperation({ summary: 'Returns the marketplace direct listings' })
  marketplaceDirect(
    @Query('address') address: string,
  ): Promise<DirectListingV3[]> {
    return this.controllerService.marketplaceDirect(address);
  }

  @Get('/marketplace_auction')
  @ApiOperation({ summary: 'Returns the marketplace auction listings' })
  @ApiResponse({
    status: 200,
    description: 'Marketplace listings',
    type: AuctionListingDto,
  })
  marketplaceAuction(
    @Query('address') address: string,
  ): Promise<EnglishAuction[]> {
    return this.controllerService.marketplaceAuction(address);
  }
}

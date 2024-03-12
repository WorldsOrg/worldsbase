import { Controller, Post, Body } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ApiHeader, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MintToDto } from './dto/onchain.dto';
import { Receipt } from './entities/wallet.entity';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Chain')
@Controller('chain')
export class ChainController {
  constructor(private readonly controllerService: ChainService) {}

  @ApiOperation({ summary: 'Mints NFT to the given address' })
  @ApiResponse({
    status: 201,
    description: 'NFT minted to the given address',
    type: Receipt,
  })
  @ApiResponse({
    status: 500,
    description: 'Error minting NFT',
  })
  @Post('/mintto')
  mintTo(@Body() mintToDto: MintToDto): Promise<Receipt> {
    return this.controllerService.mintTo(mintToDto.toAddress);
  }
}

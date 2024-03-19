import { Controller, Post, Body } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ApiHeader, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MintToDto, ReceiptDto } from './dto/onchain.dto';

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
}

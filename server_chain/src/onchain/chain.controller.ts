import { Controller, Post, Body } from '@nestjs/common';
import { ChainService } from './chain.service';

class MintToDto {
  toAddress: string;
}

@Controller('chain')
export class ChainController {
  constructor(private readonly controllerService: ChainService) {}

  @Post('/mintto')
  mintTo(@Body() mintToDto: MintToDto): Promise<string> {
    return this.controllerService.mintTo(mintToDto.toAddress);
  }
}

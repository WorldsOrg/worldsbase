import { Controller, Get } from '@nestjs/common';
import { EthersService } from './ethers.service';

@Controller('ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}

  @Get('test')
  public async makeTransaction() {
    return this.ethersService.makeTransaction();
  }
}

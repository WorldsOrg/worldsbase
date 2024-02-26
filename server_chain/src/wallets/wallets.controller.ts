import { Body, Controller, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';

class CreateWalletDto {
  user_id: string;
}

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('/create')
  createWallet(@Body() createWalletDto: CreateWalletDto): Promise<string> {
    return this.walletsService.createWallet(createWalletDto.user_id);
  }
}

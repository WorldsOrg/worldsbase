import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { EthWallet, TurnkeyWallet } from './entities/wallet.entity';
import { Stats } from './entities/stats.entity';
import { Value } from './entities/value.entity';
import Moralis from 'moralis';

@ApiHeader({ name: 'x-api-key', required: true })
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {
    Moralis.start({
      apiKey: process.env.MORALIS_API_KEY as string,
    });
  }

  @Post('/create_turnkey_wallet')
  @ApiOperation({ summary: 'Creates a wallet using Turnkey' })
  @ApiResponse({
    status: 201,
    description: 'Created wallet address',
    type: TurnkeyWallet,
  })
  createWallet(@Body() createWalletDto: CreateWalletDto): Promise<string> {
    return this.walletsService.createWallet(createWalletDto.user_id);
  }

  @Post('/create_wallet')
  @ApiOperation({ summary: 'Creates public and private key' })
  @ApiResponse({
    status: 201,
    description: 'Created wallet information',
    type: EthWallet,
  })
  createWalletAddress(@Body() createWalletDto: CreateWalletDto): Promise<any> {
    return this.walletsService.createWalletAddress(createWalletDto.user_id);
  }

  @Get('/stats')
  @ApiOperation({ summary: 'Returns wallet stats' })
  @ApiResponse({
    status: 201,
    description: 'Wallet stats',
    type: Stats,
  })
  getStats(@Query('wallet') wallet: string): Promise<any> {
    return this.walletsService.getStats(wallet);
  }

  @Get('/value')
  @ApiOperation({ summary: 'Returns wallet worth' })
  @ApiResponse({
    status: 201,
    description: 'Wallet value',
    type: Value,
  })
  getValue(@Query('wallet') wallet: string): Promise<any> {
    return this.walletsService.getValue(wallet);
  }
}

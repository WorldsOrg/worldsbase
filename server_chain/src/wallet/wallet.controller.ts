import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/wallet.dto';
import {
  EthWallet,
  TurnkeyWallet,
  Stats,
  Value,
} from './entities/wallet.entity';
import Moralis from 'moralis';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Wallet')
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {
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
    return this.walletService.createWallet(createWalletDto.user_id);
  }

  @Post('/create_wallet')
  @ApiOperation({ summary: 'Creates public and private key' })
  @ApiResponse({
    status: 201,
    description: 'Created wallet information',
    type: EthWallet,
  })
  createWalletAddress(@Body() createWalletDto: CreateWalletDto): Promise<any> {
    return this.walletService.createWalletAddress(createWalletDto.user_id);
  }

  @Get('/stats')
  @ApiOperation({ summary: 'Returns wallet stats' })
  @ApiResponse({
    status: 201,
    description: 'Wallet stats',
    type: Stats,
  })
  getStats(@Query('wallet') wallet: string): Promise<any> {
    return this.walletService.getStats(wallet);
  }

  @Get('/value')
  @ApiOperation({ summary: 'Returns wallet worth' })
  @ApiResponse({
    status: 201,
    description: 'Wallet value',
    type: Value,
  })
  getValue(@Query('wallet') wallet: string): Promise<any> {
    return this.walletService.getValue(wallet);
  }
}

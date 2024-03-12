import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/wallet.dto';
import {
  EthWallet,
  TurnkeyWallet,
  Stats,
  Value,
  NFTResult,
  TokenResult,
} from './entities/wallet.entity';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

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

  @Get('/tokens')
  @ApiOperation({
    summary: 'Returns all tokens for an address',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens from wallet',
    type: TokenResult,
  })
  getTokens(@Query('wallet') wallet: string): Promise<TokenResult[]> {
    return this.walletService.getTokens(wallet);
  }

  @Get('/nft')
  @ApiOperation({ summary: 'Returns NFTs' })
  @ApiResponse({
    status: 201,
    description: 'Returns NFTs from a wallet',
    type: NFTResult,
  })
  getNFTs(@Query('wallet') wallet: string): Promise<NFTResult[]> {
    return this.walletService.getNFTs(wallet);
  }
}

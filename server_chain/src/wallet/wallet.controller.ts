import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import {
  CreateWalletDto,
  DecryptWalletDto,
  DecryptedKeyDto,
  EncryptWalletDto,
  EncryptedKeyDto,
  EthWalletDto,
  NFTResultDto,
  StatsDto,
  TokenResultDto,
  TurnkeyWalletDto,
  ValueDto,
} from './dto/wallet.dto';

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
    type: TurnkeyWalletDto,
  })
  createWallet(
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<TurnkeyWalletDto> {
    return this.walletService.createWallet(createWalletDto.user_id);
  }

  @Post('/create_wallet')
  @ApiOperation({ summary: 'Creates public and private key' })
  @ApiResponse({
    status: 201,
    description: 'Created wallet information',
    type: EthWalletDto,
  })
  createWalletAddress(
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<EthWalletDto> {
    return this.walletService.createWalletAddress(createWalletDto.user_id);
  }

  @Post('/encrypt_wallet')
  @ApiOperation({ summary: 'Encrypts private key' })
  @ApiResponse({
    status: 201,
    description: 'Encrypted private key',
    type: EncryptedKeyDto,
  })
  encryptWallet(@Body() encryptWalletDto: EncryptWalletDto): Promise<any> {
    return this.walletService.encryptWallet(
      encryptWalletDto.key,
      encryptWalletDto.pass,
    );
  }

  @Post('/decrypt_wallet')
  @ApiOperation({ summary: 'Decrypts private key' })
  @ApiResponse({
    status: 201,
    description: 'Decrypted private key',
    type: DecryptedKeyDto,
  })
  decryptWallet(
    @Body() decryptWalletDto: DecryptWalletDto,
  ): Promise<DecryptedKeyDto> {
    return this.walletService.decryptWallet(
      decryptWalletDto.encryptedData,
      decryptWalletDto.pass,
    );
  }

  @Get('/stats')
  @ApiOperation({ summary: 'Returns wallet stats' })
  @ApiResponse({
    status: 201,
    description: 'Wallet stats',
    type: StatsDto,
  })
  getStats(@Query('wallet') wallet: string): Promise<StatsDto> {
    return this.walletService.getStats(wallet);
  }

  @Get('/value')
  @ApiOperation({ summary: 'Returns wallet worth' })
  @ApiResponse({
    status: 201,
    description: 'Wallet value',
    type: ValueDto,
  })
  getValue(@Query('wallet') wallet: string): Promise<ValueDto> {
    return this.walletService.getValue(wallet);
  }

  @Get('/tokens')
  @ApiOperation({
    summary: 'Returns all tokens for an address',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens from wallet',
    type: TokenResultDto,
  })
  getTokens(@Query('wallet') wallet: string): Promise<TokenResultDto[]> {
    return this.walletService.getTokens(wallet);
  }

  @Get('/nft')
  @ApiOperation({ summary: 'Returns NFTs' })
  @ApiResponse({
    status: 201,
    description: 'Returns NFTs from a wallet',
    type: NFTResultDto,
  })
  getNFTs(@Query('wallet') wallet: string): Promise<NFTResultDto[]> {
    return this.walletService.getNFTs(wallet);
  }
}

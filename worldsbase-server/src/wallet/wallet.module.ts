import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MoralisModule } from '../moralis/moralis.module';
@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports: [MoralisModule],
})
export class WalletModule {}

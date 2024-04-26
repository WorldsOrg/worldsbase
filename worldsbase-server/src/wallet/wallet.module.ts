import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MoralisModule } from '../moralis/moralis.module';
import { AwsKmsModule } from 'src/awskms/awskms.module';
import { VaultModule } from 'src/vault/vault.module';
@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports: [MoralisModule, AwsKmsModule, VaultModule],
})
export class WalletModule {}

import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { EthersController } from './ethers.controller';
import { AwsKmsModule } from 'src/awskms/awskms.module';
import { VaultModule } from 'src/vault/vault.module';

@Module({
  controllers: [EthersController],
  providers: [EthersService],
  imports: [AwsKmsModule, VaultModule],
})
export class EthersModule {}

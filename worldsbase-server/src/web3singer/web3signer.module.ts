import { Module } from '@nestjs/common';
import { VaultModule } from 'src/vault/vault.module';
import { Web3SignerService } from './web3signer.service';
import { K8sModule } from 'src/k8s/k8s.module';
import { Web3SignerController } from './web3signer.controller';
@Module({
  controllers: [Web3SignerController],
  providers: [Web3SignerService],
  imports: [K8sModule, VaultModule],
})
export class Web3SignerModule {}

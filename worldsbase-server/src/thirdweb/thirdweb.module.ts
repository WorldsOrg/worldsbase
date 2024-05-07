// src/thirdweb/thirdweb.module.ts
import { Module, Global } from '@nestjs/common';
import { ThirdwebService } from './thirdweb.service';
import { VaultModule } from 'src/vault/vault.module';
import { ThirdwebController } from './thirdweb.controller';

@Global()
@Module({
  providers: [ThirdwebService],
  controllers: [ThirdwebController],
  exports: [ThirdwebService],
  imports: [VaultModule],
})
export class ThirdwebModule {}

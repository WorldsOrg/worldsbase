// src/thirdweb/thirdweb.module.ts
import { Module, Global } from '@nestjs/common';
import { ThirdwebService } from './thirdweb.service';

@Global()
@Module({
  providers: [ThirdwebService],
  exports: [ThirdwebService],
})
export class ThirdwebModule {}

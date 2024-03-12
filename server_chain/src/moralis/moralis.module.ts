// src/moralis/moralis.module.ts
import { Module, Global } from '@nestjs/common';
import { MoralisService } from './moralis.service';

@Global()
@Module({
  providers: [MoralisService],
  exports: [MoralisService],
})
export class MoralisModule {}

import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';

@Module({
  imports: [],
  controllers: [ChainController],
  providers: [ChainService],
})
export class ChainModule {}

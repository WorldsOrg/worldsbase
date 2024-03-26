import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';

@Module({
  imports: [ThirdwebModule],
  controllers: [ChainController],
  providers: [ChainService],
  exports: [ChainService],
})
export class ChainModule {}

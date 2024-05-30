import { Module } from '@nestjs/common';
import { TopUpService } from './topup.service';
import { ChainModule } from 'src/onchain/chain.module';
import { DbModule } from 'src/db/db.module';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';

@Module({
  imports: [ChainModule, DbModule, ThirdwebModule],
  providers: [TopUpService],
})
export class TopUpModule {}

import { Module } from '@nestjs/common';
import { TopUpService } from './topup.service';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';

@Module({
  imports: [ThirdwebModule],
  exports: [TopUpService],
  providers: [TopUpService],
})
export class TopUpModule {}

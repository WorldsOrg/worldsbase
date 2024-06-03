import { Module } from '@nestjs/common';
import { TopUpService } from './topup.service';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';

@Module({
  imports: [ThirdwebModule],
  providers: [TopUpService],
})
export class TopUpModule {}

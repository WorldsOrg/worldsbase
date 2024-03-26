import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { EthersController } from './ethers.controller';
import { AwsKmsModule } from 'src/awskms/awskms.module';

@Module({
  controllers: [EthersController],
  providers: [EthersService],
  imports: [AwsKmsModule],
})
export class EthersModule {}

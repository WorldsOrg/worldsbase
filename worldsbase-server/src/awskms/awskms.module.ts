import { Module, Global } from '@nestjs/common';
import { AwsKmsService } from './awskms.service';

@Global()
@Module({
  providers: [AwsKmsService],
  exports: [AwsKmsService],
})
export class AwsKmsModule {}

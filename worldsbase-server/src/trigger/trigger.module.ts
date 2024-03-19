import { Module } from '@nestjs/common';
import { TriggerService } from './trigger.service';
import { DBService } from 'src/db/db.service';

@Module({
  imports: [DBService],
  providers: [TriggerService],
  exports: [TriggerService],
})
export class ThirdwebModule {}

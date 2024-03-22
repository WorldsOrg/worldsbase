import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ChainModule } from 'src/onchain/chain.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [ChainModule, DbModule],
  providers: [TasksService],
})
export class TasksModule {}

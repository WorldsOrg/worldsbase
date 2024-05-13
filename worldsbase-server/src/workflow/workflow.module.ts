import { Module, forwardRef } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TableService } from 'src/table/table.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [forwardRef(() => DbModule)],
  providers: [WorkflowService, WalletService, TableService],
  exports: [WorkflowService],
})
export class WorkflowModule {}

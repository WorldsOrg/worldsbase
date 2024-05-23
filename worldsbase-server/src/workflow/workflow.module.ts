import { Module, forwardRef } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TableService } from 'src/table/table.service';
import { DbModule } from 'src/db/db.module';
import { EthersService } from 'src/ethers/ethers.service';

@Module({
  imports: [forwardRef(() => DbModule)],
  providers: [WorkflowService, WalletService, TableService, EthersService],
  exports: [WorkflowService],
})
export class WorkflowModule {}

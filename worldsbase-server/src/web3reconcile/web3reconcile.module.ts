import { Module } from '@nestjs/common';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';
import { Web3ReconcileService } from './web3reconcile.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [ThirdwebModule, DbModule],
  exports: [Web3ReconcileService],
  providers: [Web3ReconcileService],
})
export class Web3ReconcileModule {}

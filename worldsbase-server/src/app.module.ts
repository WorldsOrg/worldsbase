import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { ChainModule } from './onchain/chain.module';
import { TableModule } from './table/table.module';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { TasksModule } from './tasks/tasks.module';
import { TopUpModule } from './topup/topup.module';
import { EthersModule } from './ethers/ethers.module';
import { WorkflowModule } from './workflow/workflow.module';
import { Web3ReconcileModule } from './web3reconcile/web3reconcile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout your application
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    TopUpModule,
    DbModule,
    WorkflowModule,
    ChainModule,
    WalletModule,
    TableModule,
    AuthModule,
    EthersModule,
    Web3ReconcileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

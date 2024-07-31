import { ConfigModule } from '@nestjs/config';
import { CacheModule, CacheModuleOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    CacheModule.registerAsync<CacheModuleOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<CacheModuleOptions> => ({
        store: require('cache-manager-ioredis'), // Ensure the correct store is used
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        username: 'default',
        password: configService.get<string>('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 1000,
        limit: 1,
      },
    ]),
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

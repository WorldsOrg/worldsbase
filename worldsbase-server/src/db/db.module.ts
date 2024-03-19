import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { DBService } from './db.service';

const dbProvider = {
  provide: PG_CONNECTION,
  useFactory: async (configService: ConfigService) =>
    new Pool({
      user: configService.get<string>('POSTGRES_USER'),
      host: configService.get<string>('POSTGRES_HOST'),
      database: configService.get<string>('POSTGRES_DATABASE'),
      password: configService.get<string>('POSTGRES_PASSWORD'),
      port: configService.get<number>('POSTGRES_PORT'),
    }),
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [dbProvider, DBService],
  exports: [dbProvider, DBService],
})
export class DbModule {}

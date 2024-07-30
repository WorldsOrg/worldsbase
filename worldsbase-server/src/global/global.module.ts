// src/steam/steam.module.ts
import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GlobalGuard } from './global.guard';
import { XApiKeyGuard } from 'src/x-api-key/x-api-key.guard';
import { SteamGuard } from 'src/steam/steam.guard';

@Global()
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalGuard,
    },
    XApiKeyGuard,
    SteamGuard,
  ],
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: 'https://partner.steam-api.com/',
        params: {
          key: configService.get('STEAM_API_KEY'),
          appid: configService.get('STEAM_APP_ID'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class GlobalModule {}

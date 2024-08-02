import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { SteamAuthResponse } from './dto/steam.dto';

export interface UserRequest {
  user: {
    steamId: string;
  };
}

@Injectable()
export class SteamGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const ticket = req.query['steamTicket'];
    try {
      const {
        data: {
          response: { error, params },
        },
      } = await this.httpService.axiosRef.get<SteamAuthResponse>(
        'ISteamUserAuth/AuthenticateUserTicket/v1',
        {
          params: {
            ticket,
            identity: 'worldsbase-api',
          },
        },
      );

      if (!params || params.result !== 'OK') return false;
      if (error) return false;
      if (params.vacbanned || params.publisherbanned) return false;
      req.user = {
        steamId: params.steamid,
      };
      return true;
    } catch (e) {
      return false;
    }
  }
}

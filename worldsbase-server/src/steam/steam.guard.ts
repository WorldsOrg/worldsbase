import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { SteamAuthResponse } from './dto/steam.dto';

@Injectable()
export class SteamGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const ticket = req.query['steamTicket'];
    const authRequest = this.httpService.get<SteamAuthResponse>(
      'ISteamUserAuth/AuthenticateUserTicket/v1',
      {
        params: {
          ticket,
          identity: 'worldsbase-api',
        },
      },
    );

    try {
      const {
        data: {
          response: { error, params },
        },
      } = await firstValueFrom(authRequest);

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

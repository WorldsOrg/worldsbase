import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { XApiKeyGuard } from '../x-api-key/x-api-key.guard';
import { SteamGuard } from '../steam/steam.guard';

@Injectable()
export class GlobalGuard implements CanActivate {
  constructor(
    @Inject(SteamGuard) private readonly steamGuard: SteamGuard,
    @Inject(XApiKeyGuard) private readonly xApiKeyGuard: XApiKeyGuard,
  ) {}
  async canActivate(context: ExecutionContext) {
    const allowed = await Promise.all([
      this.xApiKeyGuard.canActivate(context),
      this.steamGuard.canActivate(context),
    ]);
    return allowed.some(Boolean);
  }
}

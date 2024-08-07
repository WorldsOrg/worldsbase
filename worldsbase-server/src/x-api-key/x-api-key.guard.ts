import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class XApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    if (
      context.switchToHttp().getRequest().headers['x-api-key'] ===
      process.env.X_API_KEY
    ) {
      return true;
    }
    return false;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class XApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log(context.switchToHttp().getRequest().headers);
    if (
      context.switchToHttp().getRequest().headers['x-api-key'] ===
      process.env.X_API_KEY
    ) {
      return true;
    }
    return false;
  }
}

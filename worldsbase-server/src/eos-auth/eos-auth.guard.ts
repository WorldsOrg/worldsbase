import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import JwksRsa from 'jwks-rsa';

interface UserRequest extends Request {
  user: {
    id: string;
    platform: 'steam' | 'epic';
  };
}

interface Token {
  header: {
    kid: string;
    typ: 'JWT';
    alg: 'RS256';
  };
  payload: {
    aud: string;
    sub: string;
    act: {
      eaid: string;
      eat: 'steam' | 'epic';
    };
    exp: number;
    iat: number;
  };
}

@Injectable()
export class EOSAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<UserRequest>();
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;
    const [scheme, authToken] = authHeader.split(' ');
    if (scheme !== 'Bearer') return false;

    try {
      const decoded = this.jwtService.verify<Token>(authToken);
      if (!decoded) return false;

      const jwksClient = JwksRsa({
        jwksUri:
          'https://api.epicgames.dev/epic/oauth/v2/.well-known/jwks.json',
        cache: true,
      });

      const signingKey = await jwksClient.getSigningKey(decoded.header.kid);
      const publicKey = signingKey.getPublicKey();
      const verifiedToken = this.jwtService.verify<Token>(authToken, {
        publicKey,
        algorithms: ['RS256'],
      });
      if (!verifiedToken) return false;
      req.user = {
        id: verifiedToken.payload.act.eaid,
        platform: verifiedToken.payload.act.eat,
      };
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

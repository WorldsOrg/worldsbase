import { Injectable } from '@nestjs/common';
import { CheckStatus } from './app.entity';

@Injectable()
export class AppService {
  getCheck(): CheckStatus {
    return { status: 'WGS chain API is running!' };
  }
}

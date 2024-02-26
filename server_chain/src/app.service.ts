import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getCheck(): string {
    return 'WGS chain API is running!';
  }
}

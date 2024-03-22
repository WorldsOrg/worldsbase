import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';

@Injectable()
export class MoralisService implements OnModuleInit {
  constructor(private configService: ConfigService) {}
  private moralis: typeof Moralis;

  async onModuleInit(): Promise<void> {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: this.configService.get<string>('MORALIS_API_KEY'),
      });
      this.moralis = Moralis;
    }
  }

  getMoralis(): typeof Moralis {
    if (!this.moralis) {
      throw new Error('Moralis has not been initialized');
    }
    return this.moralis;
  }
}

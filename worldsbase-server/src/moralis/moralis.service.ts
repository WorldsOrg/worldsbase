import { Injectable, OnModuleInit } from '@nestjs/common';
import Moralis from 'moralis';

@Injectable()
export class MoralisService implements OnModuleInit {
  private moralis: typeof Moralis;

  async onModuleInit(): Promise<void> {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY as string,
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

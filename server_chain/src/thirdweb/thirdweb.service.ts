// src/thirdweb/thirdweb.service.ts
import { Injectable } from '@nestjs/common';
import { WorldsAppchain } from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

@Injectable()
export class ThirdwebService {
  private sdk: ThirdwebSDK;

  constructor() {
    this.sdk = ThirdwebSDK.fromPrivateKey(
      process.env.MAIN_WALLET_PRIVATE_KEY as string,
      WorldsAppchain,
      {
        secretKey: process.env.THIRDWEB_SDK_SECRET_KEY as string,
      },
    );
  }

  getSDK(): ThirdwebSDK {
    return this.sdk;
  }
}

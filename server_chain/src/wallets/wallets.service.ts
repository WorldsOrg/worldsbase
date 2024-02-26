import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TurnkeyClient, createActivityPoller } from '@turnkey/http';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';

const TURNKEY_BASE_URL = 'https://api.turnkey.com';

export type GetWalletRequest = {
  organizationId: string;
};
export type TFormattedWalletAccount = {
  address: string;
  path: string;
};

export type TFormattedWallet = {
  id: string;
  name: string;
  accounts: TFormattedWalletAccount[];
};

export type CreateSubOrgResponse = {
  subOrgId: string;
  wallet: TFormattedWallet;
};
const initTurnkeyClient = async () =>
  new TurnkeyClient(
    { baseUrl: TURNKEY_BASE_URL },
    new ApiKeyStamper({
      apiPublicKey: process.env.apiPublicKey as string,
      apiPrivateKey: process.env.apiPrivateKey as string,
    }),
  );

@Injectable()
export class WalletsService {
  async createWallet(user_id: string): Promise<string> {
    console.log(user_id);
    try {
      const turnkeyClient = await initTurnkeyClient();
      const activityPoller = createActivityPoller({
        client: turnkeyClient,
        requestFn: turnkeyClient.createPrivateKeys,
      });

      const pk = await activityPoller({
        type: 'ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2',
        timestampMs: String(Date.now()),
        organizationId: process.env.organizationId as string,
        parameters: {
          privateKeys: [
            {
              privateKeyName: user_id,
              curve: 'CURVE_SECP256K1',
              addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
              privateKeyTags: [],
            },
          ],
        },
      });

      const walletAddress =
        pk.result.createPrivateKeysResultV2?.privateKeys?.[0];

      if (!walletAddress) {
        throw new HttpException(
          'Error creating wallet',
          HttpStatus.BAD_REQUEST,
        );
      }
      return walletAddress.addresses?.[0]?.address as string;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new HttpException(
        'Error creating wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

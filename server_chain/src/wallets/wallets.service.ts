import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TurnkeyClient, createActivityPoller } from '@turnkey/http';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';
import Moralis from 'moralis';
import { Web3 } from 'web3';
import { Value } from './entities/value.entity';
import { Stats } from './entities/stats.entity';
import { EthWallet } from './entities/wallet.entity';

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
  async createWalletAddress(user_id: string): Promise<EthWallet> {
    try {
      const web3 = new Web3();
      const result = web3.eth.accounts.create();
      console.log(user_id, result.address, result.privateKey);
      // add user_id public_key and private_key to database
      return {
        address: result.address,
        privateKey: result.privateKey,
        user_id: user_id,
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new HttpException(
        'Error creating wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async createWallet(user_id: string): Promise<string> {
    try {
      const turnkeyClient = await initTurnkeyClient();
      const activityPoller = createActivityPoller({
        client: turnkeyClient,
        requestFn: turnkeyClient.createSubOrganization,
      });

      const completedActivity = await activityPoller({
        type: 'ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V4',
        timestampMs: Date.now().toString(),
        organizationId: process.env.organizationId as string,
        parameters: {
          subOrganizationName: user_id,
          rootUsers: [
            {
              userName: user_id,
              authenticators: [],
              apiKeys: [
                {
                  apiKeyName: 'test',
                  publicKey: process.env.apiPublicKey as string,
                },
              ],
            },
          ],
          rootQuorumThreshold: 1,
          wallet: {
            walletName: 'Default ETH Wallet',
            accounts: [
              {
                curve: 'CURVE_SECP256K1',
                pathFormat: 'PATH_FORMAT_BIP32',
                path: "m/44'/60'/0'/0/0",
                addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
              },
            ],
          },
        },
      });

      const walletAddress =
        completedActivity.result.createSubOrganizationResultV4?.wallet;

      if (!walletAddress) {
        throw new HttpException(
          'Error creating wallet',
          HttpStatus.BAD_REQUEST,
        );
      }
      // return walletAddress.addresses?.[0]?.address as string;
      return walletAddress.walletId;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new HttpException(
        'Error creating wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStats(wallet: string): Promise<Stats> {
    try {
      const response = await Moralis.EvmApi.wallets.getWalletStats({
        chain: '0x1',
        address: wallet,
      });
      return response.raw;
    } catch (error) {
      console.error('Error getting wallet stats:', error);
      throw new HttpException(
        'Error getting wallet stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getValue(wallet: string): Promise<Value> {
    console.log(wallet);
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-API-Key': process.env.MORALIS_API_KEY as string,
        },
      };
      const result = await fetch(
        `https://deep-index.moralis.io/api/v2.2/wallets/${wallet}/net-worth?exclude_spam=true&exclude_unverified_contracts=true`,
        options,
      );
      const response = await result.json();
      console.log(response);
      return response;
    } catch (error) {
      console.error('Error getting wallet value:', error);
      throw new HttpException(
        'Error  getting wallet value',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

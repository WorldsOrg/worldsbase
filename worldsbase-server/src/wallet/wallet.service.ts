import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TurnkeyClient, createActivityPoller } from '@turnkey/http';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';
import { Web3 } from 'web3';
import { MoralisService } from 'src/moralis/moralis.service';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { promisify } from 'util';
import * as crypto from 'crypto';
import {
  DecryptedKeyDto,
  EthWalletDto,
  StatsDto,
  TurnkeyWalletDto,
  ValueDto,
  TokenResultDto,
  NFTResultDto,
  AwsKmsWalletDto,
  VaultWalletDto,
} from './dto/wallet.dto';
import { AwsKmsService } from 'src/awskms/awskms.service';
import { VaultSecret, VaultService } from 'src/vault/vault.service';

const pbkdf2 = promisify(crypto.pbkdf2);
const createCipheriv = crypto.createCipheriv;
const createDecipheriv = crypto.createDecipheriv;

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
export class WalletService {
  constructor(
    private readonly moralisService: MoralisService,
    private awsKmsService: AwsKmsService,
    private vaultService: VaultService,
  ) {}
  async encryptWallet(key: string, pass: string): Promise<any> {
    const salt = Buffer.from(process.env.KEY_SALT as string, 'hex');
    const iterations = 100000;
    const keyLength = 32;
    const digest = 'sha512';
    const algorithm = 'aes-256-cbc';

    try {
      const derivedKey = await pbkdf2(
        pass,
        salt,
        iterations,
        keyLength,
        digest,
      );
      const iv = Buffer.from(process.env.KEY_IV as string, 'hex');
      const cipher = createCipheriv(algorithm, derivedKey, iv);

      let encrypted = cipher.update(key, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return { encrypted };
    } catch (err) {
      console.error(err);
      throw new Error('Encryption failed');
    }
  }

  async decryptWallet(
    encryptedData: string,
    pass: string,
  ): Promise<DecryptedKeyDto> {
    const salt = Buffer.from(process.env.KEY_SALT as string, 'hex');
    const iterations = 100000;
    const keyLength = 32;
    const digest = 'sha512';
    const algorithm = 'aes-256-cbc';

    try {
      const derivedKey = await pbkdf2(
        pass,
        salt,
        iterations,
        keyLength,
        digest,
      );
      const iv = Buffer.from(process.env.KEY_IV as string, 'hex');
      const decipher = createDecipheriv(algorithm, derivedKey, iv);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return { decrypted };
    } catch (err) {
      console.error(err);
      throw new Error('Decryption failed');
    }
  }

  async createAwsKmsWallet(user_id: string): Promise<AwsKmsWalletDto> {
    try {
      const key_id = await this.awsKmsService.createKey();
      const public_key = await this.awsKmsService.getPublicKey(key_id);
      return {
        address: public_key,
        key_id: key_id,
        user_id: user_id,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createWalletAddress(user_id: string): Promise<EthWalletDto> {
    try {
      const web3 = new Web3();
      const result = web3.eth.accounts.create();
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

  async createVaultWallet(user_id: string): Promise<VaultWalletDto> {
    try {
      const web3 = new Web3();
      const result = web3.eth.accounts.create();
      const secret: VaultSecret = {
        name: result.address,
        data: {
          key: result.privateKey,
        },
      };
      await this.vaultService.createVaultSececret(secret);
      return {
        address: result.address,
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

  async createWallet(user_id: string): Promise<TurnkeyWalletDto> {
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
      return { address: walletAddress.walletId };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new HttpException(
        'Error creating wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStats(wallet: string): Promise<StatsDto> {
    try {
      const response = await this.moralisService
        .getMoralis()
        .EvmApi.wallets.getWalletStats({
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

  async getValue(wallet: string): Promise<ValueDto> {
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
      return response;
    } catch (error) {
      console.error('Error getting wallet value:', error);
      throw new HttpException(
        'Error  getting wallet value',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTokens(wallet: string, chainId?: string): Promise<TokenResultDto[]> {
    try {
      const chain = chainId ? chainId : EvmChain.ETHEREUM;
      const response = await this.moralisService
        .getMoralis()
        .EvmApi.token.getWalletTokenBalances({
          chain: chain,
          address: wallet,
        });

      return response.raw as TokenResultDto[];
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new HttpException(
        'Error getting tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async tokenGateErc20(
    wallet: string,
    contract: string,
    chainId: string,
    amount: number,
  ): Promise<boolean> {
    try {
      const response = await this.getTokens(wallet, chainId);
      for (let i = 0; i < response.length; i++) {
        if (response[i].token_address === contract.toLowerCase()) {
          const balance = BigInt(response[i].balance);
          const decimals = response[i].decimals;
          const adjustedBalance = Number(balance) / Math.pow(10, decimals);
          if (adjustedBalance >= amount) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new HttpException(
        'Error getting tokens',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getNFTs(wallet: string): Promise<NFTResultDto[]> {
    try {
      const response = await this.moralisService
        .getMoralis()
        .EvmApi.nft.getWalletNFTs({
          chain: '0x1',
          format: 'decimal',
          mediaItems: false,
          address: wallet,
        });
      return response.raw.result as unknown as NFTResultDto[];
    } catch (error) {
      console.error('Error getting NFTs:', error);
      throw new HttpException(
        'Error getting NFTs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

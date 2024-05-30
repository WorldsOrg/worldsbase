// src/thirdweb/thirdweb.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sepolia } from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { BigNumber } from 'ethers';
import { VaultService } from 'src/vault/vault.service';
import { Engine } from '@thirdweb-dev/engine';

interface Receipt {
  txHash: string;
}

@Injectable()
export class ThirdwebService {
  private sdk: ThirdwebSDK;
  private engine: Engine;
  //   rpc: https://rpc-worlds-hwbmpbzcnh.t.conduit.xyz/
  // wss: wss://rpc-worlds-hwbmpbzcnh.t.conduit.xyz
  // id: 31929
  // block explorer: https://explorerl2new-worlds-hwbmpbzcnh.t.conduit.xyz/

  // customChain = {
  //   // Required information for connecting to the network
  //   chainId: 31929, // Chain ID of the network
  //   rpc: ['https://rpc-worlds-hwbmpbzcnh.t.conduit.xyz/'], // Array of RPC URLs to use

  //   // Information for adding the network to your wallet (how it will appear for first time users) === \\
  //   // Information about the chain's native currency (i.e. the currency that is used to pay for gas)
  //   nativeCurrency: {
  //     decimals: 18,
  //     name: 'worlds-hwbmpbzcnh',
  //     symbol: 'wfu',
  //   },
  //   shortName: 'wfu', // Display value shown in the wallet UI
  //   slug: 'wfu', // Display value shown in the wallet UI
  //   testnet: true, // Boolean indicating whether the chain is a testnet or mainnet
  //   chain: 'Optimism', // Name of the network
  //   name: 'worlds-hwbmpbzcnh', // Name of the network
  // };

  constructor(private vaultService: VaultService) {
    this.sdk = ThirdwebSDK.fromPrivateKey(
      process.env.MAIN_WALLET_PRIVATE_KEY as string,
      Sepolia,
      {
        secretKey: process.env.THIRDWEB_SDK_SECRET_KEY as string,
      },
    );

    this.engine = new Engine({
      url: process.env.THIRDWEB_ENGINE_URL as string,
      accessToken: process.env.THIRDWEB_ACCESS_TOKEN as string,
    });
  }

  getSDK(): ThirdwebSDK {
    return this.sdk;
  }

  async getSdkFromVaultSecret(
    pubKey: string,
    chainIdOrRpc: string,
  ): Promise<ThirdwebSDK> {
    try {
      const pk = await this.vaultService.readVaultSecret(pubKey);
      return ThirdwebSDK.fromPrivateKey(pk, chainIdOrRpc, {
        secretKey: process.env.THIRDWEB_SDK_SECRET_KEY as string,
      });
    } catch (error) {
      throw error;
    }
  }

  async getBalanceVault(
    from: string,
    chainIdOrRpc: string,
  ): Promise<BigNumber> {
    try {
      const balanceSDK = await this.getSdkFromVaultSecret(from, chainIdOrRpc);
      const { value } = await balanceSDK.wallet.balance();
      return value;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async mintErc20Vault(
    contractAddress: string,
    to: string,
    amount: string,
    minter: string,
    chainIdOrRpc: string,
  ): Promise<Receipt> {
    try {
      const mintSDK = await this.getSdkFromVaultSecret(minter, chainIdOrRpc);
      const contract = await mintSDK.getContract(contractAddress);
      const tx = await contract.call('mintTo', [to, amount]);
      return {
        txHash: tx.receipt.transactionHash,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async burnERC20Vault(
    tokenOwner: string,
    chainIdOrRpc: string,
    contractAddress: string,
    amount: string,
  ): Promise<Receipt> {
    try {
      const mintSDK = await this.getSdkFromVaultSecret(
        tokenOwner,
        chainIdOrRpc,
      );
      const contract = await mintSDK.getContract(contractAddress);
      const tx = await contract.call('burn', [amount]);
      return {
        txHash: tx.receipt.transactionHash,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async transferNativeVault(
    from: string,
    to: string,
    chainIdOrRpc: string,
    amount: string,
  ): Promise<Receipt> {
    try {
      const fromSDK = await this.getSdkFromVaultSecret(from, chainIdOrRpc);
      const balance = await fromSDK.wallet.balance();
      if (balance.value.lt(amount))
        throw new Error(`Not enough funds to transfer from: ${from}`);
      const tx = await fromSDK.wallet.transfer(to, amount);
      return {
        txHash: tx.receipt.transactionHash,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async mintErc20BatchEngine(
    contractAddress: string,
    data: Array<any>,
    minter: string,
    chainId: number,
  ): Promise<any> {
    try {
      const res = await this.engine.erc20.mintBatchTo(
        chainId.toString(),
        contractAddress,
        minter,
        {
          data: data,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return res.result;
    } catch (error) {
      console.error('Error in mintErc20BatchEngine:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createEngineWallet(user_id: string): Promise<any> {
    try {
      const res = await this.engine.backendWallet.create({ label: user_id });
      const customRes = {
        address: res.result.walletAddress,
        user_id: user_id,
      };
      return customRes;
    } catch (error) {
      console.error('Error creating engine wallet:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

// src/thirdweb/thirdweb.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sepolia } from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { VaultService } from 'src/vault/vault.service';
import { Engine } from '@thirdweb-dev/engine';
import { ZeroAddress, formatEther, parseUnits } from 'ethersV6';
import { QueueReceipt, TxReceipt } from './dto/thirdweb.dto';

export interface BackendWallet {
  address: string;
  user_id: string;
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

  async mintErc20Vault(
    contractAddress: string,
    to: string,
    amount: string,
    minter: string,
    chainIdOrRpc: string,
  ): Promise<TxReceipt> {
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
  ): Promise<TxReceipt> {
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

  async mintErc20BatchEngine(
    contractAddress: string,
    data: Array<any>,
    minter: string,
    chainId: number,
  ): Promise<QueueReceipt> {
    try {
      const res = await this.engine.erc20.mintBatchTo(
        chainId.toString(),
        contractAddress,
        minter,
        {
          data,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return res.result;
    } catch (error) {
      console.error('Error in mintErc20BatchEngine:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async mintErc20Engine(
    wallet: string,
    amount: string,
    chainId: string,
    contractAddress: string,
    backendWalletAddress: string,
  ) {
    try {
      const response = await this.engine.erc20.mintTo(
        chainId,
        contractAddress,
        backendWalletAddress,
        {
          toAddress: wallet,
          amount: amount,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return response.result;
    } catch (error) {
      console.error('Error minting erc20 engine:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createEngineWallet(user_id: string): Promise<BackendWallet> {
    try {
      const res = await this.engine.backendWallet.create({ label: user_id });
      const customRes = {
        address: res.result.walletAddress,
        user_id: user_id,
      };
      return customRes;
    } catch (error) {
      console.error('Error creating engine wallet:', error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getBalanceEngine(from: string, chain: string): Promise<bigint> {
    try {
      const {
        result: { value },
      } = await this.engine.backendWallet.getBalance(chain, from);
      return parseUnits(value, 'wei');
    } catch (error) {
      console.error('Error getting wallet balance engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getWalletsEngine(): Promise<string[]> {
    try {
      const results: string[] = [];
      for (let page = 1; ; page++) {
        const { result } = await this.engine.backendWallet.getAll(page, 1000);
        if (result.length === 0) break;
        results.push(
          ...result
            .filter(({ label }) => label !== null)
            .map(({ address }) => address),
        );
      }
      return results;
    } catch (error) {
      console.error('Error getting wallets engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async transferNativeEngine(
    from: string,
    to: string,
    chain: string,
    amount: bigint,
  ): Promise<QueueReceipt> {
    try {
      const { result } = await this.engine.backendWallet.transfer(chain, from, {
        to,
        currencyAddress: ZeroAddress,
        amount: formatEther(amount),
      });
      return result;
    } catch (error) {
      console.error('Error transfering native currency engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async transferPackEngine(wallet: string): Promise<any> {
    try {
      const chainId = '31929';
      const packAddress = '0x403B2528cF7d2b22ee5014A7D21e63BdA3DE36e1';
      const backendWalletAddress = '0x08eeb885aff95a31971ae323fb554ed397e5a63b';
      const packId = '0';
      const amount = '1';
      const data = '0x';
      const res = await this.engine.contract.write(
        chainId,
        packAddress,
        backendWalletAddress,
        {
          functionName: 'safeTransferFrom',
          args: [backendWalletAddress, wallet, packId, amount, data],
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return res.result;
    } catch (error) {
      console.error(error);
      throw new Error('Error transferring pack to user');
    }
  }

  async getErc1155BalanceEngine(
    wallet: string,
    tokenId: string,
    chainId: string,
    contractAddress: string,
  ) {
    try {
      const response = await this.engine.erc1155.balanceOf(
        wallet,
        tokenId,
        chainId,
        contractAddress,
      );
      return response.result;
    } catch (error) {
      console.error('Error getting erc1155 balance engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async transferErc1155Engine(
    wallet: string,
    tokenId: string,
    amount: string,
    chainId: string,
    contractAddress: string,
    backendWalletAddress: string,
  ) {
    try {
      const response = await this.engine.erc1155.transferFrom(
        chainId,
        contractAddress,
        backendWalletAddress,
        {
          from: backendWalletAddress,
          to: wallet,
          tokenId: tokenId,
          amount: amount,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return response.result;
    } catch (error) {
      console.error('Error transferring erc1155 engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async burnErc1155Engine(
    wallet: string,
    tokenId: string,
    amount: string,
    chainId: string,
    contractAddress: string,
  ) {
    try {
      const response = await this.engine.erc1155.burn(
        chainId,
        contractAddress,
        wallet,
        {
          tokenId,
          amount,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return response.result;
    } catch (error) {
      console.error('Error burning er1155 engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getErc20BalanceEngine(
    wallet: string,
    chainId: string,
    contractAddress: string,
  ) {
    try {
      const res = await this.engine.erc20.balanceOf(
        wallet,
        chainId,
        contractAddress,
      );
      return Number(res.result.value) / 10 ** Number(res.result.decimals);
    } catch (error) {
      console.error(error);
      throw new Error('Error getting ERC20 balance');
    }
  }

  async setAllowanceErc20Engine(
    wallet: string,
    amount: string,
    chainId: string,
    contractAddress: string,
  ) {
    try {
      const result = await this.engine.erc20.setAllowance(
        chainId,
        contractAddress,
        wallet,
        {
          spenderAddress: wallet,
          amount: amount,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return result;
    } catch (error) {
      console.error(error);
      throw new Error('Error setting ERC20 allowance');
    }
  }

  async burnErc20Engine(
    wallet: string,
    amount: string,
    chainId: string,
    contractAddress: string,
  ) {
    try {
      const currentAmount = await this.getErc20BalanceEngine(
        wallet,
        chainId,
        contractAddress,
      );

      if (currentAmount < Number(amount)) {
        throw new Error('Insufficient balance');
      }

      await this.setAllowanceErc20Engine(
        wallet,
        amount,
        chainId,
        contractAddress,
      );

      // sleep for 10 seconds to allow for the allowance to be set
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const response = await this.engine.erc20.burnFrom(
        chainId,
        contractAddress,
        wallet,
        {
          holderAddress: wallet,
          amount: amount,
          txOverrides: {
            gas: '1000000',
          },
        },
      );
      return response.result;
    } catch (error) {
      console.error('Error burning erc20 engine:', error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

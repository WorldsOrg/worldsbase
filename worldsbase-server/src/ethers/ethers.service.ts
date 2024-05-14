import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethersV6';
import { AwsKmsService } from 'src/awskms/awskms.service';
import { marketplaceAbi } from './abi/marketplaceAbi';
import { VaultService } from 'src/vault/vault.service';

export class StandardTxData {
  chainId: number;
  nonce: number;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  gasLimit: string;
  to: string;
  value: string;
  data: string;
}

export class SignRequest {
  signerPubKey: string;
  transaction: any;
}

export class SendEthRequest {
  senderAddress: string;
  receiverAddress: string;
  amount: string;
  chainId: number;
}

@Injectable()
export class EthersService {
  private providers: { [chainId: number]: ethers.JsonRpcProvider } = {};

  constructor(
    private awsKmsService: AwsKmsService,
    private vaultService: VaultService,
  ) {
    this.providers[11155111] = new ethers.JsonRpcProvider(
      'https://rpc.sepolia.org/',
    );
    this.providers[421614] = new ethers.JsonRpcProvider(
      'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
    );
    this.providers[84532] = new ethers.JsonRpcProvider(
      'https://sepolia.base.org	',
    );
    this.providers[31929] = new ethers.JsonRpcProvider(
      'https://rpc-worlds-hwbmpbzcnh.t.conduit.xyz',
    );
  }

  public async getBalance(address: string, chainId: number): Promise<any> {
    try {
      if (this.providers[chainId] !== undefined) {
        const balance = await this.providers[chainId].getBalance(address);
        return {
          status: HttpStatus.OK,
          data: {
            balance: ethers.formatEther(balance),
          },
        };
      } else {
        return new HttpException(
          'Chain Id not supported',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      return new HttpException('Error getting balance', HttpStatus.BAD_REQUEST);
    }
  }

  public async getNonce(address: string, chainId: number) {
    try {
      if (this.providers[chainId] !== undefined) {
        const nonce =
          await this.providers[chainId].getTransactionCount(address);
        return nonce;
      } else {
        throw new Error('Chain Id not supported');
      }
    } catch (error) {
      throw error;
    }
  }

  public async sendRawTransaction(
    signedTx: string,
    chainId: number,
  ): Promise<string> {
    try {
      if (this.providers[chainId] !== undefined) {
        const txHash = await this.providers[chainId].send(
          'eth_sendRawTransaction',
          [signedTx],
        );
        return txHash;
      } else {
        return 'Chain Id not supported';
      }
    } catch (error) {
      throw error;
    }
  }

  public async createStandardTx(
    to: string,
    value: string,
    senderAddress: string,
    chainId: number,
  ): Promise<StandardTxData> {
    try {
      const standardTx: StandardTxData = {
        chainId: chainId,
        nonce: (await this.getNonce(senderAddress, chainId)) || 0,
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei').toString(),
        maxFeePerGas: ethers.parseUnits('100', 'gwei').toString(),
        gasLimit: ethers.toBigInt('250000').toString(),
        to: to,
        value: ethers.parseEther(value).toString(),
        data: '0x',
      };
      return standardTx;
    } catch (error) {
      throw error;
    }
  }

  public async signTxVault(
    signerPubKey: string,
    transaction: any,
  ): Promise<any> {
    try {
      const privateKey = await this.vaultService.readVaultSecret(signerPubKey);
      const wallet = new ethers.Wallet(privateKey);
      const signedTx = await wallet.signTransaction(transaction);
      return { signedTx: signedTx };
    } catch (error) {
      throw error;
    }
  }

  public async sendEthVault(
    senderAddress: string,
    receiverAddress: string,
    amount: string,
    chainId: number,
  ): Promise<any> {
    try {
      const tx = await this.createStandardTx(
        receiverAddress,
        amount,
        senderAddress,
        chainId,
      );
      const signedTx = await this.signTxVault(senderAddress, tx);
      const txSignature = await this.sendRawTransaction(
        signedTx.signedTx,
        chainId,
      );
      return {
        status: HttpStatus.OK,
        data: {
          txSignature: txSignature,
        },
      };
    } catch (error) {
      console.error('Error in sendEthVault:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async signAndSendTxAwsKms(
    senderAddress: string,
    KeyId: string,
    txData: StandardTxData,
  ): Promise<any> {
    try {
      const chainId = txData.chainId;
      const signedTx = await this.awsKmsService.signTransaction(
        senderAddress,
        KeyId,
        txData,
        chainId,
      );
      if (this.providers[chainId] !== undefined) {
        const txHash = await this.providers[chainId].send(
          'eth_sendRawTransaction',
          [signedTx],
        );
        return { txHash: txHash };
      } else {
        console.error('Chain Id not supported');
        throw new HttpException(
          'Chain Id not supported',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error sending tx:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async createBuyFromListingTx(
    contractAddress: string,
    listingId: string,
    buyerAddress: string,
    quantity: string,
    currency: string,
    price: string,
    chainId: number,
  ) {
    const contract = new ethers.BaseContract(contractAddress, marketplaceAbi);
    const buyFromListing = contract.getFunction('buyFromListing');
    const populatedTx = await buyFromListing.populateTransaction(
      listingId,
      buyerAddress,
      quantity,
      currency,
      ethers.parseEther(price).toString(),
    );

    const tx = await this.createStandardTx(
      contractAddress,
      price,
      buyerAddress,
      chainId,
    );

    tx.data = populatedTx.data;
    return tx;
  }
}

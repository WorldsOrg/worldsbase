import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethersV6';
import { AwsKmsService } from 'src/awskms/awskms.service';
import { marketplaceAbi } from './abi/marketplaceAbi';
import { VaultService } from 'src/vault/vault.service';
import { erc20Abi } from './abi/erc20Abi';

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
          balance: ethers.formatEther(balance),
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
        maxPriorityFeePerGas: ethers.parseUnits('0.0011', 'gwei').toString(),
        maxFeePerGas: ethers.parseUnits('0.001100504', 'gwei').toString(),
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
        txHash: txSignature,
      };
    } catch (error) {
      console.error('Error in sendEthVault:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async multiMintErc20Vault(
    contractAddress: string,
    data: Array<any>,
    minter: string,
    chainId: number,
  ): Promise<any> {
    try {
      const txSignatures = [];
      // loop through data and create txs
      for (let i = 0; i < data.length; i++) {
        const tx = await this.createMintErc20Tx(
          contractAddress,
          data[i].toAddress,
          data[i].amount,
          minter,
          chainId,
        );
        const signedTx = await this.signTxVault(minter, tx);
        const txSignature = await this.sendRawTransaction(
          signedTx.signedTx,
          chainId,
        );
        await this.providers[chainId].waitForTransaction(txSignature);
        txSignatures.push(txSignature);
      }
      return {
        txHashs: txSignatures,
      };
    } catch (error) {
      console.error('Error in multiMintErc20Vault:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async mintErc20Vault(
    contractAddress: string,
    to: string,
    amount: string,
    minter: string,
    chainId: number,
  ): Promise<any> {
    try {
      const tx = await this.createMintErc20Tx(
        contractAddress,
        to,
        amount,
        minter,
        chainId,
      );
      const signedTx = await this.signTxVault(minter, tx);
      const txSignature = await this.sendRawTransaction(
        signedTx.signedTx,
        chainId,
      );
      return {
        txHash: txSignature,
      };
    } catch (error) {
      console.error('Error in mintErc20Vault:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async burnErc20Vault(
    contractAddress: string,
    tokenOwner: string,
    amount: string,
    chainId: number,
  ): Promise<any> {
    try {
      const tx = await this.createBurnErc20Tx(
        contractAddress,
        tokenOwner,
        amount,
        chainId,
      );
      const signedTx = await this.signTxVault(tokenOwner, tx);
      const txSignature = await this.sendRawTransaction(
        signedTx.signedTx,
        chainId,
      );
      return {
        txHash: txSignature,
      };
    } catch (error) {
      console.error('Error in burnErc20Vault:', error);
      return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
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

  public async createMintErc20Tx(
    contractAddress: string,
    to: string,
    amount: string,
    minter: string,
    chainId: number,
  ) {
    const contract = new ethers.BaseContract(contractAddress, erc20Abi);
    const mintTo = contract.getFunction('mintTo');
    const populatedTx = await mintTo.populateTransaction(
      to,
      ethers.parseEther(amount).toString(),
    );

    const tx = await this.createStandardTx(
      contractAddress,
      '0',
      minter,
      chainId,
    );

    tx.data = populatedTx.data;
    return tx;
  }

  public async createBurnErc20Tx(
    contractAddress: string,
    tokenOwner: string,
    amount: string,
    chainId: number,
  ) {
    const contract = new ethers.BaseContract(contractAddress, erc20Abi);
    const burn = contract.getFunction('burn');
    const populatedTx = await burn.populateTransaction(
      ethers.parseEther(amount).toString(),
    );

    const tx = await this.createStandardTx(
      contractAddress,
      '0',
      tokenOwner,
      chainId,
    );

    tx.data = populatedTx.data;
    return tx;
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
}

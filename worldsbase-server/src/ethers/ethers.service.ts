import { Injectable } from '@nestjs/common';
import { ethers } from 'ethersV6';
import { AwsKmsService } from 'src/awskms/awskms.service';
import { marketplaceAbi } from './abi/marketplaceAbi';

export class StandardTxData {
  type: number;
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
  private sepoliaProvider: ethers.JsonRpcProvider;

  constructor(private awsKmsService: AwsKmsService) {
    this.sepoliaProvider = new ethers.JsonRpcProvider(
      'https://rpc.sepolia.org/',
    );
  }

  public async getNonce(address: string) {
    try {
      const nonce = await this.sepoliaProvider.getTransactionCount(address);
      return nonce;
    } catch (error) {
      console.error('Error getting nonce:', error);
      return null;
    }
  }

  public async createStandardSepoliaTx(
    to: string,
    value: string,
    senderAddress: string,
  ): Promise<StandardTxData> {
    const standardTx: StandardTxData = {
      type: 2,
      chainId: 11155111,
      nonce: (await this.getNonce(senderAddress)) || 0,
      maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei').toString(),
      maxFeePerGas: ethers.parseUnits('100', 'gwei').toString(),
      gasLimit: ethers.toBigInt('250000').toString(),
      to: to,
      value: ethers.parseEther(value).toString(),
      data: '0x',
    };
    return standardTx;
  }

  public async signAndSendTxAwsKmsSepolia(
    senderAddress: string,
    KeyId: string,
    txData: StandardTxData,
  ): Promise<any> {
    const signedTx = await this.awsKmsService.signTransaction(
      senderAddress,
      KeyId,
      txData,
      11155111,
    );
    this.sepoliaProvider
      .send('eth_sendRawTransaction', [signedTx])
      .then((txHash) => {
        console.log(txHash);
        return txHash;
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  }

  public async createBuyFromListingTx(
    contractAddress: string,
    listingId: string,
    buyerAddress: string,
    quantity: string,
    currency: string,
    price: string,
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

    const tx = await this.createStandardSepoliaTx(
      contractAddress,
      price,
      buyerAddress,
    );

    tx.data = populatedTx.data;
    return tx;
  }
}

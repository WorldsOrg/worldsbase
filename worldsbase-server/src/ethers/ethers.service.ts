import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AwsKmsService } from 'src/awskms/awskms.service';
import { marketplaceAbi } from './abi/marketplaceAbi';

type StandardTxData = {
  type: number;
  chainId: number;
  nonce: number;
  maxPriorityFeePerGas: ethers.BigNumberish;
  maxFeePerGas: ethers.BigNumberish;
  gasLimit: ethers.BigNumberish;
  to: string;
  value: ethers.BigNumberish;
  data: string;
};

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
      maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.parseUnits('100', 'gwei'),
      gasLimit: ethers.toBigInt('21000'),
      to: to,
      value: ethers.parseEther(value),
      data: '0x',
    };
    return standardTx;
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
      price,
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

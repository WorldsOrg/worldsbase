import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { WorldsAppchain } from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

@Injectable()
export class ChainService {
  async mintTo(toAddress: string): Promise<string> {
    try {
      const sdk = ThirdwebSDK.fromPrivateKey(
        process.env.MAIN_WALLET_PRIVATE_KEY as string,
        WorldsAppchain,
        {
          secretKey: process.env.SECRET_KEY as string,
        },
      );

      const contract = await sdk.getContract(
        process.env.CONTRACT_ADDRESS as string,
      );

      const metadata = {
        name: 'waifu',
        description: 'Worlds',
        image: 'ipfs://QmNSWYbiQCJKf4gLi19gYzoiUV8tJikx9KBg1t2HPxCR9Q/wtf.jpg',
      };

      const metadataWithSupply = {
        metadata,
        supply: 1,
      };

      const tx = await contract.erc1155.mintTo(toAddress, metadataWithSupply);
      const receipt = tx.receipt;

      return receipt.transactionHash;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw new HttpException(
        'Error minting NFT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

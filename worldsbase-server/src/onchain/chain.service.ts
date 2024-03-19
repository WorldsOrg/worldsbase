import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { ReceiptDto } from './dto/onchain.dto';

@Injectable()
export class ChainService {
  constructor(private thirdwebService: ThirdwebService) {}
  async mintTo(toAddress: string): Promise<ReceiptDto> {
    try {
      const sdk = this.thirdwebService.getSDK();

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

      return { receipt: receipt.transactionHash };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw new HttpException(
        'Error minting NFT',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

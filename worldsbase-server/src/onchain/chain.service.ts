import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { ReceiptDto } from './dto/onchain.dto';
import { ConfigService } from '@nestjs/config';
import { DirectListingV3, EnglishAuction } from '@thirdweb-dev/sdk';
@Injectable()
export class ChainService {
  constructor(
    private thirdwebService: ThirdwebService,
    private configService: ConfigService,
  ) {}
  async mintTo(toAddress: string): Promise<ReceiptDto> {
    try {
      const sdk = this.thirdwebService.getSDK();

      const contract = await sdk.getContract(
        this.configService.get<string>('MINT_CONTRACT_ADDRESS') as string,
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

  async sendToken(toAddress: string, amount: number): Promise<ReceiptDto> {
    try {
      const sdk = this.thirdwebService.getSDK();

      const token = await sdk.getContract(
        this.configService.get<string>('TOKEN_CONTRACT_ADDRESS') as string,
      );
      // The amount of tokens you want to send
      const tx = await token.erc20.transfer(toAddress, amount);
      const receipt = tx.receipt;
      return { receipt: receipt.transactionHash };
    } catch (error) {
      console.error('Error sending token:', error);
      throw new HttpException(
        'Error sending token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deploy(): Promise<any> {
    const sdk = this.thirdwebService.getSDK();
    const address = await sdk.deployer.deployBuiltInContract('nft-collection', {
      name: 'My NFT Contract',
      primary_sale_recipient: '0xE2dc27f386E713cd0F277151250811b401f30CB2',
    });
    console.log('Deployed at', address);
    return { receipt: address };
  }

  async marketplaceDirect(address: string): Promise<DirectListingV3[]> {
    const sdk = this.thirdwebService.getSDK();
    const contract = await sdk.getContract(address);
    const listings = await contract.directListings.getAll();

    return listings;
  }

  async marketplaceAuction(address: string): Promise<EnglishAuction[]> {
    const sdk = this.thirdwebService.getSDK();
    const contract = await sdk.getContract(address);
    const auctions = await contract.englishAuctions.getAll();

    return auctions;
  }
}

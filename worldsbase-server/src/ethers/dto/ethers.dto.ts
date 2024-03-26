import { ApiProperty } from '@nestjs/swagger';

export class BuyFromListingMarketplaceDto {
  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Contract Address',
  })
  contractAddress: string;

  @ApiProperty({
    example: '1',
    description: 'Listing ID on the Marketplace',
  })
  listingId: string;

  @ApiProperty({
    example: '0x01A9B82dbE9873bFC22CAd4A37E1860FC00b0440',
    description: 'Wallet Address that is buying on the Marketplace',
  })
  buyerAddress: string;

  @ApiProperty({
    example: '1',
    description: 'quantity',
  })
  quantity: string;

  @ApiProperty({
    example: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    description: 'address of the currency used to purchase',
  })
  currency: string;

  @ApiProperty({
    example: '1',
    description: 'price of the item on the marketplace',
  })
  price: string;
}

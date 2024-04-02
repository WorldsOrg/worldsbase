import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DirectListingV3, EnglishAuction } from '@thirdweb-dev/sdk';

export class MintToDto {
  @ApiProperty({ example: '0x350845DD3f03F1355233a3A7CEBC24b5aAD05eC5' })
  @IsString()
  readonly toAddress: string;
}

export class SendToDto {
  @ApiProperty({ example: '0x350845DD3f03F1355233a3A7CEBC24b5aAD05eC5' })
  @IsString()
  readonly toAddress: string;
  @ApiProperty({ example: 1 })
  readonly amount: number;
}

export class ReceiptDto {
  @ApiProperty({
    example:
      '0x24a1a97691429b16f25e6e69f40a5af98a00091855c4549f9a865f568e9d9708',
    description: 'Receipt',
  })
  receipt: string;
}

export class DirectListingDto {
  @ApiProperty({
    example: [
      {
        assetContractAddress: '0x21c404005cEd824608561b362C61036903fEA7d7',
        currencyContractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        pricePerToken: '1000000000000000000',
        currencyValuePerToken: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
          value: {
            type: 'BigNumber',
            hex: '0x0de0b6b3a7640000',
          },
          displayValue: '1.0',
        },
        id: '0',
        tokenId: '1',
        quantity: '1',
        startTimeInSeconds: 1711034988,
        asset: {
          name: 'star',
          description: '',
          image:
            'https://21461335b8ce987737640624f6dc79a3.ipfscdn.io/ipfs/bafybeif2mihijkppb55plfk5emap4wwayrr2c3u2fjqn6uipmlhx35eohm/ak47-star.png',
          animation_url: '',
          external_url: '',
          background_color: '',
          attributes: [
            {
              trait_type: 'damage',
              value: '12',
            },
          ],
          id: '1',
          uri: 'ipfs://Qmed9Ywm6Kf1QpPVmweuQ2YSHvem1UggrEuePK8fZvRGmY/0',
          supply: 0,
          customImage: '',
          customAnimationUrl: '',
        },
        endTimeInSeconds: 4102444836,
        creatorAddress: '0xE2dc27f386E713cd0F277151250811b401f30CB2',
        isReservedListing: false,
        status: 4,
      },
    ],
  })
  item: DirectListingV3[];
}

export class AuctionListingDto {
  @ApiProperty({
    example: [
      {
        id: '0',
        creatorAddress: '0xE2dc27f386E713cd0F277151250811b401f30CB2',
        assetContractAddress: '0x21c404005cEd824608561b362C61036903fEA7d7',
        tokenId: '0',
        quantity: '1',
        currencyContractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        minimumBidAmount: '1000000000000000000',
        minimumBidCurrencyValue: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
          value: {
            type: 'BigNumber',
            hex: '0x0de0b6b3a7640000',
          },
          displayValue: '1.0',
        },
        buyoutBidAmount: '2000000000000000000',
        buyoutCurrencyValue: {
          name: 'Sepolia Ether',
          symbol: 'ETH',
          decimals: 18,
          value: {
            type: 'BigNumber',
            hex: '0x1bc16d674ec80000',
          },
          displayValue: '2.0',
        },
        timeBufferInSeconds: 900,
        bidBufferBps: 500,
        startTimeInSeconds: 1711035024,
        endTimeInSeconds: 1713627024,
        asset: {
          name: 'gold',
          description: '',
          image:
            'https://21461335b8ce987737640624f6dc79a3.ipfscdn.io/ipfs/bafybeiastbflijl3myzyadk2m2tatom7ip6kf267hajxyid34mhw4flfmm/ak47-gold.png',
          animation_url: '',
          external_url: '',
          background_color: '',
          attributes: [
            {
              trait_type: 'damage',
              value: '10',
            },
          ],
          id: '0',
          uri: 'ipfs://QmS9Cxo5jgztosNGNqy1jhG36E1hzEtvgv1Em7rWg7Zibi/0',
          supply: 0,
          customImage: '',
          customAnimationUrl: '',
        },
        status: 4,
      },
    ],
  })
  item: EnglishAuction[];
}

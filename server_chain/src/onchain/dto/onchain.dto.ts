import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MintToDto {
  @ApiProperty({ example: '0x350845DD3f03F1355233a3A7CEBC24b5aAD05eC5' })
  @IsString()
  readonly toAddress: string;
}
export class ReceiptDto {
  @ApiProperty({
    example:
      '0x24a1a97691429b16f25e6e69f40a5af98a00091855c4549f9a865f568e9d9708',
    description: 'Receipt',
  })
  receipt: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class Receipt {
  @ApiProperty({
    example:
      '0x24a1a97691429b16f25e6e69f40a5af98a00091855c4549f9a865f568e9d9708',
    description: 'Receipt',
  })
  receipt: string;
}

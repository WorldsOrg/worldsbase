import { ApiProperty } from '@nestjs/swagger';

export class CheckStatus {
  @ApiProperty({
    example: 'WGS chain API is running!',
    description: 'Server status is OK!',
  })
  status: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CheckStatus {
  @ApiProperty({
    example: 'Worldsbase API is running!',
    description: 'Server status is OK!',
  })
  status: string;
}

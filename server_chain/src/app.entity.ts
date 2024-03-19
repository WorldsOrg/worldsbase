import { ApiProperty } from '@nestjs/swagger';

export class CheckStatus {
  @ApiProperty({
    example: 'WorldsBase API is running!',
    description: 'Server status is OK!',
  })
  status: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class Auth {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpYVCJ9.eyJlbWFpbCI3Im96Z3UyckBvemd1cnJiLmNvbSIsImlkIjoiZjRkMTZlM2QtZTJmNS00MmJlLTg0OGUtNTE5YWFhYzM3NmQ4IiwiaWF0IjoxNzEwMTY1MTE1LCJleHAiOjE3MTA3Njk5MTV9.cVE4GDgrbOejAoAzk_vgsEXenNLe2lfvMiLtWmB7TpQ',
    description: 'JWT',
  })
  token: string;
}

export class Me {
  @ApiProperty({
    example: 'user@worlds.org',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({ example: '123', description: 'The ID of the user' })
  id: string;

  @ApiProperty({ example: 1610165115, description: 'Issued at time' })
  iat: number;

  @ApiProperty({ example: 1610769915, description: 'Expiration time' })
  exp: number;
}

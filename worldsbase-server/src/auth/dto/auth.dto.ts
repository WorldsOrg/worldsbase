import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AuthDTO {
  @ApiProperty()
  @IsEmail()
  readonly email: string;
  @ApiProperty()
  @IsString()
  readonly password: string;
}

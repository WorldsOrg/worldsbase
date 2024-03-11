import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateWalletDto {
  @ApiProperty()
  @IsString()
  readonly user_id: string;
}

export class WalletInformationDto {
  @ApiProperty()
  @IsString()
  readonly address: string;
}

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class MintToDto {
  @ApiProperty()
  @IsString()
  readonly toAddress: string;
}

export class WalletInformationDto {
  @ApiProperty()
  @IsString()
  readonly address: string;
}

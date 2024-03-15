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

export class EncryptWalletDto {
  @ApiProperty()
  @IsString()
  readonly key: string;
  @ApiProperty()
  @IsString()
  readonly pass: string;
}

export class DecryptWalletDto {
  @ApiProperty()
  @IsString()
  readonly pass: string;
  @ApiProperty()
  @IsString()
  readonly encryptedData: string;
}

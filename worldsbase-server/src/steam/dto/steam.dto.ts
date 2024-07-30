import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export interface SteamResponse {
  response: {
    item_json: string;
  };
}

export interface SteamAuthResponse {
  response: {
    params?: {
      result: string;
      steamid: string;
      ownersteamid: string;
      vacbanned: boolean;
      publisherbanned: boolean;
    };
    error?: {
      errorcode: number;
      errordesc: string;
    };
  };
}

export class SteamItemDto {
  @ApiProperty()
  @IsString()
  itemdefid: string;

  @ApiProperty()
  @IsString()
  itemid: string;

  @ApiProperty()
  @IsString()
  accountid: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  originalitemid: string;

  @ApiProperty()
  @IsNumber()
  appid: number;

  @ApiProperty()
  @IsString()
  acquired: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  origin: string;

  @ApiProperty()
  @IsString()
  state_changed_timestamp: string;
}

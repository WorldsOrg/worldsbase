import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SteamItemDto } from './dto/steam.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SteamService } from '../steam/steam.service';
import { SteamGuard, UserRequest } from './steam.guard';

@ApiTags('Steam')
@Controller('steam')
@UseGuards(SteamGuard)
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get('/inventory/get')
  @ApiOperation({
    summary: 'Get Steam Inventory of SteamID in AppId defined by env',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory Items',
    type: Array<SteamItemDto>,
  })
  getInventory(@Req() { user: { steamId } }: UserRequest) {
    return this.steamService.getInventory(steamId);
  }

  @Get('/inventory/sync')
  @ApiOperation({
    summary: 'Synchronize Steam Inventory of SteamID with database tables',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
  })
  syncInventory(@Req() { user: { steamId } }: UserRequest) {
    return this.steamService.syncInventory(steamId);
  }

  @Post('/inventory/claim')
  @ApiOperation({ summary: 'Adds item to user inventory on Steam' })
  @ApiResponse({
    status: 200,
    description: 'Added Item',
    type: Array<SteamItemDto>,
  })
  claimItem(@Req() { user: { steamId } }: UserRequest) {
    // TODO: Add body to get other info, like item-type, rarity, level, etc?
    return this.steamService.claimItem(steamId);
  }
}

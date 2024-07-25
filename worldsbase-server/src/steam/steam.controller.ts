import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { SteamItemDto } from './dto/steam.dto';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SteamService } from '../steam/steam.service';

@ApiHeader({ name: 'x-api-key', required: true })
@ApiTags('Steam')
@Controller('steam')
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get('/inventory')
  @ApiOperation({
    summary: 'Get Steam Inventory of SteamID in AppId defined by env',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory Items',
    type: Array<SteamItemDto>,
  })
  getInventory(@Param('steamId') steamId: string) {
    return this.steamService.getInventory(steamId);
  }

  @Put('/inventory')
  @ApiOperation({
    summary: 'Synchronize Steam Inventory of SteamID with database tables',
  })
  @ApiResponse({
    status: 200,
    description: 'OK',
  })
  syncInventory(@Param('steamId') steamId: string) {
    return this.steamService.syncInventory(steamId);
  }

  @Post('/inventory')
  @ApiOperation({ summary: 'Adds item to user inventory on Steam' })
  @ApiResponse({
    status: 200,
    description: 'Token(s) minted',
    type: Array<SteamItemDto>,
  })
  claimItem(@Param('steamId') steamId: string) {
    // TODO: Add body to get other info, like item-type, rarity, level, etc?
    return this.steamService.claimItem(steamId);
  }
}

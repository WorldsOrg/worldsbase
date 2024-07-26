// src/steam/steam.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SteamItemDto, SteamResponse } from './dto/steam.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { TableService } from 'src/table/table.service';

export interface BackendWallet {
  address: string;
  user_id: string;
}

@Injectable()
export class SteamService {
  constructor(
    private readonly tableService: TableService,
    private readonly httpService: HttpService,
  ) {}

  async getInventory(steamId: string) {
    const request = this.httpService
      .get<SteamResponse>('/IInventoryService/GetInventory/v1', {
        params: { steamid: steamId },
      })
      .pipe<SteamItemDto[]>(
        map((res) => JSON.parse(res.data?.response.item_json)),
      )
      .pipe(
        catchError(() => {
          throw new InternalServerErrorException(
            'Error when fetching steam API',
          );
        }),
      );
    const response = await lastValueFrom(request);
    return response;
  }

  async addItem(steamId: string, itemId: string) {
    const request = this.httpService
      .post<SteamResponse>('/IInventoryService/AddItem/v1', {
        params: { steamid: steamId, itemdefid: [itemId], notify: true },
      })
      .pipe<SteamItemDto[]>(
        map((res) => JSON.parse(res.data?.response.item_json)),
      )
      .pipe(
        catchError(() => {
          throw new InternalServerErrorException(
            'Error when fetching steam API',
          );
        }),
      );
    const response = await lastValueFrom(request);
    return response;
  }

  async getBySteamId(steamId: string, tableName: string) {
    const query = `SELECT * FROM "${tableName}" WHERE steam_id = $1;`;
    const values = [steamId];
    return this.tableService.executeQuery(query, values);
  }

  async getUserTableInventory(
    steamId: string,
    usersTableName: string,
    itemsTableName: string,
  ) {
    // TODO: Decouple column names
    const query = `
      SELECT *
      FROM ${usersTableName} users WHERE steam_id = $1
      INNER JOIN ${itemsTableName} user_item ON users.steam_id = user_item.steam_id;
    `;
    const values = [steamId];
    return this.tableService.executeQuery(query, values);
  }

  async claimItem(steamId: string) {
    // TODO: Use safety measures to return error on malicious behavior
    // TODO: Calculate drop rates and choose itemdefid
    const addedItem = await this.addItem(steamId, '2');
    await this.syncInventory(steamId);
    return addedItem;
  }

  async syncInventory(steamId: string) {
    // TODO: Decouple table names
    const { data: tableInventory, error } = await this.getUserTableInventory(
      steamId,
      'wtf_steam_users',
      'wtf_steam_user_item',
    );
    if (!tableInventory) throw new NotFoundException(error);

    const steamInventory = await this.getInventory(steamId);
    const tableItemIds = tableInventory.map(({ item_id }) => item_id);

    const addedItems = steamInventory
      .filter(({ itemid }) => !tableItemIds.includes(itemid))
      .map(({ itemid, itemdefid }) => ({
        item_id: itemid,
        steam_id: steamId,
        template_id: itemdefid,
      }));
    const removedItems = tableItemIds.filter(
      (id) => !steamInventory.map(({ itemid }) => itemid).includes(id),
    );

    if (removedItems.length > 0) {
      const deleteQuery = `DELETE FROM "wtf_steam_user_item" WHERE id IN $1;`;
      await this.tableService.executeQuery(deleteQuery, removedItems);
    }

    if (addedItems.length > 0) {
      const columns = Object.keys(addedItems).join(', ');
      const values = Object.values(addedItems);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      const query = `INSERT INTO "wtf_steam_user_item" (${columns}) VALUES (${placeholders}) RETURNING *;`;
      await this.tableService.executeQuery(query, values);
    }
  }
}

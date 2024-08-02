// src/steam/steam.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SteamItemDto, SteamResponse } from './dto/steam.dto';
import { HttpService } from '@nestjs/axios';
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

  async getInventory(steamId: string): Promise<SteamItemDto[]> {
    const { data } = await this.httpService.axiosRef.get<SteamResponse>(
      '/IInventoryService/GetInventory/v1',
      {
        params: { steamid: steamId },
      },
    );
    return JSON.parse(data.response.item_json);
  }

  async addItem(steamId: string, templateId: string): Promise<SteamItemDto[]> {
    const { data } = await this.httpService.axiosRef.post<SteamResponse>(
      '/IInventoryService/AddItem/v1/',
      {},
      {
        params: { steamid: steamId, 'itemdefid[0]': templateId, notify: true },
      },
    );
    return JSON.parse(data.response.item_json);
  }

  async getBySteamId(steamId: string, tableName: string) {
    const query = `SELECT * FROM "${tableName}" WHERE steam_id = $1;`;
    const values = [steamId];
    return this.tableService.executeQuery(query, values);
  }

  async getUserItemIds(steamId: string, itemsTableName: string) {
    // TODO: Decouple column names
    const query = `SELECT item_id FROM ${itemsTableName} WHERE steam_id = $1;`;
    const values = [steamId];
    const { data, error } = await this.tableService.executeQuery(query, values);
    if (!data) throw new NotFoundException(error);
    return data.map(({ item_id }) => item_id);
  }

  async getUserTableTemplates() {
    // TODO: Decouple table name
    const query = `
      SELECT id from wtf_steam_templates;
    `;
    const { data, error } = await this.tableService.executeQuery(query);
    if (!data) throw new InternalServerErrorException(error);
    return data.map(({ id }) => id);
  }

  async claimItem(steamId: string) {
    // TODO: Use safety measures to return error on malicious behavior
    // TODO: Calculate drop rates and choose itemdefid
    const addedItem = await this.addItem(steamId, '2');
    await this.syncInventory(steamId);
    return addedItem;
  }

  async claimDefaultItem(steamId: string) {
    // TODO: Use safety measures to return error on malicious behavior
    const addedItem = await this.addItem(steamId, '1');
    await this.syncInventory(steamId);
    return addedItem;
  }

  async syncInventory(steamId: string) {
    // TODO: Decouple table names
    const tableItemIds = await this.getUserItemIds(
      steamId,
      'wtf_steam_user_item',
    );

    const steamInventory = await this.getInventory(steamId);
    const tableTemplateIds = await this.getUserTableTemplates();

    const addedItems = steamInventory
      .filter(({ itemid }) => !tableItemIds.includes(itemid))
      .filter(({ itemdefid }) => tableTemplateIds.includes(itemdefid))
      .map(({ itemid, itemdefid }) => ({
        item_id: itemid,
        steam_id: steamId,
        template_id: itemdefid,
      }));
    const removedItems = tableItemIds.filter(
      (id) => !steamInventory.map(({ itemid }) => itemid).includes(id),
    );

    if (removedItems.length > 0) {
      const placeholders = removedItems
        .map((_, index) => `$${index + 1}`)
        .join(', ');
      const deleteQuery = `DELETE FROM "wtf_steam_user_item" WHERE item_id IN (${placeholders});`;
      await this.tableService.executeQuery(deleteQuery, removedItems);
    }

    if (addedItems.length > 0) {
      const columns = Object.keys(addedItems[0]);
      const values = addedItems.map((item) => Object.values(item)).flat();
      const placeholders = [];
      for (let row = 0; row < addedItems.length; row++) {
        const rowPlaceholders = [];
        for (let col = 0; col < columns.length; col++) {
          rowPlaceholders.push(`$${row * columns.length + col + 1}`);
        }
        placeholders.push(`(${rowPlaceholders.join(', ')})`);
      }
      const query = `INSERT INTO "wtf_steam_user_item" (${columns.join(', ')}) VALUES ${placeholders.join(', ')};`;
      await this.tableService.executeQuery(query, values);
    }
  }
}

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
        params: {
          steamid: steamId,
          'itemdefid[0]': templateId,
          notify: true,
        },
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
    const query = `SELECT * FROM ${itemsTableName} WHERE steam_id = $1;`;
    const values = [steamId];
    const { data, error } = await this.tableService.executeQuery(query, values);
    if (!data) throw new NotFoundException(error);
    return data;
  }

  async getUserTableTemplates() {
    // TODO: Decouple table name
    const query = `
      SELECT id from wtf_steam_templates WHERE sync;
    `;
    const { data, error } = await this.tableService.executeQuery(query);
    if (!data) throw new InternalServerErrorException(error);
    return data.map(({ id }) => id);
  }

  async claimItem(steamId: string, templateId?: string) {
    // TODO: Use safety measures to return error on malicious behavior
    const addedItem = await this.addItem(
      steamId,
      templateId ? templateId : '2',
    );
    await this.syncInventory(steamId);
    return addedItem;
  }

  async consumeItem(steamId: string, itemId: string) {
    const { data } = await this.httpService.axiosRef.post<SteamResponse>(
      '/IInventoryService/ConsumeItem/v1/',
      {},
      {
        params: { steamid: steamId, itemid: itemId, quantity: 1 },
      },
    );
    const consumedItem = JSON.parse(data.response.item_json);
    console.log('consumedItem', consumedItem);
    await this.syncInventory(steamId);
    return consumedItem;
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
      .filter(
        ({ itemid }) => !tableItemIds.some((item) => item.item_id === itemid),
      )
      .filter(({ itemdefid }) => tableTemplateIds.includes(itemdefid))
      .map(({ itemid, itemdefid }) => ({
        item_id: itemid,
        steam_id: steamId,
        template_id: itemdefid,
      }));

    const removedItems = tableItemIds
      .filter(({ template_id }) => tableTemplateIds.includes(template_id))
      .filter(
        ({ item_id }) =>
          !steamInventory.some(({ itemid }) => itemid === item_id),
      );

    if (removedItems.length > 0) {
      // Extract item_id values from the removedItems objects
      const itemIds = removedItems.map((item) => item.item_id);
      const placeholders = itemIds
        .map((_, index) => `$${index + 1}`)
        .join(', ');
      const deleteQuery = `DELETE FROM "wtf_steam_user_item" WHERE item_id IN (${placeholders});`;
      await this.tableService.executeQuery(deleteQuery, itemIds); // Pass the extracted item IDs instead of the full objects
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

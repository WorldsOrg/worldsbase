import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const serverURL = process.env.SERVER_URL; // Replace with your server's URL and port
const X_API_KEY = process.env.X_API_KEY;

// Example function to perform a GET request
const createTable = async (data) => {
  try {
    await axios.post(`${serverURL}/table/createtable`, data, {
      headers: {
        'x-api-key': X_API_KEY,
      },
    });
  } catch (error) {
    console.error('Error creating the tables:', error);
  }
};

const insertTable = async (data) => {
  try {
    await axios.post(`${serverURL}/table/insertdata`, data, {
      headers: {
        'x-api-key': X_API_KEY,
      },
    });
  } catch (error) {
    console.error('Error inserting into the tables:', error);
  }
};
// create table for auth functions

createTable({
  tableName: 'dashboard_users',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'email',
      type: 'TEXT',
    },
    {
      name: 'password',
      type: 'TEXT',
    },
  ],
});

// create table for dashboard functions
createTable({
  tableName: 'trigger_functions',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'triggers',
      type: 'jsonb[]',
    },
  ],
});

// create tables for monster game
createTable({
  tableName: 'monster_players',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'steam_username',
      type: 'text',
    },
    {
      name: 'wallet',
      type: 'text',
    },
  ],
});

createTable({
  tableName: 'monster_player_match_performance',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'player_id',
      type: 'BIGINT',
    },
    {
      name: 'match_id',
      type: 'text',
    },
    {
      name: 'headshots',
      type: 'BIGINT',
    },
  ],
});

createTable({
  tableName: 'monster_match_history',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'start_time',
      type: 'BIGINT',
    },
    {
      name: 'end_time',
      type: 'BIGINT',
    },
    {
      name: 'match_id',
      type: 'text',
    },
  ],
});

createTable({
  tableName: 'monster_game_variables',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'value',
      type: 'text',
    },
  ],
});

createTable({
  tableName: 'monster_player_inventory',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'player_id',
      type: 'BIGINT',
    },
    {
      name: 'resource_id',
      type: 'BIGINT',
    },
    {
      name: 'quantity',
      type: 'BIGINT',
    },
  ],
});

createTable({
  tableName: 'monster_game_resources',
  columns: [
    {
      name: 'id',
      type: 'serial',
      constraints: 'PRIMARY KEY',
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'address',
      type: 'text',
    },
  ],
});

// insert mock users
insertTable({
  tableName: 'monster_players',
  data: {
    steam_username: 'CyberneticDreamweaver',
    wallet: '0x5678TfGh6931IjK23456Lmno7890QrsT1234UxWy',
  },
});

insertTable({
  tableName: 'monster_players',
  data: {
    steam_username: 'StellarNavigatorX',
    wallet: '0x9012IjKl2345MnO67890Pqrs1234UvwX5678YzAb',
  },
});

insertTable({
  tableName: 'monster_players',
  data: {
    steam_username: 'LostAstronaut99',
    wallet: '0xb234KlMn4567OpQ89012RstU3456Vwxy7890AbCd',
  },
});

insertTable({
  tableName: 'monster_players',
  data: {
    steam_username: 'LuNarLegioNnaire',
    wallet: '',
  },
});

insertTable({
  tableName: 'monster_players',
  data: {
    steam_username: 'EtherExplorer',
    wallet: '',
  },
});

insertTable({
  tableName: 'monster_players',
  data: {
    steam_username: 'SkywardVoyager',
    wallet: '',
  },
});

//insert mock game variables
insertTable({
  tableName: 'monster_game_variables',
  data: {
    name: 'initialMonsterHealth',
    value: '100',
  },
});

insertTable({
  tableName: 'monster_game_variables',
  data: {
    name: 'headshotDamage',
    value: '50',
  },
});

insertTable({
  tableName: 'monster_game_variables',
  data: {
    name: 'isExtraGunInGame',
    value: 'true',
  },
});

insertTable({
  tableName: 'monster_game_variables',
  data: {
    name: 'goldAwardedOnCompletion',
    value: '100',
  },
});

insertTable({
  tableName: 'monster_match_history',
  data: {
    start_time: '1703776935063',
    end_time: '1703776937473',
    match_id: 'c8f9ae76-55e2-45c0-b41e-3d0644dd0c95',
  },
});

insertTable({
  tableName: 'monster_match_history',
  data: {
    start_time: '1703776938852',
    end_time: '1703776941769',
    match_id: '7db624d0-0b4c-4478-81da-68f6f95b4e58',
  },
});

insertTable({
  tableName: 'monster_match_history',
  data: {
    start_time: '1703788109775',
    end_time: '1703788119929',
    match_id: '76b80c1d-281f-4a60-b07c-e76fc980ded6',
  },
});

insertTable({
  tableName: 'monster_player_match_performance',
  data: {
    player_id: 1,
    match_id: 'c8f9ae76-55e2-45c0-b41e-3d0644dd0c95',
    headshots: 16,
  },
});

insertTable({
  tableName: 'monster_player_match_performance',
  data: {
    player_id: 2,
    match_id: '7db624d0-0b4c-4478-81da-68f6f95b4e58',
    headshots: 3,
  },
});

insertTable({
  tableName: 'monster_player_match_performance',
  data: {
    player_id: 3,
    match_id: '76b80c1d-281f-4a60-b07c-e76fc980ded6',
    headshots: 6,
  },
});

insertTable({
  tableName: 'monster_player_inventory',
  data: {
    player_id: 1,
    resource_id: 1,
    quantity: 40,
  },
});

insertTable({
  tableName: 'monster_player_inventory',
  data: {
    player_id: 2,
    resource_id: 1,
    quantity: 400,
  },
});

insertTable({
  tableName: 'monster_player_inventory',
  data: {
    player_id: 3,
    resource_id: 1,
    quantity: 140,
  },
});

insertTable({
  tableName: 'monster_player_inventory',
  data: {
    player_id: 2,
    resource_id: 2,
    quantity: 1,
  },
});

insertTable({
  tableName: 'monster_player_inventory',
  data: {
    player_id: 3,
    resource_id: 3,
    quantity: 1,
  },
});

insertTable({
  tableName: 'monster_game_resources',
  data: {
    id: 1,
    name: 'gold',
    address: '9sBZW1D8MpH4qFCD5yA8jU4sv2XKrv6qTeh8Rg12m7LU',
  },
});

insertTable({
  tableName: 'monster_game_resources',
  data: {
    id: 2,
    name: 'laser_gun',
    address: '9YZFF4A3Yy7SfRkPM5cNzcrd4nGSzSBHggNC3cyjZusZ',
  },
});

insertTable({
  tableName: 'monster_game_resources',
  data: {
    id: 3,
    name: 'health_potion',
    address: '',
  },
});

module.exports = { createTable };

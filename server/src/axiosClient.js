const axios = require("axios");
require("dotenv").config({ path: "../.env" });
const serverURL = "http://localhost:3003"; // Replace with your server's URL and port
const X_API_KEY = process.env.X_API_KEY;

// Example function to perform a GET request
const createTable = async (data) => {
  try {
    await axios.post(`${serverURL}/table/createTable`, data, {
      headers: {
        "x-api-key": X_API_KEY,
      },
    });
  } catch (error) {
    console.error("Error creating the tables:", error);
  }
};

const insertTable = async (data) => {
  try {
    await axios.post(`${serverURL}/table/insertData`, data, {
      headers: {
        "x-api-key": X_API_KEY,
      },
    });
  } catch (error) {
    console.error("Error inserting into the tables:", error);
  }
};
// create table for auth functions

// createTable({
//   tableName: "dashboard_users",
//   columns: [
//     {
//       name: "id",
//       type: "serial",
//       constraints: "PRIMARY KEY",
//     },
//     {
//       name: "email",
//       type: "TEXT",
//     },
//     {
//       name: "password",
//       type: "TEXT",
//     },
//   ],
// });

// // create table for dashboard functions
// createTable({
//   tableName: "trigger_functions",
//   columns: [
//     {
//       name: "id",
//       type: "serial",
//       constraints: "PRIMARY KEY",
//     },
//     {
//       name: "triggers",
//       type: "jsonb[]",
//     },
//   ],
// });

// create tables for monster game
createTable({
  tableName: "monster_players",
  columns: [
    {
      name: "id",
      type: "serial",
      constraints: "PRIMARY KEY",
    },
    {
      name: "steam_username",
      type: "text",
    },
    {
      name: "wallet",
      type: "text",
    },
  ],
});

createTable({
  tableName: "monster_player_match_performance",
  columns: [
    {
      name: "id",
      type: "serial",
      constraints: "PRIMARY KEY",
    },
    {
      name: "player_id",
      type: "INTEGER",
    },
    {
      name: "match_id",
      type: "text",
    },
    {
      name: "headshots",
      type: "INTEGER",
    },
  ],
});

createTable({
  tableName: "monster_match_history",
  columns: [
    {
      name: "id",
      type: "serial",
      constraints: "PRIMARY KEY",
    },
    {
      name: "start_time",
      type: "INTEGER",
    },
    {
      name: "end_time",
      type: "INTEGER",
    },
    {
      name: "match_id",
      type: "text",
    },
  ],
});

createTable({
  tableName: "monster_game_variables",
  columns: [
    {
      name: "id",
      type: "serial",
      constraints: "PRIMARY KEY",
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "value",
      type: "text",
    },
  ],
});

createTable({
  tableName: "monster_player_inventory",
  columns: [
    {
      name: "id",
      type: "serial",
      constraints: "PRIMARY KEY",
    },
    {
      name: "player_id",
      type: "INTEGER",
    },
    {
      name: "resource_id",
      type: "INTEGER",
    },
    {
      name: "quantity",
      type: "INTEGER",
    },
  ],
});

createTable({
  tableName: "monster_game_resources",
  columns: [
    {
      name: "id",
      type: "serial",
      constraints: "PRIMARY KEY",
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "address",
      type: "text",
    },
  ],
});

// create tables for monster game
insertTable({
  tableName: "monster_players",
  data: {
    steam_username: "CyberneticDreamweaver",
    wallet: "0x5678TfGh6931IjK23456Lmno7890QrsT1234UxWy",
  },
});

insertTable({
  tableName: "monster_players",
  data: {
    steam_username: "StellarNavigatorX",
    wallet: "0x9012IjKl2345MnO67890Pqrs1234UvwX5678YzAb",
  },
});

insertTable({
  tableName: "monster_players",
  data: {
    steam_username: "LostAstronaut99",
    wallet: "0xb234KlMn4567OpQ89012RstU3456Vwxy7890AbCd",
  },
});

module.exports = { createTable };

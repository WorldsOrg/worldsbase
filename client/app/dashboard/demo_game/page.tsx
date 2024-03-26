"use client";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "@/utils/axiosInstance";

function Game() {
  const [stats, setStats] = useState({ kill: 0, headshot: 0, hit: 0, gold: 0 });
  const [inventory, setInventory] = useState<string>("");
  const [health, setHealth] = useState<number>(100);
  const [headshotDamage, setHeadshotDamage] = useState<number>(20);
  const [award, setAward] = useState<number>(100);
  const [startTime, setStartTime] = useState<number>(0);
  const [matchId, setMatchId] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [wallet, setWallet] = useState<string>("");

  const { copyToClipboard, isCopied } = useCopyToClipboard();

  useEffect(() => {
    startNewGame();
  }, []);

  const getData = async (tableName: string) => {
    try {
      const result = await axiosInstance.get(`/table/gettable/${tableName}`);
      return result.data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const postData = async (tableName: string, data: any) => {
    try {
      const payload = {
        data: data,
        tableName: tableName,
      };
      const result = await axiosInstance.post(`/table/insertData/`, payload);
      return result.data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const putData = async (tableName: string, data: any) => {
    try {
      const payload = {
        data: data,
        tableName: tableName,
        condition: `id = ${data.id}`,
      };

      const result = await axiosInstance.put(`/table/updateData`, payload);
      return result.data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const startNewGame = async () => {
    const variables = await getData("monster_game_variables");
    const player = await getData("monster_players");
    if (player && player.length > 0) {
      const randomPlayer = Math.floor(Math.random() * player.length);
      setPlayerName(player[randomPlayer].steam_username);
      setPlayerId(player[randomPlayer].id);
      setWallet(player[randomPlayer].wallet);
    }

    if (variables) {
      variables?.forEach((variable: any) => {
        if (variable.name === "initialMonsterHealth") {
          setHealth(parseInt(variable.value));
        } else if (variable.name === "headshotDamage") {
          setHeadshotDamage(parseInt(variable.value));
        } else if (variable.name === "isExtraGunInGame") {
          setInventory(variable.value);
        } else if (variable.name === "goldAwardedOnCompletion") {
          setAward(parseInt(variable.value));
        }
      });
    }
    setMatchId(uuidv4());
    setStartTime(Date.now());
  };

  const killedMonster = async () => {
    const playerData = {
      match_id: matchId,
      player_id: playerId,
      headshots: stats.headshot,
    };

    setStats({ kill: 1, headshot: 0, hit: 0, gold: award });
    setHealth(0);
    const body = {
      start_time: startTime,
      end_time: Date.now(),
      match_id: matchId,
    };
    await postData("monster_match_history", body);
    await postData("monster_player_match_performance", playerData);

    const inventory_data = await getData("monster_player_inventory");

    const player = inventory_data.filter((item: any) => item.player_id === playerId && item.resource_id === 1);
    let inventoryData = {};
    if (player.length === 0) {
      inventoryData = {
        player_id: playerId,
        resource_id: 1,
        quantity: award,
      };
      await postData("monster_player_inventory", inventoryData);
    } else {
      inventoryData = {
        id: player[0].id,
        player_id: playerId,
        resource_id: 1,
        quantity: player[0].quantity + award,
      };
      await putData("monster_player_inventory", inventoryData);
    }
  };

  const updateStats = async (type: string) => {
    if (health <= 0) {
      return;
    }
    let newHealth = health;
    const newStats = stats;

    if (type === "hit") {
      if (newHealth <= 10) {
        killedMonster();
        return;
      }
      newHealth -= 10;
      newStats.hit += 1;
    } else if (type === "headshot") {
      if (newHealth <= headshotDamage) {
        killedMonster();
        return;
      }
      newHealth -= headshotDamage;
      newStats.headshot += 1;
    } else if (type === "laser") {
      if (newHealth <= 50) {
        killedMonster();
        return;
      }
      newHealth -= 50;
      newStats.kill += 1;
    }
    setHealth(newHealth);
    setStats(newStats);
  };

  return (
    <div className="flex flex-row text-primary">
      <div className="p-2 border rounded-md border-borderColor basis-1/3">
        <div className="font-bold"> Demo Game</div>
        <br></br>
        This demo game is connected to the gaming API. It loads initial parameters from the game_variables table (enemy health, hit damage, etc). After defeating an enemy, player
        match stats are saved and the gold resource is awarded to the user. Other automations are configured in Composer. For example, when a player wins 3 matches, an NFT is
        minted to their connected wallet. And when a player gets 500 gold, a new weapon is unlocked and added to their inventory.
      </div>
      <div className="grid text-center basis-2/3 ">
        <div className="flex mx-auto">
          {" "}
          Logged in: {playerName}{" "}
          {wallet ? (
            <div className="relative flex group" onClick={() => copyToClipboard(wallet)}>
              <img src="/solana.png" className="ml-2" width={20} height={20} alt="solana" />
              <span className="absolute px-1 m-4 mx-auto text-sm text-gray-100 transition-opacity -translate-x-1/2 translate-y-full bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 left-1/2">
                {wallet}
              </span>
            </div>
          ) : (
            ""
          )}
        </div>
        <br />
        {stats.kill} Kills
        <br />
        {stats.headshot} Headshots
        <br />
        {stats.hit} Hits
        <br />
        {stats.gold} Gold
        <br />
        {health > 0 ? (
          <div className="mt-8">
            <button
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${health <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={health <= 0}
              onClick={() => {
                updateStats("hit");
              }}
            >
              Hit
            </button>
            <button
              className={`ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${health <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={health <= 0}
              onClick={() => {
                updateStats("headshot");
              }}
            >
              HeadShot
            </button>
            {inventory === "true" && (
              <button
                className={`ml-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ${health <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={health <= 0}
                onClick={() => {
                  updateStats("laser");
                }}
              >
                Laser
              </button>
            )}
          </div>
        ) : (
          <button onClick={startNewGame} className="px-4 py-2 font-bold text-white bg-yellow-500 rounded hover:bg-yellow-700">
            Respawn
          </button>
        )}
        <br />
        <br />
        <div className="flex justify-center w-64 mx-auto">
          <div className={`w-60 bg-red-600 h-2 rounded-full ${health <= 0 ? "opacity-50" : ""}`} style={{ width: `${health}px` }}></div>
        </div>
        <div className="w-full mx-auto mt-2"> {health}</div>
        <div className="flex justify-center mt-12">
          <div className={`transform ${health <= 0 ? "rotate-90 hue-rotate-90" : ""}`}>
            <img src={"/monster.png"} width={200} height={200} alt="monster" />
          </div>
        </div>
        <br />
      </div>
    </div>
  );
}

export default Game;

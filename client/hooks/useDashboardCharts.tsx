"use client";
import { useState, useEffect } from "react";
import { fetchDashboardData } from "@/utils/helpers";
import { GameStatistics, PlayerCount, TopFiveHighestPlayers, TotalMatchesPerDay } from "@/types";

type StateType = {
  playerCount: PlayerCount[];
  topFiveHighestHeadshots: TopFiveHighestPlayers[];
  topFiveMatchCount: TopFiveHighestPlayers[];
  gameStatistics: GameStatistics[];
  totalMatchesPerDay: TotalMatchesPerDay[];
  averageHeadshotsPerMatch: TopFiveHighestPlayers[];
};

const useDashboardCharts = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StateType>({
    playerCount: [],
    topFiveHighestHeadshots: [],
    topFiveMatchCount: [],
    gameStatistics: [],
    totalMatchesPerDay: [],
    averageHeadshotsPerMatch: [],
  });

  const fetchData = async (endpoint: string, key: keyof StateType) => {
    const result = await fetchDashboardData(endpoint);
    setData((prev) => ({ ...prev, [key]: result || [] }));
  };

  const fetchAllData = async () => {
    setLoading(true);
    const endpoints = [
      ["getPlayerCount", "playerCount"],
      ["getTopFiveHighestHeadshots", "topFiveHighestHeadshots"],
      ["getTopFiveMatchCount", "topFiveMatchCount"],
      ["getAverageHeadshotsPerMatch", "averageHeadshotsPerMatch"],
      ["getGameStatistics", "gameStatistics"],
      ["getTotalMatchesPerDay", "totalMatchesPerDay"],
    ];
    await Promise.all(endpoints.map(([endpoint, key]) => fetchData(endpoint, key as keyof StateType)));
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return { data, loading };
};

export default useDashboardCharts;

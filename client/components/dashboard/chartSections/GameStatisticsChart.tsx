"use client";
import { useState } from "react";
import BarChart from "@/components/charts/BarChart";
import Title from "@/components/charts/Title";
import { GameStatistics } from "@/types";
import ChartLoading from "@/components/ui/chartLoading";

interface GameStatisticsChartProps {
  data: GameStatistics[];
  isLoading: boolean;
}

const chartGrouped = [
  {
    id: 1,
    type: "grouped",
    isStacked: false,
  },
  {
    id: 2,
    type: "stacked",
    isStacked: true,
  },
];

const GameStatisticsChart = ({
  data,
  isLoading = false,
}: GameStatisticsChartProps) => {
  const [chartType, setChartType] = useState("grouped");

  const gameStatisticsData = {
    labels: data?.map((entry) => entry.match_day_friendly),
    datasets: [
      {
        label: "Players",
        data: data?.map((entry) => entry.players),
        backgroundColor: "rgba(136, 132, 216, 0.6)",
      },
      {
        label: "Matches",
        data: data?.map((entry) => entry.matches),
        backgroundColor: "rgba(130, 202, 157, 0.6)",
      },
      {
        label: "Headshots",
        data: data?.map((entry) => entry.headshots),
        backgroundColor: "rgba(255, 198, 88, 0.6)",
      },
      {
        label: "Resources",
        data: data?.map((entry) => entry.resources),
        backgroundColor: "rgba(255, 115, 0, 0.6)",
      },
    ],
  };

  if (isLoading) {
    return <ChartLoading />;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:gap-0">
        <Title title="WGS-Game Statistics" />
        <div className="flex items-center gap-2 text-xs border rounded-lg border-border">
          {chartGrouped.map((item) => (
            <span
              key={item.id}
              className={`capitalize cursor-pointer px-2 py-1 rounded-lg text-primary ${
                chartType === item.type ? "bg-secondary text-white" : ""
              }`}
              onClick={() => setChartType(item.type)}
            >
              {item.type}
            </span>
          ))}
        </div>
      </div>
      <BarChart data={gameStatisticsData} chartType={chartType} />
    </>
  );
};

export default GameStatisticsChart;

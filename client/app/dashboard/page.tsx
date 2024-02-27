"use client";
import { isEmpty } from "lodash";
import Title from "@/components/charts/Title";
import GameStatisticsChart from "@/components/dashboard/chartSections/GameStatisticsChart";
import PlayerCountChart from "@/components/dashboard/chartSections/PlayerCountChart";
import TopFivePlayersChart from "@/components/dashboard/chartSections/TopFivePlayersChart";
import TotalMatchesPerDayChart from "@/components/dashboard/chartSections/TotalMatchesPerDayChart";
import useDashboardCharts from "@/hooks/useDashboardCharts";

const Home = () => {
  const { data, loading } = useDashboardCharts();
  const { playerCount, topFiveHighestHeadshots, topFiveMatchCount, gameStatistics, totalMatchesPerDay, averageHeadshotsPerMatch } = data;

  const pieCharts = [
    {
      id: 1,
      title: "Top 5 Players with Highest Average Headshots",
      data: topFiveHighestHeadshots,
      className: "flex flex-col w-full md:gap-0 gap-4 p-4 border rounded-lg md:w-1/2 border-border",
    },
    {
      id: 2,
      title: "Top 5 Active Players (Match Count)",
      data: topFiveMatchCount,
      className: "relative flex flex-col md:w-1/2 w-full p-4 border rounded-lg border-border",
    },
  ];

  const horizontalBarCharts = [
    {
      id: 1,
      title: "WGS - Average Headshots per Match",
      component: (
        <TopFivePlayersChart
          type="bar"
          data={averageHeadshotsPerMatch!}
          options={{
            indexAxis: "y",
            elements: {
              bar: {
                borderWidth: 2,
              },
            },
          }}
          isLoading={loading}
        />
      ),
      className: "flex flex-col md:w-1/2 w-full gap-4 p-4 border rounded-lg border-border md:h-[400px] h-[600px]",
    },
    {
      id: 2,
      title: "WGS - Total Matches per Day",
      component: (
        <TotalMatchesPerDayChart
          data={totalMatchesPerDay!}
          options={{
            indexAxis: "y",
            elements: {
              bar: {
                borderWidth: 2,
              },
            },
          }}
          isLoading={loading}
        />
      ),
      className: " flex flex-col md:w-1/2 w-full p-4 pb-10 border rounded-lg border-border h-[400px]",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-6 md:gap-12 bg-background text-primary">
      <div className="flex flex-col-reverse flex-grow gap-4 md:flex-row">
        {!isEmpty(gameStatistics) && (
          <div className="flex flex-col w-full h-[500px] gap-4 p-4 pb-20 border rounded-lg md:w-3/4 border-border md:pb-12">
            <GameStatisticsChart data={gameStatistics} isLoading={loading} />
          </div>
        )}
        {!isEmpty(playerCount) && (
          <div className="relative flex flex-col w-full gap-4 p-4 border rounded-lg md:w-1/4 border-border md:gap-0">
            <Title title="WGS-Player Count" />
            <PlayerCountChart count={playerCount?.[0]?.count!} isLoading={loading} />
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-6 md:flex-col md:gap-12">
        <div className="flex flex-grow md:flex-row flex-col gap-4 h-[500px]">
          {pieCharts.map((item) =>
            item.data ? (
              <div key={item.id} className={item.className}>
                <Title title={item.title} />
                <TopFivePlayersChart data={item.data} isLoading={loading} />
              </div>
            ) : null
          )}
        </div>

        <div className="flex flex-col flex-grow gap-4 md:flex-row">
          {horizontalBarCharts.map((item) => (
            <div key={item.id} className={item.className}>
              <Title title={item.title} />
              {item.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

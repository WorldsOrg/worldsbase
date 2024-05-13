import { CgSpinner } from "react-icons/cg";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import { TopFiveHighestPlayers } from "@/types";
import { generateRandomChartColor } from "@/utils/helpers";
import Loading from "@/components/ui/Loading";

interface TopFivePlayersChartProps {
  data: TopFiveHighestPlayers[];
  type?: "pie" | "bar";
  options?: any;
  isLoading: boolean;
}

const TopFivePlayersChart = ({
  data,
  type = "pie",
  options,
  isLoading = false,
}: TopFivePlayersChartProps) => {
  const formattedData = {
    labels: data?.map((entry: any) => entry.steam_username),
    datasets: [
      {
        label: "Average Headshots per Match",
        backgroundColor: data?.map(() => generateRandomChartColor()),
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        hoverBackgroundColor: data?.map(() =>
          generateRandomChartColor(0.8, true)
        ),
        hoverBorderColor: "rgba(255, 99, 132, 1)",
        data: data?.map((entry) => entry.count),
      },
    ],
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center w-full h-full ">
      {type === "pie" ? (
        <PieChart data={formattedData} />
      ) : (
        <BarChart data={formattedData} options={options} />
      )}
    </div>
  );
};

export default TopFivePlayersChart;

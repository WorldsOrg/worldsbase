import BarChart from "@/components/charts/BarChart";
import { TotalMatchesPerDay } from "@/types";
import { generateRandomChartColor } from "@/utils/helpers";
import Loading from "@/components/ui/Loading";

interface TotalMatchesPerDayChartProps {
  data: TotalMatchesPerDay[];
  options?: any;
  isLoading: boolean;
}

const TotalMatchesPerDayChart = ({
  data,
  options,
  isLoading = false,
}: TotalMatchesPerDayChartProps) => {
  const formattedData = {
    labels: data?.map((entry: any) => entry.match_day),
    datasets: [
      {
        label: "Average Headshots per Match",
        backgroundColor: data?.map(() => generateRandomChartColor()),
        borderWidth: 1,
        hoverBackgroundColor: data?.map(() =>
          generateRandomChartColor(0.8, true)
        ),
        data: data?.map((entry) => entry.count),
      },
    ],
  };

  if (isLoading) {
    return <Loading />;
  }

  return <BarChart data={formattedData} options={options} />;
};

export default TotalMatchesPerDayChart;

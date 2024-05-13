import Loading from "@/components/ui/Loading";

interface PlayerCountChartProps {
  count: string;
  isLoading: boolean;
}

const PlayerCountChart = ({
  count,
  isLoading = false,
}: PlayerCountChartProps) => {
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col md:absolute md:-translate-y-1/2 md:top-1/2">
      <span className="text-2xl font-bold md:text-6xl">{count}</span>
      <span className="text-xl md:text-4xl">Player Count</span>
    </div>
  );
};

export default PlayerCountChart;

"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/context/themeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  BarElement
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: any;
  };
  options?: any;
  chartType?: string;
}

const BarChart = ({ data, options, chartType = "grouped" }: BarChartProps) => {
  const { theme } = useTheme();

  const dataSet = {
    labels: data.labels,
    datasets: data.datasets,
  };
  return (
    <Bar
      data={dataSet}
      options={{
        ...options,
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: chartType === "stacked",
            grid: {
              color: theme === "light" ? "#ededed" : "#2e2e2e",
            },
          },
          y: {
            stacked: chartType === "stacked",
            grid: {
              color: theme === "light" ? "#ededed" : "#2e2e2e",
            },
          },
        },
      }}
      height="90%"
    />
  );
};

export default BarChart;

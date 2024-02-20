"use client";
import { Chart, ArcElement } from "chart.js";
import { Doughnut } from "react-chartjs-2";

Chart.register(ArcElement);

interface PieChartTypes {
  data: {
    labels: string[];
    datasets: any;
  };
  options?: any;
}

const PieChart = ({ data }: PieChartTypes) => {
  return (
    <Doughnut
      data={data}
      options={{
        plugins: {
          legend: {
            position: "right",
          },
        },
      }}
    />
  );
};

export default PieChart;

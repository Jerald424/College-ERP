import { useMemo } from "react";
import Chart from "react-apexcharts";

export default function ChartReport({ data }) {
  let chart_options = useMemo(() => {
    try {
      let count = data?.response?.answers?.reduce((acc, cur) => {
        cur?.options?.forEach((opt) => {
          let ques = `${opt?.id}_${opt?.name}`;
          if (!acc[ques]) acc[ques] = 0;
          acc[ques] += 1;
        });
        return acc;
      }, {});

      return {
        options: {
          chart: {
            id: "basic-bar",
          },
          xaxis: {
            categories: Object.keys(count)?.map((res) => res?.split("_")?.[1]),
          },
        },
        series: [
          {
            name: "Option",
            data: Object.values(count),
          },
        ],
      };
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  return (
    <div className="mt-3">
      <Chart options={chart_options?.options} series={chart_options?.series} type="bar" height={300} />
    </div>
  );
}

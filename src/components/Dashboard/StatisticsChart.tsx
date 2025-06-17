import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

interface PipelineData {
  timeText: string;
  success: number;
  failed: number;
  predictedCorrect: number;
  successRate: number;
  failedRate: number;
  date: string;
}

export default function StatisticsChart({ userId, repoId, branch }: { userId: string; repoId: string; branch: string }) {
  const [timePeriod, setTimePeriod] = useState<"month" | "quarter" | "year">("year"); // Mặc định là Annually
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [availableYears, setAvailableYears] = useState<number[]>([2023, 2024, 2025]);
  const [pipelineData, setPipelineData] = useState<PipelineData[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

  // Fetch pipeline data từ API
  useEffect(() => {
    const fetchPipelineData = async () => {
      if (!userId || !repoId || !branch) {
        setPipelineData([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/workflow_run/pipeline-data`, {
          params: {
            "user_id": userId,
            "repo_id": repoId,
            "branch": branch,
            "time-unit": timePeriod,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data: PipelineData[] = response.data;
        setPipelineData(data);

        // Cập nhật availableYears dựa trên dữ liệu trả về
        const years = [...new Set(data.map(item => new Date(item.date).getFullYear()))];
        setAvailableYears(years.sort((a, b) => b - a));
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
        setPipelineData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, [timePeriod, selectedYear, userId, repoId, branch]);

  // Lọc dữ liệu theo selectedYear
  const filteredData = pipelineData.filter(item => {
    const year = new Date(item.date).getFullYear();
    return timePeriod === "year" || year === selectedYear;
  });

  // Tạo categories và series cho biểu đồ
  const categories = filteredData.map(item => item.timeText);
  const failedData = filteredData.map(item => item.failed);
  const successData = filteredData.map(item => item.success);
  const predictedData = filteredData.map(item => item.predictedCorrect);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: "#6B7280",
      },
    },
    colors: ["#FF4560", "#465FFF", "#F1C21B"], // Failed, Success, Predicted
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "rgba(173, 181, 189, 0.4)",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: timePeriod === "month" ? "dd MMM yyyy" : undefined,
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Failed Pipelines",
      data: failedData,
    },
    {
      name: "Successful Pipelines",
      data: successData,
    },
    {
      name: "Predicted Pipelines",
      data: predictedData,
    },
  ];

  function toggleOptionsDropdown() {
    setIsOptionsOpen(!isOptionsOpen);
  }

  function closeOptionsDropdown() {
    setIsOptionsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Pipeline Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            View the statistics of your pipelines over time.
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab setTimePeriod={setTimePeriod} />
        </div>
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleOptionsDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOptionsOpen}
              onClose={closeOptionsDropdown}
              className="w-40 p-2"
            >
              {availableYears.map((year) => (
                <DropdownItem
                  key={year}
                  onItemClick={() => {
                    setSelectedYear(year);
                    closeOptionsDropdown();
                  }}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {year}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
          ) : filteredData.length > 0 ? (
            <Chart options={options} series={series} type="area" height={310} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No data available for the selected period.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
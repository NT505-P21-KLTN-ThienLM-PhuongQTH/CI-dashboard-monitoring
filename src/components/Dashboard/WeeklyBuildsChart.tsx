import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function WeeklyBuildsChart({ userId, repoId, branch, workflowId }) {
  const [chartData, setChartData] = useState({
    categories: [],
    series: [
      { name: "Success Rate", data: [] },
      { name: "Failed Rate", data: [] },
    ],
  });
  const [rawData, setRawData] = useState([]);
  const [displayMode, setDisplayMode] = useState("percentage");
  const [recentDays, setRecentDays] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuildData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/pipeline-data?user_id=${userId}&repo_id=${repoId}&branch=${branch}&workflow_id=${workflowId}&timeUnit=day&recentDays=${recentDays}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching pipeline data:", errorData);
          throw new Error(errorData.error || "Failed to fetch pipeline data");
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        setRawData(data);
        updateChartData(data, displayMode);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching build data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId && repoId && branch && workflowId) {
      fetchBuildData();
    }
  }, [userId, repoId, branch, workflowId, recentDays]);

  const updateChartData = (data, mode) => {
    const categories = data.map((item) => {
      const date = new Date(item.timeText);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    let series;
    if (mode === "percentage") {
      const successRateData = data.map((item) => item.successRate);
      const failedRateData = data.map((item) => item.failedRate);
      series = [
        { name: "Success Rate", data: successRateData },
        { name: "Failed Rate", data: failedRateData },
      ];
    } else {
      const successData = data.map((item) => item.success);
      const failedData = data.map((item) => item.failed);
      series = [
        { name: "Success", data: successData },
        { name: "Failed", data: failedData },
      ];
    }

    setChartData({ categories, series });
  };

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    updateChartData(rawData, mode);
    setIsOptionsOpen(false);
  };

  const handleRecentDaysChange = (days) => {
    setRecentDays(days);
    setIsOptionsOpen(false);
  };

  const options: ApexOptions = {
    colors: ["#465fff", "#FF4560"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 330, // Tăng chiều cao lên 330px để đồng bộ
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => (displayMode === "percentage" ? `${val}%` : `${val}`),
      style: {
        fontSize: "12px",
        colors: ["#fff"],
      },
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
          colors: "#adb5bd",
        },
      },
    },
    yaxis: {
      max: displayMode === "percentage" ? 100 : undefined,
      labels: {
        formatter: (val) => (displayMode === "percentage" ? `${val}%` : `${val}`),
        style: {
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
          colors: "#adb5bd",
        },
      },
    },
    legend: {
      show: true,
      position: "right",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      labels: {
        colors: "#adb5bd",
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "rgba(173, 181, 189, 0.2)",
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => (displayMode === "percentage" ? `${val}%` : `${val} builds`),
      },
    },
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function toggleOptionsDropdown() {
    setIsOptionsOpen(!isOptionsOpen);
  }

  function closeOptionsDropdown() {
    setIsOptionsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Builds
        </h3>
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
              <DropdownItem
                onItemClick={() => handleDisplayModeChange("percentage")}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Show Percentage
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleDisplayModeChange("count")}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Show Count
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleRecentDaysChange(7)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Last 7 Days
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleRecentDaysChange(10)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Last 10 Days
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleRecentDaysChange(14)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Last 14 Days
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-800 dark:text-gray-200 py-4">Loading...</p>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400 py-4">{error}</p>
      ) : chartData.categories.length === 0 ? (
        <p className="text-gray-800 dark:text-gray-200 py-4">No data available</p>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <Chart
              options={options}
              series={chartData.series}
              type="bar"
              height={420}
            />
          </div>
        </div>
      )}
    </div>
  );
}
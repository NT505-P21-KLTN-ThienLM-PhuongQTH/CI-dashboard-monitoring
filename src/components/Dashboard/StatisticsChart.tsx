import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function StatisticsChart() {
  const [timePeriod, setTimePeriod] = useState("month");
  const [selectedYear, setSelectedYear] = useState(2025); // Mặc định năm hiện tại (May 02, 2025)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Danh sách năm có phát sinh workflow run (sẽ lấy từ API hoặc model)
  const [availableYears, setAvailableYears] = useState([2023, 2024, 2025]);

  // Dummy data cho 3 series dựa trên timePeriod và selectedYear
  const getCategoriesAndSeries = () => {
    const categories: string[] = [];
    const failedData: number[] = [];
    const successData: number[] = [];
    const predictedData: number[] = [];

    if (timePeriod === "month") {
      categories.push(...["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
      failedData.push(...[10, 15, 12, 18, 20, 25, 22, 30, 28, 35, 40, 38]);
      successData.push(...[180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235]);
      predictedData.push(...[5, 8, 6, 10, 12, 15, 13, 18, 16, 20, 22, 20]);
    } else if (timePeriod === "quarter") {
      categories.push(...["Q1", "Q2", "Q3", "Q4"]);
      failedData.push(...[37, 50, 50, 78]);
      successData.push(...[540, 500, 605, 685]);
      predictedData.push(...[19, 25, 24, 40]);
    } else if (timePeriod === "year") {
      categories.push(...availableYears.map(String));
      failedData.push(...[215, 225, 196]);
      successData.push(...[2330, 2450, 2105]);
      predictedData.push(...[108, 112, 98]);
    }

    return { categories, failedData, successData, predictedData };
  };

  const { categories, failedData, successData, predictedData } = getCategoriesAndSeries();

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
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you’ve set for each month
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
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
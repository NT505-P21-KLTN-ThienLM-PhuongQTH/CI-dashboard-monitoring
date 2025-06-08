import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import { Modal, Button } from "antd";
import { BulbOutlined, CheckOutlined } from "@ant-design/icons";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface PipelineFailurePredictionChartProps {
  pipelineStats: {
    recent_failures?: number;
    failed_builds_change?: number;
    total_pipelines?: number;
    last_failure?: number | null;
  };
  project_name: string;
  branch: string;
}

interface PredictionData {
  predicted_result: boolean;
  actual_result: boolean;
  execution_time: number;
  timestamp: string;
  model_name: string;
  model_version: string;
}

export default function PipelineFailurePredictionChart({
  pipelineStats,
  project_name,
  branch,
}: PipelineFailurePredictionChartProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Fetch latest prediction based on project_name and branch
  useEffect(() => {
    const fetchLatestPrediction = async () => {
      if (!project_name || !branch) {
        setLatestPrediction(null);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/prediction/latest`, {
          params: {
            project_name: project_name || "",
            branch: branch,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLatestPrediction(response.data);
      } catch (error) {
        console.error("Error fetching latest prediction:", error);
        setLatestPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPrediction();
  }, [project_name, branch]);

  // Format the execution time (processing time in seconds)
  const formatExecutionTime = (executionTime: number): string => {
    if (!executionTime) return "N/A";
    const timeInSeconds = parseFloat(executionTime.toString());
    if (isNaN(timeInSeconds)) return "N/A";
    if (timeInSeconds < 1) return `${(timeInSeconds * 1000).toFixed(1)} ms`;
    return `${timeInSeconds.toFixed(1)} s`;
  };

  // Format prediction result
  const formatResult = (result: boolean): string => {
    return result === true ? "Failure" : result === false ? "Success" : "N/A";
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  const getMessage = (): string | JSX.Element => {
    if (!latestPrediction) {
      return "Kick off your pipeline predictions by adding a job now!";
    }
    const actualResult = formatResult(latestPrediction.actual_result);
    return (
      <span>
        Processed on <span className="font-medium">{formatTimestamp(latestPrediction.timestamp)}</span> by model{" "}
        <span className="font-medium">{latestPrediction.model_name || "N/A"}</span> (version{" "}
        <span className="font-medium">{latestPrediction.model_version || "N/A"}</span>) with a processing time of{" "}
        <span className="font-medium">{formatExecutionTime(latestPrediction.execution_time)}</span>. The actual result of the pipeline is{" "}
        <Badge size="small" color={latestPrediction.actual_result ? "error" : "success"}>
          {actualResult}
        </Badge>.
      </span>
    );
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleViewDetails = () => {
    navigate("/prediction-metrics");
    closeDropdown();
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  // Progress bar options
  const series = [100];
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 250,
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "70%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px",
            fontWeight: "600",
            offsetY: -10,
            color: "#6B7280",
          },
          value: {
            show: true,
            fontSize: "24px",
            fontWeight: "700",
            offsetY: 10,
            color: latestPrediction?.predicted_result === true ? "#F46A6A" : "#039855",
            formatter: function (val: number) {
              return latestPrediction?.predicted_result === true ? "Failure" : "Success";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [latestPrediction?.predicted_result === true ? "#F46A6A" : "#039855"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Status"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6 flex-grow">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Latest Pipeline Prediction
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Results of the most recent prediction for this pipeline
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={handleViewDetails}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={showModal}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Hint
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="text-center">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : latestPrediction ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full flex justify-center h-[180px]">
                <Chart
                  options={options}
                  series={series}
                  type="radialBar"
                />
              </div>
              <p className="w-full max-w-[380px] text-center text-sm text-gray-500 dark:text-gray-400">
                {getMessage()}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img
                src="/assets/images/oops/oops_primary.png"
                alt="Logo"
                className="my-6 h-24 dark:hidden"
              />
              <img
                src="/assets/images/oops/oops_white.png"
                alt="Logo"
                className="my-6 h-24 hidden dark:block"
              />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Kick off your pipeline predictions by adding a job now! Click the button below to see how.
              </p>
              <Button
                type="link"
                icon={<BulbOutlined />}
                onClick={showModal}
                className="text-blue-500 dark:text-blue-400"
              >
                Show the hint!
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Recent Failures
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {pipelineStats?.recent_failures || 0}
            {pipelineStats?.failed_builds_change !== undefined && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d={
                    pipelineStats.failed_builds_change >= 0
                      ? "M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75013 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64442L4.69679 7.36025C4.4038 7.65305 3.92893 7.6529 3.63613 7.35992C3.34333 7.06693 3.34348 6.59206 3.63646 6.29926L7.60141 2.33683Z"
                      : "M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                  }
                  fill={pipelineStats.failed_builds_change >= 0 ? "#039855" : "#D92D20"}
                />
              </svg>
            )}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total Builds
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {pipelineStats?.total_pipelines || 0}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Last Failure
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {pipelineStats?.last_failure !== null
              ? `${pipelineStats.last_failure} days ago`
              : "N/A"}
          </p>
        </div>
      </div>

      <Modal
        title="Enable Pipeline Predictions"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        footer={
          <div className="flex justify-end">
            <Button key="close" onClick={handleModalCancel} style={{ marginRight: 8 }}>
              Close
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleModalOk}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              Got it!
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          To enable predictions for your pipeline, add the following job to your workflow configuration:
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-2">
          <pre className="text-sm whitespace-pre-wrap break-words">
{`- name: Predict Build Error
  uses: NT505-P21-KLTN-ThienLM-PhuongQTH/CI-build-failure-prediction-action@main
  with:
    stop-on-failure: false`}
          </pre>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          <strong>Note:</strong> You can set <Badge color="info">stop-on-failure</Badge> to <Badge color="primary"><code>true</code></Badge> to stop the pipeline on failure, or <Badge color="warning"><code>false</code></Badge> to continue running.
        </p>
      </Modal>
    </div>
  );
}
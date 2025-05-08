import React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  CheckLineIcon,
  TimeIcon,
  LineChartIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function CardMetrics({ pipelineStats }) {
  const { success_rate, failed_builds, average_run_time, total_pipelines, success_rate_change, failed_builds_change } = pipelineStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Pipelines */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-[#1d2939]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-800 dark:text-gray-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 17 9 11 13 15 21 7" />
          <circle cx="3" cy="17" r="1" />
          <circle cx="9" cy="11" r="1" />
          <circle cx="13" cy="15" r="1" />
          <circle cx="21" cy="7" r="1" />
        </svg>
        </div>
        <div className="flex flex-wrap items-end justify-between mt-5 gap-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Pipelines
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-gray-200">
              {total_pipelines || 0}
            </h4>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-[#1d2939]">
          <CheckLineIcon className="text-gray-800 size-6 dark:text-gray-200" />
        </div>
        <div className="flex flex-wrap items-end justify-between mt-5 gap-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Success Rate
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-gray-200">
              {success_rate || 0}%
            </h4>
          </div>
          {success_rate_change === 0 ? (
            <Badge color="info">
              <span className="block sm:hidden">No change</span>
              <span className="hidden sm:block">No change (30 days)</span>
            </Badge>
          ) : (
            <Badge color={success_rate_change > 0 ? "success" : "error"}>
              {success_rate_change > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(success_rate_change).toFixed(2)}% <span className="hidden sm:inline">(30 days)</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Failed Builds */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-[#1d2939]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-800 size-6 dark:text-gray-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <div className="flex flex-wrap items-end justify-between mt-5 gap-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Failed Builds
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-gray-200">
              {failed_builds || 0}
            </h4>
          </div>
          {failed_builds_change === 0 ? (
            <Badge color="info">
              <span className="block sm:hidden">No change</span>
              <span className="hidden sm:block">No change (30 days)</span>
            </Badge>
          ) : (
            <Badge color={failed_builds_change > 0 ? "warning" : "error"}>
              {failed_builds_change > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {Math.abs(failed_builds_change).toFixed(2)}% <span className="hidden sm:inline">(30 days)</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Average Run Time */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-[#1d2939]">
          <TimeIcon className="text-gray-800 size-6 dark:text-gray-200" />
        </div>
        <div className="flex flex-wrap items-end justify-between mt-5 gap-2">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Average Run Time
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-gray-200">
              {average_run_time || 0} seconds
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
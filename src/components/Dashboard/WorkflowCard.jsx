import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShootingStarIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

export default function WorkflowCard({ workflowId }) {
  const [workflowDetails, setWorkflowDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const fetchWorkflowDetails = async () => {
      if (!workflowId) {
        setWorkflowDetails(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/workflow/${workflowId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWorkflowDetails(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowDetails();
  }, [workflowId]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Workflow Details
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            The details of the workflow are as follows
          </p>
        </div>
        <ShootingStarIcon className="text-gray-800 size-6 dark:text-gray-200" />
      </div>

      {loading ? (
        <p className="text-gray-800 dark:text-gray-200 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : workflowDetails ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">Name:</span>
            <span className="text-gray-600 dark:text-gray-400">{workflowDetails.name || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">GitHub Workflow ID:</span>
            <span className="text-gray-600 dark:text-gray-400">{workflowDetails.github_workflow_id || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">Path:</span>
            <span className="text-gray-600 dark:text-gray-400">{workflowDetails.path || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">State:</span>
            <Badge
              size="small"
              color={
                workflowDetails.state === "active" ? "success" : "error"
              }
            >
              {workflowDetails.state || "-"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">Created At:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {workflowDetails.created_at
                ? new Date(workflowDetails.created_at).toLocaleString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">Updated At:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {workflowDetails.updated_at
                ? new Date(workflowDetails.updated_at).toLocaleString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">URL:</span>
            {workflowDetails.html_url ? (
              <a
                href={workflowDetails.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on GitHub
              </a>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">-</span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 mt-4">
          No workflow details available.
        </p>
      )}
    </div>
  );
}
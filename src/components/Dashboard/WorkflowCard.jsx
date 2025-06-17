import React, { useState, useEffect } from "react";
import axios from "axios";
import Badge from "../ui/badge/Badge";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function WorkflowCard({ workflowId }) {
  const navigate = useNavigate();
  const [workflowDetails, setWorkflowDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

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

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleViewMore = () => {
    navigate("/workflows");
    closeDropdown();
  };

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
              onItemClick={handleViewMore}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
          </Dropdown>
        </div>
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
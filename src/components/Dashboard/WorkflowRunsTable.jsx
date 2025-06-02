import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Space, Input } from "antd";
import axios from "axios";
import Badge from "../ui/badge/Badge";

const { Search } = Input;

const WorkflowRunsTable = ({ title, workflowId, selectedBranch }) => {
  const [runs, setRuns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRun, setSelectedRun] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const fetchWorkflowRuns = async (page = 1, filters = {}, sorter = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/workflow_run/runs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          workflow_id: workflowId,
          branch: selectedBranch,
        },
      });
      setRuns(response.data.runs);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching workflow runs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRunDetails = async (runId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/workflow_run/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedRun(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching run details:", error);
    }
  };

  useEffect(() => {
    if (workflowId && selectedBranch) {
      fetchWorkflowRuns(currentPage);
    }
  }, [workflowId, selectedBranch, currentPage]);

  const handleSearch = (value) => {
    setSearchText(value);
    fetchWorkflowRuns(1, { search: value }); // Gửi search text như query param
  };

  const filteredRuns = runs.filter((run) =>
    (run.head_sha?.toLowerCase().includes(searchText.toLowerCase()) ||
      run.event?.toLowerCase().includes(searchText.toLowerCase())) &&
    (!searchText || run.head_sha || run.event)
  );

  const columns = [
    {
      title: "Actor",
      dataIndex: "actor",
      key: "actor",
      render: (actor) =>
        actor ? (
          <div className="flex items-center gap-2">
            <img
              src={actor.avatar_url}
              alt={actor.login}
              className="w-8 h-8 rounded-full"
            />
            <a
              href={actor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline whitespace-nowrap overflow-hidden max-w-[150px]"
              title={actor.login}
            >
              {actor.login}
            </a>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
      render: (text) => (
        <span
          className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
          title={text}
        >
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Head SHA",
      dataIndex: "head_sha",
      key: "head_sha",
      width: 100,
      render: (text) => (
        // <span
        //   className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
        //   title={text}
        // >
        //   {text || "-"}
        // </span>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-full block" style={{ maxWidth: '100px' }}>
          {text.substring(0, 7)}
        </span>
      ),
    },
    {
      title: "Run Started At",
      dataIndex: "run_started_at",
      key: "run_started_at",
      sorter: true,
      render: (date) => (
        <span
          className="overflow-hidden max-w-[150px] whitespace-nowrap text-ellipsis"
          title={date ? new Date(date).toLocaleString() : "-"}
        >
          {date ? new Date(date).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      sorter: true,
      render: (date) => (
        <span
          className="overflow-hidden max-w-[150px] whitespace-nowrap text-ellipsis"
          title={date ? new Date(date).toLocaleString() : "-"}
        >
          {date ? new Date(date).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      title: "Conclusion",
      dataIndex: "conclusion",
      key: "conclusion",
      filters: [
        { text: "success", value: "success" },
        { text: "failure", value: "failure" },
        { text: "neutral", value: "neutral" },
        { text: "cancelled", value: "cancelled" },
        { text: "skipped", value: "skipped" },
        { text: "stale", value: "stale" },
        { text: "action_required", value: "action_required" },
        { text: "timed_out", value: "timed_out" },
        { text: "startup_failure", value: "startup_failure" },
        { text: "null", value: "" },
      ],
      onFilter: (value, record) => record.conclusion === value,
      render: (conclusion) => (
        <div style={{ textAlign: 'center' }}>
          <Badge
            size="small"
            color={
              conclusion === "success"
                ? "success"
                : conclusion === "failure"
                ? "error"
                : "warning"
            }
          >
            {conclusion || "-"}
          </Badge>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "completed", value: "completed" },
        { text: "in_progress", value: "in_progress" },
        { text: "queued", value: "queued" },
        { text: "requested", value: "requested" },
        { text: "pending", value: "pending" },
        { text: "waiting", value: "waiting" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <div style={{ textAlign: 'center' }}>
        <Badge
            size="small"
            color={
              status === "completed"
                ? "success"
                : status === "in_progress"
                ? "warning"
                : "error"
            }
          >
            {status || "-"}
        </Badge>
        </div>
      ),
    },
    {
      title: "URL",
      dataIndex: "html_url",
      key: "html_url",
      render: (url) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
          title={url}
        >
          View on GitHub
        </a>
      ),
    },
    {
      title: "Details",
      key: "details",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            onClick={() => fetchRunDetails(record.id)}
            style={{ color: "#1890ff" }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {title}
        </h3>
      )}
      <div className="mb-4">
        <Search
          placeholder="Search by Head SHA or Event"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '35%' }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredRuns}
        rowKey="id"
        loading={loading}
        bordered
        size="small"
        pagination={{
          current: currentPage,
          pageSize: 7,
          total,
          onChange: (page) => setCurrentPage(page),
        }}
        onChange={(pagination, filters, sorter) => {
          fetchWorkflowRuns(pagination.current, filters, sorter);
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Run Details"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedRun && (
          <div className="space-y-4">
            {/* <p>
              <strong>ID:</strong> {selectedRun._id}
            </p> */}
            <p>
              <strong>GitHub Run ID:</strong> {selectedRun.github_run_id}
            </p>
            <p>
              <strong>Branch:</strong> {selectedRun.head_branch}
            </p>
            <div>
              <strong>Actor:</strong>
              {selectedRun.actor && (
                <div className="ml-4">
                  <p>
                    <strong>Login:</strong>{" "}
                    <a
                      href={selectedRun.actor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {selectedRun.actor.login}
                    </a>
                  </p>
                  <p>
                    <strong>Avatar URL:</strong>{" "}
                    <a
                      href={selectedRun.actor.avatar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Avatar
                    </a>
                  </p>
                </div>
              )}
            </div>
            <p>
              <strong>Conclusion:</strong>{" "}
              <Badge
                size="small"
                color={
                  selectedRun.conclusion === "success"
                    ? "success"
                    : selectedRun.conclusion === "failure"
                    ? "error"
                    : "warning"
                }
              >
                {selectedRun.conclusion || "-"}
              </Badge>
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <Badge
                size="small"
                color={
                  selectedRun.status === "completed"
                    ? "success"
                    : selectedRun.status === "in_progress"
                    ? "warning"
                    : "error"
                }
              >
                {selectedRun.status || "-"}
              </Badge>
            </p>
            <p>
              <strong>Event:</strong> {selectedRun.event || "-"}
            </p>
            <p>
              <strong>Head SHA:</strong> {selectedRun.head_sha || "-"}
            </p>
            <p><strong>Display Title:</strong> {selectedRun.display_title || "-"}</p>
            <p>
              <strong>Run Number:</strong> {selectedRun.run_number || "-"}
            </p>
            <p>
              <strong>Run Attempt:</strong> {selectedRun.run_attempt || "-"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {selectedRun.created_at
                ? new Date(selectedRun.created_at).toLocaleString()
                : "-"}
            </p>
            <p>
              <strong>Run Started At:</strong>{" "}
              {selectedRun.run_started_at
                ? new Date(selectedRun.run_started_at).toLocaleString()
                : "-"}
            </p>
            <p>
              <strong>Updated At:</strong>{" "}
              {selectedRun.updated_at
                ? new Date(selectedRun.updated_at).toLocaleString()
                : "-"}
            </p>
            <p>
              <strong>URL:</strong>{" "}
              {selectedRun.html_url ? (
                <a
                  href={selectedRun.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on GitHub
                </a>
              ) : (
                "-"
              )}
            </p>
            <div>
              <strong>Triggering Actor:</strong>
              {selectedRun.triggering_actor && (
                <div className="ml-4">
                  <p>
                    <strong>Login:</strong>{" "}
                    <a
                      href={selectedRun.triggering_actor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {selectedRun.triggering_actor.login}
                    </a>
                  </p>
                  <p>
                    <strong>Avatar URL:</strong>{" "}
                    <a
                      href={selectedRun.triggering_actor.avatar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Avatar
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowRunsTable;
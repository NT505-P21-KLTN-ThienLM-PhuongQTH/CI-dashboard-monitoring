import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Space, Input, Drawer, message, Modal } from "antd";
import axios from "axios";
import Badge from "../ui/badge/Badge";
import { ReloadOutlined, RedoOutlined } from '@ant-design/icons';
import { UserContext } from '../../contexts/UserContext';

const { Search } = Input;

const WorkflowRunsTable = ({ title, workflowId, selectedBranch }) => {
  const { user } = useContext(UserContext);
  const [runs, setRuns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWorkflowRun, setSelectedWorkflowRun] = useState(null);

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

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
          ...filters,
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
      setSelectedWorkflowRun(response.data);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Error fetching run details:", error);
    }
  };

  const handleRerunWorkflow = async (runId, userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No authentication token found. Please log in again.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/workflow_run/runs/${runId}/rerun?user_id=${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Workflow run re-run initiated successfully!");
      fetchWorkflowRuns(currentPage); // Refresh table after rerun
    } catch (error) {
      console.error("Error re-running workflow:", error);
      if (error.response) {
        message.error(`Failed to re-run workflow: ${error.response.data.details || error.message}`);
      } else {
        message.error("Failed to re-run workflow due to an error.");
      }
    }
  };

  useEffect(() => {
    if (workflowId && selectedBranch) {
      fetchWorkflowRuns(currentPage);
    }
  }, [workflowId, selectedBranch, currentPage]);

  const handleSearch = (value) => {
    setSearchText(value);
    fetchWorkflowRuns(1, { search: value });
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
          <Button
            type="text"
            icon={<RedoOutlined />}
            style={{ color: '#FAAD14' }}
            onClick={() => {
              Modal.confirm({
                title: "Confirm Rerun",
                content: (
                  <span>
                    Are you sure you want to re-run workflow run ID&nbsp;
                    <a
                      href={record.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1890ff", textDecoration: "underline" }}
                    >
                      {record.github_run_id}
                    </a>
                    ?
                  </span>
                ),
                okText: "Yes",
                okType: "primary",
                cancelText: "No",
                onOk: () => handleRerunWorkflow(record.id, user.id),
              });
            }}
          >
            Rerun
          </Button>
        </Space>
      ),
    },
  ];

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedWorkflowRun(null);
  };

  const handleRefresh = () => {
    fetchWorkflowRuns(currentPage);
  };

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {title}
        </h3>
      )}
      <div className="mb-4 flex items-center gap-4">
        <Search
          placeholder="Search by Head SHA or Event"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: "25%" }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
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

      <Drawer
        title="Workflow Run Details"
        placement="right"
        onClose={handleDrawerClose}
        open={isDrawerOpen}
        width={Math.min(window.innerWidth * 0.9, 550)}
        zIndex={10000}
        footer={
          <div className="flex justify-end">
            <Button onClick={handleDrawerClose} style={{ marginRight: 8 }}>
              Close
            </Button>
          </div>
        }
        className="bg-white dark:bg-white/[0.03]"
      >
        {selectedWorkflowRun && (
          <div className="space-y-5">
            {/* Triggering Actor */}
            {selectedWorkflowRun.triggering_actor && (
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedWorkflowRun.triggering_actor.avatar_url}
                    alt={selectedWorkflowRun.triggering_actor.login}
                    className="w-28 h-28 rounded-md"
                  />
                  <div>
                    <p className="text-lg font-semibold">
                      Triggered by: {selectedWorkflowRun.triggering_actor.login}
                    </p>
                    <a
                      href={selectedWorkflowRun.triggering_actor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            )}

            <hr className="block text-sm font-sm text-gray-200 dark:text-gray-800" />

            {/* Pipeline Overview */}
            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pipeline Overview</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Name:</strong> {selectedWorkflowRun.name || '-'}</p>
                <p><strong>Display Title:</strong> <Badge size="small" color="primary">{selectedWorkflowRun.display_title || '-'}</Badge></p>
                <p><strong>GitHub Run ID:</strong> {selectedWorkflowRun.github_run_id?.toString() || '-'}</p>
                <p><strong>GitHub Workflow ID:</strong> {selectedWorkflowRun.github_workflow_id?.toString() || '-'}</p>
                <p><strong>Run Number:</strong> {selectedWorkflowRun.run_number?.toString() || '-'}</p>
                <p><strong>Run Attempt:</strong> {selectedWorkflowRun.run_attempt?.toString() || '-'}</p>
                <p><strong>Path:</strong> {selectedWorkflowRun.path || '-'}</p>
                <p><strong>Event:</strong> {selectedWorkflowRun.event || '-'}</p>
              </div>
            </div>

            {/* Execution Details */}
            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Execution Details</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Head Branch:</strong> {selectedWorkflowRun.head_branch || '-'}</p>
                <p><strong>Head SHA:</strong> {selectedWorkflowRun.head_sha || '-'}</p>
                <p><strong>Status:</strong> <Badge size="small" color={selectedWorkflowRun.status === 'completed' ? 'success' : 'warning'}>{selectedWorkflowRun.status || '-'}</Badge></p>
                <p><strong>Conclusion:</strong> <Badge size="small" color={selectedWorkflowRun.conclusion === 'success' ? 'success' : selectedWorkflowRun.conclusion === 'failure' ? 'error' : 'warning'}>{selectedWorkflowRun.conclusion || '-'}</Badge></p>
                <p><strong>Run Started At:</strong> {selectedWorkflowRun.run_started_at ? new Date(selectedWorkflowRun.run_started_at).toLocaleString() : '-'}</p>
                <p><strong>Updated At:</strong> {selectedWorkflowRun.updated_at ? new Date(selectedWorkflowRun.updated_at).toLocaleString() : '-'}</p>
              </div>
            </div>

            {/* Timeline & Links */}
            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeline & Links</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Created At:</strong> {selectedWorkflowRun.created_at ? new Date(selectedWorkflowRun.created_at).toLocaleString() : '-'}</p>
                <p><strong>Run Started At:</strong> {selectedWorkflowRun.run_started_at ? new Date(selectedWorkflowRun.run_started_at).toLocaleString() : '-'}</p>
                <p><strong>URL:</strong> {selectedWorkflowRun.html_url ? <a href={selectedWorkflowRun.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View in GitHub</a> : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WorkflowRunsTable;
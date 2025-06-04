import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";
import { Select, message, Button, Spin, Space, Table, Input, Modal } from "antd";
import { CopyOutlined, DownloadOutlined, WarningOutlined } from "@ant-design/icons";
import Badge from "../../components/ui/badge/Badge";

const { Search } = Input;
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

function PredictionHistory() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [runs, setRuns] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ciBuilds, setCiBuilds] = useState([]);
  const [currentRunId, setCurrentRunId] = useState(null);
  const { width } = useWindowSize();

  const API_URL = import.meta.env.VITE_APP_API_URL;
  const GHTORRENT_API_URL = import.meta.env.VITE_GHTORRENT_API_URL;

  // Fetch repositories
  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      try {
        console.log(`Fetching repositories for user_id: ${user.id}`);
        const token = localStorage.getItem("token");
        const reposResponse = await axios.get(`${API_URL}/repos?user_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const reposData = reposResponse.data;
        console.log("Repositories fetched:", reposData);
        setRepos(reposData);
        if (reposData.length > 0) {
          setSelectedRepoId(reposData[0].id);
        }
      } catch (error) {
        console.error("Error in fetchRepos:", error);
        message.error(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRepos();
    } else {
      console.warn("User ID is not available");
    }
  }, [user?.id]);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepoId) {
        setBranches([]);
        setSelectedBranch(null);
        return;
      }

      setLoading(true);
      try {
        console.log(
          `Fetching branches for user_id: ${user.id}, repo_id: ${selectedRepoId}`
        );
        const token = localStorage.getItem("token");
        const branchesResponse = await axios.get(
          `${API_URL}/workflow_run/branches?user_id=${user.id}&repo_id=${selectedRepoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const branchesData = branchesResponse.data;
        console.log("Branches fetched:", branchesData);
        setBranches(branchesData);
        setSelectedBranch(branchesData.length > 0 ? branchesData[0] : null);
      } catch (error) {
        console.error("Error in fetchBranches:", error);
        message.error(error.response?.data?.error || error.message);
        setBranches([]);
        setSelectedBranch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [user?.id, selectedRepoId]);

  // Fetch workflow runs and predictions
  useEffect(() => {
    const fetchWorkflowRuns = async () => {
      if (!selectedRepoId || !selectedBranch) {
        setRuns([]);
        setPredictions({});
        return;
      }

      setMetricsLoading(true);
      try {
        const repo = repos.find((r) => r.id === selectedRepoId);
        if (!repo) throw new Error("Repository not found");
        const projectName = repo.full_name;

        const token = localStorage.getItem("token");
        const runsResponse = await axios.get(`${API_URL}/workflow_run/runs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            repo_id: selectedRepoId,
            branch: selectedBranch,
          },
        });
        const runsData = runsResponse.data.runs || [];
        console.log("Workflow runs fetched:", runsData);

        // Fetch predictions in batch
        if (runsData.length > 0) {
          const runIds = runsData.map(run => run.github_run_id).join(",");
          try {
            console.log(
              `Fetching batch predictions for run_ids=${runIds}, project_name=${projectName}, branch=${selectedBranch}`
            );
            const predictionResponse = await axios.get(
              `${API_URL}/prediction/batch?github_run_ids=${runIds}&project_name=${projectName}&branch=${selectedBranch}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("Batch prediction response:", predictionResponse.data);
            setPredictions(predictionResponse.data);

            // Only keep runs that have predictions
            const filteredRuns = runsData.filter(run => predictionResponse.data[run.github_run_id] !== undefined);
            setRuns(filteredRuns);
          } catch (error) {
            console.error("Error fetching batch predictions:", error.response?.data || error.message);
            setPredictions({});
            setRuns([]);
          }
        } else {
          setPredictions({});
          setRuns([]);
        }
      } catch (error) {
        console.error("Error in fetchWorkflowRuns:", error.response?.data || error.message);
        message.error(error.response?.data?.error || error.message);
        setRuns([]);
        setPredictions({});
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchWorkflowRuns();
  }, [repos, selectedRepoId, selectedBranch]);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Filter runs based on search text (only search by Head SHA since Event is removed)
  const filteredRuns = runs.filter((run) =>
    run.head_sha?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Function to fetch CI builds for a run
  const fetchCIBuilds = async (projectName, branch, runDate, githubRunId) => {
    try {
      const response = await axios.get(`${GHTORRENT_API_URL}/ci_builds_from_run`, {
        params: {
          project_name: projectName,
          branch: branch,
          run_date: runDate,
        },
      });

      const builds = response.data?.ci_builds || [];

      const cleanedData = {
        ci_builds: builds.map(build => {
          const { _id, ...rest } = build;
          return rest;
        }),
      };

      setCiBuilds(cleanedData);
      setCurrentRunId(githubRunId);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching CI builds:", error.response?.data || error.message);
      message.error("Failed to fetch CI builds. Please try again.");
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(ciBuilds, null, 2));
    message.success("Copied to clipboard!");
  };

  // Handle download
  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ciBuilds, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ci_builds.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    message.success("Downloaded as ci_builds.json!");
  };

  // Handle report to admin with confirmation
  const handleReport = () => {
    Modal.confirm({
      title: "Confirm Report",
      content: "Are you sure you want to report this CI build data to admin?",
      okText: "Yes",
      okType: "default",
      cancelText: "No",
      onOk() {
        message.success("Report sent to admin successfully!");
        // Thêm logic gửi báo cáo ở đây (ví dụ: gọi API)
      },
      onCancel() {
        message.info("Report cancelled.");
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: "Actor",
      dataIndex: "actor",
      key: "actor",
      width: 150,
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
              className="text-blue-500 hover:underline whitespace-nowrap overflow-hidden max-w-[100px]"
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
      title: "Head SHA",
      dataIndex: "head_sha",
      key: "head_sha",
      width: 100,
      render: (text) => (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-full block" style={{ maxWidth: "100px" }}>
          {text?.substring(0, 7) || "-"}
        </span>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 150,
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
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
      title: "URL",
      dataIndex: "html_url",
      key: "html_url",
      width: 120,
      render: (url) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
          title={url}
        >
          View on GitHub
        </a>
      ),
    },
    {
      title: "Prediction Time",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 150,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      render: (timestamp) => (
        <span
          className="overflow-hidden max-w-[150px] whitespace-nowrap text-ellipsis"
          title={timestamp ? new Date(timestamp).toLocaleString() : "-"}
        >
          {timestamp ? new Date(timestamp).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      title: "Model Name",
      dataIndex: "model_name",
      key: "model_name",
      width: 120,
      render: (text) => (
        <span
          className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"
          title={text}
        >
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Model Version",
      dataIndex: "model_version",
      key: "model_version",
      width: 100,
      render: (text) => (
        <span
          className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]"
          title={text}
        >
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Execution Time (s)",
      dataIndex: "execution_time",
      key: "execution_time",
      width: 100,
      render: (time) => (time ? time.toFixed(3) : "-"),
    },
    // {
    //   title: "Probability",
    //   dataIndex: "probability",
    //   key: "probability",
    //   width: 100,
    //   render: (prob) => (prob ? prob.toFixed(4) : "-"),
    // },
    // {
    //   title: "Threshold",
    //   dataIndex: "threshold",
    //   key: "threshold",
    //   width: 100,
    //   render: (threshold) => (threshold ? threshold.toFixed(4) : "-"),
    // },
    {
      title: "Conclusion",
      dataIndex: "conclusion",
      key: "conclusion",
      width: 120,
      fixed: "right",
      // filters: [
      //   { text: "success", value: "success" },
      //   { text: "failure", value: "failure" },
      //   { text: "neutral", value: "neutral" },
      //   { text: "cancelled", value: "cancelled" },
      //   { text: "skipped", value: "skipped" },
      //   { text: "stale", value: "stale" },
      //   { text: "action_required", value: "action_required" },
      //   { text: "timed_out", value: "timed_out" },
      //   { text: "startup_failure", value: "startup_failure" },
      //   { text: "null", value: "" },
      // ],
      // onFilter: (value, record) => record.conclusion === value,
      render: (conclusion) => (
        <div style={{ textAlign: "center" }}>
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
      title: "Predicted",
      dataIndex: "predicted_result",
      key: "predicted_result",
      width: 150,
      fixed: "right",
      render: (text, record) => {
        const prediction = predictions[record.github_run_id];
        const displayText = text === true ? "failure" : text === false ? "success" : "N/A";
        const projectName = prediction?.project_name || record.project_name;
        const branch = prediction?.branch || selectedBranch;
        const runDate = record.run_started_at;

        return (
          <Space size="middle">
            <Badge
              size="small"
              color={
                displayText === "success"
                  ? "success"
                  : displayText === "failure"
                  ? "error"
                  : "warning"
              }
            >
              {displayText}
            </Badge>
            <Button
              type="text"
              style={{ color: "#1890ff" }}
              onClick={() => fetchCIBuilds(projectName, branch, runDate, record.github_run_id)}
            >
              View
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageMeta
        title="Prediction History"
        description="View the history of predictions made on your repositories."
      />
      <PageBreadcrumb
        pageTitle="Prediction History"
        description="View the history of predictions made on your repositories."
      />
      <div
        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6 max-w-full overflow-x-auto"
        style={{ width: "100%" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-sm mb-1 font-semibold text-gray-800 dark:text-gray-200">
              Repository
            </label>
            <Select
              className="w-full"
              placeholder="Select a repository"
              onChange={(value) => {
                console.log("Selected repo_id:", value);
                setSelectedRepoId(value);
              }}
              value={selectedRepoId}
              allowClear
            >
              {repos.length > 0 ? (
                repos.map((repo) => (
                  <Select.Option key={repo.id} value={repo.id}>
                    {repo.full_name}
                  </Select.Option>
                ))
              ) : (
                <Select.Option value={null} disabled>
                  No repositories available
                </Select.Option>
              )}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm mb-1 font-semibold text-gray-800 dark:text-gray-200">
              Branch
            </label>
            <Select
              className="w-full"
              placeholder="Select a branch"
              onChange={(value) => {
                console.log("Selected branch:", value);
                setSelectedBranch(value);
              }}
              value={selectedBranch}
              disabled={!selectedRepoId || branches.length === 0}
              allowClear
            >
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <Select.Option key={branch} value={branch}>
                    {branch}
                  </Select.Option>
                ))
              ) : (
                <Select.Option value={null} disabled>
                  No branches available
                </Select.Option>
              )}
            </Select>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] overflow-x-auto"
        style={{ maxWidth: "100%", width: "100%" }}
      >
        {metricsLoading ? (
          <div className="flex justify-center">
            <Spin />
          </div>
        ) : runs.length > 0 ? (
          <div>
            <div className="mb-4">
              <Search
                placeholder="Search by Head SHA"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: "35%", minWidth: "200px" }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={filteredRuns.map((run) => ({
                ...run,
                ...predictions[run.github_run_id], // Gộp toàn bộ dữ liệu prediction vào run
              }))}
              rowKey="id"
              loading={loading}
              bordered
              size="small"
              scroll={{ x: "max-content" }}
              style={{ minWidth: "100%" }}
            />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No workflow runs with predictions available for this repository and branch.
          </p>
        )}
      </div>

      <Modal
        title={
          <div className="flex justify-between items-center">
            <span>CI Build Details</span>
            <Space style={{ marginRight: "40px" }}>
              <Button icon={<CopyOutlined />} onClick={handleCopy}>
                Copy
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                Download
              </Button>
            </Space>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentRunId(null);
        }}
        footer={
          currentRunId && runs.length > 0 && ciBuilds.ci_builds?.length > 0 ? (
            <div style={{ textAlign: "right" }}>
              {(() => {
                const run = runs.find(r => r.github_run_id === currentRunId);
                const prediction = predictions[currentRunId];
                const predictedResult = prediction?.predicted_result === true ? "failure" : prediction?.predicted_result === false ? "success" : null;
                const actualResult = run?.conclusion;
                const isMismatch = predictedResult && actualResult && predictedResult !== actualResult;
                return isMismatch ? (
                  <Button
                    type="default"
                    style={{ color: "#ca8a04", borderColor: "#ca8a04" }}
                    icon={<WarningOutlined />}
                    onClick={handleReport}
                  >
                    Report to Admin
                  </Button>
                ) : null;
              })()}
            </div>
          ) : null
        }
        width={800}
        style={{ maxHeight: "80vh" }}
        styles={{ body: { maxHeight: "60vh", overflowY: "auto", padding: "16px" } }}
      >
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {ciBuilds.ci_builds && ciBuilds.ci_builds.length > 0
            ? JSON.stringify(ciBuilds, null, 2)
            : "No CI build data available."}
        </pre>
      </Modal>
    </>
  );
}

export default PredictionHistory;
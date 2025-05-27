import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";
import { Select, message, Button, Spin, Space } from "antd";
import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";

function PredictionMetric() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [ciBuilds, setCiBuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);

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

  // Fetch repository details
  useEffect(() => {
    const fetchRepoData = async () => {
      if (!selectedRepoId) {
        setRepoData(null);
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching repo data for repo_id: ${selectedRepoId}`);
        const token = localStorage.getItem("token");
        const repoResponse = await axios.get(`${API_URL}/repoData/${selectedRepoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const repoData = repoResponse.data;
        console.log("Repo data fetched:", repoData);
        setRepoData(repoData);
      } catch (error) {
        console.error("Error in fetchRepoData:", error);
        message.error(error.response?.data?.error || error.message);
        setRepoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [selectedRepoId]);

  // Fetch prediction metrics (ci_builds)
  useEffect(() => {
    const fetchCiBuilds = async () => {
      if (!repoData || !selectedBranch) {
        setCiBuilds([]);
        return;
      }

      setMetricsLoading(true);
      try {
        const projectName = repoData.full_name;
        const branch = selectedBranch;
        console.log(`Fetching CI builds for project_name: ${projectName}, branch: ${branch}`);
        const ciBuildsResponse = await axios.get(
          `${GHTORRENT_API_URL}/ci_builds?project_name=${projectName}&branch=${branch}`
        );
        const ciBuildsData = ciBuildsResponse.data.ci_builds || [];
        console.log("CI builds fetched:", ciBuildsData);

        // Loại bỏ trường _id từ mỗi object trong ci_builds
        const cleanedCiBuildsData = ciBuildsData.map(build => {
          const { _id, ...rest } = build;
          return rest;
        });

        console.log("CI builds after removing _id:", cleanedCiBuildsData);
        setCiBuilds(cleanedCiBuildsData);
      } catch (error) {
        console.error("Error in fetchCiBuilds:", error);
        message.error(error.response?.data?.error || error.message);
        setCiBuilds([]);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchCiBuilds();
  }, [repoData, selectedBranch]);

  // Handle copy to clipboard
  const handleCopy = () => {
    if (ciBuilds.length === 0) {
      message.warning("No CI builds data to copy.");
      return;
    }

    const jsonString = JSON.stringify({ ci_builds: ciBuilds }, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      message.success("JSON data copied to clipboard!");
    }).catch((error) => {
      console.error("Failed to copy JSON:", error);
      message.error("Failed to copy JSON data.");
    });
  };

  // Handle download JSON file
  const handleDownload = () => {
    if (ciBuilds.length === 0) {
      message.warning("No CI builds data to download.");
      return;
    }

    const exportData = { ci_builds: ciBuilds };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${repoData?.full_name.replace("/", "_")}_${selectedBranch}_ci_builds.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageMeta
        title="Prediction Metrics Overview"
        description="See the prediction metrics of your repositories."
      />
      <PageBreadcrumb
        pageTitle="Prediction Metrics"
        description="See the prediction metrics of your repositories."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
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

      {/* Main Content: Split into two columns (2/5 and 3/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Repository Information (2/5, Fit content height) */}
        <div className="lg:col-span-2 w-full rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          {/* <div className="lg:mb-4">
              <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">
                  Repository Information
              </h4>
              <p className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  The information of the selected repository is shown below:
              </p>
          </div> */}
          {loading ? (
            <div className="flex justify-center">
              <Spin />
            </div>
          ) : repoData ? (
            <div className="space-y-4">
              <div className="mb-6 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={repoData.owner.avatar_url}
                    alt={repoData.owner.login}
                    className="w-28 h-28 rounded-md"
                  />
                  <div>
                    <p className="text-md font-semibold text-gray-800 dark:text-white/90">
                      {repoData.owner.login}
                    </p>
                    <a
                      href={`${repoData.html_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Repository
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Full Name:
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {repoData.full_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm leading-normal text-gray-500 dark:text-gray-400">
                  Owner:
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {repoData.owner.login}
                </p>
              </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Language:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{repoData.language}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Default Branch:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{repoData.default_branch}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stars:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{repoData.stargazers_count}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Forks:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{repoData.forks_count}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Watchers:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{repoData.watchers_count}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open Issues:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{repoData.open_issues_count}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Pushed:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {new Date(repoData.pushed_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Visibility:</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {repoData.private ? "Private" : "Public"}
                  </p>
                </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No repository data available.
            </p>
          )}
        </div>

        {/* Right Side: Prediction Metrics (3/5, Scrollable JSON) */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <label className="mb-1 block text-md font-medium text-gray-700 dark:text-gray-300">
                Prediction Metrics
              </label>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                The newest prediction metrics are shown below.
              </p>
            </div>
            <Space>
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopy}
                size="small"
                className="text-gray-700 dark:text-gray-300"
                disabled={metricsLoading || ciBuilds.length === 0}
              >
                Copy
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                size="small"
                className="text-gray-700 dark:text-gray-300"
                disabled={metricsLoading || ciBuilds.length === 0}
              >
                Download
              </Button>
            </Space>
          </div>
          {metricsLoading ? (
            <div className="flex justify-center">
              <Spin />
            </div>
          ) : ciBuilds.length > 0 ? (
            <div className="max-h-[500px] overflow-y-hidden hover:overflow-y-auto">
              <pre className="text-sm text-gray-800 dark:text-white/90 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {JSON.stringify({ ci_builds: ciBuilds }, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No CI builds data available for this repository and branch.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default PredictionMetric;
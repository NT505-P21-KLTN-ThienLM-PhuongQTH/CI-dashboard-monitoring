import React, { useState, useEffect, useContext } from "react";
import { Select, message } from "antd";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CardMetrics from "../../components/Dashboard/CardMetrics";
import WeeklyBuildsChart from "../../components/Dashboard/WeeklyBuildsChart";
import PipelineFailurePredictionChart from "../../components/Dashboard/PipelineFailurePredictionChart";
import StatisticsChart from "../../components/Dashboard/StatisticsChart";
import WorkflowCard from "../../components/Dashboard/WorkflowCard";
import WorkflowRunsTable from "../../components/Dashboard/WorkflowRunsTable";

const { Option } = Select;

function Dashboard() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [pipelineStats, setPipelineStats] = useState({
    success_rate: 0,
    failed_builds: 0,
    average_run_time: 0,
    success_rate_change: 0,
    failed_builds_change: 0,
    last_failure: null,
    recent_failures: 0,
  });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

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

  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepoId) {
        setBranches([]);
        setSelectedBranch(null);
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({
          success_rate: 0,
          failed_builds: 0,
          average_run_time: 0,
          success_rate_change: 0,
          failed_builds_change: 0,
          last_failure: null,
          recent_failures: 0,
        });
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
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({
          success_rate: 0,
          failed_builds: 0,
          average_run_time: 0,
          success_rate_change: 0,
          failed_builds_change: 0,
          last_failure: null,
          recent_failures: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [user?.id, selectedRepoId]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!selectedRepoId || !selectedBranch) {
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({
          success_rate: 0,
          failed_builds: 0,
          average_run_time: 0,
          success_rate_change: 0,
          failed_builds_change: 0,
          last_failure: null,
          recent_failures: 0,
        });
        return;
      }

      setLoading(true);
      try {
        console.log(
          `Fetching workflows for user_id: ${user.id}, repo_id: ${selectedRepoId}, branch: ${selectedBranch}`
        );
        const token = localStorage.getItem("token");
        const workflowsResponse = await axios.get(
          `${API_URL}/workflow/with-runs?user_id=${user.id}&repo_id=${selectedRepoId}&branch=${selectedBranch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const workflowsData = workflowsResponse.data;
        console.log("Workflows fetched:", workflowsData);
        setWorkflows(workflowsData);
        setSelectedWorkflowId(workflowsData.length > 0 ? workflowsData[0].id : null);
      } catch (error) {
        console.error("Error in fetchWorkflows:", error);
        message.error(error.response?.data?.error || error.message);
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({
          success_rate: 0,
          failed_builds: 0,
          average_run_time: 0,
          success_rate_change: 0,
          failed_builds_change: 0,
          last_failure: null,
          recent_failures: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [user?.id, selectedRepoId, selectedBranch]);

  useEffect(() => {
    const fetchPipelineStats = async () => {
      if (!selectedWorkflowId) {
        setPipelineStats({
          success_rate: 0,
          failed_builds: 0,
          average_run_time: 0,
          success_rate_change: 0,
          failed_builds_change: 0,
          last_failure: null,
          recent_failures: 0,
        });
        return;
      }

      setLoading(true);
      try {
        console.log(
          `Fetching pipeline stats for user_id: ${user.id}, repo_id: ${selectedRepoId}, branch: ${selectedBranch}, workflow_id: ${selectedWorkflowId}`
        );
        const token = localStorage.getItem("token");
        const statsResponse = await axios.get(
          `${API_URL}/workflow_run/pipeline-stats?user_id=${user.id}&repo_id=${selectedRepoId}&branch=${selectedBranch}&workflow_id=${selectedWorkflowId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const statsData = statsResponse.data;
        console.log("Pipeline stats fetched:", statsData);
        setPipelineStats(statsData);
      } catch (error) {
        console.error("Error in fetchPipelineStats:", error);
        message.error(error.response?.data?.error || error.message);
        setPipelineStats({
          success_rate: 0,
          failed_builds: 0,
          average_run_time: 0,
          success_rate_change: 0,
          failed_builds_change: 0,
          last_failure: null,
          recent_failures: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineStats();
  }, [user?.id, selectedRepoId, selectedBranch, selectedWorkflowId]);

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="Overview of your CI/CD pipelines by repository, branch, and workflow"
      />
      <PageBreadcrumb
        pageTitle="Dashboard"
        description="Overview of your CI/CD pipelines by repository, branch, and workflow"
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
                  <Option key={repo.id} value={repo.id}>
                    {repo.full_name}
                  </Option>
                ))
              ) : (
                <Option value={null} disabled>
                  No repositories available
                </Option>
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
                  <Option key={branch} value={branch}>
                    {branch}
                  </Option>
                ))
              ) : (
                <Option value={null} disabled>
                  No branches available
                </Option>
              )}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm mb-1 font-semibold text-gray-800 dark:text-gray-200">
              Workflow
            </label>
            <Select
              className="w-full"
              placeholder="Select a workflow"
              onChange={(value) => {
                console.log("Selected workflow_id:", value);
                setSelectedWorkflowId(value);
              }}
              value={selectedWorkflowId}
              disabled={!selectedRepoId || !selectedBranch || workflows.length === 0}
              allowClear
            >
              {workflows.length > 0 ? (
                workflows.map((workflow) => (
                  <Option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </Option>
                ))
              ) : (
                <Option value={null} disabled>
                  No workflows available
                </Option>
              )}
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-800 dark:text-gray-200">Loading...</p>
      ) : selectedRepoId && selectedBranch && selectedWorkflowId ? (
        <div className="grid grid-cols-12">
          <div className="grid grid-cols-12 col-span-12 gap-4 md:gap-6 mb-6">
            <div className="col-span-12">
              <CardMetrics pipelineStats={pipelineStats} />
            </div>
          </div>
          <div className="grid grid-cols-1 col-span-12 xl:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="col-span-1">
              <PipelineFailurePredictionChart pipelineStats={pipelineStats} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <WeeklyBuildsChart
                userId={user?.id}
                repoId={selectedRepoId}
                branch={selectedBranch}
                workflowId={selectedWorkflowId}
              />
            </div>
          </div>
          <div className="grid grid-cols-12 col-span-12 gap-4 md:gap-6 mb-6">
            <div className="col-span-12 xl:col-span-4">
              <WorkflowCard workflowId={selectedWorkflowId} />
            </div>
            <div className="col-span-12 xl:col-span-8">
              <StatisticsChart />
            </div>
          </div>
          <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6 max-w-full overflow-x-auto">
            <WorkflowRunsTable workflowId={selectedWorkflowId} selectedBranch={selectedBranch} />
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200">
          Please select a repository, branch, and workflow to view pipeline data.
        </p>
      )}
    </>
  );
}

export default Dashboard;
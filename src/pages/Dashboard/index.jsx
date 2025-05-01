import React, { useState, useEffect, useContext } from "react";
import { Select, message } from "antd";
import { UserContext } from "../../contexts/UserContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CardMetrics from "../../components/Dashboard/CardMetrics";
import WeeklyBuildsChart from "../../components/Dashboard/WeeklyBuildsChart";
import PipelineFailurePredictionChart from "../../components/Dashboard/PipelineFailurePredictionChart";

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

  const themeStyles = {
    light: {
      background: '#ffffff',
      borderColor: '#e4e7ec',
      textColor: '#000',
      optionHoverBg: '#f2f4f7',
    },
    dark: {
      background: '#1a2231',
      borderColor: '#1d2939',
      textColor: '#d9d9d9',
      optionHoverBg: '#1d2939',
    },
  };

  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const theme = themeStyles[currentTheme];

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      try {
        console.log(`Fetching repositories for user_id: ${user.id}`);
        const reposResponse = await fetch(`http://localhost:5000/api/repos?user_id=${user.id}`);
        if (!reposResponse.ok) {
          const errorData = await reposResponse.json();
          throw new Error(errorData.error || 'Failed to fetch repositories');
        }
        const reposData = await reposResponse.json();
        console.log('Repositories fetched:', reposData);
        setRepos(reposData);
        if (reposData.length > 0) {
          setSelectedRepoId(reposData[0].id);
        }
      } catch (error) {
        console.error('Error in fetchRepos:', error);
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRepos();
    } else {
      console.warn('User ID is not available');
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepoId) {
        setBranches([]);
        setSelectedBranch(null);
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0, success_rate_change: 0, failed_builds_change: 0, last_failure: null, recent_failures: 0 });
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching branches for user_id: ${user.id}, repo_id: ${selectedRepoId}`);
        const branchesResponse = await fetch(
          `http://localhost:5000/api/branches?user_id=${user.id}&repo_id=${selectedRepoId}`
        );
        if (!branchesResponse.ok) {
          const errorData = await branchesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch branches');
        }
        const branchesData = await branchesResponse.json();
        console.log('Branches fetched:', branchesData);
        setBranches(branchesData);
        setSelectedBranch(branchesData.length > 0 ? branchesData[0] : null);
      } catch (error) {
        console.error('Error in fetchBranches:', error);
        message.error(error.message);
        setBranches([]);
        setSelectedBranch(null);
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0, success_rate_change: 0, failed_builds_change: 0, last_failure: null, recent_failures: 0 });
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
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0, success_rate_change: 0, failed_builds_change: 0, last_failure: null, recent_failures: 0 });
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching workflows for user_id: ${user.id}, repo_id: ${selectedRepoId}, branch: ${selectedBranch}`);
        const workflowsResponse = await fetch(
          `http://localhost:5000/api/workflows?user_id=${user.id}&repo_id=${selectedRepoId}&branch=${selectedBranch}`
        );
        if (!workflowsResponse.ok) {
          const errorData = await workflowsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch workflows');
        }
        const workflowsData = await workflowsResponse.json();
        console.log('Workflows fetched:', workflowsData);
        setWorkflows(workflowsData);
        setSelectedWorkflowId(workflowsData.length > 0 ? workflowsData[0].id : null);
      } catch (error) {
        console.error('Error in fetchWorkflows:', error);
        message.error(error.message);
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0, success_rate_change: 0, failed_builds_change: 0, last_failure: null, recent_failures: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [user?.id, selectedRepoId, selectedBranch]);

  useEffect(() => {
    const fetchPipelineStats = async () => {
      if (!selectedWorkflowId) {
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0, success_rate_change: 0, failed_builds_change: 0, last_failure: null, recent_failures: 0 });
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching pipeline stats for user_id: ${user.id}, repo_id: ${selectedRepoId}, branch: ${selectedBranch}, workflow_id: ${selectedWorkflowId}`);
        const statsResponse = await fetch(
          `http://localhost:5000/api/pipeline-stats?user_id=${user.id}&repo_id=${selectedRepoId}&branch=${selectedBranch}&workflow_id=${selectedWorkflowId}`
        );
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch pipeline stats');
        }
        const statsData = await statsResponse.json();
        console.log('Pipeline stats fetched:', statsData);
        setPipelineStats(statsData);
      } catch (error) {
        console.error('Error in fetchPipelineStats:', error);
        message.error(error.message);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0, success_rate_change: 0, failed_builds_change: 0, last_failure: null, recent_failures: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineStats();
  }, [user?.id, selectedRepoId, selectedBranch, selectedWorkflowId]);

  return (
    <>
      <style>
        {`
          .ant-select-dropdown {
            background-color: ${theme.background} !important;
            border-color: ${theme.borderColor} !important;
            color: ${theme.textColor} !important;
          }
          .ant-select-item-option {
            color: ${theme.textColor} !important;
          }
          .ant-select-item-option:hover {
            background-color: ${theme.optionHoverBg} !important;
          }
          .ant-select-item-option-selected {
            background-color: ${theme.optionHoverBg} !important;
            font-weight: bold;
          }
        `}
      </style>
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
                console.log('Selected repo_id:', value);
                setSelectedRepoId(value);
              }}
              value={selectedRepoId}
              allowClear
              dropdownStyle={{
                backgroundColor: theme.background,
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
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
                console.log('Selected branch:', value);
                setSelectedBranch(value);
              }}
              value={selectedBranch}
              disabled={!selectedRepoId || branches.length === 0}
              allowClear
              dropdownStyle={{
                backgroundColor: theme.background,
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
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
                console.log('Selected workflow_id:', value);
                setSelectedWorkflowId(value);
              }}
              value={selectedWorkflowId}
              disabled={!selectedRepoId || !selectedBranch || workflows.length === 0}
              allowClear
              dropdownStyle={{
                backgroundColor: theme.background,
                borderColor: theme.borderColor,
                color: theme.textColor,
              }}
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
        <>
          <div className="grid grid-cols-12 gap-4 md:gap-6 mb-6">
            <div className="col-span-12">
              <CardMetrics pipelineStats={pipelineStats} />
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
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
        </>
      ) : (
        <p className="text-gray-800 dark:text-gray-200">
          Please select a repository, branch, and workflow to view pipeline data.
        </p>
      )}
    </>
  );
}

export default Dashboard;
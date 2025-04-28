import React, { useState, useEffect, useContext } from "react";
import { Select, message, Card, Statistic, Row, Col } from "antd";
import PageHeader from "../../components/PageHeader";
import PipelineChart from "../../components/Charts/PipelineChart";
import PipelineStatsCards from "../../components/StatsCard/PipelineStatsCards";
import { UserContext } from "../../contexts/UserContext";

const { Option } = Select;

function Dashboard() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [workflowDetails, setWorkflowDetails] = useState(null);
  const [pipelineStats, setPipelineStats] = useState({
    success_rate: 0,
    failed_builds: 0,
    average_run_time: 0,
  });
  const [loading, setLoading] = useState(false);

  // Lấy danh sách repos khi component mount
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

  // Lấy danh sách nhánh khi chọn repository
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepoId) {
        setBranches([]);
        setSelectedBranch(null);
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setWorkflowDetails(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0 });
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
        setWorkflowDetails(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [user?.id, selectedRepoId]);

  // Lấy danh sách workflows khi chọn nhánh
  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!selectedRepoId || !selectedBranch) {
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setWorkflowDetails(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0 });
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
        setWorkflowDetails(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [user?.id, selectedRepoId, selectedBranch]);

  // Lấy thông tin chi tiết workflow và số liệu thống kê khi chọn workflow
  useEffect(() => {
    const fetchWorkflowDetailsAndStats = async () => {
      if (!selectedWorkflowId) {
        setWorkflowDetails(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0 });
        return;
      }

      setLoading(true);
      try {
        // Lấy thông tin chi tiết workflow
        console.log(`Fetching workflow details for workflow_id: ${selectedWorkflowId}`);
        const workflowDetailsResponse = await fetch(
          `http://localhost:5000/api/workflow-details/${selectedWorkflowId}`
        );
        if (!workflowDetailsResponse.ok) {
          const errorData = await workflowDetailsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch workflow details');
        }
        const workflowDetailsData = await workflowDetailsResponse.json();
        console.log('Workflow details fetched:', workflowDetailsData);
        setWorkflowDetails(workflowDetailsData);

        // Lấy số liệu thống kê
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
        console.error('Error in fetchWorkflowDetailsAndStats:', error);
        message.error(error.message);
        setWorkflowDetails(null);
        setPipelineStats({ success_rate: 0, failed_builds: 0, average_run_time: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowDetailsAndStats();
  }, [user?.id, selectedRepoId, selectedBranch, selectedWorkflowId]);

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your CI/CD pipelines by repository, branch, and workflow"
      />
      <div className="mb-6">
        {/* Thêm tiêu đề và đổ bóng cho dropdowns */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repository</label>
            <Select
              style={{ width: 500 }}
              placeholder="Select a repository"
              onChange={(value) => {
                console.log('Selected repo_id:', value);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <Select
              style={{ width: 200 }}
              placeholder="Select a branch"
              onChange={(value) => {
                console.log('Selected branch:', value);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workflow</label>
            <Select
              style={{ width: 200 }}
              placeholder="Select a workflow"
              onChange={(value) => {
                console.log('Selected workflow_id:', value);
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
        <p>Loading...</p>
      ) : selectedRepoId && selectedBranch && selectedWorkflowId ? (
        <>
          <PipelineStatsCards stats={pipelineStats} />

          {/* Card hiển thị thông tin chi tiết workflow */}
          {workflowDetails && (
            <Card title="Workflow Details" className="mb-6 shadow-md">
              <p><strong>Name:</strong> {workflowDetails.name}</p>
              <p><strong>GitHub Workflow ID:</strong> {workflowDetails.github_workflow_id}</p>
              <p><strong>Path:</strong> {workflowDetails.path}</p>
              <p><strong>State:</strong> {workflowDetails.state}</p>
              <p><strong>Created At:</strong> {new Date(workflowDetails.created_at).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(workflowDetails.updated_at).toLocaleString()}</p>
              <p>
                <strong>URL:</strong>{' '}
                <a href={workflowDetails.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {workflowDetails.html_url}
                </a>
              </p>
            </Card>
          )}

          {/* Biểu đồ pipeline */}
          <div className="mt-6">
            <PipelineChart
              selectedRepoId={selectedRepoId}
              selectedBranch={selectedBranch}
              selectedWorkflowId={selectedWorkflowId}
            />
          </div>
        </>
      ) : (
        <p>Please select a repository, branch, and workflow to view pipeline data.</p>
      )}
    </div>
  );
}

export default Dashboard;
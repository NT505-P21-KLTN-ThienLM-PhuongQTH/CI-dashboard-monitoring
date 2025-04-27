import React, { useState, useEffect, useContext } from "react";
import { Select, message } from "antd";
import PageHeader from "../../components/PageHeader";
import PipelineChart from "../../components/Charts/PipelineChart";
import { UserContext } from "../../contexts/UserContext";

const { Option } = Select;

function Dashboard() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
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
        // Chọn nhánh đầu tiên nếu có
        setSelectedBranch(branchesData.length > 0 ? branchesData[0] : null);
      } catch (error) {
        console.error('Error in fetchBranches:', error);
        message.error(error.message);
        setBranches([]);
        setSelectedBranch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [user?.id, selectedRepoId]);

  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your CI/CD pipelines by repository and branch"
      />
      <div className="mb-6 flex gap-4">
        <Select
          style={{ width: 300 }}
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
      {loading ? (
        <p>Loading...</p>
      ) : selectedRepoId && selectedBranch ? (
        <div className="mt-6">
          <PipelineChart selectedRepoId={selectedRepoId} selectedBranch={selectedBranch} />
        </div>
      ) : (
        <p>Please select a repository and branch to view pipeline data.</p>
      )}
    </div>
  );
}

export default Dashboard;
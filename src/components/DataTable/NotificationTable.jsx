import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, message, Row, Col, Drawer, Input } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import Badge from '../ui/badge/Badge';

const NotificationTable = () => {
  const { user } = useContext(UserContext);
  const [commits, setCommits] = useState([]);
  const [filteredCommits, setFilteredCommits] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedWorkflowRun, setSelectedWorkflowRun] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

  const fetchCommits = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/commits?user_id=${user.id}&page=${page}&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { commits: data, pagination: pag } = response.data;
      setCommits(data);
      applyFiltersAndSort(data, searchText);
      setPagination({
        current: pag.page,
        pageSize: pag.limit,
        total: pag.total
      });
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCommits();
    }
  }, [user?.id]);

  const fetchWorkflowRun = async (runId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/workflow_run/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedWorkflowRun(response.data);
      setIsDrawerOpen(true);

      if (response.data.repo_id) {
        const repoResponse = await axios.get(`${API_URL}/repodata/${response.data.repo_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRepoData(repoResponse.data);
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to fetch workflow run or repo details');
    }
  };

  const applyFiltersAndSort = (data, search) => {
    let filteredData = [...data];

    if (search) {
      filteredData = filteredData.filter(
        (commit) =>
          commit.author.login.toLowerCase().includes(search.toLowerCase()) ||
          commit.commit.message.toLowerCase().includes(search.toLowerCase()) ||
          commit.html_url.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredCommits(filteredData);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    applyFiltersAndSort(commits, value);
  };

  const showModal = (commit) => {
    setSelectedCommit(commit);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedCommit(null);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedWorkflowRun(null);
    setRepoData(null);
  };

  const handleTableChange = (pag) => {
    fetchCommits(pag.current, pag.pageSize);
  };

  const columns = [
    {
      title: 'Author',
      key: 'author',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <img
            src={record.author.avatar_url}
            alt={record.author.login}
            className="w-8 h-8 rounded-full"
          />
          <a
            href={record.author.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:underline"
          >
            {record.author.login}
          </a>
        </div>
      ),
    },
    {
      title: 'SHA',
      dataIndex: 'sha',
      key: 'sha',
      width: 100,
      render: (text) => (
        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-full block" style={{ maxWidth: '100px' }}>
          {text.substring(0, 7)}
        </span>
      ),
    },
    {
      title: 'Commit Date',
      key: 'commit_date',
      width: 200,
      render: (_, record) => (
        <span>
          {record.commit.author.date
            ? new Date(record.commit.author.date).toLocaleString()
            : '-'}
        </span>
      ),
    },
    {
      title: 'Message',
      dataIndex: ['commit', 'message'],
      key: 'message',
      ellipsis: true,
      width: 300,
      render: (text) => (
        <Badge
          size="small"
          color="primary"
          className="text-gray-700 dark:text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap w-full block"
          style={{ maxWidth: '200px' }}
        >
          {text}
        </Badge>
      ),
    },
    {
      title: 'Link',
      key: 'html_url',
      width: 150,
      render: (_, record) => (
        <a
          href={record.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          View in GitHub
        </a>
      ),
    },
    {
      title: 'Stats',
      key: 'stats',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <Badge size="small" color="info">
            Total: {record.stats.total ?? '-'}
          </Badge>
          <Badge size="small" color="success">
            +{record.stats.additions ?? '-'}
          </Badge>
          <Badge size="small" color="error">
            -{record.stats.deletions ?? '-'}
          </Badge>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          onClick={() => showModal(record)}
          style={{ color: '#1890ff' }}
        >
          View
        </Button>
      ),
    },
  ].filter((col) => !col.hidden);

  return (
    <div>
      <div className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Search by author, message, or URL..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchCommits(1, pagination.pageSize)}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={filteredCommits}
          rowKey="id"
          bordered
          loading={loading}
          scroll={{ x: 1200 }}
          size="small"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize })
          }}
          components={{
            header: {
              row: ({ children }) => <tr>{children}</tr>,
              cell: ({ children }) => (
                <th className="border-b text-start text-sm">{children}</th>
              ),
            },
            body: {
              row: ({ children }) => <tr>{children}</tr>,
              cell: ({ children }) => (
                <td className="text-start text-sm">{children}</td>
              ),
            },
          }}
          style={{
            minWidth: '100%',
          }}
        />
      </div>

      <Modal
        title="Commit Details"
        open={isDetailModalOpen}
        onCancel={handleModalClose}
        footer={
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => fetchWorkflowRun(selectedCommit.workflow_run_id)}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              View Pipeline
            </Button>
          </div>
        }
      >
        {selectedCommit && (
          <div className="space-y-4">
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCommit.author.avatar_url}
                  alt="Author Avatar"
                  className="w-12 h-12 rounded-full border"
                />
                <p className="text-md">
                  <strong>Author:</strong>{" "}
                  <a
                    href={selectedCommit.author.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-md"
                  >
                    {selectedCommit.author.login}
                  </a>
                </p>
              </div>
            </div>
            <p>
              <strong>SHA:</strong> {selectedCommit.sha || "-"}
            </p>
            <p>
              <strong>Message:</strong>{" "}
              <Badge
                size="small"
                color="primary"
              >
                {selectedCommit.commit.message || "-"}
              </Badge>
            </p>
            <div>
              <strong>Commit Author:</strong>
              <div className="ml-4">
                <p>
                  <strong>Name:</strong>{' '}
                  {selectedCommit.commit.author.name || '-'}
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  {selectedCommit.commit.author.email || '-'}
                </p>
                <p>
                  <strong>Commit Date:</strong>{' '}
                  {selectedCommit.commit.author.date
                    ? new Date(selectedCommit.commit.author.date).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>
            <div>
              <strong>URL:</strong>{' '}
              <a
                href={selectedCommit.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View in GitHub
              </a>
            </div>
          </div>
        )}
      </Modal>

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
        className='bg-white dark:bg-white/[0.03]'
      >
        {selectedWorkflowRun && (
          <div className="space-y-5">
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

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pipeline Overview</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p>
                  <strong>Name:</strong> {selectedWorkflowRun.name || '-'}
                </p>
                <p>
                  <strong>Display Title:</strong>{" "}
                  <Badge size="small" color="primary">
                    {selectedWorkflowRun.display_title || '-'}
                  </Badge>
                </p>
                <p>
                  <strong>GitHub Run ID:</strong>{' '}
                  {selectedWorkflowRun.github_run_id?.toString() || '-'}
                </p>
                <p>
                  <strong>GitHub Workflow ID:</strong>{' '}
                  {selectedWorkflowRun.github_workflow_id?.toString() || '-'}
                </p>
                <p>
                  <strong>Run Number:</strong>{' '}
                  {selectedWorkflowRun.run_number?.toString() || '-'}
                </p>
                <p>
                  <strong>Run Attempt:</strong>{' '}
                  {selectedWorkflowRun.run_attempt?.toString() || '-'}
                </p>
                <p>
                  <strong>Path:</strong> {selectedWorkflowRun.path || '-'}
                </p>
                <p>
                  <strong>Event:</strong> {selectedWorkflowRun.event || '-'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Execution Details</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p>
                  <strong>Head Branch:</strong>{' '}
                  {selectedWorkflowRun.head_branch || '-'}
                </p>
                <p>
                  <strong>Head SHA:</strong> {selectedWorkflowRun.head_sha || '-'}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge
                    size="small"
                    color={
                      selectedWorkflowRun.status === 'completed'
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {selectedWorkflowRun.status || '-'}
                  </Badge>
                </p>
                <p>
                  <strong>Conclusion:</strong>{' '}
                  <Badge
                    size="small"
                    color={
                      selectedWorkflowRun.conclusion === 'success'
                        ? 'success'
                        : selectedWorkflowRun.conclusion === 'failure'
                        ? 'error'
                        : 'warning'
                    }
                  >
                    {selectedWorkflowRun.conclusion || '-'}
                  </Badge>
                </p>
                <p>
                  <strong>Run Started At:</strong>{' '}
                  {selectedWorkflowRun.run_started_at
                    ? new Date(selectedWorkflowRun.run_started_at).toLocaleString()
                    : '-'}
                </p>
                <p>
                  <strong>Updated At:</strong>{' '}
                  {selectedWorkflowRun.updated_at
                    ? new Date(selectedWorkflowRun.updated_at).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeline & Links</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p>
                  <strong>Created At:</strong>{' '}
                  {selectedWorkflowRun.created_at
                    ? new Date(selectedWorkflowRun.created_at).toLocaleString()
                    : '-'}
                </p>
                <p>
                  <strong>Run Started At:</strong>{' '}
                  {selectedWorkflowRun.run_started_at
                    ? new Date(selectedWorkflowRun.run_started_at).toLocaleString()
                    : '-'}
                </p>
                <p>
                  <strong>URL:</strong>{' '}
                  {selectedWorkflowRun.html_url ? (
                    <a
                      href={selectedWorkflowRun.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View in GitHub
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>

            {repoData && (
              <div>
                <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repository Info</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                  <p>
                    <strong>Full Name:</strong> {repoData.full_name || '-'}
                  </p>
                  <p>
                    <strong>Name:</strong> {repoData.name || '-'}
                  </p>
                  <p>
                    <strong>URL:</strong>{' '}
                    {repoData.html_url ? (
                      <a
                        href={repoData.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Repository
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                  <p>
                    <strong>Private:</strong> {repoData.private ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default NotificationTable;
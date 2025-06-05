import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Input, message, Space, Select, Spin, Row, Col, Modal, Drawer } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, RedoOutlined } from '@ant-design/icons';
import { UserContext } from '../../contexts/UserContext';
import Badge from "../ui/badge/Badge";
import axios from 'axios';

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
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const RepositoryTable = () => {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRepo, setEditingRepo] = useState(null);
  const [selectedRepoData, setSelectedRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowSize();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let response;
      if (user.role === "admin") {
        response = await axios.get(`${API_URL}/repos/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(`${API_URL}/repos`, {
          params: { user_id: user.id },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const data = response.data;
      setRepos(data);
      applyFiltersAndSort(data, searchText, statusFilter);

      const failedRepos = data.filter(repo => repo.status === 'Failed');
      if (failedRepos.length > 0) {
        failedRepos.forEach(repo => {
          message.error(`Repository ${repo.full_name} failed to process. Please try again or check the server.`);
        });
      }
    } catch (error) {
      message.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchRepoData = async (repoId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/repodata/${repoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedRepoData(response.data);
      setIsDrawerOpen(true);
    } catch (error) {
      message.error(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchRepos();
    // eslint-disable-next-line
  }, [user.id]);

  const applyFiltersAndSort = (data, search, status) => {
    let filteredData = [...data];

    if (search) {
      filteredData = filteredData.filter(
        (repo) =>
          repo.full_name.toLowerCase().includes(search.toLowerCase()) ||
          repo.name.toLowerCase().includes(search.toLowerCase()) ||
          repo.html_url.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filteredData = filteredData.filter((repo) => repo.status === status);
    }

    setFilteredRepos(filteredData);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    applyFiltersAndSort(repos, value, statusFilter);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    applyFiltersAndSort(repos, searchText, value);
  };

  const showModal = (repo = null) => {
    setEditingRepo(repo);
    if (repo) {
      form.setFieldsValue({
        url: repo.html_url,
        token: '',
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDrawerOpen(false);
    setEditingRepo(null);
    setSelectedRepoData(null);
    form.resetFields();
  };

  const validateUrlAndToken = async (values) => {
    const urlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
    if (!urlRegex.test(values.url)) {
      throw new Error('Invalid GitHub URL. It must be in the format: https://github.com/owner/repo');
    }

    const tokenRegex = /^(github_pat_[A-Za-z0-9_]{70,}|ghp_[A-Za-z0-9]{36,})$/;
    if (!tokenRegex.test(values.token)) {
      throw new Error('Invalid GitHub Personal Access Token. It must start with "github_pat_" (≥70 chars) or "ghp_" (≥36 chars).');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      message.warning('A request is already in progress. Please wait.');
      return;
    }

    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      await validateUrlAndToken(values);

      setProcessing(true);
      setIsModalVisible(false);
      form.resetFields();
      setEditingRepo(null);

      const token = localStorage.getItem("token");
      if (editingRepo) {
        const response = await axios.put(
          `${API_URL}/repos/${editingRepo.id}`,
          {
            url: values.url,
            token: values.token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const updatedRepo = response.data;
        const updatedRepos = repos.map((repo) =>
          repo.id === editingRepo.id ? updatedRepo : repo
        );
        setRepos(updatedRepos);
        applyFiltersAndSort(updatedRepos, searchText, statusFilter);
        message.success('Repository updated successfully!');
      } else {
        const response = await axios.post(
          `${API_URL}/repos`,
          {
            user_id: user.id,
            url: values.url,
            token: values.token,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const newRepo = response.data;
        const updatedRepos = [...repos, newRepo];
        setRepos(updatedRepos);
        applyFiltersAndSort(updatedRepos, searchText, statusFilter);
        message.success('Repository added successfully! Please refresh to see the updated status.');
      }
    } catch (error) {
      message.error(error.response?.data?.error || error.message);
    } finally {
      setProcessing(false);
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (repo) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/repos/${repo.id}`,
        {
          url: repo.html_url,
          token: repo.token,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const updatedRepo = response.data;
      const updatedRepos = repos.map((r) => (r.id === repo.id ? updatedRepo : r));
      setRepos(updatedRepos);
      applyFiltersAndSort(updatedRepos, searchText, statusFilter);
      message.success('Repository retried successfully!');
    } catch (error) {
      message.error(error.response?.data?.error || error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this repository?',
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/repos/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const updatedRepos = repos.filter((repo) => repo.id !== id);
          setRepos(updatedRepos);
          applyFiltersAndSort(updatedRepos, searchText, statusFilter);
          message.success('Repository deleted successfully!');
        } catch (error) {
          message.error(error.response?.data?.error || error.message);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      ellipsis: true,
      width: 300,
      render: (text) => <span className="text-gray-700 text-start text-sm dark:text-gray-300">{text}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      hidden: width < 768,
      ellipsis: true,
      width: 200,
      render: (text) => <span className="text-gray-700 text-start text-sm dark:text-gray-300">{text}</span>,
    },
    {
      title: 'URL',
      dataIndex: 'html_url',
      key: 'html_url',
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer" className="text-gray-700 text-start text-sm dark:text-gray-300">
          {text}
        </a>
      ),
      ellipsis: true,
      width: 400,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div style={{ textAlign: 'center' }}>
          <Badge
            size="small"
            color={
              status === 'Success'
                ? 'success'
                : status === 'Pending'
                ? 'warning'
                : 'error'
            }
          >
            {status}
          </Badge>
        </div>
      ),
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ color: '#1890ff' }}
            disabled={record.status === 'Pending' || record.status === 'Failed'}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ color: '#ff4d4f' }}
            disabled={record.status === 'Pending'}
          />
          {record.status === 'Failed' && (
            <Button
              type="text"
              icon={<RedoOutlined />}
              onClick={() => handleRetry(record)}
              style={{ color: '#FAAD14' }}
            />
          )}
          <Button
            type="text"
            onClick={() => fetchRepoData(record.id)}
            style={{ color: '#1890ff' }}
          >
            View
          </Button>
        </Space>
      ),
      width: 250,
    },
  ].filter((col) => !col.hidden);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Search by name, full name, or URL..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={handleStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Success', label: 'Success' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Pending', label: 'Pending' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space wrap size="middle">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => showModal()}
                disabled={processing || isSubmitting}
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              >
                Add Repository
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRepos}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={24} lg={8} style={{ textAlign: 'right' }}>
            {processing && (
              <Spin tip="Processing repository... Please wait or refresh to see the status." />
            )}
          </Col>
        </Row>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={filteredRepos}
          rowKey="id"
          bordered
          loading={loading}
          scroll={{ x: 1200 }}
          size="small"
          components={{
            header: {
              row: ({ children }) => <tr>{children}</tr>,
              cell: ({ children }) => (
                <th className="border-b text-start text-sm">
                  {children}
                </th>
              ),
            },
            body: {
              row: ({ children }) => <tr>{children}</tr>,
              cell: ({ children }) => (
                <td className="text-start text-sm">
                  {children}
                </td>
              ),
            },
          }}
          style={{
            minWidth: '100%',
          }}
        />
      </div>

      <Modal
        title={editingRepo ? 'Edit Repository' : 'Add Repository'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingRepo ? 'Update' : 'Add'}
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: '#1890ff', borderColor: '#1890ff' }, disabled: isSubmitting }}
        width={Math.min(window.innerWidth * 0.9, 520)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter the repository URL!' }]}
          >
            <Input placeholder="https://github.com/user/repo" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="token"
            label="Token PAT"
            rules={[{ required: true, message: 'Please enter the Token PAT!' }]}
          >
            <Input.Password placeholder="github_pat_xxxxxxxxxxxxxxxx" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Repository Details"
        placement="right"
        onClose={handleCancel}
        open={isDrawerOpen}
        width={Math.min(window.innerWidth * 0.9, 550)}
        zIndex={10000}
        footer={
          <div className="flex justify-end">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Close
            </Button>
          </div>
        }
        className="bg-white dark:bg-white/[0.03]"
      >
        {selectedRepoData && (
          <div className="space-y-5">
            {selectedRepoData.owner && (
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedRepoData.owner.avatar_url}
                    alt={selectedRepoData.owner.login}
                    className="w-28 h-28 rounded-md"
                  />
                  <div>
                    <p className="text-lg font-semibold">
                      Owner: {selectedRepoData.owner.login}
                    </p>
                    <a
                      href={selectedRepoData.owner.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Repository
                    </a>
                  </div>
                </div>
              </div>
            )}

            <hr className="block text-sm font-sm text-gray-200 dark:text-gray-800" />

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repository Overview</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Name:</strong> {selectedRepoData.name || "-"}</p>
                <p><strong>Full Name:</strong> {selectedRepoData.full_name || "-"}</p>
                <p><strong>Default Branch:</strong> {selectedRepoData.default_branch || "-"}</p>
                <p><strong>Language:</strong> {selectedRepoData.language || "-"}</p>
                <p><strong>GitHub Repo ID:</strong> {selectedRepoData.github_repo_id || "-"}</p>
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Info</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Private:</strong> {selectedRepoData.private ? "Yes" : "No"}</p>
                <div>
                <strong>Permissions:</strong>
                {selectedRepoData.permissions ? (
                  <div className="ml-4">
                    <p><strong>Admin:</strong> {selectedRepoData.permissions.admin ? "Yes" : "No"}</p>
                    <p><strong>Push:</strong> {selectedRepoData.permissions.push ? "Yes" : "No"}</p>
                    <p><strong>Pull:</strong> {selectedRepoData.permissions.pull ? "Yes" : "No"}</p>
                  </div>
                ) : " -"}
              </div>
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeline & Links</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Created At:</strong> {selectedRepoData.created_at ? new Date(selectedRepoData.created_at).toLocaleString() : "-"}</p>
                <p><strong>Updated At:</strong> {selectedRepoData.updated_at ? new Date(selectedRepoData.updated_at).toLocaleString() : "-"}</p>
                <p><strong>Pushed At:</strong> {selectedRepoData.pushed_at ? new Date(selectedRepoData.pushed_at).toLocaleString() : "-"}</p>
                <p><strong>URL:</strong> {selectedRepoData.html_url ? <a href={selectedRepoData.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View in GitHub</a> : '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repository Stats</h3>
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Stargazers Count:</strong> {selectedRepoData.stargazers_count ?? "-"}</p>
                <p><strong>Forks Count:</strong> {selectedRepoData.forks_count ?? "-"}</p>
                <p><strong>Watchers Count:</strong> {selectedRepoData.watchers_count ?? "-"}</p>
                <p><strong>Open Issues Count:</strong> {selectedRepoData.open_issues_count ?? "-"}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RepositoryTable;

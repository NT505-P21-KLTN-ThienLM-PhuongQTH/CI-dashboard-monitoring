import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Select, Spin, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, RedoOutlined } from '@ant-design/icons';
import { UserContext } from '../../contexts/UserContext';
import Badge from "../ui/badge/Badge";

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
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowSize();

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/repos?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data);
      applyFiltersAndSort(data, searchText, statusFilter);

      const failedRepos = data.filter(repo => repo.status === 'Failed');
      if (failedRepos.length > 0) {
        failedRepos.forEach(repo => {
          message.error(`Repository ${repo.full_name} failed to process. Please try again or check the server.`);
        });
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
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
    setEditingRepo(null);
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

      if (editingRepo) {
        const response = await fetch(`http://localhost:5000/api/repos/${editingRepo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: values.url,
            token: values.token,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update repository');
        }

        const updatedRepo = await response.json();
        const updatedRepos = repos.map((repo) =>
          repo.id === editingRepo.id ? updatedRepo : repo
        );
        setRepos(updatedRepos);
        applyFiltersAndSort(updatedRepos, searchText, statusFilter);
        message.success('Repository updated successfully!');
      } else {
        const response = await fetch('http://localhost:5000/api/repos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            url: values.url,
            token: values.token,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add repository');
        }

        const newRepo = await response.json();
        const updatedRepos = [...repos, newRepo];
        setRepos(updatedRepos);
        applyFiltersAndSort(updatedRepos, searchText, statusFilter);
        message.success('Repository added successfully! Please refresh to see the updated status.');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setProcessing(false);
      setIsSubmitting(false);
    }
  };

  const handleRetry = async (repo) => {
    try {
      setProcessing(true);
      const response = await fetch(`http://localhost:5000/api/repos/${repo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: repo.html_url,
          token: repo.token,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry repository');
        }

        const updatedRepo = await response.json();
        const updatedRepos = repos.map((r) => (r.id === repo.id ? updatedRepo : r));
        setRepos(updatedRepos);
        applyFiltersAndSort(updatedRepos, searchText, statusFilter);
        message.success('Repository retried successfully!');
      } catch (error) {
        message.error(error.message);
      } finally {
        setProcessing(false);
      }
    };

    const handleDelete = (id) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this repository?',
        onOk: async () => {
          try {
            const response = await fetch(`http://localhost:5000/api/repos/${id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              throw new Error('Failed to delete repository');
            }

            const updatedRepos = repos.filter((repo) => repo.id !== id);
            setRepos(updatedRepos);
            applyFiltersAndSort(updatedRepos, searchText, statusFilter);
            message.success('Repository deleted successfully!');
          } catch (error) {
            message.error(error.message);
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
              size="small" // Sử dụng size="small" thay vì "sm" vì Ant Design không có size "sm"
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
          </Space>
        ),
        width: 150,
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
      </div>
    );
};

export default RepositoryTable;
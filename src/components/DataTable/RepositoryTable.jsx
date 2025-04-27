import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Select, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, RedoOutlined } from '@ant-design/icons';
import { UserContext } from '../../contexts/UserContext';

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

    const tokenRegex = /^github_pat_[A-Za-z0-9_]{70,}$/;
    if (!tokenRegex.test(values.token)) {
      throw new Error('Invalid GitHub Personal Access Token. It must start with "github_pat_" and be at least 70 characters long.');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      message.warning('A request is already in progress. Please wait.');
      return;
    }

    try {
      setIsSubmitting(true); // Vô hiệu hóa submit
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
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'URL',
      dataIndex: 'html_url',
      key: 'html_url',
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color;
        if (status === 'Success') color = '#52C41A';
        else if (status === 'Failed') color = '#F5222D';
        else if (status === 'Pending') color = '#FAAD14';
        return <span style={{ color }}>{status}</span>;
      },
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
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Input.Search
            placeholder="Search by name, full name, or URL..."
            style={{ width: 300, marginRight: 8 }}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: 150, marginRight: 8 }}
            value={statusFilter}
            onChange={handleStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Success', label: 'Success' },
              { value: 'Failed', label: 'Failed' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal()}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', marginRight: 8 }}
            disabled={processing || isSubmitting}
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
        </div>
        {processing && (
          <Spin tip="Processing repository... Please wait or refresh to see the status." />
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filteredRepos}
        rowKey="id"
        bordered
        loading={loading}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      />

      <Modal
        title={editingRepo ? 'Edit Repository' : 'Add Repository'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingRepo ? 'Update' : 'Add'}
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: '#1890ff', borderColor: '#1890ff' }, disabled: isSubmitting }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter the repository URL!' }]}
          >
            <Input placeholder="https://github.com/user/repo" />
          </Form.Item>
          <Form.Item
            name="token"
            label="Token PAT"
            rules={[{ required: true, message: 'Please enter the Token PAT!' }]}
          >
            <Input.Password placeholder="github_pat_xxxxxxxxxxxxxxxx" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepositoryTable;
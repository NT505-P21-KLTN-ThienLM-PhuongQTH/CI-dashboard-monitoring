import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Space, Modal, message, Input } from 'antd';
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import Badge from "../ui/badge/Badge";

const ReportTable = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]); // Dữ liệu sau khi lọc
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState(''); // Trạng thái tìm kiếm
    const [modalVisible, setModalVisible] = useState(false); // Trạng thái hiển thị Modal
    const [modalConfig, setModalConfig] = useState({ // Cấu hình Modal
        action: null,
        reportId: null,
        title: '',
        content: '',
    });

    const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/report/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const reportsData = response.data;

            const updatedReports = await Promise.all(reportsData.map(async (report) => {
                console.log(`Fetching prediction for id: ${report.prediction_id}`);
                try {
                    const predictionResponse = await axios.get(`${API_URL}/prediction/results/${report.prediction_id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    return {
                        ...report,
                        predicted_result: predictionResponse.data.predicted_result,
                        actual_result: predictionResponse.data.actual_result,
                    };
                } catch (error) {
                    console.error(`Error fetching prediction for id ${report.prediction_id}:`, error);
                    message.error(error.message);
                    return {
                        ...report,
                        predicted_result: null,
                        actual_result: null,
                    };
                }
            }));

            setReports(updatedReports);
            setFilteredReports(updatedReports);
            console.log('Reports with predictions fetched:', updatedReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [API_URL]);

    const handleRefresh = () => {
        fetchReports();
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        if (!value) {
            setFilteredReports(reports); // Nếu không có từ khóa, hiển thị toàn bộ
            return;
        }

        const lowercasedValue = value.toLowerCase();
        const filtered = reports.filter(report =>
            (report.github_run_id?.toString().toLowerCase().includes(lowercasedValue) ||
            report.project_name?.toLowerCase().includes(lowercasedValue) ||
            report.branch?.toLowerCase().includes(lowercasedValue) ||
            report.reported_by?.toLowerCase().includes(lowercasedValue))
        );
        setFilteredReports(filtered);
    };

    // Delete a report
    const handleDelete = async (reportId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedReports = reports.filter(report => report.id !== reportId);
            setReports(updatedReports);
            setFilteredReports(updatedReports.filter(report =>
                (report.github_run_id?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
                report.project_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                report.branch?.toLowerCase().includes(searchText.toLowerCase()) ||
                report.reported_by?.toLowerCase().includes(searchText.toLowerCase()))
            ));
            message.success('Report deleted successfully');
        } catch (error) {
            console.error('Error deleting report:', error);
            message.error(error.message);
        }
    };

    // Handle admin action (Approve/Reject)
    const handleAction = async (reportId, action) => {
        try {
            const token = localStorage.getItem('token');
            const adminEmail = localStorage.getItem('admin_email') || 'admin@example.com';
            await axios.post(`${API_URL}/report/${reportId}/action`, {
                action,
                admin_email: adminEmail,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedReports = reports.map(report =>
                report.id === reportId ? { ...report, status: action === 'approve' ? 'approved' : 'rejected' } : report
            );
            setReports(updatedReports);
            setFilteredReports(updatedReports.filter(report =>
                (report.github_run_id?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
                report.project_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                report.branch?.toLowerCase().includes(searchText.toLowerCase()) ||
                report.reported_by?.toLowerCase().includes(searchText.toLowerCase()))
            ));
            message.success(`Report ${action}ed successfully`);
        } catch (error) {
            console.error('Error handling action:', error);
            message.error(error.message);
        }
    };

    // Show Modal for confirmation
    const showConfirmModal = (action, reportId) => {
        let title, content;
        switch (action) {
            case 'approve':
                title = 'Confirm Approval';
                content = 'Are you sure you want to approve this report?';
                break;
            case 'reject':
                title = 'Confirm Rejection';
                content = 'Are you sure you want to reject this report?';
                break;
            case 'delete':
                // Không cần xử lý delete ở đây nữa, sẽ dùng Modal.confirm trực tiếp
                return;
            default:
                return;
        }
        setModalConfig({ action, reportId, title, content });
        setModalVisible(true);
    };

    // Handle Modal confirmation
    const handleModalConfirm = () => {
        const { action, reportId } = modalConfig;
        if (action === 'delete') {
            // Không xử lý delete ở đây nữa
            return;
        } else {
            handleAction(reportId, action);
        }
        setModalVisible(false);
    };

    // Handle Modal cancellation
    const handleModalCancel = () => {
        setModalVisible(false);
        // message.info(`${modalConfig.action.charAt(0).toUpperCase() + modalConfig.action.slice(1)} canceled`);
    };

    // Table columns
    const columns = [
        {
            title: 'Workflow Run ID',
            dataIndex: 'github_run_id',
            key: 'github_run_id',
            width: 150,
            render: (text, record) => (
                <a
                    href={`https://github.com/${record.project_name}/actions/runs/${text}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{
                        display: 'inline-block',
                        maxWidth: 150,
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    title={text}
                >
                    {text || '-'}
                </a>
            ),
        },
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            width: 200,
            render: (text) => (
                <span
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{
                        display: 'inline-block',
                        maxWidth: 200,
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    title={text}
                >
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            width: 120,
            render: (text) => (
                <span
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{
                        display: 'inline-block',
                        maxWidth: 150,
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    title={text}
                >
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Reported By',
            dataIndex: 'reported_by',
            key: 'reported_by',
            width: 150,
            render: (text) => (
                <span
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{
                        display: 'inline-block',
                        maxWidth: 150,
                        verticalAlign: 'bottom',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    title={text}
                >
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Predicted Result',
            dataIndex: 'predicted_result',
            key: 'predicted_result',
            width: 120,
            render: (text) => {
                const displayText = text === true ? 'failure' : text === false ? 'success' : '-';
                return (
                    <div style={{ textAlign: 'center' }}>
                        <Badge
                            size="small"
                            color={
                                displayText === 'success' ? 'success' :
                                displayText === 'failure' ? 'error' :
                                'warning'
                            }
                        >
                            {displayText || '-'}
                        </Badge>
                    </div>
                );
            },
        },
        {
            title: 'Actual Result',
            dataIndex: 'actual_result',
            key: 'actual_result',
            width: 120,
            render: (text) => {
                const displayText = text === true ? 'failure' : text === false ? 'success' : '-';
                return (
                    <div style={{ textAlign: 'center' }}>
                        <Badge
                            size="small"
                            color={
                                displayText === 'success' ? 'success' :
                                displayText === 'failure' ? 'error' :
                                'warning'
                            }
                        >
                            {displayText || '-'}
                        </Badge>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            filters: [
                { text: 'pending', value: 'pending' },
                { text: 'approved', value: 'approved' },
                { text: 'rejected', value: 'rejected' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <div style={{ textAlign: 'center' }}>
                    <Badge
                        size="small"
                        color={
                            status === 'approved' ? 'success' :
                            status === 'rejected' ? 'error' :
                            'warning'
                        }
                    >
                        {status || '-'}
                    </Badge>
                </div>
            ),
        },
        {
            title: 'Reported At',
            dataIndex: 'reported_at',
            key: 'reported_at',
            width: 200,
            sorter: (a, b) => new Date(a.reported_at) - new Date(b.reported_at),
            render: (date) => {
                const displayDate = date ? new Date(date).toLocaleString() : '-';
                return (
                    <span
                        className="whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                            display: 'inline-block',
                            maxWidth: 200,
                            verticalAlign: 'bottom',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                        title={displayDate}
                    >
                        {displayDate}
                    </span>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                style={{ backgroundColor: '#27AE60', borderColor: '#27AE60', color: '#fff' }}
                                onClick={() => showConfirmModal('approve', record.id)}
                            >
                                Approve
                            </Button>
                            <Button
                                type="primary"
                                icon={<CloseCircleOutlined />}
                                style={{ backgroundColor: '#E74C3C', borderColor: '#E74C3C', color: '#fff' }}
                                onClick={() => showConfirmModal('reject', record.id)}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#FF4D4F' }} />}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Are you sure you want to delete this report?',
                                onOk: async () => {
                                    await handleDelete(record.id);
                                },
                                onCancel() {
                                    // message.info('Deletion canceled');
                                },
                            });
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                <Input.Search
                    placeholder="Search by Workflow Run ID, Project Name, Branch, or Reported By"
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: '37%', minWidth: '200px' }}
                    allowClear
                />
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                >
                    Refresh
                </Button>
            </div>
            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={filteredReports}
                    rowKey="id"
                    loading={loading}
                    bordered
                    scroll={{ x: 1200 }}
                    size="small"
                    style={{
                        minWidth: '100%',
                    }}
                />
            </div>
            <Modal
                title={modalConfig.title}
                open={modalVisible}
                onOk={handleModalConfirm}
                onCancel={handleModalCancel}
                okText="Yes"
                cancelText="No"
            >
                <p>{modalConfig.content}</p>
            </Modal>
        </div>
    );
};

export default ReportTable;
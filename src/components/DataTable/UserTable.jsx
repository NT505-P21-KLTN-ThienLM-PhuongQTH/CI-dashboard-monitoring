import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message, Space, Select, Spin, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { UserContext } from "../../contexts/UserContext";
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
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const UserTable = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowSize();

  // Lấy danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, [user.id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/userdata/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      applyFiltersAndSort(response.data, searchText, roleFilter);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (data, search, role) => {
    let filteredData = [...data];

    if (search) {
      filteredData = filteredData.filter(
        (user) =>
          user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role !== "all") {
      filteredData = filteredData.filter((user) => user.role === role);
    }

    setFilteredUsers(filteredData);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    applyFiltersAndSort(users, value, roleFilter);
  };

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
    applyFiltersAndSort(users, searchText, value);
  };

  const showModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        phone: user.phone,
        github_account: user.github_account,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const openDetailModal = (user) => {
    setEditingUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsDetailModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      message.warning("A request is already in progress. Please wait.");
      return;
    }

    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const token = localStorage.getItem("token");
      if (editingUser) {
        await axios.put(`http://localhost:5000/api/userdata/${editingUser.user_id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("User updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/userdata", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("User added successfully!");
      }
      fetchUsers();
      handleCancel();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (userId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:5000/api/userdata/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(users.filter((user) => user.user_id !== userId));
          applyFiltersAndSort(users.filter((user) => user.user_id !== userId), searchText, roleFilter);
          message.success("User deleted successfully!");
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error("Failed to delete user");
        }
      },
    });
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      ellipsis: true,
      width: 200,
      render: (text) => <span className="text-gray-700 text-start text-sm dark:text-gray-300">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      ellipsis: true,
      width: 250,
      render: (text) => <span className="text-gray-700 text-start text-sm dark:text-gray-300">{text}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Badge size="small" color={role === "admin" ? "success" : "primary"}>
          {role}
        </Badge>
      ),
      width: 120,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ellipsis: true,
      width: 150,
      render: (text) => <span className="text-gray-700 text-start text-sm dark:text-gray-300">{text || "-"}</span>,
    },
    {
      title: "GitHub",
      dataIndex: "github_account",
      key: "github_account",
      ellipsis: true,
      width: 200,
      render: (text) => <span className="text-gray-700 text-start text-sm dark:text-gray-300">{text || "-"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ color: "#1890ff" }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.user_id)}
            style={{ color: "#ff4d4f" }}
          />
          <Button
            type="text"
            onClick={() => openDetailModal(record)}
            style={{ color: "#1890ff" }}
          >
            View
          </Button>
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
              placeholder="Search by name or email..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Select
              style={{ width: "100%" }}
              value={roleFilter}
              onChange={handleRoleFilter}
              options={[
                { value: "all", label: "All Roles" },
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space wrap size="middle">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => showModal()}
                disabled={isSubmitting}
                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
              >
                Add User
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="user_id"
          bordered
          loading={loading}
          scroll={{ x: 1200 }}
          size="small"
          components={{
            header: {
              row: ({ children }) => <tr>{children}</tr>,
              cell: ({ children }) => <th className="border-b text-start text-sm">{children}</th>,
            },
            body: {
              row: ({ children }) => <tr>{children}</tr>,
              cell: ({ children }) => <td className="text-start text-sm">{children}</td>,
            },
          }}
          style={{ minWidth: "100%" }}
        />
      </div>

      {/* Modal thêm/sửa người dùng */}
      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingUser ? "Update" : "Add"}
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "#1890ff", borderColor: "#1890ff" }, disabled: isSubmitting }}
        width={Math.min(window.innerWidth * 0.9, 520)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name!" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item name="github_account" label="GitHub Account">
            <Input placeholder="Enter GitHub username" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        title="User Details"
        open={isDetailModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={Math.min(window.innerWidth * 0.9, 520)}
      >
        {editingUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <p>
                <strong>User ID:</strong> {editingUser.user_id}
              </p>
              <p>
                <strong>Full Name:</strong> {editingUser.fullname || "-"}
              </p>
              <p>
                <strong>Email:</strong> {editingUser.email || "-"}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                <Badge size="small" color={editingUser.role === "admin" ? "success" : "primary"}>
                  {editingUser.role || "-"}
                </Badge>
              </p>
              <p>
                <strong>Phone:</strong> {editingUser.phone || "-"}
              </p>
              <p>
                <strong>Pronouns:</strong> {editingUser.pronouns || "-"}
              </p>
              <p>
                <strong>Bio:</strong> {editingUser.bio || "-"}
              </p>
              <p>
                <strong>GitHub:</strong> {editingUser.github_account || "-"}
              </p>
              <div>
                <strong>Address:</strong>
                {editingUser.address ? (
                  <div className="ml-4">
                    <p>
                      <strong>Country:</strong> {editingUser.address.country || "-"}
                    </p>
                    <p>
                      <strong>City/State:</strong> {editingUser.address.cityState || "-"}
                    </p>
                    <p>
                      <strong>Postal Code:</strong> {editingUser.address.postalCode || "-"}
                    </p>
                  </div>
                ) : (
                  " -"
                )}
              </div>
              <p>
                <strong>Avatar:</strong>{" "}
                {editingUser.avatar ? (
                  <a href={editingUser.avatar} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View Avatar
                  </a>
                ) : (
                  "-"
                )}
              </p>
              {/* <p>
                <strong>Avatar:</strong>{" "}
                {editingUser.avatar ? (
                  <img src={editingUser.avatar} alt="Avatar" className="w-16 h-16 object-cover rounded" />
                ) : (
                  "-"
                )}
              </p> */}
              <p>
                <strong>Created At:</strong>{" "}
                {editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleString() : "-"}
              </p>
              <p>
                <strong>Updated At:</strong>{" "}
                {editingUser.updatedAt ? new Date(editingUser.updatedAt).toLocaleString() : "-"}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserTable;
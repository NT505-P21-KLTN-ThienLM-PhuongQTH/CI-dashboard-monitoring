import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Input, message, Space, Select, Row, Col, Drawer } from "antd";
import { EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { UserContext } from "../../contexts/UserContext";
import Badge from "../ui/badge/Badge";

const UserTable = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState({ personal: false, address: false, add: false });
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isPasswordStrong = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  // Fetch user list
  useEffect(() => {
    fetchUsers();
  }, [user.id]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/userdata/all`, {
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

  const showModal = (type, user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(
        type === "personal"
          ? {
              fullname: user.fullname,
              email: user.email,
              role: user.role,
              phone: user.phone,
              pronouns: user.pronouns,
              bio: user.bio,
              github_account: user.github_account,
            }
          : type === "add"
          ? {
              name: user.fullname,
              email: user.email,
              password: "",
              role: user.role,
            }
          : {
              country: user.address?.country || "",
              cityState: user.address?.cityState || "",
              postalCode: user.address?.postalCode || "",
            }
      );
    } else {
      form.resetFields();
    }
    setIsModalVisible((prev) => ({ ...prev, [type]: true }));
  };

  const handleCancel = (type) => {
    setIsModalVisible((prev) => ({ ...prev, [type]: false }));
    setIsDrawerOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async (type) => {
    if (isSubmitting) {
      message.warning("A request is already in progress. Please wait.");
      return;
    }

    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const token = localStorage.getItem("token");
      if (editingUser) {
        if (type === "personal") {
          await axios.put(`${API_URL}/userdata/${editingUser.user_id}`, values, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Personal information updated successfully!");
        } else {
          await axios.put(`${API_URL}/userdata/${editingUser.user_id}`, {
            address: values,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          message.success("Address updated successfully!");
        }
        fetchUsers();
      } else if (type === "add") {
        await axios.post(`${API_URL}/user`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success("User created successfully!");
        fetchUsers();
      }
      handleCancel(type);
    } catch (error) {
      console.error("Error saving user: ", error);
      message.error((error.response?.data?.error || "An error occurred"));
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
          await axios.delete(`${API_URL}/userdata/${userId}`, {
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

  const openDetailDrawer = (user) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
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
            onClick={() => showModal("personal", record)}
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
            onClick={() => openDetailDrawer(record)}
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
                onClick={() => showModal("add")}
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

      <Modal
        title={isModalVisible.personal ? "Edit Personal Information" : isModalVisible.add ? "Add User" : "Edit Address"}
        open={isModalVisible.personal || isModalVisible.address || isModalVisible.add}
        onOk={() => handleSubmit(isModalVisible.personal ? "personal" : isModalVisible.add ? "add" : "address")}
        onCancel={() => handleCancel(isModalVisible.personal ? "personal" : isModalVisible.add ? "add" : "address")}
        okText={isModalVisible.add ? "Add" : "Save Changes"}
        cancelText="Close"
        okButtonProps={{ style: { backgroundColor: "#1890ff", borderColor: "#1890ff" }, disabled: isSubmitting }}
        width={700}
        zIndex={10001}
      >
        <Form form={form} layout="vertical">
          <div className="flex flex-col">
            <div className="overflow-y-auto max-h-[450px] px-2 pb-3">
              {isModalVisible.add && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[{ required: true, message: "Please enter name!" }]}
                    >
                      <Input placeholder="Enter name" autoComplete="name" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}
                    >
                      <Input placeholder="Enter email" autoComplete="email" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        { required: true, message: "Please enter password!" },
                        {
                          validator: (_, value) =>
                            value && isPasswordStrong(value)
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error(
                                    "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
                                  )
                                ),
                        },
                      ]}
                    >
                      <Input.Password placeholder="Enter password" autoComplete="new-password" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Role"
                      name="role"
                      rules={[{ required: true, message: "Please select a role!" }]}
                    >
                      <Select>
                        <Select.Option value="user">User</Select.Option>
                        <Select.Option value="admin">Admin</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              )}
              {isModalVisible.personal && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Full Name"
                      name="fullname"
                      rules={[{ required: true, message: "Please enter full name!" }]}
                    >
                      <Input placeholder="Enter full name" autoComplete="name" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[{ required: true, type: "email", message: "Please enter a valid email!" }]}
                    >
                      <Input placeholder="Enter email" autoComplete="email" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item
                      label="Role"
                      name="role"
                      rules={[{ required: true, message: "Please select a role!" }]}
                    >
                      <Select>
                        <Select.Option value="user">User</Select.Option>
                        <Select.Option value="admin">Admin</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item label="Phone" name="phone">
                      <Input placeholder="Enter phone number" autoComplete="tel" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item label="Pronouns" name="pronouns">
                      <Select style={{ width: "100%" }}>
                        <Select.Option value="they/them">they/them</Select.Option>
                        <Select.Option value="she/her">she/her</Select.Option>
                        <Select.Option value="he/him">he/him</Select.Option>
                        <Select.Option value="Don't specify">Don't specify</Select.Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <Form.Item label="Bio" name="bio">
                      <Input.TextArea placeholder="Enter a short bio" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item label="GitHub Account" name="github_account">
                      <Input placeholder="Enter GitHub username" autoComplete="username" />
                    </Form.Item>
                  </div>
                </div>
              )}
              {isModalVisible.address && (
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item label="Country" name="country">
                      <Input placeholder="Enter country" autoComplete="country" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item label="City/State" name="cityState">
                      <Input placeholder="Enter city/state" autoComplete="address-level2" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Form.Item label="Postal Code" name="postalCode">
                      <Input placeholder="Enter postal code" autoComplete="postal-code" />
                    </Form.Item>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="User Details"
        placement="right"
        onClose={handleCancel}
        open={isDrawerOpen}
        width={Math.min(window.innerWidth * 0.9, 550)}
        zIndex={10000}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => handleCancel("personal")} style={{ marginRight: 8 }}>
              Close
            </Button>
          </div>
        }
        className="bg-white dark:bg-white/[0.03]"
      >
        {editingUser && (
          <div className="space-y-5">
            <div className="mb-4">
              <div className="flex items-center space-x-4 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p onClick={handleAvatarClick} className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                  />
                  {editingUser.avatar ? (
                    <img src={editingUser.avatar} alt="Avatar" className="w-28 h-28 rounded-full" />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-brand-600 flex items-center justify-center text-white text-[38px] font-medium">
                      {getInitial(editingUser.fullname)}
                    </div>
                  )}
                </p>
                <div>
                  <p className="text-lg font-medium mb-2">
                    {editingUser.fullname || "N/A"}
                  </p>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {editingUser.role ? "Role: " + editingUser.role : "Role"}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {editingUser.bio ? "Bio: " + editingUser.bio : "Bio"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal Information</h3>
                <button
                  onClick={() => showModal("personal", editingUser)}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.3] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57504 10.106C4.26662 10.4144 4.0545 10.8058 3.96448 11.2326L3.31211 14.3251C3.25974 14.5732 3.33633 14.8309 3.51562 15.0102C3.69492 15.1895 3.95266 15.266 4.20076 15.2137L7.29335 14.5613C7.72011 14.4713 8.11152 14.2592 8.4199 13.9508L15.7539 6.61682C16.6325 5.73814 16.6325 4.31352 15.7539 3.4348L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6357 11.1766C5.53289 11.2794 5.46218 11.4099 5.43218 11.5522L5.01738 13.5185L6.98374 13.1037C7.126 13.0737 7.25646 13.003 7.35927 12.9002L12.9831 7.27639L11.2597 5.55281Z"
                      fill=""
                    />
                  </svg>
                  Edit
                </button>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                <p><strong>Full Name:</strong> {editingUser.fullname || "-"}</p>
                <p><strong>Email:</strong> {editingUser.email || "-"}</p>
                <p><strong>Role:</strong> <Badge size="small" color={editingUser.role === "admin" ? "success" : "primary"}>{editingUser.role || "-"}</Badge></p>
                <p><strong>Phone:</strong> {editingUser.phone || "-"}</p>
                <p><strong>Pronouns:</strong> {editingUser.pronouns || "-"}</p>
                <p><strong>Bio:</strong> {editingUser.bio || "-"}</p>
                <p><strong>GitHub:</strong> {editingUser.github_account || "-"}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</h3>
                <button
                  onClick={() => showModal("address", editingUser)}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.3] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57504 10.106C4.26662 10.4144 4.0545 10.8058 3.96448 11.2326L3.31211 14.3251C3.25974 14.5732 3.33633 14.8309 3.51562 15.0102C3.69492 15.1895 3.95266 15.266 4.20076 15.2137L7.29335 14.5613C7.72011 14.4713 8.11152 14.2592 8.4199 13.9508L15.7539 6.61682C16.6325 5.73814 16.6325 4.31352 15.7539 3.4348L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6357 11.1766C5.53289 11.2794 5.46218 11.4099 5.43218 11.5522L5.01738 13.5185L6.98374 13.1037C7.126 13.0737 7.25646 13.003 7.35927 12.9002L12.9831 7.27639L11.2597 5.55281Z"
                      fill=""
                    />
                  </svg>
                  Edit
                </button>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                {editingUser.address ? (
                  <>
                    <p><strong>Country:</strong> {editingUser.address.country || "-"}</p>
                    <p><strong>City/State:</strong> {editingUser.address.cityState || "-"}</p>
                    <p><strong>Postal Code:</strong> {editingUser.address.postalCode || "-"}</p>
                  </>
                ) : " -"}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserTable;
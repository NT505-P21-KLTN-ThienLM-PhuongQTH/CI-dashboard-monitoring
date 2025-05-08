import React, { useState, useEffect } from "react";
import { Select, Input, Button, Table, message, Space, Switch, Modal } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Badge from "../ui/badge/Badge";

const { Option } = Select;
const { confirm } = Modal;

export default function WebhookSettingsCard({ repos, userId }) {
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookExists, setWebhookExists] = useState(false);
  const [configuredWebhooks, setConfiguredWebhooks] = useState([]);
  const [showSecret, setShowSecret] = useState({});

  const fetchConfiguredWebhooks = async () => {
    if (!userId) {
      console.warn("No user_id found in repos");
      setConfiguredWebhooks([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/webhooks/list?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setConfiguredWebhooks(data);
      } else {
        setConfiguredWebhooks([]);
      }
    } catch (error) {
      console.warn("Failed to fetch configured webhooks:", error.message);
      setConfiguredWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguredWebhooks();
  }, [repos, userId]);

  useEffect(() => {
    if (!selectedRepo) {
      setWebhookSecret("");
      setWebhookExists(false);
      return;
    }

    const checkWebhook = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/webhooks/check?repo_id=${selectedRepo}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          if (data.exists) {
            setWebhookExists(true);
          } else {
            setWebhookExists(false);
            setWebhookSecret("");
          }
        } else {
          setWebhookExists(false);
          setWebhookSecret("");
        }
      } catch (error) {
        message.warn("Failed to check webhook status, assuming not configured");
        setWebhookExists(false);
        setWebhookSecret("");
      }
    };

    checkWebhook();
  }, [selectedRepo, configuredWebhooks]);

  const handleConfigureWebhook = async () => {
    if (!selectedRepo) {
      message.error("Please select a repository");
      return;
    }

    if (!webhookSecret) {
      message.error("Webhook secret is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/webhooks/configure", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          repo_id: selectedRepo,
          webhook_secret: webhookSecret,
          active: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to configure webhook");
      }

      message.success("Webhook configured successfully");
      setWebhookExists(true);
      await fetchConfiguredWebhooks();
    } catch (error) {
      message.error(error.message);
      await fetchConfiguredWebhooks();
    }
  };

  const showUpdateConfirm = () => {
    confirm({
      title: "Are you sure you want to update this webhook?",
      content: "This action will update the webhook secret and settings.",
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      onOk() {
        handleUpdateWebhook(selectedRepo, webhookSecret);
      },
    });
  };

  const handleUpdateWebhook = async (repoId, newSecret) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/webhooks/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          repo_id: repoId,
          webhook_secret: newSecret || undefined,
          active: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update webhook");
      }

      message.success("Webhook updated successfully");
      await fetchConfiguredWebhooks();
    } catch (error) {
      message.error(error.message);
      await fetchConfiguredWebhooks();
    }
  };

  const showDeleteConfirm = (repoId) => {
    confirm({
      title: "Are you sure you want to delete this webhook?",
      content: "This action cannot be undone and will remove the webhook from this repository.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        handleDeleteWebhook(repoId);
      },
    });
  };

  const handleDeleteWebhook = async (repoId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/webhooks/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ repo_id: repoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete webhook");
      }

      message.success("Webhook deleted successfully");
      setWebhookExists(false);
      setWebhookSecret("");
      setConfiguredWebhooks((prev) => prev.filter((w) => w.repo_id !== repoId));
      if (selectedRepo === repoId) {
        setSelectedRepo(null);
      }
      await fetchConfiguredWebhooks();
    } catch (error) {
      message.error(error.message);
      await fetchConfiguredWebhooks();
    }
  };

  const handleToggleWebhook = async (repoId) => {
    const webhook = configuredWebhooks.find((w) => w.repo_id === repoId);
    const newActive = !webhook.active;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/webhooks/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          repo_id: repoId,
          active: newActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle webhook");
      }

      message.success(`Webhook ${newActive ? "enabled" : "disabled"} successfully`);
      await fetchConfiguredWebhooks();
    } catch (error) {
      message.error(error.message);
      await fetchConfiguredWebhooks();
    }
  };

  const columns = [
    {
      title: "Repository",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Webhook URL",
      dataIndex: "webhook_url",
      key: "webhook_url",
      render: (text) => (
        <span>
          {text} <small className="text-gray-500">(Default, non-editable)</small>
        </span>
      ),
    },
    {
      title: "Events",
      dataIndex: "events",
      key: "events",
      render: (text) => (
        <span>
          {text.join(", ")} <small className="text-gray-500">(Default, non-editable)</small>
        </span>
      ),
    },
    {
      title: "Webhook Secret",
      dataIndex: "webhook_secret",
      key: "webhook_secret",
      render: (text, record) => (
        <div>
          {showSecret[record.repo_id] ? (
            <span>{text}</span>
          ) : (
            <span>
              {"*".repeat(text ? text.length : 0)} <small className="text-gray-500">(Hidden)</small>
            </span>
          )}
          <Button
            type="link"
            size="small"
            icon={showSecret[record.repo_id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setShowSecret((prev) => ({ ...prev, [record.repo_id]: !prev[record.repo_id] }))}
            style={{ padding: 0, marginLeft: 8 }}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <div style={{ textAlign: 'center' }}>
            <Badge
                size="small" // Sử dụng size="small" thay vì "sm" vì Ant Design không có size "sm"
                color={
                text === 'Configured'
                    ? 'success'
                    : text === 'Pending'
                    ? 'warning'
                    : 'error'
                }
            >
                {text}
            </Badge>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              if (record.status !== "Configured" && record.status !== "Failed") {
                message.error("Cannot edit webhook while status is Pending");
                return;
              }
              setSelectedRepo(record.repo_id);
              setWebhookSecret("");
            }}
            style={{ color: '#1890ff' }}
            disabled={record.status === "Pending"}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => {
              if (record.status === "Pending") {
                message.error("Cannot delete webhook while status is Pending");
                return;
              }
              showDeleteConfirm(record.repo_id);
            }}
            style={{ color: '#ff4d4f' }}
            disabled={record.status === "Pending"}
          />
        </Space>
      ),
    },
  ];

  const webhookData = configuredWebhooks.map((webhook) => ({
    key: webhook.repo_id,
    repo_id: webhook.repo_id,
    full_name: webhook.full_name,
    owner: webhook.owner,
    webhook_url: webhook.webhook_url,
    events: webhook.events,
    webhook_secret: webhook.webhook_secret || "",
    active: webhook.active,
    status: webhook.status,
  }));

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Repository
        </label>
        <Select
          style={{ width: "100%" }}
          placeholder="Select a repository"
          onChange={(value) => setSelectedRepo(value)}
          value={selectedRepo}
          className="mt-2"
        >
          {repos.map((repo) => (
            <Option key={repo.id} value={repo.id}>
              {repo.full_name}
            </Option>
          ))}
        </Select>
      </div>

      {selectedRepo && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Webhook Secret
            </label>
            <Input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Enter webhook secret"
              className="mt-2"
            />
          </div>

          <div className="flex gap-2">
            {!webhookExists ? (
              <Button type="primary" onClick={handleConfigureWebhook}>
                Configure Webhook
              </Button>
            ) : (
              <Button type="primary" onClick={showUpdateConfirm}>
                Update Webhook
              </Button>
            )}
          </div>
        </>
      )}

      {configuredWebhooks.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Configured Webhooks
          </h4>
          <Table
            columns={columns}
            dataSource={webhookData}
            className="mt-2"
            loading={loading}
            bordered
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
      )}
    </div>
  );
}
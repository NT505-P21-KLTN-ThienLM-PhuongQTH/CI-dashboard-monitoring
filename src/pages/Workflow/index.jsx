import React, { useState, useEffect, useContext } from "react";
import { Select, message, Button, Spin, Table, Modal, Space } from "antd";
import { CheckCircleOutlined, CopyOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { UserContext } from "../../contexts/UserContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

const { Option } = Select;

export default function Workflows() {
  const { user } = useContext(UserContext);
  const [repos, setRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowContent, setWorkflowContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWorkflowDetails, setSelectedWorkflowDetails] = useState(null);
  const [editorTheme, setEditorTheme] = useState("vs"); // Mặc định là light theme

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

  // Phát hiện theme dark/light từ class của document
  useEffect(() => {
    const updateEditorTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setEditorTheme(isDarkMode ? "vs-dark" : "vs");
    };

    // Kiểm tra theme ban đầu
    updateEditorTheme();

    // Theo dõi sự thay đổi theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        updateEditorTheme();
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const reposResponse = await axios.get(`${API_URL}/repos?user_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRepos(reposResponse.data);
        if (reposResponse.data.length > 0) {
          setSelectedRepoId(reposResponse.data[0].id);
        } else {
          setSelectedRepoId("");
        }
      } catch (error) {
        console.error("Error in fetchRepos:", error);
        message.error(error.response?.data?.error || error.message);
        setSelectedRepoId("");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRepos();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setWorkflows([]);
      setSelectedWorkflow(null);
      setWorkflowContent("");
      setOriginalContent("");
      setCurrentBranch(null);

      if (!selectedRepoId) {
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const workflowsResponse = await axios.get(
          `${API_URL}/workflow/repo?user_id=${user.id}&repo_id=${selectedRepoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newWorkflows = workflowsResponse.data;
        setWorkflows(newWorkflows);
        if (newWorkflows.length > 0) {
          setSelectedWorkflow(newWorkflows[0]);
          console.log("Selected Workflow set to:", newWorkflows[0]);
        }
      } catch (error) {
        console.error("Error in fetchWorkflows:", error);
        message.error(error.response?.data?.error || error.message);
        setWorkflows([]);
        setSelectedWorkflow(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [user?.id, selectedRepoId]);

  useEffect(() => {
    const fetchWorkflowContent = async () => {
      if (!selectedWorkflow || !workflows.some((w) => w.id === selectedWorkflow.id)) {
        setWorkflowContent("");
        setOriginalContent("");
        setCurrentBranch(null);
        console.log("Reset content due to invalid state:", { selectedWorkflow, workflows });
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching content for:", { workflow_id: selectedWorkflow.id, repo_id: selectedRepoId });
        const response = await axios.get(
          `${API_URL}/workflow/content?workflow_id=${selectedWorkflow.id}&repo_id=${selectedRepoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { content, branch } = response.data;
        setWorkflowContent(content);
        setOriginalContent(content);
        setCurrentBranch(branch);
        console.log("Content fetched successfully:", { content, branch });
      } catch (error) {
        console.error("Error in fetchWorkflowContent:", error);
        message.error(error.response?.data?.error || error.message);
        setWorkflowContent("");
        setOriginalContent("");
        setCurrentBranch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowContent();
  }, [selectedWorkflow]);

  const handleCommit = async () => {
    if (workflowContent === originalContent) {
      message.info("No changes to commit");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/workflow/commit`,
        {
          repo_id: selectedRepoId,
          workflow_id: selectedWorkflow.id,
          content: workflowContent,
          message: `Update workflow ${selectedWorkflow.name} via editor`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Workflow updated successfully");
      setOriginalContent(workflowContent);
    } catch (error) {
      console.error("Error in handleCommit:", error);
      message.error(error.response?.data?.error || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWorkflowSelect = (workflow) => {
    setSelectedWorkflow(workflow);
  };

  const showModal = (workflow) => {
    setSelectedWorkflowDetails(workflow);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedWorkflowDetails(null);
  };

  // Hàm xử lý Copy nội dung
  const handleCopy = () => {
    if (workflowContent) {
      navigator.clipboard.writeText(workflowContent).then(() => {
        message.success("Content copied to clipboard!");
      }).catch((err) => {
        console.error("Failed to copy:", err);
        message.error("Failed to copy content");
      });
    } else {
      message.warning("No content to copy");
    }
  };

  // Hàm xử lý Download nội dung
  const handleDownload = () => {
    if (workflowContent) {
      const blob = new Blob([workflowContent], { type: "text/yaml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedWorkflow?.name || "workflow"}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success("File downloaded successfully!");
    } else {
      message.warning("No content to download");
    }
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (text, record, index) => <span className="text-gray-700 text-sm dark:text-gray-300 text-center">{index + 1}</span>,
    },
    {
      title: "Path",
      dataIndex: "path",
      key: "path",
      render: (text, record) => (
        <a href={record.html_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {text || "N/A"}
        </a>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => showModal(record)}
            style={{ color: "#1890ff" }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Workflows" description="Manage your workflows and settings." />
      <PageBreadcrumb pageTitle="Workflows" description="Manage your workflows and settings." />
      <div className="space-y-6">
        <div className="rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <label className="mb-1 block text-md font-medium text-gray-700 dark:text-gray-300">
            Select Repository
          </label>
          {/* <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Choose a repository to view and manage its workflows.
          </p> */}
          <Select
            style={{ width: "100%" }}
            placeholder="Select a repository"
            onChange={(value) => setSelectedRepoId(value || "")}
            value={selectedRepoId || undefined}
            className="mt-2"
            allowClear
          >
            {repos.length > 0 ? (
              repos.map((repo) => (
                <Option key={repo.id} value={repo.id}>
                  {repo.full_name}
                </Option>
              ))
            ) : (
              <Option value="" disabled>
                No repositories available
              </Option>
            )}
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : selectedRepoId ? (
          <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-6">
            <div className="w-full md:w-1/2 lg:w-1/3 rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <label className="mb-1 block text-md font-medium text-gray-700 dark:text-gray-300">
                Workflow List
              </label>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                Click on a workflow to view and edit its content.
              </p>
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={workflows}
                  rowKey="id"
                  bordered
                  scroll={{ x: 120 }}
                  size="small"
                  components={{
                    header: {
                      row: ({ children }) => <tr>{children}</tr>,
                      cell: ({ children }) => <th className="border-b text-start text-sm">{children}</th>,
                    },
                    body: {
                      row: ({ children, ...restProps }) => {
                        const id = `table-row-${restProps['data-row-key']}`;
                        return <tr id={id} {...restProps}>{children}</tr>;
                      },
                      cell: ({ children }) => <td className="text-start text-sm">{children}</td>,
                    },
                  }}
                  rowClassName={(record) =>
                    selectedWorkflow?.id === record.id
                      ? "bg-blue-500/10 dark:bg-blue-500/20"
                      : ""
                  }
                  onRow={(record) => ({
                    onClick: () => handleWorkflowSelect(record),
                    onMouseEnter: () => {
                      document.querySelector(`#table-row-${record.id}`).classList.add("hover:bg-gray-100", "dark:hover:bg-gray-700");
                    },
                    onMouseLeave: () => {
                      document.querySelector(`#table-row-${record.id}`).classList.remove("hover:bg-gray-100", "dark:hover:bg-gray-700");
                    },
                  })}
                  pagination={false}
                  className="dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-2/3 rounded-2xl p-6 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              {selectedWorkflow ? (
                <div>
                  <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Edit workflow: {selectedWorkflow.name}
                  </label>
                  {currentBranch && (
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Branch: {currentBranch}
                    </p>
                  )}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {selectedWorkflow.name}
                      </span>
                      <Space>
                        <Button
                          icon={<CopyOutlined />}
                          onClick={handleCopy}
                          size="small"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Copy
                        </Button>
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={handleDownload}
                          size="small"
                          className="text-gray-700 dark:text-gray-300"
                        >
                          Download
                        </Button>
                      </Space>
                    </div>

                    {/* Wrapper để điều khiển bo góc + border cho editor */}
                    <div className="h-[400px]">
                      <Editor
                        height="100%"
                        language="yaml"
                        // theme={useTheme().theme === "dark" ? "vs-dark" : "vs"}
                        theme={editorTheme}
                        value={workflowContent}
                        onChange={(newValue) => setWorkflowContent(newValue || "")}
                        options={{
                          automaticLayout: true,
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          lineNumbers: "on",
                          tabSize: 2,
                          autoClosingBrackets: "always",
                          autoClosingQuotes: "always",
                          suggest: {
                            showWords: true,
                            showSnippets: true,
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="primary"
                      onClick={handleCommit}
                      icon={<CheckCircleOutlined />}
                      loading={saving}
                      disabled={workflowContent === originalContent}
                      style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                    >
                      Commit Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-center py-10">
                  Select a workflow to view and edit its content.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 text-center py-10">
            Please select a repository to view workflows.
          </p>
        )}

        <Modal
          title="Workflow Details"
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button key="close" onClick={handleModalClose}>
              Close
            </Button>,
          ]}
        >
          {selectedWorkflowDetails && (
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedWorkflowDetails.name}</p>
              <p><strong>GitHub Workflow ID:</strong> {selectedWorkflowDetails.github_workflow_id}</p>
              <p><strong>Path:</strong> {selectedWorkflowDetails.path || "N/A"}</p>
              <p><strong>State:</strong>{" "}
                <Badge
                  size="small"
                  color={
                    selectedWorkflowDetails.state === "active"
                      ? "success"
                      : "error"
                  }
                >
                  {selectedWorkflowDetails.state || "-"}
                </Badge>
              </p>
              <p><strong>Created At:</strong>{" "}
                {selectedWorkflowDetails.created_at
                  ? new Date(selectedWorkflowDetails.created_at).toLocaleString()
                  : "-"}
              </p>
              <p><strong>Updated At:</strong>{" "}
                {selectedWorkflowDetails.updated_at
                  ? new Date(selectedWorkflowDetails.updated_at).toLocaleString()
                  : "-"}
              </p>
              <p><strong>URL:</strong>{" "}
                {selectedWorkflowDetails.html_url ? (
                  <a
                    href={selectedWorkflowDetails.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View on GitHub
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}
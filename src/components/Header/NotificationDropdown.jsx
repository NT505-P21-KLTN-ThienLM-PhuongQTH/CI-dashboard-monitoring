import React, { useState, useEffect, useContext, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router-dom";
import { Modal, Button, message, Drawer } from "antd";
import axios from "axios";
import { UserContext } from '../../contexts/UserContext';
import { EyeOutlined } from '@ant-design/icons';
import Badge from '../ui/badge/Badge';


export default function NotificationDropdown() {
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [commits, setCommits] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedWorkflowRun, setSelectedWorkflowRun] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  const fetchCommits = async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/commits?user_id=${user.id}&page=${pageNum}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      if (append) {
        setCommits((prev) => [...prev, ...data]);
      } else {
        setCommits(data);
      }
      if (data.length < 5) setHasMore(false);
      if (data.length > 0) setNotifying(true);
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to fetch notifications');
    }
  };

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

  useEffect(() => {
    if (user?.id) {
      fetchCommits();
    }
  }, [user?.id]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
        fetchCommits(page + 1, true);
      }
    }, { threshold: 1 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, page]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  const showModal = (commit) => {
    setSelectedCommit(commit);
    setIsDetailModalOpen(true);
    if (commit.workflow_run_id) fetchWorkflowRun(commit.workflow_run_id);
    closeDropdown();
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const commitDate = new Date(date);
    const diffInSeconds = Math.floor((now - commitDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day ago`;
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {commits.length > 0 ? (
            commits.map((commit) => (
              <li key={commit.id}>
                <DropdownItem
                  onItemClick={() => showModal(commit)}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    <img
                      width={40}
                      height={40}
                      src={commit.author.avatar_url}
                      alt={commit.author.login}
                      className="w-full overflow-hidden rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
                  </span>
                  <span className="block flex-1">
                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400 space-x-1">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {commit.author.login}
                      </span>
                      <span>pushed a new commit:</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        "{commit.commit.message.length > 30 ? commit.commit.message.substring(0, 27) + '...' : commit.commit.message}"
                      </span>
                      {commit.html_url && (
                        <a
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                          onClick={(e) => e.stopPropagation()} // Ngăn đóng dropdown khi nhấn link
                        >
                          (View Commit)
                        </a>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>Commit</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{commit.commit.author.date ? formatTimeAgo(commit.commit.author.date) : '-'}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500 dark:text-gray-400 py-4">
              No notifications available
            </li>
          )}
          {hasMore && <div ref={observerRef} className="h-1"></div>}
        </ul>
        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>

      {/* Modal chi tiết Commit */}
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
              <div className="flex items-center space-x-4 mt-2">
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
              <Badge size="small" color="primary">
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

      {/* Drawer hiển thị chi tiết Workflow Run */}
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
            {/* Triggering Actor - Không nằm trong scope */}
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

            {/* Pipeline Overview */}
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

            {/* Execution Details */}
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

            {/* Timeline & Links */}
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

            {/* Repository Info */}
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
}
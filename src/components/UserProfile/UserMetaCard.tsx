import React, { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Button as AntButton, Form, Input, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

export default function UserMetaCard({ userData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: userData?.fullname || "",
    bio: userData?.bio || "",
    github_account: userData?.github_account || "",
    avatar: userData?.avatar || "",
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

  useEffect(() => {
    setFormData({
      fullname: userData?.fullname || "",
      bio: userData?.bio || "",
      github_account: userData?.github_account || "",
      avatar: userData?.avatar || formData.avatar,
    });
  }, [userData]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const uploadAvatar = useCallback(async (token: string, userId: string) => {
    if (!fileToUpload) return null;
    if (!fileToUpload.type.startsWith("image/")) {
      message.error("Please select an image file!");
      throw new Error("Invalid file type");
    }

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", fileToUpload);
    const response = await axios.post(
      `${API_URL}/userdata/upload-avatar`,
      formDataUpload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        params: { user_id: userId },
      }
    );
    return response.data.url;
  }, [API_URL, fileToUpload]);

  const updateProfile = useCallback(async (data: any, token: string, userId: string) => {
    await axios.put(
      `${API_URL}/userdata/${userId}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }, [API_URL]);

  const handleOk = useCallback(async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      let updatedFormData = { ...formData };
      const hasDataChanged =
        formData.fullname !== userData?.fullname ||
        formData.bio !== userData?.bio ||
        formData.github_account !== userData?.github_account;

      if (fileToUpload) {
        try {
          const avatarUrl = await uploadAvatar(token, userData.user_id);
          if (avatarUrl) {
            updatedFormData.avatar = avatarUrl;
            setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
            message.success("Avatar uploaded successfully!");
          }
        } catch (uploadError) {
          message.error(`Failed to upload avatar: ${uploadError.message}`);
          return;
        }
      }

      if (hasDataChanged) {
        await updateProfile(updatedFormData, token, userData.user_id);
        message.success("Profile data updated successfully!");
      }

      setIsModalOpen(false);
      setPreviewImage(null);
      setFileToUpload(null);
    } catch (error) {
      message.error(`Failed to update profile: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  }, [formData, userData, fileToUpload, uploadAvatar, updateProfile]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    setFormData((prev) => ({
      fullname: userData?.fullname || "",
      bio: userData?.bio || "",
      github_account: userData?.github_account || "",
      avatar: prev.avatar || userData?.avatar || "",
    }));
    setPreviewImage(null);
    setFileToUpload(null);
  }, [userData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  }, []);

  const getInitial = useCallback((name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  }, []);

  const handleAvatarClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div
              className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 cursor-pointer"
              onClick={handleAvatarClick}
            >
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="User Avatar"
                  className="h-20 w-20 rounded-full object-cover"
                  onError={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-brand-500 flex items-center justify-center text-white font-medium">
                  {getInitial(formData.fullname)}
                </div>
              )}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {formData.fullname || "N/A"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData?.role ? "Role: " + userData?.role : "Role"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.bio ? "Bio: " + formData.bio : "Bio"}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <a
                href={formData.github_account || "https://github.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.19 6.84 9.49.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.61-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.64.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.57 9.57 0 0110 3.1c.85.004 1.71.115 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.35 4.68-4.57 4.93.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.59.69.49C17.13 18.19 20 14.42 20 10c0-5.52-4.48-10-10-10z"
                    fill=""
                  />
                </svg>
              </a>
            </div>
          </div>
          <button
            onClick={handleAvatarClick}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal
        title="Edit Profile Overview"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        okText="Save Changes"
        cancelText="Close"
        confirmLoading={uploading}
      >
        <Form
          layout="vertical"
          initialValues={formData}
          onValuesChange={(changedValues, allValues) => {
            setFormData(allValues);
          }}
          onFinish={handleOk}
        >
          <div className="flex flex-col">
            <div className="overflow-y-auto max-h-[450px] px-2 pb-3">
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Form.Item
                      label="Full Name"
                      name="fullname"
                      rules={[{ required: true, message: "Please enter your full name!" }]}
                    >
                      <Input placeholder="Enter your full name" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <Form.Item label="Bio" name="bio">
                      <Input placeholder="Enter a short bio" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <Form.Item
                      label="GitHub Account"
                      name="github_account"
                      rules={[
                        {
                          pattern: /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/?$/,
                          message: "Please enter a valid GitHub URL (e.g., https://github.com/username)",
                        },
                      ]}
                    >
                      <Input placeholder="Enter your GitHub URL (e.g., https://github.com/username)" />
                    </Form.Item>
                  </div>
                  <div className="col-span-2">
                    <Form.Item label="Upload Avatar">
                      <div>
                        <AntButton
                          icon={<UploadOutlined />}
                          loading={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Click to Upload"}
                        </AntButton>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          style={{ display: "none" }}
                        />
                        {previewImage && (
                          <img
                            src={previewImage}
                            alt="Preview Avatar"
                            className="mt-2 w-20 h-20 rounded-full object-cover"
                          />
                        )}
                      </div>
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
}

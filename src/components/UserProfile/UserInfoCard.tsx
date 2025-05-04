// UserInfoCard.tsx
import React, { useState, useContext } from "react";
import { Modal, Button as AntButton, Input as AntInput, Select } from "antd";
import { UserContext } from "../../contexts/UserContext";
const { Option } = Select;

export default function UserInfoCard({ userData }) {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: userData?.fullname || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    bio: userData?.bio || "",
    pronouns: userData?.pronouns || "Don't specify",
  });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      // Kiểm tra email có khớp với thông tin đăng nhập không
      if (formData.email !== user?.email) {
        throw new Error("Email must match your login email");
      }

      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}userdata/${userData.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update user data");

      // Cập nhật bảng users nếu cần (tùy thuộc backend)
      if (formData.email && formData.email !== user?.email) {
        await fetch(`${import.meta.env.VITE_APP_API_URL}users/${userData.user_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      fullname: userData?.fullname || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      bio: userData?.bio || "",
      pronouns: userData?.pronouns || "Don't specify",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePronounChange = (value) => {
    setFormData((prev) => ({ ...prev, pronouns: value }));
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.fullname || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.bio || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Pronouns
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.pronouns || "N/A"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={showModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
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

      <Modal
        title="Edit Personal Information"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        okText="Save Changes"
        cancelText="Close"
      >
        <div className="flex flex-col mt-6">
          <div className="overflow-y-auto max-h-[450px] px-2 pb-3">
            <div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <AntInput
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <AntInput
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <AntInput
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pronouns
                  </label>
                  <Select
                    value={formData.pronouns}
                    onChange={handlePronounChange}
                    style={{ width: "100%" }}
                  >
                    <Option value="they/them">they/them</Option>
                    <Option value="she/her">she/her</Option>
                    <Option value="he/him">he/him</Option>
                    <Option value="Don't specify">Don't specify</Option>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <AntInput
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Enter a short bio"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
import React, { useEffect, useState, useContext } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import UserAddressCard from "../../components/UserProfile/UserAddressCard";
import WebhookSettingsCard from "../../components/UserProfile/WebhookSettingsCard";
import PageMeta from "../../components/common/PageMeta";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";

export default function AccountSettings() {
  const { user } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.id || null;

  const API_URL = `${import.meta.env.VITE_APP_API_URL}/api`;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError("User ID is not available");
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const userDataResponse = await axios.get(
          `${API_URL}/userdata/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(userDataResponse.data);

        const reposResponse = await axios.get(
          `${API_URL}/repos?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRepos(reposResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) return <div className="text-[#000] dark:text-[#d9d9d9]">Loading...</div>;
  if (error) return <div className="text-[#000] dark:text-[#d9d9d9]">Error: {error}</div>;

  return (
    <>
      <PageMeta
        title="Account Settings"
        description="Settings for your account and profile information."
      />
      <PageBreadcrumb
        pageTitle="Settings"
        description="Settings for your account and profile information."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
        <div className="flex flex-col gap-2 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Manage your profile settings
          </h3>
        </div>
        <div className="space-y-6">
          <UserMetaCard userData={userData} />
          <UserInfoCard userData={userData} />
          <UserAddressCard userData={userData} />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 mb-6">
        <div className="flex flex-col gap-2 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Webhook Settings
          </h3>
        </div>
        <div className="space-y-6">
          <WebhookSettingsCard repos={repos} userId={userId} />
        </div>
      </div>
    </>
  );
}

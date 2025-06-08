import React, { useState, useEffect } from "react";
import { Button } from "antd";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import SixteenIsToNine from "../../components/ui/videos/SixteenIsToNine";
import axios from "axios";

const ModelListTab = ({ appSelectedModel, setAppSelectedModel }) => {
  const [models, setModels] = useState([]);
  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/ml_model/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setModels(response.data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div>
        {models.map((model) => {
          const latestVersion = model.latest_versions[0] || {};
          return (
            <div
              key={model.id}
              className="rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 mb-4 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {model.name}
                </h4>
                <p>
                  <strong>Version:</strong>{" "}
                  <Badge size="small" color="info">
                    {latestVersion.version || "N/A"}
                  </Badge>
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(model.last_updated_timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    size="small"
                    color={
                      latestVersion.status === "READY"
                        ? "success"
                        : "warning"
                    }
                  >
                    {latestVersion.status || "N/A"}
                  </Badge>
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="primary"
                    onClick={() => setAppSelectedModel(model.name)}
                    disabled={appSelectedModel === model.name}
                    style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", width: "100px" }}
                  >
                    {appSelectedModel === model.name ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="What is LSTM (Long Short-Term Memory)?">
          <SixteenIsToNine />
        </ComponentCard>
      </div>
    </div>
  );
};

export default ModelListTab;
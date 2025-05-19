import React from "react";
import { Button } from "antd";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard"
import SixteenIsToNine from "../../components/ui/videos/SixteenIsToNine"

const ModelListTab = ({ appSelectedModel, setAppSelectedModel }) => {
  // Dữ liệu mẫu cho mỗi model (có thể thay bằng API)
  const modelData = {
    "Stacked-LSTM": {
      version: "6",
      lastUpdated: "2025-05-18T11:09:00Z",
      status: "READY",
    },
    "Bi-LSTM": {
      version: "5",
      lastUpdated: "2025-05-17T11:09:00Z",
      status: "READY",
    },
    "Conv-LSTM": {
      version: "4",
      lastUpdated: "2025-05-16T11:09:00Z",
      status: "READY",
    },
  };

  const models = ["Stacked-LSTM", "Bi-LSTM", "Conv-LSTM"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div>
        {models.map((model) => (
          <div
            key={model}
            className="rounded-2xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 mb-4 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {model}
              </h4>
              <p>
                <strong>Version:</strong> {" "}
                  <Badge
                    size="small"
                    color={"info"}
                  >
                    {modelData[model].version}
                  </Badge>
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(modelData[model].lastUpdated).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  size="small"
                  color={
                    modelData[model].status === "READY"
                      ? "success"
                      : "warning"
                  }
                >
                  {modelData[model].status}
                </Badge>
              </p>
              <div className="mt-4 flex justify-end">
                <Button
                  type="primary"
                  onClick={() => setAppSelectedModel(model)}
                  disabled={appSelectedModel === model}
                  style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", width: "100px" }}
                >
                  {appSelectedModel === model ? "Selected" : "Select"}
                </Button>
              </div>
            </div>
          </div>
        ))}
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
import React, { useState, useEffect, useContext } from "react";
import { Tabs, message } from "antd";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ModelInfoTab from "./ModelInfoTab";
import ModelListTab from "./ModelListTab";
import PredictionTab from "./PredictionTab";

function CurrentModel() {
  const { user } = useContext(UserContext);
  const [modelData, setModelData] = useState(null);
  const [appSelectedModel, setAppSelectedModel] = useState("Stacked-LSTM");

  const API_URL = import.meta.env.VITE_APP_API_URL;

  // Fetch model info
  useEffect(() => {
    const fetchModel = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/ml_model?model_name=${appSelectedModel}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setModelData(response.data);
      } catch (error) {
        message.error(error.response?.data?.error || "Failed to fetch model");
      }
    };
    if (user?.id) fetchModel();
  }, [appSelectedModel, user?.id]);

  return (
    <>
      <PageMeta
        title="Model"
        description="AI Model selected for predicting build failed pipelines."
      />
      <PageBreadcrumb
        pageTitle="Model"
        description="AI Model selected for predicting build failed pipelines."
      />
      <Tabs
        defaultActiveKey="1"
        className="block text-md font-medium text-gray-700 dark:text-gray-300"
        items={[
          {
            label: "Model Info",
            key: "1",
            children: <ModelInfoTab modelData={modelData} />,
          },
          {
            label: "Model List",
            key: "2",
            children: (
              <ModelListTab
                appSelectedModel={appSelectedModel}
                setAppSelectedModel={setAppSelectedModel}
              />
            ),
          },
          {
            label: "Prediction",
            key: "3",
            children: <PredictionTab modelData={modelData} />,
          },
        ]}
      />
    </>
  );
}

export default CurrentModel;
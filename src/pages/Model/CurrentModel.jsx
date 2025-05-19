import React, { useState, useEffect, useContext } from "react";
import { Tabs, message } from "antd";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ModelInfoTab from "./ModelInfoTab";
import ModelListTab from "./ModelListTab";
import PredictionTab from "./PredictionTab";

const { TabPane } = Tabs;

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
      {/* <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6 mb-6 max-w-full overflow-x-auto">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hello
        </label>
      </div> */}
      <Tabs defaultActiveKey="1" className="block text-md font-medium text-gray-700 dark:text-gray-300">
          <TabPane tab="Model Info" key="1">
            <ModelInfoTab modelData={modelData} />
          </TabPane>
          <TabPane tab="Model List" key="2">
            <ModelListTab
              appSelectedModel={appSelectedModel}
              setAppSelectedModel={setAppSelectedModel}
            />
          </TabPane>
          <TabPane tab="Prediction" key="3">
            <PredictionTab modelData={modelData} />
          </TabPane>
        </Tabs>
    </>
  );
}

export default CurrentModel;
import React, { useState } from "react";
import { Select, Input, Button, message, Radio, Spin } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Badge from "../../components/ui/badge/Badge";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import axios from "axios";

const { TextArea } = Input;

const PredictionTab = ({ modelData }) => {
  const [testSelectedModel, setTestSelectedModel] = useState("Stacked-LSTM");
  const [predictionResult, setPredictionResult] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [showFormatHint, setShowFormatHint] = useState(false);
  const [inputMethod, setInputMethod] = useState("upload");
  const [isLoading, setIsLoading] = useState(false);

  // Gọi API predict
  const callPredictAPI = async (inputData) => {
    setIsLoading(true);
    try {
      const parsedData = JSON.parse(inputData);
      const ciBuilds = parsedData.ci_builds || [];

      // Validate gh_project_name và git_branch
      if (ciBuilds.length > 0) {
        const firstBuild = ciBuilds[0];
        const projectName = firstBuild.gh_project_name;
        const gitBranch = firstBuild.git_branch;
        const isValid = ciBuilds.every(
          (build) =>
            build.gh_project_name === projectName && build.git_branch === gitBranch
        );
        if (!isValid) {
          message.error("gh_project_name and git_branch must be consistent across all ci_builds.");
          return;
        }
      } else {
        message.error("No ci_builds data found in input.");
        return;
      }

      const body = {
        predict_name: testSelectedModel,
        predict_version: modelData?.latest_versions[0]?.version || "latest",
        ci_builds: ciBuilds,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_PREDICT_URL}/predict`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      // const confidencePercentage = (data.probability / data.threshold) * 100;
      setPredictionResult({
        buildFailed: data.build_failed,
        projectName: ciBuilds[0].gh_project_name,
        gitBranch: ciBuilds[0].git_branch,
        // confidencePercentage: Number(confidencePercentage.toFixed(2)), // Làm tròn 2 chữ số
        executionTime: data.execution_time,
        timestamp: data.timestamp,
        data: data, // Lưu toàn bộ response
      });
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || "Error calling prediction API.");
      setPredictionResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload from Dropzone
  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          setFileData(file);
          setTextInput(content);
          callPredictAPI(content);
        } catch (error) {
          message.error("Invalid JSON or CSV file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle manual predict button click
  const handleManualPredict = () => {
    try {
      if (!textInput.trim()) {
        message.error("Input cannot be empty.");
        return;
      }
      callPredictAPI(textInput);
    } catch (error) {
      message.error("Invalid JSON format.");
      setPredictionResult(null);
    }
  };

  // Handle text input change (chỉ cập nhật state, không gọi API)
  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    setFileData(null);
    setPredictionResult(null);
  };

  // Format hint toggle
  const toggleFormatHint = () => {
    setShowFormatHint(!showFormatHint);
  };

  // Dummy data for prediction input
  const dummyInput = {
    ci_builds: [
      {
        _id: "abc123def456ghi789jkl012",
        git_branch: "feature/improve-ci",
        git_all_built_commits: "a1b2c3d4e5f67890123456789abcdef12345678",
        git_num_all_built_commits: 3,
        git_trigger_commit: "a1b2c3d4e5f67890123456789abcdef12345678",
        git_diff_src_churn: 15,
        git_diff_test_churn: 8,
        gh_project_name: "sample-org/sample-ci-project",
        gh_is_pr: true,
        gh_lang: "javascript",
        gh_team_size: 5,
        gh_num_issue_comments: 2,
        gh_num_pr_comments: 4,
        gh_num_commit_comments: 1,
        gh_diff_files_added: 2,
        gh_diff_files_deleted: 1,
        gh_diff_files_modified: 3,
        gh_diff_tests_added: 2,
        gh_diff_tests_deleted: 0,
        gh_diff_src_files: 3,
        gh_diff_doc_files: 1,
        gh_diff_other_files: 0,
        gh_num_commits_on_files_touched: 6,
        gh_sloc: 1250,
        gh_test_lines_per_kloc: 180,
        gh_test_cases_per_kloc: 14,
        gh_asserts_cases_per_kloc: 25,
        gh_by_core_team_member: false,
        gh_repo_age: 985.75,
        gh_repo_num_commits: 289,
        build_duration: 198,
        build_failed: "passed",
        gh_build_started_at: "06/01/2025 10:15:00",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
      {/* Left Side: Model Selection and Info */}
      <div className="space-y-6">
        <div className="w-full rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="lg:mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Model Information
            </h4>
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Name:
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {modelData.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Creation Date:
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(modelData.creation_timestamp).toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Updated:
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(modelData.last_updated_timestamp).toLocaleString() || "N/A"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status:
              </p>
              <Badge
                size="small"
                color={
                  modelData?.latest_versions[0]?.status === "READY" ? "success" : "warning"
                }
              >
                {modelData?.latest_versions[0]?.status || "N/A"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Prediction Options and Result */}
      <div className="space-y-6">
        <div className="rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="lg:mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Input Method
            </h4>
            <p className="block text-md font-medium text-gray-600 dark:text-gray-400">
              Choose how to input data for prediction:
            </p>
          </div>
          <div className="mb-4">
            <Radio.Group
              onChange={(e) => setInputMethod(e.target.value)}
              value={inputMethod}
            >
              <Radio value="upload">Upload File</Radio>
              <Radio value="manual">Manual Input</Radio>
            </Radio.Group>
          </div>

          {inputMethod === "upload" ? (
            <div>
              <DropzoneComponent
                onDrop={handleDrop}
                accept={{ "application/json": [".json"], "text/csv": [".csv"] }}
              />
              {fileData && (
                <p className="text-sm text-gray-600 mt-2">Selected: {fileData.name}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter JSON Data
              </label>
              <TextArea
                value={textInput}
                onChange={handleTextChange}
                rows={6}
                placeholder="Enter JSON data here"
                className="w-full mb-2"
              />
              <div className="flex space-x-2">
                <Button
                  type="primary"
                  onClick={handleManualPredict}
                  style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                  disabled={isLoading}
                >
                  {isLoading ? <Spin size="small" /> : "Predict"}
                </Button>
                <Button
                  type="primary"
                  onClick={toggleFormatHint}
                  style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                  icon={<EyeOutlined />}
                  disabled={isLoading}
                >
                  Show Input Format
                </Button>
              </div>
              {showFormatHint && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2 bg-gray-50 dark:bg-gray-800">
                  <pre className="text-sm text-gray-700 dark:text-gray-300">
                    {JSON.stringify(dummyInput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Prediction Result */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Prediction Result
                </h4>
                {predictionResult ? (
                  <div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-lg font-semibold">Result:</span>
                    <Badge
                      size="medium"
                      color={predictionResult.buildFailed ? "error" : "success"}
                    >
                    {predictionResult.buildFailed ? "Failure" : "Success"}
                    </Badge>
                  </div>
                  {predictionResult.projectName && predictionResult.gitBranch && (
                    <p className="mt-2">
                    <strong>Repository Link:</strong>{" "}
                    <a
                      href={`https://github.com/${predictionResult.projectName}/tree/${predictionResult.gitBranch}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Repo
                    </a>
                    </p>
                  )}
                <p className="mt-1">
                  <strong>Execution Time:</strong>{" "}
                  {Number(predictionResult.executionTime).toFixed(2)} seconds
                </p>
                <p className="mt-1">
                  <strong>Timestamp:</strong>{" "}
                  {new Date(predictionResult.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No result yet. Upload a file or enter data to predict.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionTab;
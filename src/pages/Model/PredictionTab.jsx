import React, { useState } from "react";
import { Select, Input, Button, message, Radio } from "antd";
import { EyeOutlined } from "@ant-design/icons"; // Icon cho Show Input Format
import Badge from "../../components/ui/badge/Badge";
import DropzoneComponent from "../../components/form/form-elements/DropZone";

const { TextArea } = Input;

const PredictionTab = ({ modelData }) => {
  const [testSelectedModel, setTestSelectedModel] = useState("Stacked-LSTM");
  const [predictionResult, setPredictionResult] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [showFormatHint, setShowFormatHint] = useState(false);
  const [inputMethod, setInputMethod] = useState("upload"); // "upload" hoặc "manual"

  // Simulate prediction result (placeholder for API)
  const simulatePrediction = (inputData) => {
    const parsedData = JSON.parse(inputData);
    const ciBuilds = parsedData.ci_builds || [];
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

      setTimeout(() => {
        setPredictionResult({
          result: fileData ? "pass" : "fail",
          projectName,
          gitBranch,
        });
      }, 1000);
    } else {
      message.error("No ci_builds data found in input.");
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
          simulatePrediction(content);
        } catch (error) {
          message.error("Invalid JSON or CSV file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle text input change
  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    setFileData(null);
    try {
      simulatePrediction(e.target.value);
    } catch (error) {
      setPredictionResult(null); // Reset nếu JSON không hợp lệ
    }
  };

  // Format hint toggle
  const toggleFormatHint = () => {
    setShowFormatHint(!showFormatHint);
  };

  // Dummy data for prediction input
  const dummyInput = {
    ci_builds: [
      {
        _id: "681394b89e247d0a2a3596d0",
        git_branch: "main",
        git_all_built_commits: "7d8e41598c210104c03be7e1a8b8262c02bf78b0",
        git_num_all_built_commits: 1,
        git_trigger_commit: "7d8e41598c210104c03be7e1a8b8262c02bf78b0",
        git_diff_src_churn: 0,
        git_diff_test_churn: 0,
        gh_project_name: "mablhq/github-run-tests-action",
        gh_is_pr: false,
        gh_lang: "typescript",
        gh_team_size: 1,
        gh_num_issue_comments: 0,
        gh_num_pr_comments: 0,
        gh_num_commit_comments: 0,
        gh_diff_files_added: 0,
        gh_diff_files_deleted: 0,
        gh_diff_files_modified: 1,
        gh_diff_tests_added: 0,
        gh_diff_tests_deleted: 0,
        gh_diff_src_files: 0,
        gh_diff_doc_files: 0,
        gh_diff_other_files: 1,
        gh_num_commits_on_files_touched: 2,
        gh_sloc: 662,
        gh_test_lines_per_kloc: 209,
        gh_test_cases_per_kloc: 11,
        gh_asserts_cases_per_kloc: 20,
        gh_by_core_team_member: true,
        gh_repo_age: 1765.14,
        gh_repo_num_commits: 111,
        build_duration: 131,
        build_failed: "passed",
        gh_build_started_at: "05/21/2024 16:51:00",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side: Model Selection and Info */}
      <div className="space-y-6">
        <div className="rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Model
          </label>
          <Select
            value={testSelectedModel}
            onChange={setTestSelectedModel}
            className="w-full"
            style={{ width: "100%" }}
          >
            {["Stacked-LSTM", "Bi-LSTM", "Conv-LSTM"].map((model) => (
              <Select.Option key={model} value={model}>
                {model}
              </Select.Option>
            ))}
          </Select>
        </div>

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
              <Button
                type="primary"
                onClick={toggleFormatHint}
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                icon={<EyeOutlined />}
              >
                Show Input Format
              </Button>
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
                <p
                  className={`text-lg font-semibold ${
                    predictionResult.result === "pass" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Result: {predictionResult.result.toUpperCase()}
                </p>
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
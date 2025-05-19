import React from "react";
import { Table } from "antd";
import Badge from "../../components/ui/badge/Badge";

const ModelInfoTab = ({ modelData }) => {
    // Định nghĩa cột cho bảng Latest Versions
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 150,
            render: (text) => (
                <span className="text-gray-700 text-start text-sm dark:text-gray-300">
                {text || "N/A"}
                </span>
            ),
        },
        {
            title: "Version",
            dataIndex: "version",
            key: "version",
            width: 80,
            render: (text) => (
                <div style={{ textAlign: 'center' }}>
                    <Badge size="small" color="info">
                        {text || "N/A"}
                    </Badge>
                </div>
            ),
        },
        {
            title: "Creation Date",
            dataIndex: "creation_timestamp",
            key: "creation_timestamp",
            render: (text) => (
                <span className="text-gray-700 text-start text-sm dark:text-gray-300">
                {text ? new Date(text).toLocaleString() : "N/A"}
                </span>
            ),
        },
        {
            title: "Last Updated",
            dataIndex: "last_updated_timestamp",
            key: "last_updated_timestamp",
            render: (text) => (
                <span className="text-gray-700 text-start text-sm dark:text-gray-300">
                {text ? new Date(text).toLocaleString() : "N/A"}
                </span>
            ),
        },
        {
            title: "Current Stage",
            dataIndex: "current_stage",
            key: "current_stage",
            width: 130,
            render: (text) => (
                <span className="text-gray-700 text-start text-sm dark:text-gray-300">
                {text || "N/A"}
                </span>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            render: (text) => (
                <span className="text-gray-700 text-start text-sm dark:text-gray-300">
                    {text || "N/A"}
                </span>
            ),
        },
        {
            title: "Source",
            dataIndex: "source",
            key: "source",
            ellipsis: true,
            render: (text) => (
                <span className="text-gray-700 text-start text-sm dark:text-gray-300">
                {text || "N/A"}
                </span>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (text) => (
                <div style={{ textAlign: 'center' }}>
                    <Badge size="small" color={text === "READY" ? "success" : "warning"}>
                        {text || "N/A"}
                    </Badge>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
        {modelData ? (
            <>
            {/* Basic Information */}
            <div className="w-full rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="lg:mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Basic Information
                    </h4>
                    <p className="block text-md font-medium text-gray-600 dark:text-gray-400">
                        Information of the selected model is shown below:
                    </p>
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
                </div>
            </div>

            {/* Latest Versions */}
            <div className="w-full rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="lg:mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Latest Versions
                </h4>
                <p className="block text-md font-medium text-gray-600 dark:text-gray-400">
                    Here are the latest versions of this model, including their details and current status:
                </p>
                </div>
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        dataSource={modelData.latest_versions}
                        bordered
                        size="small"
                        pagination={false}
                        rowKey={(record) => record.run_id || record.version}
                        scroll={{ x: 1200 }}
                        style={{ minWidth: "100%" }}
                    />
                </div>
            </div>
            </>
        ) : (
            <div className="w-full rounded-2xl p-5 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="lg:mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Status
                </h4>
                <p className="block text-md font-medium text-gray-600 dark:text-gray-400">
                    Loading model data...
                </p>
            </div>
            </div>
        )}
        </div>
    );
};

export default ModelInfoTab;
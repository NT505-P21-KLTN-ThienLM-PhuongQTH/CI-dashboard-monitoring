import React, { useState } from "react";
import { Select, message } from "antd";

const RepoFilterDropdown = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    applyFiltersAndSort(repos, searchText, value);
  };
}

export default RepoFilterDropdown;
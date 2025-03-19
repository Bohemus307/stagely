import React, { useState } from "react";
import Search from "@/components/Search";

export interface IncidentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

const IncidentSearch: React.FC<IncidentSearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const incidentFilterOptions = [
    { label: "All", value: null },
    { label: "Urgent", value: "High" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
  ];

  const [severityValues, setSeverityValues] = useState<string[]>([]);
  const [statusValues, setStatusValues] = useState<string[]>([]);

  const filterSections = [
    {
      title: "Severity",
      options: [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
        { label: "Critical", value: "Critical" },
      ],
      values: severityValues,
      onChange: setSeverityValues,
    },
    {
      title: "Status",
      options: [
        { label: "Open", value: "Open" },
        { label: "In Progress", value: "In Progress" },
        { label: "Resolved", value: "Resolved" },
        { label: "Closed", value: "Closed" },
      ],
      values: statusValues,
      onChange: setStatusValues,
    },
  ];

  const handleResetFilters = () => {
    setSeverityValues([]);
    setStatusValues([]);
  };

  const handleApplyFilters = () => {
    // You'd need to update this to handle the advanced filters
    // For example, you might want to set statusFilter based on statusValues
    if (statusValues.length > 0) {
      onStatusFilterChange(statusValues[0]);
    }
  };

  return (
    <Search
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      placeholderText="Search Incidents..."
      filterOptions={incidentFilterOptions}
      showAdvancedFilters={true}
      filterSections={filterSections}
      onResetFilters={handleResetFilters}
      onApplyFilters={handleApplyFilters}
      menuTitle="Filter Incidents"
    />
  );
};

export default IncidentSearch;

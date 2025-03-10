import React from "react";
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

  return (
    <Search
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      placeholderText="Search Incidents..."
      filterOptions={incidentFilterOptions}
    />
  );
};

export default IncidentSearch;

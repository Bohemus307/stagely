import React, { useState } from "react";
import Search from "@/components/Search";

export interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const messageFilterOptions = [
    { label: "All", value: null },
    { label: "Unread", value: "Unread" },
    { label: "Urgent", value: "Urgent" },
  ];

  const [readStatusValues, setReadStatusValues] = useState<string[]>([]);
  const [priorityValues, setPriorityValues] = useState<string[]>([]);

  const filterSections = [
    {
      title: "Read Status",
      options: [
        { label: "Read", value: "Read" },
        { label: "Unread", value: "Unread" },
      ],
      values: readStatusValues,
      onChange: setReadStatusValues,
    },
    {
      title: "Priority",
      options: [
        { label: "Urgent", value: "Urgent" },
        { label: "Normal", value: "Normal" },
        { label: "Low", value: "Low" },
      ],
      values: priorityValues,
      onChange: setPriorityValues,
    },
  ];

  const handleResetFilters = () => {
    setReadStatusValues([]);
    setPriorityValues([]);
  };

  const handleApplyFilters = () => {
    if (readStatusValues.includes("Unread")) {
      onStatusFilterChange("Unread");
    } else if (priorityValues.includes("Urgent")) {
      onStatusFilterChange("Urgent");
    } else {
      onStatusFilterChange(null);
    }

    // If needed, you could also pass these values to a parent component
    console.log("Advanced filters applied:", {
      readStatus: readStatusValues,
      priority: priorityValues,
    });
  };
  return (
    <Search
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      placeholderText="Search Messages..."
      filterOptions={messageFilterOptions}
      showAdvancedFilters={true}
      filterSections={filterSections}
      onResetFilters={handleResetFilters}
      onApplyFilters={handleApplyFilters}
      menuTitle="Filter Messages"
    />
  );
};

export default MessageSearch;

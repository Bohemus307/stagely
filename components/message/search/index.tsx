import React from "react";
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

  return (
    <Search
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
      placeholderText="Search Messages..."
      filterOptions={messageFilterOptions}
    />
  );
};

export default MessageSearch;

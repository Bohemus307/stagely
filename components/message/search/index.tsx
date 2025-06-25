import React, { useMemo } from "react";
import Search from "@/components/Search";

export interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = React.memo(
  ({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange }) => {
    // Memoize the filter options to prevent recreation
    const messageFilterOptions = useMemo(
      () => [
        { label: "All", value: null },
        { label: "Unread", value: "Unread" },
        { label: "Urgent", value: "Urgent" },
      ],
      [],
    );

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
  },
);

MessageSearch.displayName = "MessageSearch";

export default MessageSearch;

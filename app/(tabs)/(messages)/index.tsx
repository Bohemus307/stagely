import { useState } from "react";
import { View } from "react-native";
import MessageSearch from "@/components/message/search";
import MessagesList from "@/components/message/list";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <View className="px-4 p-2 bg-white">
        <MessageSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </View>
      <View className="flex-1">
        <MessagesList searchQuery={searchQuery} statusFilter={statusFilter} />
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default MessagesScreen;

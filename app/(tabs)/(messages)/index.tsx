import { useState } from "react";
import { SafeAreaView, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import MessageSearch from "@/components/message/search";
import MessagesList from "@/components/message/list";

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  return (
    <ThemedView className="flex-1">
      <Header />
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          <MessageSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <MessagesList searchQuery={searchQuery} statusFilter={statusFilter} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default MessagesScreen;

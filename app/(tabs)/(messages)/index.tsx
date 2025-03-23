import { useState } from "react";
import { SafeAreaView, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import MessageSearch from "@/components/message/search";
import MessagesList from "@/components/message/list";
import Header from "@/components/Header";

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  return (
    <ThemedView className="flex-1">
      <Header />
      <SafeAreaView className="flex-1 flex-col">
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
      </SafeAreaView>
    </ThemedView>
  );
};

export default MessagesScreen;

import { useState } from "react";
import { SafeAreaView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import MessageSearch from "@/components/message/search";
import MessagesList from "@/components/message/list";

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <MessageSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <MessagesList searchQuery={searchQuery} />
        </SafeAreaView>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default MessagesScreen;

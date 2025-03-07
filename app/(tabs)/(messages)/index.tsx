import React from "react";
import { SafeAreaView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import MessageSearch from "@/components/message/search";
import MessagesList from "@/components/message/list";

const MessagesScreen = () => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <MessageSearch
            searchQuery={""}
            onSearchChange={function (query: string): void {
              throw new Error("Function not implemented.");
            }}
            statusFilter={null}
            onStatusFilterChange={function (status: string | null): void {
              throw new Error("Function not implemented.");
            }}
          />
          <MessagesList />
        </SafeAreaView>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default MessagesScreen;

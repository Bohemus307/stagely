import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const IncidentsScreen = () => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1 flex-col">
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>Incidents Screen Main</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default IncidentsScreen;

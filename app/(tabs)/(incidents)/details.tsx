import ParallaxScrollView from "@/components/ParallaxScrollView";
import React from "react";
import { View, Text } from "react-native";

const IncidentsScreen = () => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text> Screen (Coming Soon)</Text>
      </View>
    </ParallaxScrollView>
  );
};

export default IncidentsScreen;

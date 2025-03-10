import React from "react";
import { View, SafeAreaView } from "react-native";
import { properties } from "@/components/properties/data/properties";
import PropertyList from "@/components/properties/list";
import PropertySearch from "@/components/properties/search";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import PropertyMetrics from "@/components/properties/PropertyMetrics";

const PropertiesScreen = () => {
  return (
    <ThemedView className="flex-1">
      <Header />
      <SafeAreaView className="flex-1 flex-col">
        <View className="px-4 p-2">
          <PropertySearch />
        </View>
        <PropertyMetrics />
        <View className="flex-1">
          <PropertyList properties={properties} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertiesScreen;

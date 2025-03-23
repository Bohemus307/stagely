import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import PropertyList from "@/components/properties/list";
import PropertySearch from "@/components/properties/search";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import PropertyMetrics from "@/components/properties/PropertyMetrics";
import { usePropertySearch } from "@/hooks/properties/usePropertiesSearch";
import { Property } from "@/lib/@types/properties";

const PropertiesScreen = () => {
  // Use property search hook directly in the screen component for initial load
  const { properties: initialProperties, isLoading } = usePropertySearch(
    "",
    1,
    10,
  );

  // State to hold search results when searching
  const [searchResults, setSearchResults] = useState<Property[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Handler for search results from PropertySearch component
  const handleSearchResults = (properties: Property[]) => {
    setSearchResults(properties);
    setIsSearching(true);
  };

  // Handler for when search is cleared
  const handleSearchCleared = () => {
    setIsSearching(false);
  };

  // Properties to display - either search results or initial properties
  const displayProperties = isSearching ? searchResults : initialProperties;

  return (
    <ThemedView className="flex-1">
      <Header />
      <SafeAreaView className="flex-1 flex-col">
        <View className="px-4 p-2 bg-white">
          <PropertySearch
            onSearchResults={handleSearchResults}
            onSearchCleared={handleSearchCleared}
          />
        </View>

        {!isLoading && initialProperties && (
          <PropertyMetrics properties={initialProperties.data} />
        )}
        <View className="flex-1">
          <PropertyList properties={displayProperties?.data || []} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertiesScreen;

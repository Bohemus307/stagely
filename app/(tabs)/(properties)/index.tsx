import React, { useState } from "react";
import { View } from "react-native";
import PropertyList from "@/components/properties/list";
import PropertySearch from "@/components/properties/search";
import PropertyMetrics from "@/components/properties/PropertyMetrics";
import { usePropertySearch } from "@/hooks/properties/usePropertiesSearch";
import { Property } from "@/lib/@types/properties";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

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
    <ResponsiveScreenWrapper scrollable={false}>
      <View className="p-3 w-screen bg-white">
        <PropertySearch
          onSearchResults={handleSearchResults}
          onSearchCleared={handleSearchCleared}
        />
      </View>

      {!isLoading && initialProperties && (
        <PropertyMetrics properties={initialProperties.data} />
      )}
      <View className="flex-1">
        {displayProperties && (
          <PropertyList properties={displayProperties?.data} />
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default PropertiesScreen;

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import PropertyList from "@/components/properties/list";
import PropertySearch from "@/components/properties/search";
import PropertyMetrics from "@/components/properties/PropertyMetrics";
import { Property } from "@/lib/@types/properties";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { useGetProperties } from "@/hooks/properties/useGetProperties";

const PropertiesScreen = () => {
  const params = useLocalSearchParams();
  const mode = params.mode as string;
  const isIncidentSelectionMode = mode === "incident-selection";

  const {
    properties: initialProperties,
    isLoading,
    refetch,
  } = useGetProperties({
    page: 1,
    limit: 10,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  // State to hold search results when searching
  const [searchResults, setSearchResults] = useState<Property[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    refetch();
  }, []);

  // Handler for search results from PropertySearch component
  const handleSearchResults = (properties: Property[]) => {
    setSearchResults(properties);
    setIsSearching(true);
  };

  // Handler for when search is cleared
  const handleSearchCleared = () => {
    setIsSearching(false);
  };

  // Handler for property selection in incident mode
  const handlePropertySelect = (property: Property) => {
    if (isIncidentSelectionMode) {
      router.push({
        pathname: "/(tabs)/(incidents)/addIncident",
        params: { propertyId: property.id.toString() },
      });
    }
  };

  // Properties to display - either search results or initial properties
  const displayProperties = isSearching
    ? { data: searchResults }
    : initialProperties;

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      {/* Header */}
      {isIncidentSelectionMode && (
        <Box className="px-4 py-3 bg-primary-50 border-b border-gray-200">
          <ThemedText className="text-lg font-semibold text-center">
            Select Property for Incident
          </ThemedText>
        </Box>
      )}
      <View className="p-3 w-screen bg-white">
        <PropertySearch
          onSearchResults={handleSearchResults}
          onSearchCleared={handleSearchCleared}
        />
      </View>

      {/* Only show metrics in normal mode */}
      {!isIncidentSelectionMode && !isLoading && initialProperties && (
        <PropertyMetrics properties={initialProperties.data} />
      )}
      <View className="flex-1">
        <PropertyList
          properties={displayProperties?.data || []}
          selectionMode={isIncidentSelectionMode}
          onPropertySelect={handlePropertySelect}
        />
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default PropertiesScreen;

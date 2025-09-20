import React, { useState } from "react";
import { View } from "react-native";
import PropertyList from "@/components/properties/list";
import PropertySearch from "@/components/properties/search";
import PropertyMetrics from "@/components/properties/PropertyMetrics";
import { Property } from "@/lib/@types/properties";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { usePropertySearch } from "@/hooks/properties/usePropertiesSearch";

const PropertiesScreen = () => {
  const params = useLocalSearchParams();
  const mode = params.mode as string;
  const isIncidentSelectionMode = mode === "incident-selection";

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Single hook call - let it handle everything
  const { properties, isLoading, error } = usePropertySearch(
    searchQuery,
    1,
    10,
  );

  // Handler for property selection in incident mode
  const handlePropertySelect = (property: Property) => {
    if (isIncidentSelectionMode) {
      router.push({
        pathname: "/(tabs)/(incidents)/addIncident",
        params: { propertyId: property.id.toString() },
      });
    }
  };

  // Properties will always have data array based on API response
  const propertyList = properties?.data || [];
  const isSearching = searchQuery.length > 0;

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      {/* Header */}
      {isIncidentSelectionMode && (
        <Box className="px-4 py-3 border-b border-gray-200">
          <ThemedText className="text-lg font-semibold text-center">
            Select Property for Incident
          </ThemedText>
        </Box>
      )}

      <View className="p-3 w-screen bg-white">
        <PropertySearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          error={error}
        />
      </View>

      {/* Only show metrics in normal mode when not searching */}
      {!isIncidentSelectionMode && !isSearching && propertyList.length > 0 && (
        <PropertyMetrics properties={propertyList} />
      )}

      <View className="flex-1">
        {properties?.data && (
          <PropertyList
            properties={properties?.data}
            selectionMode={isIncidentSelectionMode}
            onPropertySelect={handlePropertySelect}
          />
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default PropertiesScreen;

import React from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import PropertyCard from "@/components/properties/list/PropertyCard";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";
import { Property } from "@/lib/@types/properties";

export interface PropertyListProps {
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
  selectionMode?: boolean;
  onPropertySelect?: (property: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onSelectProperty,
  selectionMode = false,
  onPropertySelect,
}) => {
  const handlePropertyPress = (property: Property) => {
    if (selectionMode && onPropertySelect) {
      // In selection mode, selecting a property triggers incident creation
      onPropertySelect(property);
    } else if (onSelectProperty) {
      // In normal mode, use the standard selection handler
      onSelectProperty(property);
    }
  };

  const handleDetailsPress = (property: Property) => {
    console.log("Navigate to details for property:", property.id);
    router.push({
      pathname: "/(tabs)/(properties)/details",
      params: { propertyId: property.id },
    });
  };

  const handlePhotosPress = (property: Property) => {
    console.log("Navigate to photos for property:", property.id);
    router.push({
      pathname: "/(tabs)/(properties)/(photos)",
      params: { propertyId: property.id },
    });
  };

  const handleDocumentsPress = (property: Property) => {
    console.log("Navigate to documents");
    router.push("/(tabs)/(properties)/documents");
  };

  const handleAddProperty = () => {
    console.log("Navigate to add property");
    router.push("/(tabs)/(properties)/addProperty");
  };

  const renderProperty = ({ item }: { item: Property }) => {
    console.log("Rendering property:", item.id);
    return (
      <View className="mb-4">
        <PropertyCard
          property={item}
          onPress={() => handlePropertyPress(item)}
          onDetailsPress={() => handleDetailsPress(item)}
          onPhotosPress={() => handlePhotosPress(item)}
          onDocumentsPress={() => handleDocumentsPress(item)}
          selectionMode={selectionMode}
        />
      </View>
    );
  };

  const EmptyListComponent = () => (
    <View className="items-center justify-center p-8 flex-1">
      <IconSymbol
        name="house.fill"
        size={28}
        color={Colors.light.tabIconDefault}
      />
      <Text className="text-center my-3">
        {selectionMode
          ? "No properties found. Please add a property first before reporting an incident."
          : "No properties found. Add your first property to get started."}
      </Text>
      {!selectionMode && (
        <TouchableOpacity
          className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
          onPress={handleAddProperty}
        >
          <Text className="text-white font-medium">Add Property</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Box className="flex-1 relative">
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item?.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: 15,
          paddingBottom: 15,
          flexGrow: 1,
        }}
        className="flex-1 bg-primary-50"
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={<EmptyListComponent />}
      />

      {/* Fab button in bottom right corner */}
      <Box className="absolute bottom-0 lg:bottom-10 right-6">
        <Fab size="lg" placement="bottom right" onPress={handleAddProperty}>
          <FabIcon size="xl" as={AddIcon} />
        </Fab>
      </Box>
    </Box>
  );
};

export default PropertyList;

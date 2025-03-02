import React from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import PropertyCard from "@/components/properties/list/PropertyCard";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { Box } from "@/components/ui/box";

// Types for data structure
export interface Location {
  latitude: number;
  longitude: number;
}

export interface PropertyImage {
  image_id: number;
  image_url: string;
  caption?: string;
  taken_at: string;
}

export interface IncidentImage {
  image_id: number;
  image_url: string;
  caption?: string;
  taken_at: string;
}

export interface Incident {
  incident_id: number;
  incident_type: string;
  description: string;
  reported_at: string;
  resolved_at?: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  images: IncidentImage[];
}

export interface Property {
  property_id: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  location: Location;
  status: PropertyStatus;
  images?: PropertyImage[];
  incidents?: Incident[];
  created_at: string;
  updated_at: string;
}

export enum PropertyStatus {
  Active = "Active",
  Maintenance = "Maintenance",
  Archived = "Archived",
}

export interface PropertyListProps {
  properties: Property[];
  onSelectProperty?: (property: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onSelectProperty,
}) => {
  const handlePropertyPress = (property: Property) => {
    if (onSelectProperty) {
      onSelectProperty(property);
    }
  };

  const handleDetailsPress = (property: Property) => {
    console.log("PROPS", property);
    router.push({
      pathname: "/(tabs)/(properties)/details",
      params: { propertyId: property.property_id },
    });
  };

  const handlePhotosPress = (property: Property) => {
    console.log("PROPS", property);
    router.push({
      pathname: "/(tabs)/(properties)/photos",
      params: { propertyId: property.property_id },
    });
  };

  const handleDocumentsPress = (property: Property) => {
    console.log("PROPS", property);
    router.push("/(tabs)/(properties)/documents");
  };

  const handleAddProperty = () => {
    router.push("/(tabs)/(properties)/add");
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <View className="mb-4">
      <PropertyCard
        property={item}
        onPress={() => handlePropertyPress(item)}
        onDetailsPress={handleDetailsPress}
        onPhotosPress={handlePhotosPress}
        onDocumentsPress={handleDocumentsPress}
      />
    </View>
  );

  const EmptyListComponent = () => (
    <View className="items-center justify-center p-8 flex-1">
      <IconSymbol
        name="house.fill"
        size={28}
        color={Colors.light.tabIconDefault}
      />
      <Text className="text-center my-3">
        No properties found. Add your first property to get started.
      </Text>
      <TouchableOpacity
        className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
        onPress={handleAddProperty}
      >
        <Text className="text-white font-medium">Add Property</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Box className="flex-1 relative">
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.property_id.toString()}
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
      <Fab
        size="lg"
        placement="bottom right"
        onPress={handleAddProperty}
        className="mb-14 mr-4"
      >
        <FabIcon size="xl" as={AddIcon} />
      </Fab>
    </Box>
  );
};

export default PropertyList;

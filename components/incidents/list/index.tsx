// Modified IncidentList.tsx
import {
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import IncidentCard from "@/components/incidents/list/IncidentCard";
import { Incident } from "@/lib/@types/properties";
import AddIncidentButton from "../AddIncidentButton";
import { useNearestProperty } from "@/hooks/useNearestProperty";
import PropertyConfirmationModal from "@/components/PropertyConfirmationModal";

export interface IncidentListProps {
  incidents: Incident[];
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onSelectIncident?: (incident: Incident) => void;
}

const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  isLoading,
  error,
  onRefresh,
  onSelectIncident,
}) => {
  // Use our custom hook
  const {
    nearestProperty,
    isLoading: locationLoading,
    showModal,
    setShowModal,
    streetViewError,
    setStreetViewError,
    findNearestProperty,
  } = useNearestProperty();

  const handleIncidentPress = (incident: Incident) => {
    if (onSelectIncident) {
      onSelectIncident(incident);
    }
  };

  const handleDetailsPress = (incident: Incident) => {
    router.push({
      pathname: "/(tabs)/(incidents)/details",
      params: { incidentId: incident.id },
    });
  };

  // Modified to use our property finding logic
  const handleAddIncident = async () => {
    const found = await findNearestProperty();
    if (!found) {
      // If no property found or error occurred, navigate to properties
      router.push("/(tabs)/(properties)");
    }
    // If property found, the modal will show automatically via the hook state
  };

  const handleConfirmProperty = () => {
    if (nearestProperty) {
      setShowModal(false);
      router.push({
        pathname: "/(tabs)/(incidents)/[addIncident]",
        params: {
          propertyId: nearestProperty.id.toString(),
          addIncident: "[addIncident]",
        },
      });
    }
  };

  const handleViewAllProperties = () => {
    setShowModal(false);
    router.push("/(tabs)/(properties)");
  };

  const renderIncident = ({ item }: { item: Incident }) => (
    <View className="mb-4">
      <IncidentCard
        incident={item}
        onPress={() => handleIncidentPress(item)}
        onDetailsPress={() => handleDetailsPress(item)}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText className="mt-4">Loading incidents...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50 p-4">
        <IconSymbol
          name="exclamationmark.triangle.fill"
          size={48}
          color="red"
        />
        <ThemedText className="text-center mt-4 text-red-600">
          Error loading incidents
        </ThemedText>
        <ThemedText className="text-center mt-2 text-sm">
          {error.message}
        </ThemedText>
        {onRefresh && (
          <TouchableOpacity
            className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
            onPress={onRefresh}
          >
            <ThemedText className="text-white font-medium">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const EmptyListComponent = () => (
    <View className="items-center justify-center p-8 flex-1">
      <IconSymbol
        name="exclamationmark.triangle.fill"
        size={28}
        color={Colors.light.tabIconDefault}
      />
      <ThemedText className="text-center my-3">
        No incidents found. Report a new incident to get started.
      </ThemedText>
      <Box className="mt-4">
        {/* Using the AddIncidentButton component here */}
        <AddIncidentButton />
      </Box>
    </View>
  );

  return (
    <Box className="flex-1 relative">
      <FlatList
        data={incidents}
        renderItem={renderIncident}
        keyExtractor={(item, index) => item?.id?.toString() || `id#${index}`}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: 15,
          paddingBottom: 15,
          flexGrow: incidents.length === 0 ? 1 : undefined,
        }}
        className="flex-1 bg-primary-50"
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={<EmptyListComponent />}
        onRefresh={onRefresh}
        refreshing={isLoading}
      />

      <Fab
        size="lg"
        placement="bottom right"
        onPress={handleAddIncident}
        className="mb-24 mr-4"
        isDisabled={locationLoading}
      >
        <FabIcon size="xl" as={AddIcon} />
      </Fab>

      {/* Property Confirmation Modal */}
      <PropertyConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        property={nearestProperty}
        onConfirm={handleConfirmProperty}
        onViewAll={handleViewAllProperties}
        streetViewError={streetViewError}
        setStreetViewError={setStreetViewError}
      />
    </Box>
  );
};

export default IncidentList;

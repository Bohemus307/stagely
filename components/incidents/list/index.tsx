import { FlatList, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import IncidentCard from "@/components/incidents/list/IncidentCard";
import { Incident } from "@/lib/@types/properties";
import AddIncidentButtonFab from "@/components/incidents/AddIncidentButtonFab";

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

  const renderIncident = ({ item }: { item: Incident }) => (
    <View className="mb-4">
      <IncidentCard
        incident={item}
        onPress={() => handleIncidentPress(item)}
        onDetailsPress={() => handleDetailsPress(item)}
      />
    </View>
  );

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

      <Box className="absolute bottom-0 right-6">
        <AddIncidentButtonFab />
      </Box>
    </Box>
  );
};

export default IncidentList;

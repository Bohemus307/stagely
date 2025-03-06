import React from 'react';
import { FlatList, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import IncidentCard from "@/components/incidents/list/IncidentCard";
import { Incident } from "../data/incidents";


export interface IncidentListProps {
    incidents: Incident[];
    onSelectIncident?: (incident: Incident) => void;
}

const IncidentList: React.FC<IncidentListProps> = ({
    incidents,
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
        params: { incidentId: incident.incident_id },
      });
    };

    const handleAddIncident = () => {
        router.push({
            pathname: "/(tabs)/(incidents)/add",
        });
    };

    const renderIncident = ({ item }: { item: Incident }) => (
      <View className="mb-3">
          <IncidentCard
              incident={item}
              onPress={() => handleIncidentPress(item)}
              onDetailsPress={() => handleDetailsPress(item)}
          />
      </View>
    );

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
          <TouchableOpacity
            className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
            onPress={handleAddIncident}
          >
            <ThemedText className="text-white font-medium">Report Incident</ThemedText>
          </TouchableOpacity>
        </View>
    );

    return (
        <Box className="flex-1 relative">
          <FlatList
            data={incidents}
            renderItem={renderIncident}
            keyExtractor={(item) => item.incident_id.toString()}
            contentContainerStyle={{
              paddingHorizontal: 15,
              paddingTop: 15,
              paddingBottom: 15,
              flexGrow: incidents.length === 0 ? 1 : undefined,
            }}
            className="flex-1 bg-primary-50"
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={<EmptyListComponent />}
          />

          <Fab
            size="lg"
            placement="bottom right"
            onPress={handleAddIncident}
            className="mb-14 mr-4"
          >
            <FabIcon size="xl" as={AddIcon} />
          </Fab>
        </Box>
      );
};

export default IncidentList;





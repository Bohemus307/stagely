import BackButton from "@/components/BackButton";
import {
  IncidentImage,
  incidents,
} from "@/components/incidents/data/incidents";
import IncidentDetails from "@/components/incidents/details/IncidentDetails";
import IncidentPhotos from "@/components/incidents/details/IncidentPhotos";
import { Incident } from "@/components/properties/list";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView } from "react-native";
import IncidentNotes from "@/components/incidents/details/IncidentNotes";
import IncidentActions from "@/components/incidents/details/IncidentQuickActions";
import { properties } from "@/components/properties/data/properties";
import { Box } from "@/components/ui/box";
import StreetViewImage from "@/components/properties/details/StreetView";
import { Badge } from "@/components/ui/badge";
import { IconSymbol } from "@/components/ui/IconSymbol";

// Extend the Incident interface to include notes
interface ExtendedIncident extends Incident {
  notes?: string;
}

const IncidentsDetailsScreen = () => {
  const params = useLocalSearchParams();
  const incidentId = parseInt(params.incidentId as string);
  const [incident, setIncident] = useState<ExtendedIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [streetViewError, setStreetViewError] = useState(false);
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    //Fetch incident
    const fetchData = async () => {
      setLoading(true);
      try {
        //Eventually an Api call to Backend
        const foundIncident = incidents.find(
          (inc) => inc.incident_id === incidentId,
        ) as ExtendedIncident;

        if (foundIncident) {
          setIncident(foundIncident);

          const associatedProperty = properties.find(
            (p) => p.property_id === foundIncident.property_id,
          );

          setProperty(associatedProperty);
        }
      } catch (error) {
        console.error("Error fetching incident details", error);
        Alert.alert("Error", "Failed to load incident details");
      } finally {
        setLoading(false);
      }
    };

    if (incidentId) {
      fetchData();
    }
  }, [incidentId]);

  const handlePhotoPress = (image: IncidentImage): void => {
    router.push({
      pathname: "/(tabs)/(incidents)/photos",
    });
  };

  const handleAddNote = (note: { text: string; timestamp: string }) => {
    if (incident) {
      setIncident({
        ...incident,
        notes: note.text,
      } as ExtendedIncident);
    }
  };

  const handleEscalate = () => {
    Alert.alert("Escalate Incident", "Do you want to Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Escalate",
        style: "destructive",
        onPress: () => console.log("Incident escalated"),
      },
    ]);
  };

  const handleContactManager = () => {
    router.push({
      pathname: "/(tabs)/(messages)/new",
    });
  };

  const handleGenerateReport = () => {
    Alert.alert("Generate Report", "Report will be generated", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Generate",
        onPress: () => console.log("Report Generation pressed"),
      },
    ]);
  };

  const handleEditIncident = () => {
    router.push({
      pathname: "/(tabs)/(incidents)/edit",
      params: { incidentId: incident?.incident_id.toString() },
    });
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </ThemedView>
    );
  }

  if (!incident) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText>Incident not found</ThemedText>
        <Button className="mt-4" onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <ScrollView className="flex-1">
          {/* Street View image */}
          {property?.location && !streetViewError ? (
            <Box className="h-48 w-full px-4">
              <StreetViewImage
                latitude={property.location.latitude}
                longitude={property.location.longitude}
                size={{ width: 600, height: 300 }}
                onError={() => setStreetViewError(true)}
              />
              <Badge className="absolute bottom-2 left-4 py-1 px-2 rounded">
                <ThemedText>Incident Location</ThemedText>
              </Badge>
            </Box>
          ) : (
            <Box className="h-48 w-full flex items-center justify-center">
              <IconSymbol name="eye.slash" size={32} color={"gray"} />
              <ThemedText>Location Preview Unavailable</ThemedText>
            </Box>
          )}

          {/* Incident Details */}
          <IncidentDetails incident={incident} />

          {/* Photos Section */}
          <IncidentPhotos
            images={incident.images}
            onPhotoPress={handlePhotoPress}
          />

          {/* Notes Section */}
          <IncidentNotes
            initialNotes={
              incident.notes
                ? [{ text: incident.notes, timestamp: incident.reported_at }]
                : []
            }
            onAddNote={handleAddNote}
          />

          {/* Action Buttons */}
          <IncidentActions
            incident={incident}
            onEscalate={handleEscalate}
            onContactManager={handleContactManager}
            onGenerateReport={handleGenerateReport}
            onEditIncident={handleEditIncident}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default IncidentsDetailsScreen;

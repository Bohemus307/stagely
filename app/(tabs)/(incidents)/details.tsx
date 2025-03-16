import BackButton from "@/components/BackButton";
import {
  IncidentImage,
  incidents,
} from "@/components/incidents/data/incidents";
import IncidentDetails from "@/components/incidents/details/IncidentDetails";
import IncidentPhotos from "@/components/incidents/details/IncidentPhotos";
import { formatDate } from "@/components/message/lib/utils/timeHelpers";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Incident } from "@/components/properties/list";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Spinner } from "@/components/ui/spinner";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView } from "react-native";

// Extend the Incident interface to include notes
interface ExtendedIncident extends Incident {
  notes?: string;
}

const IncidentsDetailsScreen = () => {
  const params = useLocalSearchParams();
  const incidentId = parseInt(params.incidentId as string);
  const [incident, setIncident] = useState<ExtendedIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState<string>("");
  const [notes, setNotes] = useState<{ text: string; timestamp: string }[]>([]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  useEffect(() => {
    //Fetch incident data
    const fetchData = async () => {
      setLoading(true);
      try {
        //Eventually an Api call to Backend
        const foundIncident = incidents.find(
          (inc) => inc.incident_id === incidentId,
        ) as ExtendedIncident;
        if (foundIncident) {
          setIncident(foundIncident);

          //Eventually fetch Notes from API
          setNotes(
            foundIncident.notes
              ? [
                  {
                    text: foundIncident.notes,
                    timestamp: foundIncident.reported_at,
                  },
                ]
              : [],
          );
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

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    //Eventually API call to add a note
    const newNoteObj = {
      text: newNote,
      timestamp: new Date().toISOString(),
    };

    setNotes([...notes, newNoteObj]);

    //Update incident with new note
    if (incident) {
      setIncident({
        ...incident,
        notes: newNote,
      } as ExtendedIncident);
    }

    setNewNote("");
    setShowNoteEditor(false);
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

  function handlePhotoPress(image: IncidentImage): void {
    throw new Error("Function not implemented.");
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          <BackButton />

          <ScrollView className="flex-1">
            {/* Incident Details */}
            <IncidentDetails incident={incident} />

            {/* Photos Section */}
            <IncidentPhotos
              images={incident.images}
              onPhotoPress={handlePhotoPress}
            />

            {/* Notes Section */}
            <Box className="bg-white mx-4 p-4 rounded-lg shadow-sm mb-4">
              <HStack className="justify-between items-center mb-3">
                <ThemedText>Notes & Updates</ThemedText>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setShowNoteEditor(!showNoteEditor)}
                >
                  <ButtonText>
                    {showNoteEditor ? "Cancel" : "Add Note"}
                  </ButtonText>
                </Button>
              </HStack>

              {showNoteEditor && (
                <VStack className="space-y-4 mb-4">
                  <Textarea size="md">
                    <TextareaInput
                      placeholder="Enter notes about the incident..."
                      value={newNote}
                      onChangeText={setNewNote}
                    />
                  </Textarea>

                  <Button onPress={handleAddNote}>
                    <ButtonText>Save</ButtonText>
                  </Button>
                </VStack>
              )}

              {notes.length > 0 ? (
                <VStack className="space-y-3">
                  {notes.map((note, index) => (
                    <Box key={index} className="p-3 bg-gray-50 rounded-lg">
                      <ThemedText>{note.text}</ThemedText>
                      <ThemedText>{formatDate(note.timestamp)}</ThemedText>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <ThemedText>No notes have been added yet.</ThemedText>
              )}
            </Box>

            {/* Action Buttons */}
            <Box className="mx-4 p-4 mb-8">
              <VStack className="space-y-3">
                <Button variant="outline">
                  <HStack className="justify-center items-center">
                    <IconSymbol
                      name="exclamationmark.triangle"
                      size={18}
                      color={"ef4444"}
                    />
                    <ButtonText className="text-red-500 ml-2">
                      Escalate Incident
                    </ButtonText>
                  </HStack>
                </Button>

                <Button variant="outline">
                  <HStack className="justify-center items-center">
                    <IconSymbol name="message" size={18} color={"#6b7280"} />
                    <ButtonText className="ml-2">
                      Contact Property Manager
                    </ButtonText>
                  </HStack>
                </Button>

                <Button variant="outline">
                  <HStack className="justify-center items-center">
                    <IconSymbol name="doc.text" size={18} color={"#6b7280"} />
                    <ButtonText className="ml-2">Generate Report</ButtonText>
                  </HStack>
                </Button>
              </VStack>
            </Box>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default IncidentsDetailsScreen;

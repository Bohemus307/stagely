import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import LocationSearchMap from "@/components/LocationSearchMap";

interface Location {
  latitude: number;
  longitude: number;
}

export default function Add() {
  const handleBack = () => {
    router.back();
  };

  const handleLocationSave = async (location: Location, address: string) => {
    try {
      // make your API call
      console.log("Location saved:", location);
      console.log("Address:", address);

      // Example API call:
      // await saveLocationToAPI({ location, address });

      // After successful API call, you might want to navigate back
      router.back();
    } catch (error) {
      console.error("Error saving location:", error);
      // Handle error appropriately
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text>Back</Text>
      </TouchableOpacity>

      <View style={styles.mapContainer}>
        <LocationSearchMap onSaveLocation={handleLocationSave} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
});

import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import LocationSearchMap from "@/components/LocationSearchMap";
import BackButton from "@/components/ui/BackButton";

interface Location {
  latitude: number;
  longitude: number;
}

export default function AddProperty() {
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
      <View style={styles.header}>
        <BackButton />
      </View>
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
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    width: "100%",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
  },
});

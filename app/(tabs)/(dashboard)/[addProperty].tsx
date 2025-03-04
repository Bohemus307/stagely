import { View } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import LocationSearchMap from "@/components/LocationSearchMap";
import BackButton from "@/components/BackButton";

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
    <ThemedView className="flex-1">
      <View className="px-5 w-full z-10 shadow-sm">
        <BackButton />
      </View>
      <View className="flex-1 w-full">
        <LocationSearchMap onSaveLocation={handleLocationSave} />
      </View>
    </ThemedView>
  );
}

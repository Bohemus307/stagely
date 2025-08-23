import { SafeAreaView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";

const PropertyEditScreen = () => {
  const { propertyId } = useLocalSearchParams();

  const currentProperty = useGetProperty(propertyId as string);

  if (currentProperty.isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </ThemedView>
    );
  }

  if (!currentProperty) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <BackButton />
        <Text>Property not found</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <Text>EDIT</Text>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertyEditScreen;

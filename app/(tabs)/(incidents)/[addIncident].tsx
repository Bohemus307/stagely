import { SafeAreaView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import BackButton from "@/components/BackButton";

const AddIncidentScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  const handleTakePhoto = (): void => {
    router.push({
      pathname: "/(tabs)/(incidents)/camera",
      params: { propertyId },
    });
  };

  const handleSelectFromGallery = (): void => {
    router.push({
      pathname: "/(tabs)/(incidents)/(photos)/select",
      params: { propertyId },
    });
  };

  const handleReportWithoutPhotos = (): void => {
    router.replace({
      pathname: "/(tabs)/(incidents)/new",
      params: {
        propertyId,
        skipPhotos: "true",
      },
    });
  };

  const getCardStyle = () => {
    return "bg-gray-200 rounded-xl overflow-hidden";
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <Box className="px-2 py-2 border-b border-gray-200">
        <Box className="flex-row justify-between items-center">
          <BackButton />
          <ThemedText className="text-lg font-medium text-center flex-1 mr-24">
            Report New Incident
          </ThemedText>
        </Box>
      </Box>

      <Box className="flex-1 px-4 py-6">
        <ThemedText className="text-base mb-6 text-gray-600">
          Choose how you would like to document this incident:
        </ThemedText>

        {/* Option Cards */}
        <Box className="gap-4">
          {/* Take Photo Option */}
          <Pressable onPress={handleTakePhoto} className={getCardStyle()}>
            <Box className="flex-row items-center py-5 px-4">
              <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                <IconSymbol name="camera.fill" size={24} color="white" />
              </Box>
              <Box className="flex-1">
                <ThemedText className="text-lg font-medium">
                  Take New Photo
                </ThemedText>
              </Box>
            </Box>
          </Pressable>

          {/* Upload from Gallery Option */}
          <Pressable
            onPress={handleSelectFromGallery}
            className={getCardStyle()}
          >
            <Box className="flex-row items-center py-5 px-4">
              <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                <IconSymbol name="photo.on.rectangle" size={24} color="white" />
              </Box>
              <Box className="flex-1">
                <ThemedText className="text-lg font-medium">
                  Choose from Gallery
                </ThemedText>
              </Box>
            </Box>
          </Pressable>

          {/* Report Without Photos Option */}
          <Pressable
            onPress={handleReportWithoutPhotos}
            className={getCardStyle()}
          >
            <Box className="flex-row items-center py-5 px-4">
              <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                <IconSymbol name="doc.text" size={24} color="white" />
              </Box>
              <Box className="flex-1">
                <ThemedText className="text-lg font-medium">
                  Report Without Photos
                </ThemedText>
              </Box>
            </Box>
          </Pressable>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default AddIncidentScreen;

import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Text } from "react-native";

const EmptyPhotosState = ({ onAddPhotos }: { onAddPhotos: () => void }) => (
  <Box className="flex-1 justify-start mt-16 items-center py-8">
    <IconSymbol name="photo.on.rectangle" size={48} color="gray" />
    <ThemedText className="text-gray-500 mt-4 text-center">
      No photos available
    </ThemedText>
    <ThemedText className="text-gray-500 text-center text-sm mt-1 mb-6">
      Add photos to document this property
    </ThemedText>
    <Button onPress={onAddPhotos}>
      <Text className="text-white">Add Photos</Text>
    </Button>
  </Box>
);

export default EmptyPhotosState;

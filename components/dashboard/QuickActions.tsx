import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AddIncidentButton from "../incidents/AddIncidentButton";

export default function QuickActions() {
  const router = useRouter();
  const addProperty = () => router.push("/(tabs)/(dashboard)/addProperty");

  return (
    <Box className="h-48 w-full mx-auto p-2 rounded-lg border-2 flex flex-col items-center justify-center">
      <ThemedText type="subtitle" className="mb-2 text-center">
        Quick Actions
      </ThemedText>
      <HStack className="justify-center px-2 mb-5 w-full space-x-4">
        <Button
          className="flex flex-col mr-4 items-center justify-center h-24"
          onPress={addProperty}
        >
          <IconSymbol size={28} name="building.2.fill" color="grey" />
          <ButtonText>Add Property</ButtonText>
        </Button>
        <AddIncidentButton />
      </HStack>
    </Box>
  );
}

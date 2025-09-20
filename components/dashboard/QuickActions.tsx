import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";

export default function QuickActions(): JSX.Element {
  const router = useRouter();

  const addProperty = (): void =>
    router.push("/(tabs)/(dashboard)/addProperty");

  const addIncident = (): void =>
    router.push("/(tabs)/(dashboard)/addIncident");

  return (
    <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-4">
      <ThemedText type="defaultSemiBold" className="text-left mb-3">
        Quick Actions
      </ThemedText>
      <HStack className="justify-center px-2 mb-2 w-full gap-4">
        <Button
          className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-primary-500"
          onPress={addProperty}
        >
          <HStack className="items-center justify-center gap-2">
            <IconSymbol size={38} name="building.2.fill" color="white" />
            <ButtonText className="mt-1 text-white">Add Property</ButtonText>
          </HStack>
        </Button>
        <Button
          className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-primary-500"
          onPress={addIncident}
        >
          <HStack className="items-center gap-2 justify-center">
            <IconSymbol
              size={38}
              name="exclamationmark.triangle.fill"
              color="white"
            />
            <ButtonText className="mt-1 text-white">Add Incident</ButtonText>
          </HStack>
        </Button>
      </HStack>
    </Box>
  );
}

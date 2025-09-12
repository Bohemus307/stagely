import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import { VStack } from "../ui/vstack";

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
          className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-background-50"
          onPress={addProperty}
        >
          <VStack className="items-center justify-center">
            <IconSymbol size={18} name="building.2.fill" color="grey" />
            <ButtonText className="mt-1 text-primary-500">
              Add Property
            </ButtonText>
          </VStack>
        </Button>
        <Button
          className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-background-50"
          onPress={addIncident}
        >
          <VStack className="items-center justify-center">
            <IconSymbol
              size={18}
              name="exclamationmark.triangle.fill"
              color="grey"
            />
            <ButtonText className="mt-1 text-primary-500">
              Add Incident
            </ButtonText>
          </VStack>
        </Button>
      </HStack>
    </Box>
  );
}

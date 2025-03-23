import React from "react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Property } from "@/lib/@types/properties";

type Props = {
  property: Property;
};

const QuickActions = ({ property }: Props) => {
  return (
    <Box className="bg-primary-50 p-4 mb-6 rounded-2xl">
      <Heading className="text-lg font-semibold mb-3">Quick Actions</Heading>

      <VStack className="gap-1">
        <Button
          className="bg-white border border-primary-300 "
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(properties)/photos",
              params: { propertyId: property.id },
            })
          }
        >
          <HStack className="items-center justify-center">
            <IconSymbol
              name="photo"
              size={18}
              color={Colors.light.tabIconDefault}
            />
            <ThemedText className="ml-2 text-primary-700">Photos</ThemedText>
          </HStack>
        </Button>

        <Button
          className="bg-white border border-primary-300 "
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(properties)/documents",
              params: { propertyId: property.id },
            })
          }
        >
          <HStack className="items-center justify-center">
            <IconSymbol
              name="doc.text"
              size={18}
              color={Colors.light.tabIconDefault}
            />
            <ThemedText className="ml-2 text-primary-700">Documents</ThemedText>
          </HStack>
        </Button>

        <Button
          className="bg-white border border-primary-300 "
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(properties)/edit",
              params: { propertyId: property.id },
            })
          }
        >
          <HStack className="items-center justify-center">
            <IconSymbol
              name="pencil"
              size={18}
              color={Colors.light.tabIconDefault}
            />
            <ThemedText className="ml-2 text-primary-700">Edit</ThemedText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default QuickActions;

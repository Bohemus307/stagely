import { Text } from "react-native";
import React from "react";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { Property } from "../list";
import { Colors } from "react-native/Libraries/NewAppScreen";

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
              params: { propertyId: property.property_id },
            })
          }
        >
          <HStack className="items-center justify-center">
            <IconSymbol
              name="photo"
              size={18}
              color={Colors.light.tabIconDefault}
            />
            <Text className="ml-2 text-primary-700">Manage Photos</Text>
          </HStack>
        </Button>

        <Button
          className="bg-white border border-primary-300 "
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(properties)/documents",
              params: { propertyId: property.property_id },
            })
          }
        >
          <HStack className="items-center justify-center">
            <IconSymbol
              name="doc.text"
              size={18}
              color={Colors.light.tabIconDefault}
            />
            <Text className="ml-2 text-primary-700">View Documents</Text>
          </HStack>
        </Button>

        <Button
          className="bg-white border border-primary-300 "
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(properties)/edit",
              params: { propertyId: property.property_id },
            })
          }
        >
          <HStack className="items-center justify-center">
            <IconSymbol
              name="pencil"
              size={18}
              color={Colors.light.tabIconDefault}
            />
            <Text className="ml-2 text-primary-700">Edit Property</Text>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default QuickActions;

import React from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Property } from "@/lib/@types/properties";

type Props = {
  property: Property;
};

const QuickActions = ({ property }: Props) => {
  return (
    <Box className="bg-primary-50 p-4 mb-2 rounded-2xl">
      <VStack className="gap-1">
        <Button
          className="bg-primary-500"
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(properties)/(photos)",
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
            <ButtonText className="ml-2 text-white">Photos</ButtonText>
          </HStack>
        </Button>

        <Button
          className="bg-primary-500"
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
            <ButtonText className="ml-2 text-white">Documents</ButtonText>
          </HStack>
        </Button>

        <Button
          className="bg-primary-500"
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
            <ButtonText className="ml-2 text-white">Edit</ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default QuickActions;

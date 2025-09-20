import React from "react";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { formatDate } from "../lib/utils/detailsHelpers";
import { ThemedText } from "@/components/ThemedText";
import { Property } from "@/lib/@types/properties";

type Props = {
  property: Property;
};

const PropertyDetails = ({ property }: Props) => {
  return (
    <Box className="bg-primary-50 p-4 mb-3 rounded-2xl">
      <Heading className="text-lg font-semibold mb-3">Property Details</Heading>

      <VStack className="gap-2">
        <HStack className="justify-between">
          <ThemedText className="text-primary-500">Added On</ThemedText>
          <ThemedText className="font-medium">
            {formatDate(property.createdAt)}
          </ThemedText>
        </HStack>

        <Divider className="bg-primary-200" />
        <HStack className="justify-between">
          <ThemedText className="text-primary-500">Last Updated</ThemedText>
          <ThemedText className="font-medium">
            {formatDate(property.updatedAt)}
          </ThemedText>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PropertyDetails;

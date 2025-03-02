import React from "react";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { formatDate } from "../lib/utils/detailsHelpers";
import { Property } from "../list";
import { ThemedText } from "@/components/ThemedText";

type Props = {
  property: Property;
};

const PropertyDetails = ({ property }: Props) => {
  return (
    <Box className="bg-primary-50 p-4 mb-6 rounded-2xl">
      <Heading className="text-lg font-semibold mb-3">Property Details</Heading>

      <VStack className="gap-2">
        <HStack className="justify-between">
          <ThemedText className="text-primary-500">Property ID</ThemedText>
          <ThemedText className="font-medium">
            {property.property_id}
          </ThemedText>
        </HStack>

        <Divider className="bg-primary-200" />

        <HStack className="justify-between">
          <ThemedText className="text-primary-500">Added On</ThemedText>
          <ThemedText className="font-medium">
            {formatDate(property.created_at)}
          </ThemedText>
        </HStack>

        <Divider className="bg-primary-200" />
        <HStack className="justify-between">
          <ThemedText className="text-primary-500">Last Updated</ThemedText>
          <ThemedText className="font-medium">
            {formatDate(property.updated_at)}
          </ThemedText>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PropertyDetails;

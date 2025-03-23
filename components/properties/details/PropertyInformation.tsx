import React from "react";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import PropertyActions from "./PropertyActions";
import PropertyDetails from "./PropertyDetails";
import QuickActions from "./QuickActions";
import RecentIncidents from "./RecentIncidents";

import { getStatusBadge } from "../lib/utils/detailsHelpers";
import { ThemedText } from "@/components/ThemedText";
import { Property } from "@/lib/@types/properties";

type Props = {
  property: Property;
};

const PropertyInformation = ({ property }: Props) => {
  const statusBadge = getStatusBadge(property.status);

  return (
    <Box className="p-4">
      <HStack className="justify-between items-start mb-4">
        <Heading className="text-lg w-3/4 font-bold">
          <ThemedText>{property.address}</ThemedText>
        </Heading>
        <Badge className={`${statusBadge.color} py-1 px-3 rounded-full`}>
          <ThemedText>{statusBadge.text}</ThemedText>
        </Badge>
      </HStack>

      {/* Property Actions */}
      <PropertyActions property={property} />

      {/* Property Details Section */}
      <PropertyDetails property={property} />

      {/* Recent Incidents Section */}
      {property.incidents && property.incidents.length > 0 && (
        <RecentIncidents property={property} />
      )}

      {/* Quick Actions Section */}
      <QuickActions property={property} />
    </Box>
  );
};

export default PropertyInformation;

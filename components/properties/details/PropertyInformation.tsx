import { Text } from 'react-native'
import React from 'react'
import { Badge } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PropertyActions from './PropertyActions';
import PropertyDetails from './PropertyDetails';
import QuickActions from './QuickActions';
import RecentIncidents from './RecentIncidents';
import { Property } from '../list';
import { getStatusBadge } from '../lib/detailsHelpers';

type Props = {
  property: Property;
}

const PropertyInformation = ({ property }: Props) => {
  const statusBadge = getStatusBadge(property.status);
  
  return (
    <Box className="p-4">
      <HStack className="justify-between items-start mb-2">
        <Heading className="text-xl font-bold">{property.address}</Heading>
        <Badge className={`${statusBadge.color} py-1 px-3 rounded-full`}>
          <Text>{statusBadge.text}</Text>
        </Badge>
      </HStack>

      <HStack className="items-center mb-4">
        <IconSymbol name="location.fill" size={16} color="gray" />
        <Text className="ml-1 text-gray-700">
          {property.city}
          {property.state ? `, ${property.state}` : ""} {property.zip_code},{" "}
          {property.country}
        </Text>
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
}

export default PropertyInformation
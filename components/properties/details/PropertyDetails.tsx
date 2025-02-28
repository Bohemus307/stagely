import { Text } from 'react-native'
import React from 'react'
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { formatDate } from '../lib/detailsHelpers';
import { Property } from '../list';

type Props = {
  property: Property
}

const PropertyDetails = ({ property }: Props) => {
  return (
    <Box className="bg-primary-50 p-4 mb-6 rounded-2xl">
      <Heading className="text-lg font-semibold mb-3">Property Details</Heading>

      <VStack className="gap-2">
        <HStack className="justify-between">
          <Text className="text-primary-500">Property ID</Text>
          <Text className="font-medium">{property.property_id}</Text>
        </HStack>

        <Divider className="bg-primary-200" />

        <HStack className="justify-between">
          <Text className="text-primary-500">Added On</Text>
          <Text className="font-medium">{formatDate(property.created_at)}</Text>
        </HStack>

        <Divider className="bg-primary-200" />
        <HStack className="justify-between">
          <Text className="text-primary-500">Last Updated</Text>
          <Text className="font-medium">{formatDate(property.updated_at)}</Text>
        </HStack>
      </VStack>
    </Box>
  );
}

export default PropertyDetails
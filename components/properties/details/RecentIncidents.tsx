import React from 'react'
import { Badge } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';
import { getIncidentStatusBadge, getSeverityBadge, formatDate } from '../lib/detailsHelpers';
import { Property } from '../list';
import { Image } from "@/components/ui/image";
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/ThemedText';

type Props = {
  property: Property
}

const RecentIncidents = ({ property }: Props) => {
  return (
    <Box className="mb-6">
      <Heading className="text-lg font-semibold mb-3">Recent Incidents</Heading>

      <VStack className="gap-3">
        {property?.incidents?.slice(0, 3).map((incident) => (
          <Box
            key={incident.incident_id}
            className="bg-white rounded-lg  p-3"
          >
            <HStack className="justify-between items-start mb-2">
              <ThemedText className="font-medium">{incident.incident_type}</ThemedText>
              <Badge className={getIncidentStatusBadge(incident.status)}>
                <ThemedText className="text-xs">{incident.status}</ThemedText>
              </Badge>
            </HStack>

            <ThemedText className="text-primary-600 text-sm mb-2">
              {incident.description}
            </ThemedText>

            <HStack className="justify-between items-center rounded-2xl">
              <Badge className={getSeverityBadge(incident.severity)}>
                <ThemedText className="text-xs">{incident.severity} Priority</ThemedText>
              </Badge>
              <ThemedText className="text-xs text-primary-500">
                {formatDate(incident.reported_at)}
              </ThemedText>
            </HStack>

            {/* Incident Images Preview */}
            {incident.images && incident.images.length > 0 && (
              <HStack className="mt-3 space-x-2">
                {incident.images.slice(0, 3).map((image) => (
                  <Box
                    key={image.image_id}
                    className="h-16 w-16 rounded overflow-hidden bg-primary-100"
                  >
                    <Image
                      source={{ uri: image.image_url }}
                      alt={image.caption}
                      className="h-full w-full object-cover"
                    />
                  </Box>
                ))}
                {incident.images.length > 3 && (
                  <Box className="h-16 w-16 rounded overflow-hidden bg-primary-200 items-center justify-center">
                    <ThemedText className="text-primary-600 font-medium">
                      +{incident.images.length - 3}
                    </ThemedText>
                  </Box>
                )}
              </HStack>
            )}
          </Box>
        ))}
      </VStack>

      {/* View All Button */}
      {property.incidents && property.incidents.length > 3 && (
        <Button
          className="mt-3 py-2 bg-white"
          onPress={() =>
            router.push({
              pathname: "/incidents",
              params: { propertyId: property.property_id },
            })
          }
        >
          <ThemedText className="text-primary-700 text-center">
            View All {property.incidents.length} Incidents
          </ThemedText>
        </Button>
      )}
    </Box>
  );
}

export default RecentIncidents;
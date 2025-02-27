import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';


export default function MetricsCard() {

  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [incidents, setIncidents] = useState<{ id: number; description: string }[]>([]);

  useEffect(() => {
    setProperties([{ id: 1, name: "Property A" }, { id: 2, name: "Property B" }, { id: 3, name: "Property C" }]);
    setIncidents([{ id: 1, description: "Leak in Property A" }, { id: 2, description: "Power outage in Property B" }]);

  }, []);

return (
  <HStack className="justify-center px-2 mb-5 w-full">
    <Box className="h-20 w-3/5 p-2 rounded-lg border-2 flex items-center justify-center">
      <ThemedText type='subtitle' className="text-center">Active Properties</ThemedText>
        <ThemedView>
      <ThemedText className="text-2xl text-center">{properties.length}</ThemedText>
        </ThemedView>
    </Box>
    <Box className="h-20 w-3/5 p-2 rounded-lg border-2 flex items-center justify-center">
      <ThemedText type='subtitle' className="text-center">Open Incidents</ThemedText>
        <ThemedView>
      <ThemedText className="text-2xl text-center">{incidents.length}</ThemedText>
        </ThemedView>
    </Box>
  </HStack>
  );
}

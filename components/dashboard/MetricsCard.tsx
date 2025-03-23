import { useState, useEffect } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import {
  Property,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  PropertyStatus,
} from "@/lib/@types/properties";

interface MetricItem {
  title: string;
  value: number;
}

export default function MetricsCard(): JSX.Element {
  const [properties, setProperties] = useState<Property[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setProperties([
      {
        id: 1,
        address: "Property A",
        propertyId: 0,
        userId: 0,
        city: "",
        country: "",
        latitude: 0,
        longitude: 0,
        status: PropertyStatus.Active,
        incidentCount: 0,
        openIncidentCount: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 2,
        address: "Property B",
        propertyId: 0,
        userId: 0,
        city: "",
        country: "",
        latitude: 0,
        longitude: 0,
        status: PropertyStatus.Active,
        incidentCount: 0,
        openIncidentCount: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 3,
        address: "Property C",
        propertyId: 0,
        userId: 0,
        city: "",
        country: "",
        latitude: 0,
        longitude: 0,
        status: PropertyStatus.Active,
        incidentCount: 0,
        openIncidentCount: 0,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    setIncidents([
      {
        id: 1,
        description: "Leak in Property A",
        propertyId: 0,
        incidentType: "",
        reportedAt: "",
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Open,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 2,
        description: "Power outage in Property B",
        propertyId: 0,
        incidentType: "",
        reportedAt: "",
        severity: IncidentSeverity.Low,
        status: IncidentStatus.Open,
        createdAt: "",
        updatedAt: "",
      },
    ]);
  }, []);

  const metricItems: MetricItem[] = [
    { title: "Active Properties", value: properties.length },
    { title: "Open Incidents", value: incidents.length },
  ];

  return (
    <ThemedView>
      <Box className="p-2 rounded-2xl flex flex-col items-center justify-center mt-2 mb-0">
        <HStack className="justify-center px-2 mb-2 w-full gap-4">
          {metricItems.map((item, index) => (
            <Box
              key={index}
              className="min-h-24 w-1/2 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white"
            >
              <ThemedText className="text-left text-black font-semibold font-roboto mb-1">
                {item.title}
              </ThemedText>
              <ThemedText className="text-2xl font-semibold font-roboto text-left">
                {item.value}
              </ThemedText>
            </Box>
          ))}
        </HStack>
      </Box>
    </ThemedView>
  );
}

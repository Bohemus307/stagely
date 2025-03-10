import React, { useMemo } from "react";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { properties } from "./data/properties";
import { PropertyStatus } from "./list";

const PropertyMetrics: React.FC = () => {
  const metrics = useMemo(() => {
    // Total count of all properties
    const totalCount = properties.length;

    // Count of active properties
    const activeCount = properties.filter(
      (p) => p.status === PropertyStatus.Active,
    ).length;

    // Count of properties with incidents
    const withIncidentsCount = properties.filter(
      (p) => p.incidents && p.incidents.length > 0,
    ).length;

    return [
      { title: "Total", value: totalCount },
      { title: "Active", value: activeCount },
      { title: "Issues", value: withIncidentsCount },
    ];
  }, []);

  return (
    <Box className="p-2 rounded-2xl flex flex-col items-center justify-center mr-4 mt-2 mb-0">
      <HStack className="justify-between px-2 w-full gap-2">
        {metrics.map((item, index) => (
          <Box
            key={index}
            className={`h-16 w-1/3 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white`}
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
  );
};

export default PropertyMetrics;

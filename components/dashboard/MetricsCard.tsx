import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";

interface MetricItem {
  title: string;
  value: number;
}

export default function MetricsCard(): JSX.Element {
  const { incidents } = useGetIncidents({
    status: "Open",
    severity: undefined,
    page: 1,
    limit: 50,
    sortBy: "reportedAt",
    sortOrder: "desc",
  });
  const { properties } = useGetProperties();

  const metricItems: MetricItem[] = [
    { title: "Active Properties", value: properties?.data?.length },
    { title: "Open Incidents", value: incidents?.length },
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

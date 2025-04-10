import { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { useAuth0 } from "react-native-auth0";
import Constants from "expo-constants";

interface MetricItem {
  title: string;
  value: number;
  isLoading: boolean;
}

interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  maintenanceProperties: number;
  archivedProperties: number;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  totalInspections: number;
  recentlyUpdated?: any[];
}

export default function MetricsCard(): JSX.Element {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const credentials = await getCredentials();
        if (!credentials?.accessToken) {
          throw new Error("Authentication required");
        }

        const response = await fetch(`https://${apiUrl}/properties/stats`, {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const statsData = await response.json();
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [apiUrl, getCredentials]);

  const metricItems: MetricItem[] = [
    {
      title: "Active Properties",
      value: stats?.activeProperties || 0,
      isLoading: isLoading,
    },
    {
      title: "Open Incidents",
      value: stats?.openIncidents || 0,
      isLoading: isLoading,
    },
  ];

  if (error) {
    console.warn("Error loading metrics:", error.message);
  }

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
              {item.isLoading ? (
                <Box className="flex justify-start">
                  <Spinner size="small" />
                </Box>
              ) : (
                <ThemedText className="text-2xl font-semibold font-roboto text-left">
                  {item.value}
                </ThemedText>
              )}
            </Box>
          ))}
        </HStack>
      </Box>
    </ThemedView>
  );
}

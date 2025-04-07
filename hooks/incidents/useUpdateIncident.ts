import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

export interface UpdateIncidentData {
  incidentType?: string;
  description?: string;
  reportedAt?: string;
  resolvedAt?: string | null;
  severity?: "Low" | "Medium" | "High" | "Critical";
  status?: "Open" | "In_Progress" | "Resolved" | "Closed";
  spaceType?: string;
  aiClassified?: boolean;
  images?: {
    id?: number;
    imageUrl: string;
    caption?: string;
    takenAt?: string;
    metadata?: any;
  }[];
}

export const useUpdateIncident = (incidentId: string) => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation({
    mutationFn: async (incidentData: UpdateIncidentData) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/properties/incidents/${incidentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(incidentData),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", incidentId] });
    },
  });

  return {
    updateIncident: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

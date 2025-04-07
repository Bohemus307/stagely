import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

export interface CreateIncidentData {
  propertyId: number;
  incidentType: string;
  description: string;
  reportedAt?: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status?: "Open" | "In_Progress" | "Resolved" | "Closed";
  spaceType?: string;
  aiClassified?: boolean;
  images?: {
    imageUrl: string;
    caption?: string;
    takenAt?: string;
    metadata?: any;
  }[];
}

export const useCreateIncident = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation({
    mutationFn: async (incidentData: CreateIncidentData) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access Token not available");
      }

      const response = await fetch(`https://${apiUrl}/properties/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(incidentData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      if (variables.propertyId) {
        queryClient.invalidateQueries({
          queryKey: ["incidents", { propertyId: variables.propertyId }],
        });
      }
    },
  });

  return {
    createIncident: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

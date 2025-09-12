import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

export interface CreateIncidentData {
  userId?: number;
  propertyId: number;
  incidentType: string;
  description: string;
  reportedAt?: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status?: "Open" | "In_Progress" | "Resolved" | "Closed";
  spaceType?: string;
  spaceId?: number;
  aiClassified?: boolean;
  imageUrl?: string;
  metadata?: any;
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
      console.log(
        "Creating incident with data:",
        JSON.stringify(incidentData, null, 2),
      );
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access Token not available");
      }

      const baseUrl = `https://${apiUrl}`;
      const response = await fetch(`${baseUrl}/properties/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(incidentData),
      });

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch (e) {
          // If error response is not JSON, use the text
          console.error("Error parsing API response:", e);
        }
        throw new Error(errorMessage);
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

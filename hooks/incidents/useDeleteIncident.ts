import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

export const useDeleteIncident = (incidentId: string, propertyId?: number) => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation({
    mutationFn: async () => {
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
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      if (propertyId) {
        queryClient.invalidateQueries({
          queryKey: ["incidents", { propertyId }],
        });
      }
    },
  });

  return {
    deleteIncident: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

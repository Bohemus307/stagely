import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuth0 } from "react-native-auth0";

/**
 * Custom hook to delete a property
 */
export const useDeleteProperty = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!propertyId) {
        throw new Error("Property ID not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Delete property via API
      const response = await fetch(
        `https://${apiUrl}/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        // Try to get the error details from response
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log("Delete error response:", errorData);
          errorMessage =
            errorData.error?.message || errorData.message || errorMessage;
        } catch (e) {
          console.log("Could not parse error response");
        }

        if (response.status === 404) {
          throw new Error("Property not found");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to delete this property");
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data, propertyId) => {
      // Remove the deleted property from the cache
      queryClient.removeQueries({ queryKey: ["property", propertyId] });
      // Invalidate properties list to refresh it
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  return {
    deleteProperty: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

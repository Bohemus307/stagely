import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

// Define interface for the delete response
interface DeletePropertySpaceResponse {
  success: boolean;
  id: number;
}

/**
 * Custom hook to delete a property space
 * @returns Mutation object with mutate function, loading state, error state, and success data
 */
export const useDeletePropertySpace = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Mutation to delete property space
  const deleteMutation = useMutation<
    DeletePropertySpaceResponse,
    Error,
    string // The space ID parameter
  >({
    mutationFn: async (spaceId: string) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Make DELETE request to the backend
      const response = await fetch(
        `https://${apiUrl}/properties/spaces/${spaceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Property space not found");
        }
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data, spaceId) => {
      // Invalidate and refetch property spaces queries to update the cache
      queryClient.invalidateQueries({
        queryKey: ["propertySpaces"],
      });

      // You might also want to remove the specific space from cache
      // if you have individual space queries
      queryClient.invalidateQueries({
        queryKey: ["propertySpace", spaceId],
      });
    },
  });

  return {
    deletePropertySpace: deleteMutation.mutate,
    deletePropertySpaceAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    deleteSuccess: deleteMutation.isSuccess,
    deleteData: deleteMutation.data,
    reset: deleteMutation.reset,
  };
};

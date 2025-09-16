import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuth0 } from "react-native-auth0";

interface UpdatePropertyData {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export const useUpdateProperty = (propertyId: string) => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation({
    mutationFn: async (updateData: UpdatePropertyData) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/properties/${propertyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    },
    onSuccess: async (updatedProperty) => {
      // Update individual property cache
      queryClient.setQueryData(["property", propertyId], updatedProperty);

      queryClient.invalidateQueries({
        queryKey: ["properties"],
        exact: false,
      });

      // 3. Also force an immediate refetch of the most common property queries
      await Promise.all([
        // Refetch the main properties list (used by PropertiesScreen)
        queryClient.refetchQueries({
          queryKey: [
            "properties",
            1,
            10,
            undefined,
            undefined,
            undefined,
            "updatedAt",
            "desc",
            "",
          ],
          exact: true,
        }),
        // Refetch the search query (used by usePropertySearch)
        queryClient.refetchQueries({
          queryKey: ["properties", "", 1, 10],
          exact: true,
        }),
      ]);
    },
    onError: (error) => {
      console.error("❌ Property update failed:", error);
    },
  });

  return {
    updateProperty: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};

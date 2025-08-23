import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { PropertySpace, SpaceType } from "@/lib/@types/properties";

export interface ObjectLabel {
  name: string;
  confidence: number;
  category?: string;
}

// Define interface for update parameters
interface UpdatePropertySpaceData {
  name?: string | null;
  type?: SpaceType;
  aiGenerated?: boolean;
  featureVector?: object | null;
  confidenceScore?: string | null;
  objectLabels?: ObjectLabel[];
}

// Define the mutation variables interface
interface UpdatePropertySpaceMutationVariables {
  spaceId: string;
  data: UpdatePropertySpaceData;
}

/**
 * Custom hook to update a property space
 * @returns Mutation functions and states for updating a property space
 */
export const useUpdatePropertySpace = () => {
  const {
    getCredentials,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Mutation to update property space
  const mutation = useMutation<
    PropertySpace,
    Error,
    UpdatePropertySpaceMutationVariables
  >({
    mutationFn: async ({ spaceId, data }) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Make the PUT request
      const response = await fetch(
        `https://${apiUrl}/properties/spaces/${spaceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(data),
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
    onSuccess: (updatedSpace) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: ["propertySpaces", updatedSpace.propertyId],
      });

      // Optionally update the specific space in cache if you have individual space queries
      queryClient.setQueryData(
        ["propertySpace", updatedSpace.id],
        updatedSpace,
      );
    },
  });

  return {
    updatePropertySpace: mutation.mutate,
    updatePropertySpaceAsync: mutation.mutateAsync,
    isLoading: authLoading || mutation.isPending,
    error: authError || mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    reset: mutation.reset,
    data: mutation.data,
  };
};

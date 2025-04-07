import { useAuth0 } from "react-native-auth0";
import { useMutation } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Image analysis data interface
 */
export interface AnalyzeImageData {
  propertyId: number;
  imageUrl: string;
}

/**
 * Custom hook to analyze an image and detect incidents
 */
export const useAnalyzeIncidentImage = () => {
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Mutation to analyze image in backend
  const mutation = useMutation({
    mutationFn: async (imageData: AnalyzeImageData) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Analyze image in the backend
      const response = await fetch(
        `https://${apiUrl}/properties/incidents/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(imageData),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
  });

  return {
    analyzeImage: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

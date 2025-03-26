import { useAuth0 } from "react-native-auth0";
import Constants from "expo-constants";
import { User } from "@/lib/@types/properties";

export interface UserMutationParams {
  userId: string;
  endpoint: string;
  method: "PUT" | "POST" | "DELETE" | "PATCH";
}

// This hook provides the core functionality for any user-related API mutations
export const useUserMutation = <T = User, D = any>({
  userId,
  endpoint,
  method,
}: UserMutationParams) => {
  const { getCredentials } = useAuth0();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutate = async (data: D): Promise<T> => {
    if (!apiUrl) {
      throw new Error("API URL not available");
    }

    const credentials = await getCredentials();

    if (!credentials?.accessToken) {
      throw new Error("Access token not available");
    }

    const url = `https://${apiUrl}${endpoint}`.replace("{userId}", userId);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API error: ${response.status}`,
      );
    }

    return response.json();
  };

  return mutate;
};

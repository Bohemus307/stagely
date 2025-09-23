import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

interface DeleteResponse {
  success: boolean;
  id: number;
  auth0Deleted: boolean;
  message: string;
}
export const useDeleteUser = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation<DeleteResponse, Error, string>({
    mutationFn: async (userId: string) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!userId) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(`https://${apiUrl}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        if (response.status === 409) {
          throw new Error("User is already deleted");
        }
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    deleteUser: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

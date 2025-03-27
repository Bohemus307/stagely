import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

export const useUpdateUser = (userId?: string) => {
  const { getCredentials, user: auth0User } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const mutation = useMutation<any, Error, UpdateUserData>({
    mutationFn: async (userData: UpdateUserData) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // If userId is not provided directly, try to get it from currentUser query cache
      let id = userId;
      if (!id) {
        const currentUser = queryClient.getQueryData<any>([
          "currentUser",
          auth0User?.sub,
        ]);
        id = currentUser?.id?.toString();

        if (!id) {
          throw new Error("User ID not available");
        }
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(`https://${apiUrl}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update error response:", errorText);

        if (response.status === 404) {
          throw new Error("User not found");
        }
        if (response.status === 409) {
          throw new Error("Email already in use");
        }
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();

      return responseData;
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["user", userId] });
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Force refetch of current user data
      queryClient.refetchQueries({ queryKey: ["currentUser"] });
    },
  });

  return {
    updateUser: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/@types/properties";
import { useUserMutation } from "@/hooks/profile/useUserMutation";

export interface UserUpdateData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

export const useEditUser = (userId: string) => {
  const queryClient = useQueryClient();

  // Use the core mutation hook
  const userMutate = useUserMutation<User, UserUpdateData>({
    userId,
    endpoint: "/users/{userId}",
    method: "PUT",
  });

  // Wrap the core mutation with React Query's useMutation
  const mutation = useMutation<User, Error, UserUpdateData>({
    mutationFn: userMutate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    updateEditUser: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

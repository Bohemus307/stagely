import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

export const useGetConversations = (limit = 20) => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/messaging/conversations?userId=${backendUser.id}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const conversationsData = await response.json();

      const allParticipantIds = new Set<number>();
      conversationsData.conversations?.forEach((conv: any) => {
        conv.participants?.forEach((id: number) => {
          if (id !== backendUser.id) {
            allParticipantIds.add(id);
          }
        });
      });

      const participantDetails: { [key: number]: any } = {};

      if (allParticipantIds.size > 0) {
        const participantIdsArray = Array.from(allParticipantIds);

        const userPromises = participantIdsArray.map(async (userId) => {
          try {
            const userResponse = await fetch(
              `https://${apiUrl}/users/${userId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${credentials.accessToken}`,
                },
              },
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();
              return { id: userId, ...userData };
            }
          } catch (error) {
            console.warn(`Failed to fetch user ${userId}:`, error);
          }
          return null;
        });

        const userResults = await Promise.all(userPromises);

        userResults.forEach((user) => {
          if (user) {
            participantDetails[user.id] = user;
          }
        });
      }

      return (
        conversationsData.conversations?.map((conv: any) => {
          const otherParticipants =
            conv.participants?.filter((p: number) => p !== backendUser?.id) ||
            [];

          // Get participant details for this conversation
          const participantNames: string[] = [];
          const participantEmails: string[] = [];
          const participantFirstNames: string[] = [];
          const participantLastNames: string[] = [];
          const participantAvatars: (string | null)[] = [];

          let otherParticipant = null;

          otherParticipants.forEach((participantId: number) => {
            const participant = participantDetails[participantId];

            if (participant) {
              // Build name - handle different response structures
              let displayName = "User";
              let firstName = participant.firstName;
              let lastName = participant.lastName;
              let email = participant.email;
              let avatar = participant.profilePictureUrl;

              // Handle different API response structures
              if (participant.user) {
                firstName = participant.user.firstName || participant.firstName;
                lastName = participant.user.lastName || participant.lastName;
                email = participant.user.email || participant.email;
                avatar =
                  participant.user.profilePictureUrl ||
                  participant.profilePictureUrl;
              }

              if (firstName && lastName) {
                if (!(firstName === "Invited" && lastName === "User")) {
                  displayName = `${firstName} ${lastName}`;
                } else if (email) {
                  // Create name from email for invited users
                  const emailUsername = email.split("@")[0];
                  displayName = emailUsername
                    .replace(/[._-]/g, " ")
                    .split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(" ");
                }
              } else if (email) {
                // Create name from email
                const emailUsername = email.split("@")[0];
                displayName = emailUsername
                  .replace(/[._-]/g, " ")
                  .split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1),
                  )
                  .join(" ");
              }

              participantNames.push(displayName);
              participantEmails.push(email || "");
              participantFirstNames.push(firstName || "");
              participantLastNames.push(lastName || "");
              participantAvatars.push(avatar || null);

              // For one-on-one conversations, set the other participant
              if (otherParticipants.length === 1) {
                otherParticipant = {
                  id: participantId,
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  profilePictureUrl: avatar,
                  name: displayName,
                };
              }
            } else {
              // Fallback if we couldn't fetch participant details
              participantNames.push(`User ${participantId}`);
              participantEmails.push("");
              participantFirstNames.push("");
              participantLastNames.push("");
              participantAvatars.push(null);
            }
          });

          return {
            ...conv,
            participantNames,
            participantEmails,
            participantFirstNames,
            participantLastNames,
            participantAvatars,
            otherParticipant,
          };
        }) || []
      );
    },
    enabled: !!apiUrl && !!backendUser?.id,
  });

  return {
    conversations: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useGetConversation = (conversationId: string) => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}?userId=${backendUser.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const conversationData = await response.json();

      const otherParticipants =
        conversationData.conversation?.participants?.filter(
          (p: number) => p !== backendUser?.id,
        ) || [];

      const participantNames: string[] = [];
      const participantAvatars: (string | null)[] = [];

      for (const participantId of otherParticipants) {
        try {
          const userResponse = await fetch(
            `https://${apiUrl}/users/${participantId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${credentials.accessToken}`,
              },
            },
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            let displayName = "User";

            // Handle different API response structures
            let firstName = userData.firstName;
            let lastName = userData.lastName;
            let email = userData.email;
            let avatar = userData.profilePictureUrl;

            if (userData.user) {
              firstName = userData.user.firstName || userData.firstName;
              lastName = userData.user.lastName || userData.lastName;
              email = userData.user.email || userData.email;
              avatar =
                userData.user.profilePictureUrl || userData.profilePictureUrl;
            }

            if (firstName && lastName) {
              if (!(firstName === "Invited" && lastName === "User")) {
                displayName = `${firstName} ${lastName}`;
              } else if (email) {
                const emailUsername = email.split("@")[0];
                displayName = emailUsername
                  .replace(/[._-]/g, " ")
                  .split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1),
                  )
                  .join(" ");
              }
            } else if (email) {
              const emailUsername = email.split("@")[0];
              displayName = emailUsername
                .replace(/[._-]/g, " ")
                .split(" ")
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1),
                )
                .join(" ");
            }

            participantNames.push(displayName);
            participantAvatars.push(avatar || null);
          } else {
            participantNames.push(`User ${participantId}`);
            participantAvatars.push(null);
          }
        } catch (error) {
          console.warn(`Failed to fetch user ${participantId}:`, error);
          participantNames.push(`User ${participantId}`);
          participantAvatars.push(null);
        }
      }

      return {
        ...conversationData,
        conversation: {
          ...conversationData.conversation,
          participantNames,
          participantAvatars,
        },
      };
    },
    enabled: !!apiUrl && !!conversationId && !!backendUser?.id,
  });

  return {
    conversation: data?.conversation || null,
    isLoading,
    error,
    refetch,
  };
};

export const useGetUnreadCount = () => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/messaging/unread-count?userId=${backendUser.id}`,
        {
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
    enabled: !!apiUrl && !!backendUser?.id,
  });

  return {
    unreadCount: data?.unreadCount || 0,
    conversationsWithUnread: data?.conversationsWithUnread || [],
    isLoading,
    error,
    refetch,
  };
};

import { Message } from "@/lib/@types/messages";

/**
 * Filters messages based on search query and status filter
 * @param messages Array of messages to filter
 * @param searchQuery Text to search for in message data
 * @param statusFilter Status filter to apply (Unread, Urgent, or null for all)
 * @returns Filtered array of messages
 */
export const filterMessages = (
  messages: Message[],
  searchQuery: string = "",
  statusFilter: string | null = null,
): Message[] => {
  return messages.filter((message) => {
    // Text search filter
    const matchesSearch =
      message.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "Unread") {
      matchesStatus = message.unread;
    } else if (statusFilter === "Urgent") {
      matchesStatus = !!message.urgent;
    }

    return matchesSearch && matchesStatus;
  });
};

/**
 * Get display name for a user/participant
 * Handles placeholder users, invited users, and email-based names
 */
export const getDisplayName = (participant: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
}): string => {
  // Use firstName + lastName if both exist and not placeholder
  if (
    participant.firstName &&
    participant.lastName &&
    !(participant.firstName === "Invited" && participant.lastName === "User")
  ) {
    return `${participant.firstName} ${participant.lastName}`;
  }

  // Use name if it exists and isn't placeholder
  if (
    participant.name &&
    participant.name !== "Invited User" &&
    participant.name.trim() !== ""
  ) {
    return participant.name;
  }

  // Fall back to email username if available
  if (participant.email) {
    const emailUsername = participant.email.split("@")[0];
    return emailUsername
      .replace(/[._-]/g, " ")
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "User";
};

/**
 * Check if user is a placeholder (invited but not registered)
 */
export const isPlaceholderUser = (participant: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  isPlaceholder?: boolean;
}): boolean => {
  if (participant.isPlaceholder) return true;

  return (
    !participant.firstName ||
    !participant.lastName ||
    participant.firstName === "Invited" ||
    participant.lastName === "User" ||
    participant.name === "Invited User" ||
    !participant.name ||
    participant.name.trim() === ""
  );
};

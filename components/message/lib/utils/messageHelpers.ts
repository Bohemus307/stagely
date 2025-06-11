import { Message } from "@/components/message/data/messages";

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

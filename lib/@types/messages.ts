// Types for Data Structure
export interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string; // Add email field
  firstName?: string; // Add firstName field
  lastName?: string; // Add lastName field
}

export interface User {
  lastMessageTime: string;
  lastMessage: string;
  conversationId: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

export interface Conversation {
  conversationId: string;
  participants?: number[];
  participantNames?: string[];
  participantAvatars?: string[];
  participantEmails?: string[];
  participantFirstNames?: string[];
  participantLastNames?: string[];
  lastMessageText?: string;
  lastMessageTime?: number;
  unreadCount?: Record<string, number>;
  // Add these fields if your API provides participant details
  otherParticipant?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePictureUrl?: string;
    name?: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: string;
  status?: "sent" | "delivered" | "read" | "error";
}

// Fix the Message interface to use MessageUser instead of inline type
export interface Message {
  id: string;
  user: MessageUser; // Changed from inline type to MessageUser interface
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  urgent?: boolean;
  propertyId?: number;
  propertyName?: string;
}

// Type definitions for dictionaries
export interface UserDictionary {
  [key: string]: MessageUser;
}

export interface ConversationDictionary {
  [key: string]: ChatMessage[];
}

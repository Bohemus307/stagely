// Define interfaces first
export interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
  role: "owner" | "cleaner" | "manager";
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: string;
  status?: "sent" | "delivered" | "read";
}

export interface Message {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: "owner" | "cleaner" | "manager";
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
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

// Mock messages list (renamed from the first mockUsers)
export const mockMessages: Message[] = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      role: "cleaner", // Now using the correct union type
    },
    lastMessage: "I finished cleaning the property. Everything looks good!",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
    unread: true,
    propertyId: 1,
    propertyName: "588 Cortez St",
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "manager", // Now using the correct union type
    },
    lastMessage: "Let's discuss the new maintenance schedule for next month.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    unread: false,
    propertyId: 2,
    propertyName: "742 Evergreen Terrace",
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Mike Peterson",
      role: "cleaner", // Now using the correct union type
    },
    lastMessage:
      "I found a broken window in the kitchen. Should I report this as an incident?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unread: true,
    propertyId: 3,
    propertyName: "221B Baker St",
  },
  {
    id: "4",
    user: {
      id: "u4",
      name: "Emma Wilson",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      role: "owner", // Now using the correct union type
    },
    lastMessage: "Thanks for taking care of that issue so quickly!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    unread: false,
    propertyId: 5,
    propertyName: "350 Fifth Avenue",
  },
  {
    id: "5",
    user: {
      id: "u5",
      name: "Alex Rodriguez",
      role: "cleaner", // Now using the correct union type
    },
    lastMessage: "I'll be there at 10 AM tomorrow to clean the property.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    unread: false,
    propertyId: 6,
    propertyName: "123 Main St",
  },
];

// User dictionary with proper type
export const mockUsers: UserDictionary = {
  u1: {
    id: "u1",
    name: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "cleaner",
  },
  u2: {
    id: "u2",
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "manager",
  },
  u3: {
    id: "u3",
    name: "Mike Peterson",
    role: "cleaner",
  },
  u4: {
    id: "u4",
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    role: "owner",
  },
  u5: {
    id: "u5",
    name: "Alex Rodriguez",
    role: "cleaner",
  },
  "current-user": {
    id: "current-user",
    name: "You",
    role: "owner",
  },
};

// Conversation dictionary with proper type
export const mockConversations: ConversationDictionary = {
  u1: [
    {
      id: "1",
      text: "Hello, I'm here to clean the property.",
      timestamp: "2025-02-28T09:30:00Z",
      sender: "u1",
    },
    {
      id: "2",
      text: "Great! The key is under the mat.",
      timestamp: "2025-02-28T09:32:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "3",
      text: "Thanks, I got it.",
      timestamp: "2025-02-28T09:35:00Z",
      sender: "u1",
    },
    {
      id: "4",
      text: "I noticed the kitchen sink is leaking a bit. Should I fix it?",
      timestamp: "2025-02-28T10:15:00Z",
      sender: "u1",
    },
    {
      id: "5",
      text: "Yes please, if you can. There should be tools in the garage.",
      timestamp: "2025-02-28T10:18:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "6",
      text: "I finished cleaning the property. Everything looks good!",
      timestamp: "2025-02-28T12:30:00Z",
      sender: "u1",
    },
  ],
  u2: [
    {
      id: "1",
      text: "Hi, I'd like to discuss the maintenance schedule for next month.",
      timestamp: "2025-02-27T14:00:00Z",
      sender: "u2",
    },
    {
      id: "2",
      text: "Sure, what do you have in mind?",
      timestamp: "2025-02-27T14:10:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "3",
      text: "Let's discuss the new maintenance schedule for next month. I think we should increase cleaning frequency.",
      timestamp: "2025-02-27T14:15:00Z",
      sender: "u2",
    },
  ],
  u3: [
    {
      id: "1",
      text: "I found a broken window in the kitchen. Should I report this as an incident?",
      timestamp: "2025-02-28T08:10:00Z",
      sender: "u3",
    },
  ],
  u4: [
    {
      id: "1",
      text: "Hi there! Just wanted to say thanks for taking care of that issue so quickly.",
      timestamp: "2025-02-26T15:30:00Z",
      sender: "u4",
    },
    {
      id: "2",
      text: "You're welcome! Let me know if you need anything else.",
      timestamp: "2025-02-26T16:00:00Z",
      sender: "current-user",
      status: "read",
    },
  ],
  u5: [
    {
      id: "1",
      text: "I'll be there at 10 AM tomorrow to clean the property.",
      timestamp: "2025-02-25T09:00:00Z",
      sender: "u5",
    },
    {
      id: "2",
      text: "Sounds good, thanks for letting me know.",
      timestamp: "2025-02-25T09:15:00Z",
      sender: "current-user",
      status: "read",
    },
  ],
};

//Types for Data Structure
export interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
}

// components/message/data/messages.ts

export interface Message {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: string;
  status?: "sent" | "delivered" | "read" | "error";
}
// Type definitions for dictionaries
export interface UserDictionary {
  [key: string]: MessageUser;
}

export interface ConversationDictionary {
  [key: string]: ChatMessage[];
}

// Mock data for testing messages functionality

export const mockUsers = {
  user1: {
    id: "user1",
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  user2: {
    id: "user2",
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
  },
  user3: {
    id: "user3",
    name: "Emma Williams",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  user4: {
    id: "user4",
    name: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  user5: {
    id: "user5",
    name: "David Thompson",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
  },
};

export const mockMessages = [
  {
    id: "msg1",
    user: mockUsers["user1"],
    lastMessage: "The bathroom sink is clogged again. Can someone take a look?",
    timestamp: "2025-02-28T09:30:00Z",
    unread: true,
    urgent: true,
    propertyId: 1,
    propertyName: "588 Cortez St",
  },
  {
    id: "msg2",
    user: mockUsers["user2"],
    lastMessage: "When will the painters finish with the living room?",
    timestamp: "2025-02-27T16:45:00Z",
    unread: false,
    propertyId: 2,
    propertyName: "742 Evergreen Terrace",
  },
  {
    id: "msg3",
    user: mockUsers["user3"],
    lastMessage: "I've approved the maintenance request for next Tuesday.",
    timestamp: "2025-02-27T11:20:00Z",
    unread: false,
    propertyId: 3,
    propertyName: "221B Baker St",
  },
  {
    id: "msg4",
    user: mockUsers["user4"],
    lastMessage:
      "There's water leaking from the ceiling! Please send help ASAP!",
    timestamp: "2025-02-28T08:15:00Z",
    unread: true,
    urgent: true,
    propertyId: 5,
    propertyName: "350 Fifth Avenue",
  },
  {
    id: "msg5",
    user: mockUsers["user5"],
    lastMessage: "Just confirming our appointment tomorrow at 2pm.",
    timestamp: "2025-02-26T15:30:00Z",
    unread: false,
    propertyId: 6,
    propertyName: "123 Main St",
  },
];

export const mockConversations = {
  user1: [
    {
      id: "conv1_1",
      text: "Hi, I've noticed the bathroom sink is draining slowly. I think it might be clogged.",
      timestamp: "2025-02-27T14:20:00Z",
      sender: "user1",
    },
    {
      id: "conv1_2",
      text: "Thanks for reporting this. We'll schedule a plumber to take a look.",
      timestamp: "2025-02-27T14:35:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "conv1_3",
      text: "Great, thank you! When do you think they'll be able to come?",
      timestamp: "2025-02-27T14:40:00Z",
      sender: "user1",
    },
    {
      id: "conv1_4",
      text: "We should be able to have someone there tomorrow morning between 9-11am. Does that work for you?",
      timestamp: "2025-02-27T15:05:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "conv1_5",
      text: "Yes, that works perfectly. Thank you!",
      timestamp: "2025-02-27T15:10:00Z",
      sender: "user1",
    },
    {
      id: "conv1_6",
      text: "The bathroom sink is clogged again. Can someone take a look?",
      timestamp: "2025-02-28T09:30:00Z",
      sender: "user1",
    },
  ],
  user2: [
    {
      id: "conv2_1",
      text: "Hello, just wanted to check when the painters will be finished with the living room?",
      timestamp: "2025-02-27T16:30:00Z",
      sender: "user2",
    },
    {
      id: "conv2_2",
      text: "Hi Michael, they should be done by Friday afternoon.",
      timestamp: "2025-02-27T16:40:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "conv2_3",
      text: "When will the painters finish with the living room?",
      timestamp: "2025-02-27T16:45:00Z",
      sender: "user2",
    },
  ],
  user3: [
    {
      id: "conv3_1",
      text: "I've reviewed the maintenance request for next Tuesday.",
      timestamp: "2025-02-27T11:10:00Z",
      sender: "user3",
    },
    {
      id: "conv3_2",
      text: "Thank you for looking into it. Do you need any additional information?",
      timestamp: "2025-02-27T11:15:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "conv3_3",
      text: "I've approved the maintenance request for next Tuesday.",
      timestamp: "2025-02-27T11:20:00Z",
      sender: "user3",
    },
  ],
  user4: [
    {
      id: "conv4_1",
      text: "There's water leaking from the ceiling! Please send help ASAP!",
      timestamp: "2025-02-28T08:15:00Z",
      sender: "user4",
    },
  ],
  user5: [
    {
      id: "conv5_1",
      text: "Hello, I wanted to confirm our appointment for tomorrow.",
      timestamp: "2025-02-26T15:20:00Z",
      sender: "user5",
    },
    {
      id: "conv5_2",
      text: "Yes, we're scheduled for 2pm at the property. I'll be there.",
      timestamp: "2025-02-26T15:25:00Z",
      sender: "current-user",
      status: "read",
    },
    {
      id: "conv5_3",
      text: "Just confirming our appointment tomorrow at 2pm.",
      timestamp: "2025-02-26T15:30:00Z",
      sender: "user5",
    },
  ],
};

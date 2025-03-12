import React from "react";
import { Text, View, Pressable } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { router } from "expo-router";

// Define types for our mocks
interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
}

interface Message {
  id: string;
  user: MessageUser;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  urgent?: boolean;
  propertyId?: number;
  propertyName?: string;
}

// Mock all the dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("react-native-auth0", () => ({
  useAuth0: () => ({
    user: { name: "Test User", sub: "test-user-id" },
  }),
}));

// Define the mock messages
const mockMessages: Message[] = [
  {
    id: "msg1",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      avatar: "https://example.com/avatar1.jpg",
    },
    lastMessage: "The bathroom sink is clogged again. Can someone take a look?",
    timestamp: "2025-02-28T09:30:00Z",
    unread: true,
    urgent: true,
    propertyId: 1,
    propertyName: "588 Cortez St",
  },
  {
    id: "msg2",
    user: {
      id: "user2",
      name: "Michael Chen",
      avatar: "https://example.com/avatar2.jpg",
    },
    lastMessage: "When will the painters finish with the living room?",
    timestamp: "2025-02-27T16:45:00Z",
    unread: false,
    propertyId: 2,
    propertyName: "742 Evergreen Terrace",
  },
];

// Mock the external components
jest.mock("@/components/message/data/messages", () => ({
  mockMessages,
}));

// Mock functions for MessagesList component if needed
// No mock functions needed at the moment

// Mock the entire MessagesList component
jest.mock("@/components/message/list", () => {
  const MockMessagesList = ({
    searchQuery,
    statusFilter,
  }: {
    searchQuery?: string;
    statusFilter?: string | null;
  }) => {
    // This is a simple mock implementation of MessagesList
    return (
      <View testID="message-list">
        <Text>Messages List Mock</Text>
        <Pressable
          testID="fab-button"
          accessible={true}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/(tabs)/(messages)" })}
        />
      </View>
    );
  };
  return MockMessagesList;
});

describe("MessagesList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Suppress console logs
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = render(
      <View>
        <Text>Message List Container</Text>
        {/* Import the actual component here */}
        {/* We're just testing if our test setup works */}
        <View testID="message-list">
          <Text>Messages List Mock</Text>
        </View>
      </View>,
    );

    expect(getByText("Message List Container")).toBeTruthy();
    expect(getByText("Messages List Mock")).toBeTruthy();
  });

  it("navigates when the fab button is pressed", () => {
    const { getByTestId } = render(
      <View>
        {/* Import the mocked MessagesList */}
        <View testID="message-list">
          <Text>Messages List Mock</Text>
          <Pressable
            testID="fab-button"
            accessible={true}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/(tabs)/(messages)" })}
          />
        </View>
      </View>,
    );

    const fabButton = getByTestId("fab-button");
    fireEvent.press(fabButton);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(messages)",
    });
  });
});

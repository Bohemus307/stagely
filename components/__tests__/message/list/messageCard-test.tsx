import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text, View } from "react-native";
import MessageCard from "@/components/message/list/MessageCard";

// Mock Message interface
interface Message {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  urgent?: boolean;
}

// Mock the dependencies
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    type,
    className,
    numberOfLines,
  }: {
    children: React.ReactNode;
    type?: string;
    className?: string;
    numberOfLines?: number;
  }) => <Text numberOfLines={numberOfLines}>{children}</Text>,
}));

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="hstack">{children}</View>,
}));

jest.mock("@/components/ui/vstack", () => ({
  VStack: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="vstack">{children}</View>,
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({
    children,
    size,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    className?: string;
  }) => <View testID="avatar">{children}</View>,
  AvatarImage: ({ source }: { source: { uri: string } }) => (
    <View testID="avatar-image" />
  ),
  AvatarFallbackText: ({ children }: { children: React.ReactNode }) => (
    <Text testID="avatar-fallback">{children}</Text>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="badge">{children}</View>,
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="box">{children}</View>,
}));

jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => <View testID={`icon-${name}`} />,
}));

// Mock formatDate helper function
jest.mock("@/components/message/lib/utils/timeHelpers", () => ({
  formatDate: jest.fn((date) => `Formatted: ${date}`),
}));

describe("MessageCard Component", () => {
  // Sample message data
  const mockMessage: Message = {
    id: "msg1",
    user: {
      id: "user1",
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
    },
    lastMessage: "Hello, how are you?",
    timestamp: "2025-02-28T10:30:00Z",
    unread: true,
    urgent: false,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with basic message data correctly", () => {
    const { getByText } = render(
      <MessageCard message={mockMessage} onPress={mockOnPress} />,
    );

    // Check if user name is displayed
    expect(getByText("John Doe")).toBeTruthy();

    // Check if last message is displayed
    expect(getByText("Hello, how are you?")).toBeTruthy();

    // Check if formatted timestamp is displayed
    expect(getByText("Formatted: 2025-02-28T10:30:00Z")).toBeTruthy();
  });
});

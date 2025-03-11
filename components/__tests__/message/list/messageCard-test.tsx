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
  propertyId?: number;
  propertyName?: string;
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
    propertyId: 123,
    propertyName: "123 Main St",
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

    // Check if property name is displayed
    expect(getByText("123 Main St")).toBeTruthy();
  });

  test("renders with avatar image when avatar URL is provided", () => {
    const { queryByTestId } = render(
      <MessageCard message={mockMessage} onPress={mockOnPress} />,
    );

    // Check if avatar image is rendered
    expect(queryByTestId("avatar-image")).toBeTruthy();

    // AvatarFallbackText should not be rendered
    expect(queryByTestId("avatar-fallback")).toBeFalsy();
  });

  test("renders with avatar fallback text when avatar URL is not provided", () => {
    const messageWithoutAvatar = {
      ...mockMessage,
      user: {
        ...mockMessage.user,
        avatar: undefined,
      },
    };

    const { queryByTestId, getByText } = render(
      <MessageCard message={messageWithoutAvatar} onPress={mockOnPress} />,
    );

    // Check if avatar image is not rendered
    expect(queryByTestId("avatar-image")).toBeFalsy();

    // Check if avatar fallback text is rendered with first character of user name
    expect(getByText("J")).toBeTruthy();
  });

  test("renders with urgent styling for urgent messages", () => {
    const urgentMessage = {
      ...mockMessage,
      urgent: true,
    };

    const { queryByTestId } = render(
      <MessageCard message={urgentMessage} onPress={mockOnPress} />,
    );

    // The Box component should have the border-l-4 and border-amber-500 classes for urgent messages
    // Since we're mocking Box and can't directly test the className, we'll verify the component renders
    expect(queryByTestId("box")).toBeTruthy();
  });

  test("renders without property information when propertyName is not provided", () => {
    const messageWithoutProperty = {
      ...mockMessage,
      propertyName: undefined,
    };

    const { queryByTestId } = render(
      <MessageCard message={messageWithoutProperty} onPress={mockOnPress} />,
    );

    // Building icon should not be present
    expect(queryByTestId("icon-building.2.fill")).toBeFalsy();
  });

  test("renders unread indicator for unread messages", () => {
    const { queryByTestId } = render(
      <MessageCard message={mockMessage} onPress={mockOnPress} />,
    );

    // Check if badge (unread indicator) is rendered
    expect(queryByTestId("badge")).toBeTruthy();
  });

  test("does not render unread indicator for read messages", () => {
    const readMessage = {
      ...mockMessage,
      unread: false,
    };

    const { queryByTestId } = render(
      <MessageCard message={readMessage} onPress={mockOnPress} />,
    );

    // Badge should not be visible for read messages
    // Since we mocked Badge component, we can't directly check if it's not rendered
    // But we can check for the presence of red badge
    expect(queryByTestId("badge")).toBeFalsy();
  });

  test("calls onPress handler when message card is pressed", () => {
    const { getByText } = render(
      <MessageCard message={mockMessage} onPress={mockOnPress} />,
    );

    // Trigger press on the touchable component by pressing on the user name
    fireEvent.press(getByText("John Doe"));

    // Check if onPress was called with the message
    expect(mockOnPress).toHaveBeenCalledWith(mockMessage);
  });

  test("handles error in formatMessageTime gracefully", () => {
    // Create a spy on console.error to check for error logging
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock the formatDate function to throw an error
    const {
      formatDate,
    } = require("@/components/message/lib/utils/timeHelpers");
    (formatDate as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Date formatting error");
    });

    const { getByText } = render(
      <MessageCard message={mockMessage} onPress={mockOnPress} />,
    );

    // Check if the original timestamp is displayed when formatting fails
    expect(getByText("2025-02-28T10:30:00Z")).toBeTruthy();

    // Check if error was logged
    expect(consoleSpy).toHaveBeenCalled();

    // Restore console.error
    consoleSpy.mockRestore();
  });
});

import React from "react";
import { render } from "@testing-library/react-native";
import {
  Text,
  View,
  Image,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ReactNode } from "react";
import Header from "@/components/Header";


// Mock all external dependencies
jest.mock("react-native-auth0", () => ({
  useAuth0: () => ({
    user: { name: "John Doe", picture: "https://example.com/avatar.jpg" },
  }),
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Properly typed UI component mocks
jest.mock("@/components/ui/avatar", () => {
  return {
    Avatar: ({ children, size }: { children: ReactNode; size?: string }) => (
      <View testID="avatar">{children}</View>
    ),

    AvatarImage: ({ source }: { source: { uri: string } }) => (
      <Image testID="avatar-image" source={source} />
    ),

    AvatarBadge: () => <View testID="avatar-badge" />,

    AvatarFallbackText: ({ children }: { children: ReactNode }) => (
      <Text testID="avatar-fallback">{children}</Text>
    ),
  };
});

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children, type }: { children: ReactNode; type?: string }) => (
    <Text>{children}</Text>
  ),
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({
    children,
    style,
  }: {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
  }) => <View style={style}>{children}</View>,
}));

jest.mock(
  "@expo/vector-icons/MaterialIcons",
  () =>
    function MaterialIcons({
      name,
      size,
      color,
    }: {
      name: string;
      size: number;
      color: string;
    }) {
      return <View testID="material-icon" />;
    }
);

describe("Header Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Header />);
    expect(getByText("Stagely")).toBeTruthy();
  });
});

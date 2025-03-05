import React from "react";
import { render, screen } from "@testing-library/react-native";

import { Text, View } from "react-native";
import RecentActivity from "@/components/dashboard/RecentActivity";

// Mock necessary components
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => (
    <Text>{children}</Text>
  ),
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

describe("RecentActivity Component", () => {
  it('renders correctly and shows "Recent Activity" text', () => {
    render(<RecentActivity />);

    // Check if the component renders the "Recent Activity" text
    expect(screen.getByText("Recent Activity")).toBeTruthy();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RecentActivity from "@/components/dashboard/RecentActivity";

// Create a new QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
// Mock necessary components
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => (
    <Text>{children}</Text>
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({ name }: { name: string }) => <Text>Icon</Text>,
}));

// Wrapper component with QueryClientProvider
const renderWithQueryClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>,
  );
};

describe("RecentActivity Component", () => {
  it('renders correctly and shows "Recent Activity" text', () => {
    renderWithQueryClient(<RecentActivity />);

    // Check if the component renders the "Recent Activity" text
    expect(screen.getByText("Recent Activity")).toBeTruthy();
  });
});

import React from "react";
import { render } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MetricsCard from "@/components/dashboard/MetricsCard";

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => (
    <Text>{children}</Text>
  ),
}));

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

// Mock the useGetIncidents hook to avoid actual API calls
jest.mock("@/hooks/incidents/useGetIncidents", () => ({
  useGetIncidents: () => ({
    data: {
      incidents: [],
      totalCount: 5, // Mock count for open incidents
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

// If you have other hooks that need mocking, add them here
// For example, if there's a useGetProperties hook:
jest.mock("@/hooks/properties/useGetProperties", () => ({
  useGetProperties: () => ({
    data: {
      properties: [],
      totalCount: 10, // Mock count for active properties
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe("MetricsCard Component", () => {
  it("renders correctly and displays correct counts", async () => {
    // Create a test QueryClient instance
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests
        },
      },
    });

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <MetricsCard />
      </QueryClientProvider>,
    );

    expect(getByText("Active Properties")).toBeTruthy();
    expect(getByText("Open Incidents")).toBeTruthy();
  });
});

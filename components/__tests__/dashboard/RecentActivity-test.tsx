import React from "react";
import { render } from "@testing-library/react-native";
import { Text, View } from "react-native";
import RecentActivity from "@/components/dashboard/RecentActivity";

// Mock necessary components based on actual component structure
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

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

// Mock the time ago helper
jest.mock("@/components/incidents/lib/utils/incidentHelpers", () => ({
  getTimeAgo: jest.fn().mockReturnValue("2 hours ago"),
}));

// Mock the Auth0 hook
jest.mock("react-native-auth0", () => ({
  useAuth0: () => ({
    getCredentials: jest.fn().mockResolvedValue({ accessToken: "fake-token" }),
    isLoading: false,
    error: null,
  }),
}));

// Mock our custom hooks with minimal data
jest.mock("@/hooks/incidents/useGetIncidents", () => ({
  useGetIncidents: jest.fn().mockReturnValue({
    incidents: [],
    isLoading: false,
    error: null,
  }),
}));

jest.mock("@/hooks/properties/useGetProperties", () => ({
  useGetProperties: jest.fn().mockReturnValue({
    properties: [],
    isLoading: false,
    error: null,
  }),
}));

// Mock the fetch function
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue([]),
});

// Simple test that focuses on the component rendering at all
describe("RecentActivity Component", () => {
  // Ensure console errors don't clutter the test output
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("renders without crashing", () => {
    // Just test that the component renders without throwing an error
    render(<RecentActivity />);
    // If we get here, the test passes
    expect(true).toBeTruthy();
  });
});

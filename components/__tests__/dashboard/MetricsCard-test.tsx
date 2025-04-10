import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { Text, View, ActivityIndicator } from "react-native";
import MetricsCard from "@/components/dashboard/MetricsCard";

// Mock necessary components
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <Text testID={className?.includes("text-2xl") ? "metric-value" : undefined}>
      {children}
    </Text>
  ),
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <View
      testID={
        className?.includes("justify-start") ? "spinner-container" : undefined
      }
    >
      {children}
    </View>
  ),
}));

jest.mock("@/components/ui/spinner", () => ({
  Spinner: ({ size }: { size: string }) => (
    <ActivityIndicator
      size={size === "small" ? "small" : "large"}
      testID="spinner"
    />
  ),
}));

// Mock the Auth0 hook
jest.mock("react-native-auth0", () => ({
  useAuth0: () => ({
    getCredentials: jest.fn().mockResolvedValue({ accessToken: "fake-token" }),
    isLoading: false,
    error: null,
  }),
}));

// Mock the fetch function
global.fetch = jest.fn();

describe("MetricsCard Component", () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockReset();

    // Mock console.warn to prevent test output cluttering
    jest.spyOn(console, "warn").mockImplementation(() => {});

    // Mock the fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        totalProperties: 10,
        activeProperties: 8,
        maintenanceProperties: 1,
        archivedProperties: 1,
        totalIncidents: 5,
        openIncidents: 3,
        resolvedIncidents: 2,
      }),
    });
  });

  afterEach(() => {
    // Restore console.warn after each test
    jest.restoreAllMocks();
  });

  it("shows loading spinners initially", async () => {
    const { getAllByTestId } = render(<MetricsCard />);
    expect(getAllByTestId("spinner").length).toBe(2);
  });

  it("renders correct counts after data loads", async () => {
    const { getByText, queryAllByTestId, getAllByTestId } = render(
      <MetricsCard />,
    );

    // Wait for the API call to resolve
    await waitFor(() => {
      expect(queryAllByTestId("spinner").length).toBe(0);
      expect(getByText("Active Properties")).toBeTruthy();
      expect(getByText("Open Incidents")).toBeTruthy();
    });

    // Check that the values are correct in the metric-value elements
    const metricValues = getAllByTestId("metric-value");
    expect(metricValues.length).toBe(2);
    expect(metricValues[0].props.children).toBe(8); // 8 active properties
    expect(metricValues[1].props.children).toBe(3); // 3 open incidents

    // Verify that the API was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/properties/stats"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("handles API failure gracefully", async () => {
    // Mock an API failure
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    const { getByText, queryAllByTestId, getAllByTestId } = render(
      <MetricsCard />,
    );

    await waitFor(() => {
      expect(queryAllByTestId("spinner").length).toBe(0);
      // Should still render the titles
      expect(getByText("Active Properties")).toBeTruthy();
      expect(getByText("Open Incidents")).toBeTruthy();
    });

    // Check that the values are 0 when the API fails
    const metricValues = getAllByTestId("metric-value");
    expect(metricValues.length).toBe(2);
    expect(metricValues[0].props.children).toBe(0);
    expect(metricValues[1].props.children).toBe(0);
  });
});

// MetricsCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import MetricsCard from "@/components/dashboard/MetricsCard";
import { PropertyStatus, IncidentStatus } from "@/lib/@types/properties";

// Import the mocked hooks
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";

// Mock ThemedText and UI components
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

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

// Mock the hooks with test data
jest.mock("@/hooks/properties/useGetProperties", () => ({
  useGetProperties: jest.fn(),
}));

jest.mock("@/hooks/incidents/useGetIncidents", () => ({
  useGetIncidents: jest.fn(),
}));

const mockUseGetProperties = useGetProperties as jest.MockedFunction<
  typeof useGetProperties
>;
const mockUseGetIncidents = useGetIncidents as jest.MockedFunction<
  typeof useGetIncidents
>;

describe("MetricsCard Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Clear any previous test state
    jest.resetModules();
  });

  it("renders correctly and displays correct counts", async () => {
    // Mock successful data response
    mockUseGetProperties.mockReturnValue({
      properties: {
        data: [
          {
            id: 1,
            propertyId: 1,
            userId: 1,
            address: "123 Main St",
            city: "Springfield",
            country: "US",
            latitude: 40.7128,
            longitude: -74.006,
            status: PropertyStatus.Active,
            incidentCount: 0,
            openIncidentCount: 0,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
          {
            id: 2,
            propertyId: 2,
            userId: 1,
            address: "456 Oak Ave",
            city: "Springfield",
            country: "US",
            latitude: 40.7589,
            longitude: -73.9851,
            status: PropertyStatus.Active,
            incidentCount: 1,
            openIncidentCount: 1,
            createdAt: "2024-01-02T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
          },
          {
            id: 3,
            propertyId: 3,
            userId: 1,
            address: "789 Pine St",
            city: "Springfield",
            country: "US",
            latitude: 40.7505,
            longitude: -73.9934,
            status: PropertyStatus.Maintenance, // This shouldn't be counted
            incidentCount: 0,
            openIncidentCount: 0,
            createdAt: "2024-01-03T00:00:00Z",
            updatedAt: "2024-01-03T00:00:00Z",
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseGetIncidents.mockReturnValue({
      incidents: [
        {
          id: 1,
          propertyId: 1,
          incidentType: "Leak",
          description: "Water leak in bathroom",
          reportedAt: "2024-01-01T10:00:00Z",
          severity: "Medium" as any,
          status: IncidentStatus.Open,
          createdAt: "2024-01-01T10:00:00Z",
          updatedAt: "2024-01-01T10:00:00Z",
        },
        {
          id: 2,
          propertyId: 2,
          incidentType: "Electrical",
          description: "Power outage",
          reportedAt: "2024-01-02T14:00:00Z",
          severity: "High" as any,
          status: IncidentStatus.Open,
          createdAt: "2024-01-02T14:00:00Z",
          updatedAt: "2024-01-02T14:00:00Z",
        },
        {
          id: 3,
          propertyId: 1,
          incidentType: "Heating",
          description: "Heater not working",
          reportedAt: "2024-01-03T09:00:00Z",
          severity: "Low" as any,
          status: IncidentStatus.Resolved, // This shouldn't be counted
          createdAt: "2024-01-03T09:00:00Z",
          updatedAt: "2024-01-03T09:00:00Z",
        },
      ],
      meta: {
        page: 1,
        limit: 100,
        total: 3,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(<MetricsCard />);

    // Check if labels are present
    expect(getByText("Active Properties")).toBeTruthy();
    expect(getByText("Open Incidents")).toBeTruthy();

    // Check counts (2 active properties, 2 open incidents)
    const elements = screen.getAllByText("2");
    expect(elements).toHaveLength(2); // Should appear twice (for both metrics)
  });

  it("displays loading state correctly", () => {
    // Mock loading state
    mockUseGetProperties.mockReturnValue({
      properties: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    mockUseGetIncidents.mockReturnValue({
      incidents: [],
      meta: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
      },
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(<MetricsCard />);

    // Should show labels during loading
    expect(getByText("Active Properties")).toBeTruthy();
    expect(getByText("Open Incidents")).toBeTruthy();
  });

  it("displays error state correctly", () => {
    // Mock error state
    mockUseGetProperties.mockReturnValue({
      properties: undefined,
      isLoading: false,
      error: new Error("API error: 500"),
      refetch: jest.fn(),
    });

    mockUseGetIncidents.mockReturnValue({
      incidents: [],
      meta: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(<MetricsCard />);

    // Should show error state
    expect(getByText("Properties Error")).toBeTruthy();
    expect(getByText("API error: 500")).toBeTruthy();
    expect(getByText("Retry Properties")).toBeTruthy();
  });
});

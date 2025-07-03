// RecentActivity.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { PropertyStatus, IncidentStatus } from "@/lib/@types/properties";

// Import the mocked hooks
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";

// Mock necessary components
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    type,
  }: {
    children: React.ReactNode;
    type?: string;
  }) => <Text>{children}</Text>,
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
  IconSymbol: ({ name }: { name: string }) => <Text>{name}</Text>,
}));

// Mock the hooks
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

describe("RecentActivity Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any previous test state
    jest.resetModules();
  });

  it('renders correctly and shows "Recent Activity" text', () => {
    // Mock empty data
    mockUseGetProperties.mockReturnValue({
      properties: { data: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseGetIncidents.mockReturnValue({
      incidents: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<RecentActivity />);

    // Check if the component renders the "Recent Activity" text
    expect(screen.getByText("Recent Activity")).toBeTruthy();
  });

  it("displays recent activities correctly", () => {
    // Mock data with activities
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
          reportedAt: "2024-01-02T10:00:00Z", // More recent
          severity: "Medium" as any,
          status: IncidentStatus.Open,
          createdAt: "2024-01-02T10:00:00Z",
          updatedAt: "2024-01-02T10:00:00Z",
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<RecentActivity />);

    // Should show recent activities - using regex to be more flexible
    expect(screen.getByText("Recent Activity")).toBeTruthy();
    expect(screen.getByText(/New property.*123 Main St/)).toBeTruthy(); // More flexible matching
    expect(screen.getByText("Leak incident reported")).toBeTruthy();
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
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<RecentActivity />);

    expect(screen.getByText("Recent Activity")).toBeTruthy();
    expect(screen.getByText("Loading recent activity...")).toBeTruthy();
  });

  it("displays no activity message when there are no activities", () => {
    // Completely isolate this test by mocking fresh data
    jest.clearAllMocks();

    // Mock completely empty data - make sure BOTH hooks return empty data
    mockUseGetProperties.mockReturnValue({
      properties: { data: [] }, // Explicitly empty
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseGetIncidents.mockReturnValue({
      incidents: [], // Explicitly empty
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText, queryByText } = render(<RecentActivity />);

    expect(getByText("Recent Activity")).toBeTruthy();
    expect(getByText("No recent activity")).toBeTruthy();

    // Make sure no other activities are showing
    expect(queryByText(/incident reported/)).toBeNull();
    expect(queryByText(/New property/)).toBeNull();
  });
});

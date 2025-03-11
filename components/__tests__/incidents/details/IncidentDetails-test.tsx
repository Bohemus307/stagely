import React from "react";
import { render } from "@testing-library/react-native";
import IncidentDetails from "@/components/incidents/details/IncidentDetails";
import {
  formatDate,
  getSeverityBadge,
} from "@/components/properties/lib/utils/detailsHelpers";
import { Incident } from "@/components/properties/list";
import { Text, View } from "react-native";

// Mock the helper functions
jest.mock("@/components/properties/lib/utils/detailsHelpers", () => ({
  formatDate: jest.fn((date) => `Formatted: ${date}`),
  getSeverityBadge: jest.fn((severity) => {
    switch (severity) {
      case "High":
        return "bg-red-400/80 text-red-800";
      case "Medium":
        return "bg-amber-400/80 text-amber-800";
      case "Low":
        return "bg-blue-400/80 text-blue-800";
      default:
        return "bg-gray-400/80 text-gray-800";
    }
  }),
}));

// Mock ThemedText component - IMPORTANT: Use Text instead of div for React Native testing
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <Text testID="themed-text">{children}</Text>,
}));

// Mock UI components that appear in your component
jest.mock("@/components/ui/box", () => ({
  Box: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="box">{children}</View>,
}));

jest.mock("@/components/ui/divider", () => ({
  Divider: ({ className }: { className?: string }) => <View testID="divider" />,
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

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="badge">{children}</View>,
}));

describe("IncidentDetails", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create a valid Incident that matches the expected type
  const createTestIncident = (overrides = {}) => {
    const baseIncident: Incident = {
      incident_id: 123,
      property_id: 456,
      incident_type: "Water Damage",
      description: "Leak in the bathroom ceiling",
      reported_at: "2025-02-15T10:30:00Z",
      // Explicitly type these as the union types
      severity: "Medium" as "Low" | "Medium" | "High" | "Critical",
      status: "In Progress" as "Open" | "In Progress" | "Resolved" | "Closed",
      images: [],
    };

    return { ...baseIncident, ...overrides };
  };

  // Sample incident data
  const mockIncident = createTestIncident();

  test("renders correctly with incident data", () => {
    const { getByText } = render(<IncidentDetails incident={mockIncident} />);

    // Check if the component header is displayed
    expect(getByText("Incident Details")).toBeTruthy();

    // Check if priority with severity is displayed
    expect(getByText("Priority")).toBeTruthy();
    expect(getByText("Medium")).toBeTruthy();

    // Check if status is displayed
    expect(getByText("Status")).toBeTruthy();
    expect(getByText("In Progress")).toBeTruthy();

    // Check if reported date is displayed
    expect(getByText("Reported On")).toBeTruthy();
    expect(getByText("Formatted: 2025-02-15T10:30:00Z")).toBeTruthy();

    // Check if incident ID is displayed
    expect(getByText("Incident ID")).toBeTruthy();
    expect(getByText("#123")).toBeTruthy();
  });

  test("formatDate is called with correct dates", () => {
    render(<IncidentDetails incident={mockIncident} />);

    // Verify that formatDate was called with the correct parameters
    expect(formatDate).toHaveBeenCalledTimes(1);
    expect(formatDate).toHaveBeenCalledWith("2025-02-15T10:30:00Z");
  });

  test("getSeverityBadge is called with correct severity", () => {
    render(<IncidentDetails incident={mockIncident} />);

    // Verify that getSeverityBadge was called with the correct parameters
    expect(getSeverityBadge).toHaveBeenCalledTimes(1);
    expect(getSeverityBadge).toHaveBeenCalledWith("Medium");
  });

  test("displays resolved date when incident is resolved", () => {
    const resolvedIncident = createTestIncident({
      status: "Resolved" as "Open" | "In Progress" | "Resolved" | "Closed",
      resolved_at: "2025-02-20T14:45:00Z",
    });

    const { getByText } = render(
      <IncidentDetails incident={resolvedIncident} />,
    );

    // Check if resolved date is displayed
    expect(getByText("Resolved On")).toBeTruthy();
    expect(getByText("Formatted: 2025-02-20T14:45:00Z")).toBeTruthy();

    // Check that formatDate was called twice (for reported and resolved dates)
    expect(formatDate).toHaveBeenCalledTimes(2);
    expect(formatDate).toHaveBeenNthCalledWith(1, "2025-02-15T10:30:00Z");
    expect(formatDate).toHaveBeenNthCalledWith(2, "2025-02-20T14:45:00Z");
  });

  test("does not display resolved date when incident is not resolved", () => {
    const { queryByText } = render(<IncidentDetails incident={mockIncident} />);

    // Check that resolved date is not displayed
    expect(queryByText("Resolved On")).toBeNull();
  });

  test("handles incident with different severity levels", () => {
    // Test with High severity
    const highSeverityIncident = createTestIncident({
      severity: "High" as "Low" | "Medium" | "High" | "Critical",
    });

    render(<IncidentDetails incident={highSeverityIncident} />);
    expect(getSeverityBadge).toHaveBeenCalledWith("High");

    // Test with Low severity
    jest.clearAllMocks();
    const lowSeverityIncident = createTestIncident({
      severity: "Low" as "Low" | "Medium" | "High" | "Critical",
    });

    render(<IncidentDetails incident={lowSeverityIncident} />);
    expect(getSeverityBadge).toHaveBeenCalledWith("Low");

    // Test with Critical severity
    jest.clearAllMocks();
    const criticalSeverityIncident = createTestIncident({
      severity: "Critical" as "Low" | "Medium" | "High" | "Critical",
    });

    render(<IncidentDetails incident={criticalSeverityIncident} />);
    expect(getSeverityBadge).toHaveBeenCalledWith("Critical");
  });

  test("handles missing incident_id gracefully", () => {
    const incidentWithoutId = createTestIncident({
      incident_id: undefined,
    });

    const { getByText } = render(
      <IncidentDetails incident={incidentWithoutId as unknown as Incident} />,
    );

    // Should still render the component without crashing
    expect(getByText("Incident ID")).toBeTruthy();
    expect(getByText("#")).toBeTruthy(); // Should display # with no ID
  });

  test("handles invalid date formats gracefully", () => {
    const incidentWithInvalidDate = createTestIncident({
      reported_at: "invalid-date-format",
    });

    render(<IncidentDetails incident={incidentWithInvalidDate} />);

    // formatDate should still be called with the invalid date
    expect(formatDate).toHaveBeenCalledWith("invalid-date-format");
  });
});

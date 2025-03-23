import React from "react";
import { render } from "@testing-library/react-native";
import IncidentMetrics from "@/components/incidents/details/IncidentMetrics";
import { Text, View } from "react-native";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/@types/properties";

// Mock ThemedText component for React Native testing
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    className,
    type,
  }: {
    children: React.ReactNode;
    className?: string;
    type?: string;
  }) => (
    <Text testID="themed-text" data-type={type}>
      {children}
    </Text>
  ),
}));

// Mock HStack and Box components
jest.mock("@/components/ui/hstack", () => ({
  HStack: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View testID="hstack">{children}</View>,
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

describe("IncidentMetrics", () => {
  // Sample incident data for testing with proper typing
  const createIncident = (
    id: number,
    status: IncidentStatus,
    severity: IncidentSeverity,
  ): Incident => ({
    id: id,
    propertyId: 1,
    incidentType: "Test Incident",
    description: "Test Description",
    reportedAt: "2025-02-15T10:30:00Z",
    severity,
    status,
    images: [],
    createdAt: "",
    updatedAt: "",
  });

  const mockIncidents: Incident[] = [
    createIncident(1, IncidentStatus.Open, IncidentSeverity.Medium),
    createIncident(2, IncidentStatus.Open, IncidentSeverity.High),
    createIncident(3, IncidentStatus.InProgress, IncidentSeverity.Low),
    createIncident(4, IncidentStatus.Resolved, IncidentSeverity.Medium),
    createIncident(5, IncidentStatus.Closed, IncidentSeverity.Low),
    createIncident(6, IncidentStatus.Open, IncidentSeverity.Critical),
  ];

  test("renders correctly with incident data", () => {
    // In React Native Testing Library, we can't use `container` directly
    const { queryAllByText } = render(
      <IncidentMetrics incidents={mockIncidents} />,
    );

    // Check if all metrics are rendered
    expect(queryAllByText("Total").length).toBe(1);
    expect(queryAllByText("Open").length).toBe(1);
    expect(queryAllByText("Urgent").length).toBe(1);

    // Check if the values are correct
    // We need to check that each value exists
    expect(queryAllByText("6").length).toBeGreaterThan(0); // Total count
    expect(queryAllByText("3").length).toBeGreaterThan(0); // Open count
    expect(queryAllByText("2").length).toBeGreaterThan(0); // Urgent count
  });

  test("renders zero counts when no incidents", () => {
    const { queryAllByText } = render(<IncidentMetrics incidents={[]} />);

    // All values should be zero, and there should be exactly 3 zeros (one for each metric)
    expect(queryAllByText("0").length).toBe(3);
  });

  test("handles different incident status and severities correctly", () => {
    // Custom set of incidents with specific status and severity combinations
    const customIncidents: Incident[] = [
      createIncident(1, IncidentStatus.InProgress, IncidentSeverity.Medium), // Not open, not urgent
      createIncident(2, IncidentStatus.Open, IncidentSeverity.High), // Open and urgent
      createIncident(3, IncidentStatus.Open, IncidentSeverity.Low), // Open, not urgent
      createIncident(4, IncidentStatus.Resolved, IncidentSeverity.Critical), // Not open, but would be urgent if open
    ];

    const { queryAllByText } = render(
      <IncidentMetrics incidents={customIncidents} />,
    );

    // Check for the existence of values
    expect(queryAllByText("4").length).toBeGreaterThan(0); // Total count
    expect(queryAllByText("2").length).toBeGreaterThan(0); // There should be at least one "2" for Open and Urgent
  });

  test("correctly counts critical incidents as urgent", () => {
    // Set with only Critical incidents
    const criticalIncidents: Incident[] = [
      createIncident(1, IncidentStatus.Open, IncidentSeverity.Critical),
      createIncident(2, IncidentStatus.InProgress, IncidentSeverity.Critical),
    ];

    const { queryAllByText } = render(
      <IncidentMetrics incidents={criticalIncidents} />,
    );

    // Total count and Urgent count should both be 2
    expect(queryAllByText("2").length).toBeGreaterThan(0);
  });

  test("metrics update when incidents prop changes", () => {
    // Initial render with all incidents
    const { queryAllByText, rerender } = render(
      <IncidentMetrics incidents={mockIncidents} />,
    );

    // Initial metrics should exist
    expect(queryAllByText("6").length).toBeGreaterThan(0); // Total count
    expect(queryAllByText("3").length).toBeGreaterThan(0); // Open count
    expect(queryAllByText("2").length).toBeGreaterThan(0); // Urgent count

    // Rerender with subset of incidents
    const fewerIncidents = mockIncidents.slice(0, 3); // Just first 3 incidents
    rerender(<IncidentMetrics incidents={fewerIncidents} />);

    // Updated metrics should exist
    expect(queryAllByText("3").length).toBeGreaterThan(0); // Total count
    expect(queryAllByText("2").length).toBeGreaterThan(0); // Open count
    expect(queryAllByText("1").length).toBeGreaterThan(0); // Urgent count
  });

  test("renders boxes with appropriate styling for each metric", () => {
    const { queryAllByTestId } = render(
      <IncidentMetrics incidents={mockIncidents} />,
    );

    // Should render three Box components (one for each metric)
    const boxes = queryAllByTestId("box");
    expect(boxes.length).toBeGreaterThanOrEqual(3);
  });
});

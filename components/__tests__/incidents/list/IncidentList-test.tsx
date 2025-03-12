import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IncidentList from "@/components/incidents/list/index";
import { Incident } from "@/components/properties/list";
import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock IncidentCard component
jest.mock("@/components/incidents/list/IncidentCard", () => ({
  __esModule: true,
  default: ({
    incident,
    onPress,
    onDetailsPress,
  }: {
    incident: any;
    onPress: () => void;
    onDetailsPress: () => void;
  }) => (
    <View testID="incident-card">
      <Text testID="incident-title">{incident.incident_type}</Text>
      <TouchableOpacity testID="details-button" onPress={onDetailsPress}>
        <Text>View Details</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="card-press" onPress={onPress}>
        <Text>Press Card</Text>
      </TouchableOpacity>
    </View>
  ),
}));

// Mock UI components
jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => (
    <View
      testID="icon-symbol"
      data-name={name}
      data-size={size}
      data-color={color}
    />
  ),
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <Text testID="themed-text" className={className}>
      {children}
    </Text>
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
    <View testID="box" className={className}>
      {children}
    </View>
  ),
}));

jest.mock("@/components/ui/fab", () => ({
  Fab: ({
    children,
    size,
    placement,
    onPress,
    className,
  }: {
    children: React.ReactNode;
    size: string;
    placement: string;
    onPress: () => void;
    className?: string;
  }) => (
    <TouchableOpacity testID="fab" onPress={onPress}>
      {children}
    </TouchableOpacity>
  ),
  FabIcon: ({ size, as }: { size: string; as: any }) => (
    <View testID="fab-icon" />
  ),
}));

jest.mock("@/components/ui/icon", () => ({
  AddIcon: () => <View testID="add-icon" />,
}));

jest.mock("@/constants/Colors", () => ({
  Colors: {
    light: {
      tabIconDefault: "#000000",
    },
  },
}));

describe("IncidentList", () => {
  // Helper function to create test incidents
  const createTestIncident = (
    id: number,
    type: string,
    status: "Open" | "In Progress" | "Resolved" | "Closed",
    severity: "Low" | "Medium" | "High" | "Critical",
  ): Incident => ({
    incident_id: id,
    property_id: 123,
    incident_type: type,
    description: `Description for ${type}`,
    reported_at: "2025-02-15T10:30:00Z",
    severity,
    status,
    images: [],
  });

  // Sample incidents for testing
  const mockIncidents: Incident[] = [
    createTestIncident(1, "Water Damage", "Open", "Medium"),
    createTestIncident(2, "Electrical Issue", "In Progress", "High"),
    createTestIncident(3, "Broken Window", "Resolved", "Low"),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders list with incidents correctly", () => {
    const { getAllByTestId } = render(
      <IncidentList incidents={mockIncidents} />,
    );

    // Check if all incident cards are rendered
    const incidentCards = getAllByTestId("incident-card");
    expect(incidentCards.length).toBe(mockIncidents.length);

    // Check if incident titles are displayed
    const incidentTitles = getAllByTestId("incident-title");
    expect(incidentTitles[0].props.children).toBe("Water Damage");
    expect(incidentTitles[1].props.children).toBe("Electrical Issue");
    expect(incidentTitles[2].props.children).toBe("Broken Window");
  });

  test("renders EmptyListComponent when no incidents", () => {
    const { getByText, queryAllByTestId } = render(
      <IncidentList incidents={[]} />,
    );

    // Should not render any incident cards
    expect(queryAllByTestId("incident-card").length).toBe(0);

    // Should render the empty state message
    expect(
      getByText("No incidents found. Report a new incident to get started."),
    ).toBeTruthy();
    expect(getByText("Report Incident")).toBeTruthy();
  });

  test("calls onSelectIncident when an incident card is pressed", () => {
    const mockOnSelectIncident = jest.fn();
    const { getAllByTestId } = render(
      <IncidentList
        incidents={mockIncidents}
        onSelectIncident={mockOnSelectIncident}
      />,
    );

    // Find all card press buttons and press the first one
    const cardPressButtons = getAllByTestId("card-press");
    fireEvent.press(cardPressButtons[0]);

    // Check if onSelectIncident was called
    expect(mockOnSelectIncident).toHaveBeenCalled();
    // Note: Due to how we mocked the component, we can't verify the exact parameter passed
  });

  test("navigates to incident details when details button is pressed", () => {
    const { getAllByTestId } = render(
      <IncidentList incidents={mockIncidents} />,
    );

    // Find all details buttons and press the second one
    const detailsButtons = getAllByTestId("details-button");
    fireEvent.press(detailsButtons[1]);

    // Check if router.push was called
    expect(router.push).toHaveBeenCalled();
    // Note: We can verify that router.push was called, but not with which exact parameters
    // because our mock doesn't pass the incident to the callback
  });

  test("navigates to add incident screen when FAB is pressed", () => {
    const { getByTestId } = render(<IncidentList incidents={mockIncidents} />);

    // Find and press the FAB
    const fab = getByTestId("fab");
    fireEvent.press(fab);

    // Check if router.push was called with the correct parameters
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(incidents)/[addIncident]",
      params: { addIncident: "new" },
    });
  });

  test("navigates to add incident screen when 'Report Incident' button is pressed in empty state", () => {
    const { getByText } = render(<IncidentList incidents={[]} />);

    // Find and press the "Report Incident" button
    const reportButton = getByText("Report Incident");
    fireEvent.press(reportButton);

    // Check if router.push was called with the correct parameters
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(incidents)/[addIncident]",
      params: { addIncident: "new" },
    });
  });

  test("does not call onSelectIncident when it's not provided", () => {
    const { getAllByTestId } = render(
      <IncidentList incidents={mockIncidents} />,
    );

    // Find all card press buttons and press the first one
    const cardPressButtons = getAllByTestId("card-press");
    fireEvent.press(cardPressButtons[0]);

    // Since we didn't provide onSelectIncident, nothing should happen (no error)
    // This is an implicit test that the component doesn't crash
  });
});

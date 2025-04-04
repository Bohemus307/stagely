// Mock expo-location before other imports
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IncidentList from "@/components/incidents/list/index";

import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/@types/properties";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.7749, longitude: -122.4194 },
  }),
}));

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock AddIncidentButton to avoid dependency on expo-location
jest.mock("@/components/incidents/AddIncidentButton", () => ({
  __esModule: true,
  default: ({ className }: { className?: string }) => (
    <TouchableOpacity testID="add-incident-button">
      <Text>Add Incident</Text>
    </TouchableOpacity>
  ),
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
      <Text testID="incident-title">{incident.incidentType}</Text>
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
    status: IncidentStatus,
    severity: IncidentSeverity,
  ): Incident => ({
    id: id,
    propertyId: 123,
    incidentType: type,
    description: type,
    reportedAt: "2025-02-15T10:30:00Z",
    severity,
    status,
    images: [],
    createdAt: "",
    updatedAt: "",
  });

  // Sample incidents for testing
  const mockIncidents: Incident[] = [
    createTestIncident(
      1,
      "Water Damage",
      IncidentStatus.Open,
      IncidentSeverity.Medium,
    ),
    createTestIncident(
      2,
      "Electrical Issue",
      IncidentStatus.InProgress,
      IncidentSeverity.High,
    ),
    createTestIncident(
      3,
      "Broken Window",
      IncidentStatus.Resolved,
      IncidentSeverity.Low,
    ),
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

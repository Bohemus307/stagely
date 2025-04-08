import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View, Text, TouchableOpacity } from "react-native";

// Import the Incident type
import { Incident } from "@/lib/@types/properties";

// Mock cssInterop before importing any components that use it
jest.mock("react-native-css-interop", () => ({
  cssInterop: jest.fn(() => jest.fn()),
}));

// Simplified mocks that don't depend on each other
const routerMock = {
  push: jest.fn(),
};

jest.mock("expo-router", () => ({
  router: routerMock,
}));

// Add interfaces for props
interface ThemedTextProps {
  children: React.ReactNode;
  className?: string;
}

interface BoxProps {
  children: React.ReactNode;
  className?: string;
}

interface IncidentCardProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
  onDetailsPress: (incident: Incident) => void;
}

interface FabProps {
  children: React.ReactNode;
  onPress: () => void;
  isDisabled?: boolean;
  className?: string;
  placement?: string;
  size?: string;
}

// Sample incidents for testing
const mockIncidents = [
  {
    id: 1,
    propertyId: 123,
    incidentType: "Water Damage",
    description: "Water damage in kitchen",
    status: "Open",
    severity: "Medium",
    images: [],
    reportedAt: "2025-01-01T00:00:00Z",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: 2,
    propertyId: 456,
    incidentType: "Electrical Issue",
    description: "Electrical issue in bathroom",
    status: "In Progress",
    severity: "High",
    images: [],
    reportedAt: "2025-01-02T00:00:00Z",
    createdAt: "",
    updatedAt: "",
  },
] as Incident[];

// Mock necessary components
jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: () => <View testID="icon-symbol" />,
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: ThemedTextProps) => (
    <Text testID="themed-text">{children}</Text>
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({ children }: BoxProps) => <View testID="box">{children}</View>,
}));

// Mock incident card
jest.mock("@/components/incidents/list/IncidentCard", () => ({
  __esModule: true,
  default: ({ incident, onPress, onDetailsPress }: IncidentCardProps) => (
    <View testID="incident-card">
      <Text testID="incident-type">{incident.incidentType}</Text>
      <TouchableOpacity
        testID="details-button"
        onPress={() => onDetailsPress(incident)}
      >
        <Text>View Details</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="card-press" onPress={() => onPress(incident)}>
        <Text>Press Card</Text>
      </TouchableOpacity>
    </View>
  ),
}));

// Mock AddIncidentButton
jest.mock("@/components/incidents/AddIncidentButton", () => ({
  __esModule: true,
  default: () => <View testID="add-incident-button" />,
}));

// Mock useNearestProperty hook
jest.mock("@/hooks/useNearestProperty", () => ({
  useNearestProperty: () => ({
    nearestProperty: null,
    isLoading: false,
    error: null,
    showModal: false,
    setShowModal: jest.fn(),
    streetViewError: false,
    setStreetViewError: jest.fn(),
    findNearestProperty: jest.fn().mockResolvedValue(false),
  }),
}));

// Mock PropertyConfirmationModal
jest.mock("@/components/PropertyConfirmationModal", () => ({
  __esModule: true,
  default: () => <View testID="property-confirmation-modal" />,
}));

// Mock Fab components
jest.mock("@/components/ui/fab", () => ({
  Fab: ({ children, onPress }: FabProps) => (
    <TouchableOpacity testID="fab" onPress={onPress}>
      {children}
    </TouchableOpacity>
  ),
  FabIcon: ({ as }: { as: React.ComponentType }) => <View testID="fab-icon" />,
}));

jest.mock("@legendapp/motion", () => ({}));
jest.mock("@/components/ui/modal", () => ({}));
jest.mock("@/components/ui/pressable", () => ({}));

// Mock UIIcon component
jest.mock("@/components/ui/icon", () => ({
  AddIcon: () => <View testID="add-icon" />,
}));

// Remove this import since we're not using it
// import { IncidentListProps } from "@/components/incidents/list";

// Import the component after all mocks are set up
import IncidentList from "@/components/incidents/list";

describe("IncidentList Basic Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty state when no incidents", () => {
    const { getByTestId, getByText } = render(<IncidentList incidents={[]} />);

    // Check for empty state icon
    const emptyIcon = getByTestId("icon-symbol");
    expect(emptyIcon).toBeTruthy();

    // Check for empty state text
    expect(
      getByText("No incidents found. Report a new incident to get started."),
    ).toBeTruthy();
  });

  test("renders incident cards when incidents are provided", () => {
    const { getAllByTestId } = render(
      <IncidentList incidents={mockIncidents} />,
    );

    // Check if incident cards are rendered
    const incidentCards = getAllByTestId("incident-card");
    expect(incidentCards.length).toBe(2);

    // Check incident types
    const incidentTypes = getAllByTestId("incident-type");
    expect(incidentTypes[0].props.children).toBe("Water Damage");
    expect(incidentTypes[1].props.children).toBe("Electrical Issue");
  });

  test("calls onSelectIncident when an incident is pressed", () => {
    const mockOnSelectIncident = jest.fn();

    const { getAllByTestId } = render(
      <IncidentList
        incidents={mockIncidents}
        onSelectIncident={mockOnSelectIncident}
      />,
    );

    // Press the first incident
    const cardPressButtons = getAllByTestId("card-press");
    fireEvent.press(cardPressButtons[0]);

    // Check if onSelectIncident was called with the correct incident
    expect(mockOnSelectIncident).toHaveBeenCalledWith(mockIncidents[0]);
  });

  test("navigates to details screen when details button is pressed", () => {
    const { getAllByTestId } = render(
      <IncidentList incidents={mockIncidents} />,
    );

    // Press the details button of the second incident
    const detailsButtons = getAllByTestId("details-button");
    fireEvent.press(detailsButtons[1]);

    // Check if router.push was called with the correct params
    expect(routerMock.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(incidents)/details",
      params: { incidentId: 2 },
    });
  });
});

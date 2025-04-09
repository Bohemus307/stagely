import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TouchableOpacity, Text, View } from "react-native";

// Get reference to the mocked router
import { router } from "expo-router";

// Import after all mocks
import IncidentList from "@/components/incidents/list";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/@types/properties";

// Mock router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));
const mockRouter = router as jest.Mocked<typeof router>;

// Motion mocks
jest.mock("@legendapp/motion", () => ({
  Motion: ({ children }: { children: React.ReactNode }) => children,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock components
jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => <View testID={`icon-${name}`} />,
}));

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <Text>{children}</Text>,
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <View>{children}</View>,
}));

jest.mock("@/components/ui/fab", () => ({
  Fab: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress: () => void;
  }) => (
    <TouchableOpacity testID="fab" onPress={onPress}>
      {children}
    </TouchableOpacity>
  ),
  FabIcon: () => <View testID="fab-icon" />,
}));

jest.mock("@/components/ui/icon", () => ({
  AddIcon: () => <View testID="add-icon" />,
}));

// Mock IncidentCard component
jest.mock(
  "@/components/incidents/list/IncidentCard",
  () =>
    function IncidentCard({
      incident,
      onPress,
      onDetailsPress,
    }: {
      incident: Incident;
      onPress: (incident: Incident) => void;
      onDetailsPress: (incident: Incident) => void;
    }) {
      return (
        <View testID={`incident-${incident.id}`}>
          <Text>{incident.incidentType}</Text>
          <TouchableOpacity
            testID="press-area"
            onPress={() => onPress(incident)}
          />
          <TouchableOpacity
            testID="details-button"
            onPress={() => onDetailsPress(incident)}
          />
        </View>
      );
    },
);

// Mock AddIncidentButton component
jest.mock(
  "@/components/incidents/AddIncidentButton",
  () =>
    function AddIncidentButton() {
      return <View testID="add-incident-button" />;
    },
);

// Mock PropertyConfirmationModal component
jest.mock(
  "@/components/PropertyConfirmationModal",
  () =>
    function PropertyConfirmationModal({
      isOpen,
      onClose,
      property,
      onConfirm,
      onViewAll,
      streetViewError,
      setStreetViewError,
    }: {
      isOpen: boolean;
      onClose: () => void;
      property: any | null;
      onConfirm: () => void;
      onViewAll: () => void;
      streetViewError: boolean;
      setStreetViewError: (error: boolean) => void;
    }) {
      return isOpen ? <View testID="property-confirmation-modal" /> : null;
    },
);

// Mock PropertySelectionModal component
jest.mock(
  "@/components/PropertySelectionModal",
  () =>
    function PropertySelectionModal({
      isOpen,
      onClose,
      onSelectProperty,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onSelectProperty: (property: any) => void;
    }) {
      return isOpen ? <View testID="property-selection-modal" /> : null;
    },
);

// Mock the hook
jest.mock("@/hooks/incidents/useIncidentCreation", () => ({
  useIncidentCreation: () => ({
    nearestProperty: null,
    showModal: false,
    setShowModal: jest.fn(),
    showPropertySelectionModal: false,
    setShowPropertySelectionModal: jest.fn(),
    streetViewError: false,
    setStreetViewError: jest.fn(),
    handleCreateIncident: jest.fn(),
    handleConfirmProperty: jest.fn(),
    handleViewAllProperties: jest.fn(),
    handleSelectProperty: jest.fn(),
  }),
}));

// Sample incidents for testing
const mockIncidents: Incident[] = [
  {
    id: 1,
    propertyId: 123,
    incidentType: "Water Damage",
    description: "Water damage in kitchen",
    status: IncidentStatus.Open,
    severity: IncidentSeverity.Medium,
    images: [],
    reportedAt: "2025-01-01T00:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    propertyId: 456,
    incidentType: "Electrical Issue",
    description: "Electrical issue in bathroom",
    status: IncidentStatus.InProgress,
    severity: IncidentSeverity.High,
    images: [],
    reportedAt: "2025-01-02T00:00:00Z",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
];

describe("IncidentList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state when isLoading is true", () => {
    const { getByText } = render(
      <IncidentList incidents={[]} isLoading={true} />,
    );
    expect(getByText("Loading incidents...")).toBeTruthy();
  });

  test("renders error state when error is provided", () => {
    const error = new Error("Network error");
    const { getByText } = render(<IncidentList incidents={[]} error={error} />);
    expect(getByText("Error loading incidents")).toBeTruthy();
    expect(getByText("Network error")).toBeTruthy();
  });

  test("renders empty state when no incidents are provided", () => {
    const { getByText, queryByTestId } = render(
      <IncidentList incidents={[]} />,
    );
    expect(
      getByText("No incidents found. Report a new incident to get started."),
    ).toBeTruthy();
    expect(queryByTestId("add-incident-button")).toBeTruthy();
  });

  test("renders incidents when provided", () => {
    const { getByText } = render(<IncidentList incidents={mockIncidents} />);

    // Check if incidents are rendered by their text content
    expect(getByText("Water Damage")).toBeTruthy();
    expect(getByText("Electrical Issue")).toBeTruthy();
  });

  test("calls onSelectIncident when an incident is pressed", () => {
    const mockOnSelectIncident = jest.fn();
    const { getAllByTestId } = render(
      <IncidentList
        incidents={mockIncidents}
        onSelectIncident={mockOnSelectIncident}
      />,
    );

    // Get all press areas
    const pressAreas = getAllByTestId("press-area");

    // Simulate press on the first incident
    fireEvent.press(pressAreas[0]);

    // Check if callback was called with correct incident
    expect(mockOnSelectIncident).toHaveBeenCalledWith(mockIncidents[0]);
  });

  test("navigates to details screen when details button is pressed", () => {
    const { getAllByTestId } = render(
      <IncidentList incidents={mockIncidents} />,
    );

    // Get all details buttons
    const detailsButtons = getAllByTestId("details-button");

    // Simulate press on the second incident's details button
    fireEvent.press(detailsButtons[1]);

    // Check if router was called correctly
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(incidents)/details",
      params: { incidentId: 2 },
    });
  });
});

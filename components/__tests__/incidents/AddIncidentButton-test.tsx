import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text, TouchableOpacity, View } from "react-native";
import AddIncidentButton from "@/components/incidents/AddIncidentButton";

// Mock the entire module to have more control
jest.mock("@/hooks/incidents/useIncidentCreation", () => ({
  useIncidentCreation: jest.fn(() => ({
    nearestProperty: {
      id: 1,
      address: "123 Test St",
      city: "Test City",
      state: "TS",
    },
    isLoading: false,
    isProcessing: false,
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
  })),
}));

// Mock UI components to be more like React Native components
jest.mock("@/components/ui/button", () => {
  const Button = ({ children, onPress, isDisabled }: any) => (
    <TouchableOpacity
      testID="button"
      onPress={!isDisabled ? onPress : undefined}
    >
      {children}
    </TouchableOpacity>
  );
  Button.displayName = "MockButton";
  return { Button, ButtonText: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock("@/components/ui/IconSymbol", () => {
  const IconSymbol = () => <View testID="icon" />;
  IconSymbol.displayName = "MockIconSymbol";
  return { IconSymbol };
});

jest.mock("@/components/ui/vstack", () => {
  const VStack = ({ children }: any) => <View>{children}</View>;
  VStack.displayName = "MockVStack";
  return { VStack };
});

jest.mock("@/components/PropertyConfirmationModal", () => {
  const PropertyConfirmationModal = ({ isOpen }: { isOpen?: boolean }) =>
    isOpen ? <View testID="property-confirmation-modal" /> : null;
  PropertyConfirmationModal.displayName = "MockPropertyConfirmationModal";
  return PropertyConfirmationModal;
});

jest.mock("@/components/PropertySelectionModal", () => {
  const PropertySelectionModal = ({ isOpen }: { isOpen?: boolean }) =>
    isOpen ? <View testID="property-selection-modal" /> : null;
  PropertySelectionModal.displayName = "MockPropertySelectionModal";
  return PropertySelectionModal;
});

describe("AddIncidentButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders button with correct text", () => {
    const { getByText, getByTestId } = render(<AddIncidentButton />);

    expect(getByText("New Incident")).toBeTruthy();
    expect(getByTestId("button")).toBeTruthy();
  });

  test("shows loading state while processing", () => {
    // Mock the hook to return loading state
    const mockUseIncidentCreation =
      require("@/hooks/incidents/useIncidentCreation").useIncidentCreation;
    mockUseIncidentCreation.mockReturnValueOnce({
      ...mockUseIncidentCreation(),
      isLoading: true,
    });

    const { getByText } = render(<AddIncidentButton />);

    expect(getByText("Locating...")).toBeTruthy();
  });

  test("calls handleCreateIncident when button is pressed", () => {
    const mockUseIncidentCreation =
      require("@/hooks/incidents/useIncidentCreation").useIncidentCreation;
    const mockHandleCreateIncident = jest.fn();
    mockUseIncidentCreation.mockReturnValueOnce({
      ...mockUseIncidentCreation(),
      handleCreateIncident: mockHandleCreateIncident,
    });

    const { getByText } = render(<AddIncidentButton />);

    fireEvent.press(getByText("New Incident"));

    expect(mockHandleCreateIncident).toHaveBeenCalled();
  });

  test("renders PropertyConfirmationModal when showModal is true", () => {
    const mockUseIncidentCreation =
      require("@/hooks/incidents/useIncidentCreation").useIncidentCreation;
    mockUseIncidentCreation.mockReturnValueOnce({
      ...mockUseIncidentCreation(),
      showModal: true,
    });

    const { getByTestId } = render(<AddIncidentButton />);

    expect(getByTestId("property-confirmation-modal")).toBeTruthy();
  });

  test("renders PropertySelectionModal when showPropertySelectionModal is true", () => {
    const mockUseIncidentCreation =
      require("@/hooks/incidents/useIncidentCreation").useIncidentCreation;
    mockUseIncidentCreation.mockReturnValueOnce({
      ...mockUseIncidentCreation(),
      showPropertySelectionModal: true,
    });

    const { getByTestId } = render(<AddIncidentButton />);

    expect(getByTestId("property-selection-modal")).toBeTruthy();
  });
});

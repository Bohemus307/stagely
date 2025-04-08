/**
 * @jest-environment node
 */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import { router } from "expo-router";
import PropertyList from "@/components/properties/list";
import { PropertyStatus, Property } from "@/lib/@types/properties";

// Mock dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: () => null,
}));

describe("PropertyList Component", () => {
  // Sample property data
  const createProperty = (
    id: number,
    status = PropertyStatus.Active,
  ): Property => ({
    id: id,
    address: `${id} Test Street`,
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    country: "Test Country",
    latitude: 37.7749,
    longitude: -122.4194,
    status,
    incidents: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    propertyId: 0,
    userId: 0,
    incidentCount: 0,
    openIncidentCount: 0,
  });

  const mockProperties = [
    createProperty(1),
    createProperty(2, PropertyStatus.Maintenance),
    createProperty(3, PropertyStatus.Archived),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty state when no properties are provided", () => {
    const { getByText } = render(<PropertyList properties={[]} />);

    expect(
      getByText("No properties found. Add your first property to get started."),
    ).toBeTruthy();
    expect(getByText("Add Property")).toBeTruthy();
  });

  test("renders properties with their addresses", () => {
    const { getByText } = render(<PropertyList properties={mockProperties} />);

    mockProperties.forEach((property) => {
      expect(getByText(property.address)).toBeTruthy();
    });
  });

  test("calls onSelectProperty when a property is pressed", () => {
    const mockOnSelectProperty = jest.fn();
    const { getByText } = render(
      <PropertyList
        properties={mockProperties}
        onSelectProperty={mockOnSelectProperty}
      />,
    );

    // Press the first property by its address
    fireEvent.press(getByText(mockProperties[0].address));

    expect(mockOnSelectProperty).toHaveBeenCalledWith(mockProperties[0]);
  });

  test("navigates to details page when details button is pressed", () => {
    const { getAllByText } = render(
      <PropertyList properties={mockProperties} />,
    );

    // Find all "View Details" buttons and press the second one
    const detailsButtons = getAllByText("Details");
    fireEvent.press(detailsButtons[1]);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/details",
      params: { propertyId: mockProperties[1].id },
    });
  });

  test("navigates to photos page when photos button is pressed", () => {
    const { getAllByText } = render(
      <PropertyList properties={mockProperties} />,
    );

    // Find all "Manage Photos" buttons and press the third one
    const photosButtons = getAllByText("Photos");
    fireEvent.press(photosButtons[2]);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/(photos)",
      params: { propertyId: mockProperties[2].id },
    });
  });

  test("navigates to documents page when documents button is pressed", () => {
    const { getAllByText } = render(
      <PropertyList properties={mockProperties} />,
    );

    // Find all "View Documents" buttons and press the first one
    const documentsButtons = getAllByText("Documents");
    fireEvent.press(documentsButtons[0]);

    expect(router.push).toHaveBeenCalledWith("/(tabs)/(properties)/documents");
  });

  test("does not crash when onSelectProperty is not provided", () => {
    const { getByText } = render(<PropertyList properties={mockProperties} />);

    // This should not throw an error
    expect(() => {
      fireEvent.press(getByText(mockProperties[0].address));
    }).not.toThrow();
  });
});

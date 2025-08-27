/**
 * @jest-environment node
 */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PropertyCard from "@/components/properties/list/PropertyCard";
import {
  IncidentSeverity,
  IncidentStatus,
  Property,
  PropertyStatus,
} from "@/lib/@types/properties";

// Minimal required mocks
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      googleMapsKey: "test-api-key",
    },
  },
}));

describe("PropertyCard Component", () => {
  // Create a basic property object
  const mockProperty: Property = {
    id: 123,
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    country: "Test Country",
    status: PropertyStatus.Active,
    latitude: 37.7749,
    longitude: -122.4194,
    incidents: [
      {
        id: 12345,
        incidentType: "Plumbing",
        description: "Leaking pipe",
        reportedAt: "2025-01-01T12:00:00Z",
        status: IncidentStatus.Open,
        severity: IncidentSeverity.Medium,
        images: [],
        propertyId: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 12345,
        incidentType: "Electrical",
        description: "Wiring issue",
        reportedAt: "2025-01-02T12:00:00Z",
        status: IncidentStatus.Resolved,
        severity: IncidentSeverity.Low,
        images: [],
        propertyId: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    propertyId: 0,
    userId: 0,
    incidentCount: 0,
    openIncidentCount: 0,
  };

  // Mock event handlers
  const mockOnPress = jest.fn();
  const mockOnDetailsPress = jest.fn();
  const mockOnPhotosPress = jest.fn();
  const mockOnDocumentsPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders property address and location correctly", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty as Property}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    expect(getByText("123 Test Street")).toBeTruthy();
    expect(getByText("Test City, TS 12345")).toBeTruthy();
  });

  test("displays correct status badge for Active status", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    expect(getByText("Active")).toBeTruthy();
  });

  test("displays correct status badge for Maintenance status", () => {
    const propertyInMaintenance = {
      ...mockProperty,
      status: PropertyStatus.Maintenance,
    };

    const { getByText } = render(
      <PropertyCard
        property={propertyInMaintenance}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    expect(getByText("Maintenance")).toBeTruthy();
  });

  test("displays correct status badge for Archived status", () => {
    const archivedProperty = {
      ...mockProperty,
      status: PropertyStatus.Archived,
    };

    const { getByText } = render(
      <PropertyCard
        property={archivedProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    expect(getByText("Archived")).toBeTruthy();
  });

  test("displays active incidents count correctly", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    expect(getByText("1 Issue")).toBeTruthy();
  });

  test("calls onDetailsPress when Details button is pressed", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    fireEvent.press(getByText("Details"));
    expect(mockOnDetailsPress).toHaveBeenCalledWith(mockProperty);
  });

  test("calls onPhotosPress when Photos button is pressed", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    fireEvent.press(getByText("Photos"));
    expect(mockOnPhotosPress).toHaveBeenCalledWith(mockProperty);
  });

  test("calls onDocumentsPress when Documents button is pressed", () => {
    const { getByText } = render(
      <PropertyCard
        property={mockProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
        onPhotosPress={mockOnPhotosPress}
        onDocumentsPress={mockOnDocumentsPress}
      />,
    );

    fireEvent.press(getByText("Documents"));
    expect(mockOnDocumentsPress).toHaveBeenCalledWith(mockProperty);
  });
});

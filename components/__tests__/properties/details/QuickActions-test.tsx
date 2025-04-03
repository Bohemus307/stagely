/**
 * @jest-environment node
 */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import QuickActions from "@/components/properties/details/QuickActions";
import { router } from "expo-router";
import { Property, PropertyStatus } from "@/lib/@types/properties";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock Colors from react-native
jest.mock("react-native/Libraries/NewAppScreen", () => ({
  Colors: {
    light: {
      tabIconDefault: "#1A1A1A",
    },
  },
}));

describe("QuickActions Component", () => {
  // Sample property data
  const mockProperty: Property = {
    propertyId: 12345,
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    country: "Test Country",
    latitude: 37.7749,
    longitude: -122.4194,
    status: PropertyStatus.Active,
    incidents: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    id: 0,
    userId: 0,
    incidentCount: 0,
    openIncidentCount: 0,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("renders correctly with the expected title and buttons", () => {
    const { getByText, getAllByText } = render(
      <QuickActions property={mockProperty} />,
    );

    // Check if the component renders the title
    expect(getByText("Quick Actions")).toBeTruthy();

    // Check if it renders the button text
    expect(getByText("Photos")).toBeTruthy();
    expect(getByText("Documents")).toBeTruthy();
    expect(getByText("Edit")).toBeTruthy();

    // Count the buttons based on the text (all buttons have text)
    const buttons = [
      ...getAllByText("Photos"),
      ...getAllByText("Documents"),
      ...getAllByText("Edit"),
    ];
    expect(buttons.length).toBe(3);
  });

  test("navigates to correct routes when buttons are pressed", () => {
    const { getByText } = render(<QuickActions property={mockProperty} />);

    // Test Photos navigation - directly find the pressable element
    fireEvent.press(getByText("Photos"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/(photos)",
      params: { propertyId: 0 },
    });

    // Test Documents navigation
    fireEvent.press(getByText("Documents"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/documents",
      params: { propertyId: 0 },
    });

    // Test Edit navigation
    fireEvent.press(getByText("Edit"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/edit",
      params: { propertyId: 0 },
    });
  });

  test("uses correct property ID for navigation", () => {
    const { getByText } = render(
      <QuickActions property={{ ...mockProperty, id: 67890 }} />,
    );

    fireEvent.press(getByText("Edit"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/edit",
      params: { propertyId: 67890 },
    });
  });
});

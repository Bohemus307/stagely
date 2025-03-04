/**
 * @jest-environment node
 */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import QuickActions from "@/components/properties/details/QuickActions";
import { PropertyStatus } from "@/components/properties/list";
import { router } from "expo-router";

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
  const mockProperty = {
    property_id: 12345,
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zip_code: "12345",
    country: "Test Country",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    status: PropertyStatus.Active,
    images: [],
    incidents: [],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
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
    expect(getByText("Manage Photos")).toBeTruthy();
    expect(getByText("View Documents")).toBeTruthy();
    expect(getByText("Edit Property")).toBeTruthy();

    // Count the buttons based on the text (all buttons have text)
    const buttons = [
      ...getAllByText("Manage Photos"),
      ...getAllByText("View Documents"),
      ...getAllByText("Edit Property"),
    ];
    expect(buttons.length).toBe(3);
  });

  test("navigates to correct routes when buttons are pressed", () => {
    const { getByText } = render(<QuickActions property={mockProperty} />);

    // Test Photos navigation - directly find the pressable element
    fireEvent.press(getByText("Manage Photos"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/photos",
      params: { propertyId: 12345 },
    });

    // Test Documents navigation
    fireEvent.press(getByText("View Documents"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/documents",
      params: { propertyId: 12345 },
    });

    // Test Edit navigation
    fireEvent.press(getByText("Edit Property"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/edit",
      params: { propertyId: 12345 },
    });
  });

  test("uses correct property ID for navigation", () => {
    const { getByText } = render(
      <QuickActions property={{ ...mockProperty, property_id: 67890 }} />,
    );

    fireEvent.press(getByText("Edit Property"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(properties)/edit",
      params: { propertyId: 67890 },
    });
  });
});

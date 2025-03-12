import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IncidentCard from "@/components/incidents/list/IncidentCard";
import { Incident } from "@/components/properties/list";
import { getTimeAgo } from "@/components/incidents/lib/utils/incidentHelpers";
import { Text, View, TouchableOpacity, Image as RNImage } from "react-native";

// Mock the helper functions
jest.mock("@/components/incidents/lib/utils/incidentHelpers", () => ({
  getIncidentStatusBadge: jest.fn(() => "bg-red-400/80 text-white rounded-2xl"),
  getTimeAgo: jest.fn(() => "2 hours ago"),
}));

// Mock properties data
jest.mock("@/components/properties/data/properties", () => ({
  properties: [
    {
      property_id: 123,
      address: "123 Test St",
      city: "Test City",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    },
    {
      property_id: 456,
      address: "456 Sample Ave",
      city: "Sample City",
      location: null,
    },
  ],
}));

// Mock UI components for React Native testing
jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View testID="hstack">{children}</View>
  ),
}));

jest.mock("@/components/ui/vstack", () => ({
  VStack: ({ children }: { children: React.ReactNode }) => (
    <View testID="vstack">{children}</View>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <View testID="badge" className={className}>
      {children}
    </View>
  ),
}));

jest.mock("@/components/ui/pressable", () => ({
  Pressable: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity testID="pressable" onPress={onPress}>
      {children}
    </TouchableOpacity>
  ),
}));

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

jest.mock("@/components/ui/heading", () => ({
  Heading: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <Text testID="heading" className={className}>
      {children}
    </Text>
  ),
}));

jest.mock("@/components/ui/image", () => ({
  Image: ({
    source,
    alt,
    className,
    onError,
  }: {
    source: any;
    alt: string;
    className?: string;
    onError?: () => void;
  }) => <RNImage testID="image" source={source} accessibilityLabel={alt} />,
}));

// Mock Constants to avoid issues with GOOGLE_MAPS_API_KEY
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      googleMapsKey: "mock-api-key",
    },
  },
}));

describe("IncidentCard", () => {
  // Create a helper function for type-safe incident creation
  const createTestIncident = (overrides = {}): Incident => {
    const baseIncident: Incident = {
      incident_id: 101,
      property_id: 123,
      incident_type: "Water Damage",
      description: "Leak in kitchen ceiling",
      reported_at: "2025-02-15T10:30:00Z",
      severity: "High" as "Low" | "Medium" | "High" | "Critical",
      status: "Open" as "Open" | "In Progress" | "Resolved" | "Closed",
      images: [],
    };

    return { ...baseIncident, ...overrides };
  };

  // Sample incident for testing
  const mockIncident = createTestIncident();

  // Mock event handlers
  const mockOnPress = jest.fn();
  const mockOnDetailsPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders incident card with correct details", () => {
    const { getByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Check if main incident information is displayed
    expect(getByText("Water Damage")).toBeTruthy();
    expect(getByText("123 Test St, Test City")).toBeTruthy();
    expect(getByText("View Details")).toBeTruthy();
  });

  test("calls onDetailsPress when View Details is pressed", () => {
    const { getByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Press the View Details button
    fireEvent.press(getByText("View Details"));

    // Check if onDetailsPress was called with the incident
    expect(mockOnDetailsPress).toHaveBeenCalledTimes(1);
    expect(mockOnDetailsPress).toHaveBeenCalledWith(mockIncident);
  });

  test("displays property information from properties data", () => {
    const { getByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Should show the property address from the mock properties data
    expect(getByText("123 Test St, Test City")).toBeTruthy();
  });

  test("displays property ID when property not found in data", () => {
    // Incident with a property_id that doesn't exist in the mock properties data
    const incidentWithUnknownProperty = createTestIncident({
      property_id: 999,
    });

    const { getByText } = render(
      <IncidentCard
        incident={incidentWithUnknownProperty}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Should show a fallback with just the property ID
    expect(getByText("Property #999")).toBeTruthy();
  });

  test("displays street view indicator when location is available", () => {
    const { queryByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Should have StreetView text since we're using property_id 123 which has location
    expect(queryByText("Street View")).toBeTruthy();
  });

  test("displays 'No Preview' when location is not available", () => {
    // Incident with a property that has no location data
    const incidentWithNoLocation = createTestIncident({
      property_id: 456, // This has no location in our mock
    });

    const { queryByText } = render(
      <IncidentCard
        incident={incidentWithNoLocation}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Should show No Preview text
    expect(queryByText("No Preview")).toBeTruthy();
  });

  test("handles time ago display", () => {
    const { queryByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Our mock returns "2 hours ago"
    expect(queryByText("2 hours ago")).toBeTruthy();

    // Check that the helper was called with the right date
    expect(getTimeAgo).toHaveBeenCalledWith(mockIncident.reported_at);
  });
});

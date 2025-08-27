import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Linking } from "react-native";
import PropertyActions from "@/components/properties/details/PropertyActions";
import { router } from "expo-router";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  Property,
  PropertyStatus,
} from "@/lib/@types/properties";

// Mock the dependencies
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock Linking
jest.mock("react-native/Libraries/Linking/Linking", () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

// Mock the IconSymbol component to avoid issues with native modules
jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: () => "IconSymbol",
}));

// Helper function to create properly typed incidents
const createIncident = (
  id: number,
  type: string,
  description: string,
  status: string,
  severity: string,
  resolved_at?: string,
): Incident => ({
  propertyId: 12345,
  id: id,
  incidentType: type,
  description,
  reportedAt: "2025-02-15T10:30:00Z",
  severity: severity as IncidentSeverity,
  status: status as IncidentStatus,
  images: [],
  ...(resolved_at ? { resolved_at } : {}),
  createdAt: "",
  updatedAt: "",
});

// Helper function to create test property
const createTestProperty = (incidents: Incident[] = []): Property => ({
  id: 12345,
  address: "123 Test Street",
  city: "Test City",
  state: "TS",
  zipCode: "12345",
  country: "Test Country",
  latitude: 37.7749,
  longitude: -122.4194,
  status: PropertyStatus.Active,
  incidents,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-02-01T00:00:00Z",
  propertyId: 0,
  userId: 0,
  incidentCount: 0,
  openIncidentCount: 0,
});

describe("PropertyActions", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Define incidents using the helper function
  const activeIncidents = [
    createIncident(101, "Plumbing", "Water leak in bathroom", "Open", "Medium"),
    createIncident(
      102,
      "Electrical",
      "Power outage in living room",
      "Resolved",
      "High",
      "2025-02-12T09:45:00Z",
    ),
    createIncident(
      103,
      "HVAC",
      "AC not cooling properly",
      "In Progress",
      "Low",
    ),
  ];

  // Create a test property with the incidents
  const mockProperty = createTestProperty(activeIncidents);

  test("renders correctly with property data", () => {
    const { getByText } = render(<PropertyActions property={mockProperty} />);

    // Check if both buttons are rendered
    expect(getByText("Open in Maps")).toBeTruthy();
    expect(getByText("Issues (2)")).toBeTruthy(); // 2 active incidents (Open and In Progress)
  });

  test('displays "Report Issue" when no active incidents', () => {
    const resolvedIncidents = [
      createIncident(
        104,
        "Plumbing",
        "Fixed faucet",
        "Resolved",
        "Low",
        "2025-02-02T15:45:00Z",
      ),
      createIncident(
        105,
        "Appliance",
        "Refrigerator repair",
        "Closed",
        "Medium",
        "2025-01-26T14:30:00Z",
      ),
    ];

    const propertyWithNoActiveIncidents = createTestProperty(resolvedIncidents);

    const { getByText } = render(
      <PropertyActions property={propertyWithNoActiveIncidents} />,
    );

    expect(getByText("Report Incident")).toBeTruthy();
  });

  test("handles null or undefined incidents gracefully", () => {
    const propertyWithNoIncidents = {
      ...mockProperty,
      incidents: undefined,
    };

    const { getByText } = render(
      <PropertyActions property={propertyWithNoIncidents as Property} />,
    );

    expect(getByText("Report Incident")).toBeTruthy();
  });

  test('opens map URL when "Open in Maps" button is pressed', () => {
    const { getByText } = render(<PropertyActions property={mockProperty} />);

    // Find and press the Maps button
    const mapsButton = getByText("Open in Maps");
    fireEvent.press(mapsButton);

    // Check if Linking.openURL was called with the correct URL
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://www.google.com/maps/search/?api=1&query=37.7749,-122.4194",
    );
  });

  test("navigates to incidents page with correct params when incidents button is pressed", () => {
    const { getByText } = render(<PropertyActions property={mockProperty} />);

    // Find and press the Incidents button
    const incidentsButton = getByText("Issues (2)");
    fireEvent.press(incidentsButton);

    // Check if router.push was called with the correct parameters
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(tabs)/(incidents)",
      params: { propertyId: 12345 },
    });
  });

  test("correctly counts only unresolved incidents", () => {
    const mixedIncidents = [
      createIncident(101, "Plumbing", "Water leak", "Open", "Medium"),
      createIncident(102, "Electrical", "Light fixture", "In Progress", "Low"),
      createIncident(
        103,
        "HVAC",
        "Heating issue",
        "Resolved",
        "High",
        "2025-01-25T16:30:00Z",
      ),
      createIncident(
        104,
        "Appliance",
        "Dishwasher repair",
        "Closed",
        "Medium",
        "2025-01-12T11:45:00Z",
      ),
    ];

    const propertyWithMixedIncidents = createTestProperty(mixedIncidents);

    const { getByText } = render(
      <PropertyActions property={propertyWithMixedIncidents} />,
    );

    // Should only count 'Open' and 'In Progress' incidents
    expect(getByText("Issues (2)")).toBeTruthy();
  });
});

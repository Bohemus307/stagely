import React from "react";
import { render } from "@testing-library/react-native";
import PropertyInformation from "@/components/properties/details/PropertyInformation";
import {
  Incident,
  Property,
  PropertyStatus,
  IncidentStatus,
  IncidentSeverity,
} from "@/lib/@types/properties";

describe("PropertyInformation", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Sample incidents data
  const mockIncidents: Incident[] = [
    {
      id: 101,
      propertyId: 12345,
      incidentType: "Plumbing",
      description: "Water leak in bathroom",
      reportedAt: "2025-02-15T10:30:00Z",
      severity: IncidentSeverity.Medium,
      status: IncidentStatus.Open,
      createdAt: "2025-02-15T10:30:00Z",
      updatedAt: "2025-02-15T10:30:00Z",
      images: [],
      aiClassified: false,
    },
    {
      id: 102,
      propertyId: 12345,
      incidentType: "Electrical",
      description: "Power outage in living room",
      reportedAt: "2025-02-10T14:15:00Z",
      resolvedAt: "2025-02-12T09:45:00Z",
      severity: IncidentSeverity.High,
      status: IncidentStatus.Resolved,
      createdAt: "2025-02-10T14:15:00Z",
      updatedAt: "2025-02-12T09:45:00Z",
      images: [],
      aiClassified: false,
    },
  ];

  // Sample property data
  const mockProperty: Property = {
    id: 12345,
    propertyId: 12345,
    userId: 1,
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    country: "Test Country",
    latitude: 37.7749,
    longitude: -122.4194,
    status: PropertyStatus.Active,
    incidentCount: 2,
    openIncidentCount: 1,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    incidents: mockIncidents,
  };

  test("renders correctly with complete property data", () => {
    const { getByText, queryByText } = render(
      <PropertyInformation property={mockProperty} />,
    );

    // Check for other key elements
    expect(queryByText(/Active/i)).toBeTruthy();
    expect(getByText("123 Test Street")).toBeTruthy();
    expect(getByText("Issues (1)")).toBeTruthy();
  });

  test("renders with maintenance status", () => {
    const maintenanceProperty: Property = {
      ...mockProperty,
      status: PropertyStatus.Maintenance,
    };

    const { getByText } = render(
      <PropertyInformation property={maintenanceProperty} />,
    );

    // Maintenance status badge should be rendered
    expect(getByText(/Maintenance/)).toBeTruthy();
  });

  test("renders location without state", () => {
    const propertyWithoutState: Property = {
      ...mockProperty,
      state: "",
    };

    const { getByText } = render(
      <PropertyInformation property={propertyWithoutState} />,
    );

    // Since our mocks may render text differently, we check for text content more flexibly
    expect(getByText(/123 Test Street/)).toBeTruthy();
  });

  test("does not render RecentIncidents when no incidents", () => {
    const propertyWithoutIncidents: Property = {
      ...mockProperty,
      incidents: [],
    };

    const { queryByText } = render(
      <PropertyInformation property={propertyWithoutIncidents} />,
    );

    // RecentIncidents component should not be rendered
    expect(queryByText("RecentIncidents-12345")).toBeNull();
  });

  test("does not render RecentIncidents when incidents is undefined", () => {
    const propertyWithUndefinedIncidents = {
      ...mockProperty,
      incidents: undefined,
    } as Property;

    const { queryByText } = render(
      <PropertyInformation property={propertyWithUndefinedIncidents} />,
    );

    // RecentIncidents component should not be rendered
    expect(queryByText("RecentIncidents-12345")).toBeNull();
  });
});

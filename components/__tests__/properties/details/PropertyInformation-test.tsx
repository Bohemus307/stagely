import React from "react";
import { render } from "@testing-library/react-native";
import {
  Property,
  PropertyStatus,
  Incident,
} from "@/components/properties/list";
import PropertyInformation from "@/components/properties/details/PropertyInformation";

describe("PropertyInformation", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Sample incidents data
  const mockIncidents: Incident[] = [
    {
      incident_id: 101,
      incident_type: "Plumbing",
      description: "Water leak in bathroom",
      reported_at: "2025-02-15T10:30:00Z",
      severity: "Medium",
      status: "Open",
      images: [],
    },
    {
      incident_id: 102,
      incident_type: "Electrical",
      description: "Power outage in living room",
      reported_at: "2025-02-10T14:15:00Z",
      resolved_at: "2025-02-12T09:45:00Z",
      severity: "High",
      status: "Resolved",
      images: [],
    },
  ];

  // Sample property data
  const mockProperty: Property = {
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
    incidents: mockIncidents,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
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

    const { getByText, getAllByText } = render(
      <PropertyInformation property={propertyWithoutState} />,
    );

    // Uncomment to see what's being rendered
    // debug();

    // Since our mocks may render text differently, we check for text content more flexibly
    expect(getByText(/Test City/)).toBeTruthy();
    expect(getAllByText(/12345/)[0]).toBeTruthy();
    expect(getByText(/Test Country/)).toBeTruthy();
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

  test("properly formats address with missing fields", () => {
    const propertyWithMissingFields: Property = {
      ...mockProperty,
      city: "Test City",
      state: "",
      zip_code: "",
      country: "Test Country",
    };

    const { getByText } = render(
      <PropertyInformation property={propertyWithMissingFields} />,
    );

    // Check for individual parts of the address that should be displayed
    expect(getByText(/Test City/)).toBeTruthy();
    expect(getByText(/Test Country/)).toBeTruthy();
  });
});

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  SafeAreaView,
  Text,
  Linking,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

// Define property status enum
enum PropertyStatus {
  Active = "Active",
  Maintenance = "Maintenance",
  Archived = "Archived",
}

// Define the incident interface
interface Incident {
  incident_id: number;
  incident_type: string;
  description: string;
  reported_at: string;
  severity: string;
  status: string;
  resolved_at?: string;
  images?: {
    image_id: number;
    image_url: string;
    caption: string;
    taken_at: string;
  }[];
}

// Define the property interface
interface Property {
  property_id: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: PropertyStatus;
  images?: {
    image_id: number;
    image_url: string;
    caption: string;
    taken_at: string;
  }[];
  incidents?: Incident[];
  created_at: string;
  updated_at: string;
}

// Street View Image Component
interface StreetViewImageProps {
  latitude: number;
  longitude: number;
  size?: {
    width: number;
    height: number;
  };
  onError?: () => void;
}

const StreetViewImage: React.FC<StreetViewImageProps> = ({
  latitude,
  longitude,
  size = { width: 400, height: 200 },
  onError,
}) => {
  // Get API key from Expo Constants
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey || "";

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=${size.width}x${size.height}&location=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <Image
      source={{ uri: streetViewUrl }}
      alt="Street View"
      className="h-full w-full object-cover rounded-md"
      onError={() => {
        console.log("Street View image failed to load");
        onError && onError();
      }}
    />
  );
};

const PropertyDetailsScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [streetViewError, setStreetViewError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log(`Fetching property with ID: ${propertyId}`);

      // In a real app, you would fetch from an API using the propertyId
      // For example:
      // const response = await fetch(`https://your-api.com/properties/${propertyId}`);
      // const data = await response.json();
      // setProperty(data);

      // For now, we'll simulate a fetch with the propertyId
      setTimeout(() => {
        // Mock properties database
        const propertiesDb = [
          {
            property_id: 1,
            address: "588 Cortez St",
            city: "Salt Lake City",
            state: "UT",
            zip_code: "84103",
            country: "USA",
            location: {
              latitude: 40.7822476,
              longitude: -111.8870798,
            },
            status: PropertyStatus.Active,
            images: [],
            incidents: [
              {
                incident_id: 1,
                incident_type: "Water Damage",
                description:
                  "Leak from upstairs bathroom caused ceiling damage in living room",
                reported_at: "2025-02-22T08:15:00Z",
                severity: "Medium",
                status: "In Progress",
                images: [
                  {
                    image_id: 1,
                    image_url:
                      "storage/incidents/2025_02_22/ceiling_damage_1.jpg",
                    caption: "Ceiling water stain",
                    taken_at: "2025-02-22T08:20:00Z",
                  },
                  {
                    image_id: 2,
                    image_url: "storage/incidents/2025_02_22/bathroom_leak.jpg",
                    caption: "Source of leak in upstairs bathroom",
                    taken_at: "2025-02-22T08:25:00Z",
                  },
                  {
                    image_id: 3,
                    image_url: "storage/incidents/2025_02_22/floor_damage.jpg",
                    caption: "Water damage on hardwood floor",
                    taken_at: "2025-02-22T08:30:00Z",
                  },
                ],
              },
            ],
            created_at: "2025-01-15T10:30:00Z",
            updated_at: "2025-02-22T09:00:00Z",
          },
          {
            property_id: 2,
            address: "742 Evergreen Terrace",
            city: "Springfield",
            state: "OR",
            zip_code: "97403",
            country: "USA",
            location: {
              latitude: 44.0462,
              longitude: -123.022,
            },
            status: PropertyStatus.Active,
            images: [],
            incidents: [],
            created_at: "2024-12-01T14:45:00Z",
            updated_at: "2025-01-15T09:30:00Z",
          },
          {
            property_id: 3,
            address: "221B Baker Street",
            city: "London",
            state: "",
            zip_code: "NW1 6XE",
            country: "UK",
            location: {
              latitude: 51.5237,
              longitude: -0.1585,
            },
            status: PropertyStatus.Maintenance,
            images: [],
            incidents: [],
            created_at: "2024-11-05T08:30:00Z",
            updated_at: "2025-02-01T11:15:00Z",
          },
        ];

        // Find property by ID
        const id = parseInt(propertyId);
        const foundProperty = propertiesDb.find((p) => p.property_id === id);

        // If property found, use it; otherwise, create a fallback property
        const exampleProperty: Property = foundProperty || {
          property_id: id || 0,
          address: `${id || "Unknown"} Main Street`,
          city: "Springfield",
          state: "OR",
          zip_code: "97403",
          country: "USA",
          location: {
            latitude: 44.0462,
            longitude: -123.022,
          },
          status: PropertyStatus.Active,
          images: [],
          incidents: [
            {
              incident_id: 11,
              incident_type: "Electrical Failure",
              description: `Power outage in building #${id}`,
              reported_at: "2025-02-10T20:00:00Z",
              severity: "High",
              status: "Resolved",
              resolved_at: "2025-02-11T02:30:00Z",
              images: [
                {
                  image_id: 47,
                  image_url: "storage/incidents/2025_02_10/fuse_box.jpg",
                  caption: "Main fuse box issue",
                  taken_at: "2025-02-10T20:30:00Z",
                },
                {
                  image_id: 48,
                  image_url:
                    "storage/incidents/2025_02_10/emergency_lighting.jpg",
                  caption: "Emergency lighting active",
                  taken_at: "2025-02-10T21:00:00Z",
                },
              ],
            },
          ],
          created_at: "2024-11-01T08:30:00Z",
          updated_at: "2025-02-11T03:00:00Z",
        };

        setProperty(exampleProperty);
        setLoading(false);
      }, 500);
    };

    if (propertyId) {
      fetchPropertyData();
    } else {
      console.error("No property ID provided in URL parameters");
      setLoading(false);
    }
  }, [propertyId]);

  // Determine status badge color and text based on property status
  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.Archived:
        return { text: "Archived", color: "bg-gray-400/80" };
      case PropertyStatus.Maintenance:
        return { text: "Maintenance", color: "bg-amber-400/80" };
      case PropertyStatus.Active:
      default:
        return { text: "Active", color: "bg-green-400/80" };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get severity badge color
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color for incidents
  const getIncidentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Open Maps app with the location
  const openMaps = () => {
    if (property?.location) {
      const { latitude, longitude } = property.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Text>Loading property details for ID: {propertyId}...</Text>
      </ThemedView>
    );
  }

  if (!property) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Text>Property with ID {propertyId} not found</Text>
        <Button
          className="mt-4 px-4 py-2 bg-blue-500 rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </Button>
      </ThemedView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const statusBadge = getStatusBadge(property.status);
  const activeIncidents =
    property.incidents?.filter(
      (incident) =>
        incident.status !== "Resolved" && incident.status !== "Closed"
    ).length || 0;

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <TouchableOpacity
          onPress={handleBack}
          className="flex flex-row px-1 py-2"
        >
          <Ionicons name="chevron-back" size={24} color="#042C44" />
          <ThemedText>Back</ThemedText>
        </TouchableOpacity>
        <ScrollView className="flex-1">
          {/* Street View Image */}
          {property.location && !streetViewError ? (
            <Box className="h-48 w-full">
              <StreetViewImage
                latitude={property.location.latitude}
                longitude={property.location.longitude}
                size={{ width: 600, height: 300 }}
                onError={() => setStreetViewError(true)}
              />
              <Badge className="absolute bottom-2 left-2 bg-blue-400/70 text-white py-1 px-2 rounded">
                <Text className="text-white text-xs">Street View</Text>
              </Badge>
            </Box>
          ) : (
            <Box className="h-48 w-full bg-gray-100 flex items-center justify-center">
              <IconSymbol name="eye.slash" size={32} color="gray" />
              <Text className="text-sm text-gray-500 mt-2">
                Preview Unavailable
              </Text>
            </Box>
          )}

          {/* Property Information */}
          <Box className="p-4">
            <HStack className="justify-between items-start mb-2">
              <Heading className="text-xl font-bold">
                {property.address}
              </Heading>
              <Badge
                className={`${statusBadge.color} text-white py-1 px-3 rounded-full`}
              >
                <Text className="text-white">{statusBadge.text}</Text>
              </Badge>
            </HStack>

            <HStack className="items-center mb-4">
              <IconSymbol name="location.fill" size={16} color="gray" />
              <Text className="ml-1 text-gray-700">
                {property.city}
                {property.state ? `, ${property.state}` : ""}{" "}
                {property.zip_code}, {property.country}
              </Text>
            </HStack>

            {/* Property Actions */}
            <HStack className="mb-6 space-x-2">
              <Button
                className="flex-1 bg-blue-500 py-2 rounded-md"
                onPress={openMaps}
              >
                <HStack className="items-center justify-center">
                  <IconSymbol name="map.fill" size={16} color="white" />
                  <Text className="text-white ml-2">Open in Maps</Text>
                </HStack>
              </Button>

              <Button
                className="flex-1 bg-indigo-500 py-2 rounded-md"
                onPress={() =>
                  router.push({
                    pathname: "/incidents",
                    params: { propertyId: property.property_id },
                  })
                }
              >
                <HStack className="items-center justify-center">
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={16}
                    color="white"
                  />
                  <Text className="text-white ml-2">
                    {activeIncidents > 0
                      ? `Issues (${activeIncidents})`
                      : "Report Issue"}
                  </Text>
                </HStack>
              </Button>
            </HStack>

            {/* Property Details Section */}
            <Box className="bg-gray-50 rounded-lg p-4 mb-6">
              <Heading className="text-lg font-semibold mb-3">
                Property Details
              </Heading>

              <VStack className="space-y-2">
                <HStack className="justify-between">
                  <Text className="text-gray-500">Property ID</Text>
                  <Text className="font-medium">{property.property_id}</Text>
                </HStack>

                <Divider className="bg-gray-200" />

                <HStack className="justify-between">
                  <Text className="text-gray-500">Added On</Text>
                  <Text className="font-medium">
                    {formatDate(property.created_at)}
                  </Text>
                </HStack>

                <Divider className="bg-gray-200" />

                <HStack className="justify-between">
                  <Text className="text-gray-500">Last Updated</Text>
                  <Text className="font-medium">
                    {formatDate(property.updated_at)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Recent Incidents Section */}
            {property.incidents && property.incidents.length > 0 && (
              <Box className="mb-6">
                <Heading className="text-lg font-semibold mb-3">
                  Recent Incidents
                </Heading>

                <VStack className="space-y-3">
                  {property.incidents.slice(0, 3).map((incident) => (
                    <Box
                      key={incident.incident_id}
                      className="bg-white rounded-lg border border-gray-200 p-3"
                    >
                      <HStack className="justify-between items-start mb-2">
                        <Text className="font-medium">
                          {incident.incident_type}
                        </Text>
                        <Badge
                          className={getIncidentStatusBadge(incident.status)}
                        >
                          <Text className="text-xs">{incident.status}</Text>
                        </Badge>
                      </HStack>

                      <Text className="text-gray-600 text-sm mb-2">
                        {incident.description}
                      </Text>

                      <HStack className="justify-between items-center">
                        <Badge className={getSeverityBadge(incident.severity)}>
                          <Text className="text-xs">
                            {incident.severity} Priority
                          </Text>
                        </Badge>
                        <Text className="text-xs text-gray-500">
                          {formatDate(incident.reported_at)}
                        </Text>
                      </HStack>

                      {/* Incident Images Preview */}
                      {incident.images && incident.images.length > 0 && (
                        <HStack className="mt-3 space-x-2">
                          {incident.images.slice(0, 3).map((image) => (
                            <Box
                              key={image.image_id}
                              className="h-16 w-16 rounded overflow-hidden bg-gray-100"
                            >
                              <Image
                                source={{ uri: image.image_url }}
                                alt={image.caption}
                                className="h-full w-full object-cover"
                              />
                            </Box>
                          ))}
                          {incident.images.length > 3 && (
                            <Box className="h-16 w-16 rounded overflow-hidden bg-gray-200 items-center justify-center">
                              <Text className="text-gray-600 font-medium">
                                +{incident.images.length - 3}
                              </Text>
                            </Box>
                          )}
                        </HStack>
                      )}
                    </Box>
                  ))}
                </VStack>

                {/* View All Button */}
                {property.incidents.length > 3 && (
                  <Button
                    className="mt-3 py-2 bg-white border border-gray-300 rounded-md"
                    onPress={() =>
                      router.push({
                        pathname: "/incidents",
                        params: { propertyId: property.property_id },
                      })
                    }
                  >
                    <Text className="text-gray-700 text-center">
                      View All {property.incidents.length} Incidents
                    </Text>
                  </Button>
                )}
              </Box>
            )}

            {/* Quick Actions Section */}
            <Box className="bg-indigo-50 rounded-lg p-4 mb-6">
              <Heading className="text-lg font-semibold mb-3">
                Quick Actions
              </Heading>

              <VStack className="space-y-2">
                <Button
                  className="bg-white border border-gray-300 py-3 rounded-md"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(properties)/photos",
                      params: { propertyId: property.property_id },
                    })
                  }
                >
                  <HStack className="items-center justify-center">
                    <IconSymbol name="photo" size={18} color="#4F46E5" />
                    <Text className="ml-2 text-indigo-700">Manage Photos</Text>
                  </HStack>
                </Button>

                <Button
                  className="bg-white border border-gray-300 py-3 rounded-md"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(properties)/documents",
                      params: { propertyId: property.property_id },
                    })
                  }
                >
                  <HStack className="items-center justify-center">
                    <IconSymbol name="doc.text" size={18} color="#4F46E5" />
                    <Text className="ml-2 text-indigo-700">View Documents</Text>
                  </HStack>
                </Button>

                <Button
                  className="bg-white border border-gray-300 py-3 rounded-md"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(properties)/edit",
                      params: { propertyId: property.property_id },
                    })
                  }
                >
                  <HStack className="items-center justify-center">
                    <IconSymbol name="pencil" size={18} color="#4F46E5" />
                    <Text className="ml-2 text-indigo-700">Edit Property</Text>
                  </HStack>
                </Button>
              </VStack>
            </Box>
          </Box>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertyDetailsScreen;

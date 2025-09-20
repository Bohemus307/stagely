import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

// Define interface for Event object
export interface UserEvent {
  eventId: string;
  eventType: string;
  timestamp: number;
  entityId: string;
  entityType: "property" | "incident" | "inspection";
  metadata: Record<string, any>;
  source: string;
  datePartition: string;
}

// Define interface for API response
interface EventsResponse {
  data: UserEvent[];
  meta: {
    limit: number;
    hasMore: boolean;
    lastEvaluatedKey: string;
  };
}

// Define valid entity types
export type EntityType = "property" | "incident" | "inspection";

// Define interface for query parameters
export interface UserEventsQueryParams {
  limit?: number;
  eventType?: string;
  entityType?: EntityType;
  entityId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  lastEvaluatedKey?: string;
}

/**
 * Custom hook to get user events with filtering and pagination options
 * @param queryParams Optional query parameters for filtering and pagination
 * @returns User events data, loading state, error state, refetch function, and pagination info
 */
export const useGetUserEvents = (queryParams?: UserEventsQueryParams) => {
  const {
    getCredentials,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to fetch user events from backend
  const {
    data: eventsResponse,
    isLoading: eventsLoading,
    error: eventsError,
    refetch,
  } = useQuery<EventsResponse>({
    queryKey: ["userEvents", queryParams],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Build URL with query parameters
      const url = new URL(`https://${apiUrl}/events`);

      // Add query parameters if provided
      if (queryParams) {
        if (queryParams.limit !== undefined) {
          url.searchParams.append("limit", queryParams.limit.toString());
        }

        if (queryParams.eventType) {
          url.searchParams.append("eventType", queryParams.eventType);
        }

        if (queryParams.entityType) {
          url.searchParams.append("entityType", queryParams.entityType);
        }

        if (queryParams.entityId) {
          url.searchParams.append("entityId", queryParams.entityId);
        }

        if (queryParams.startDate) {
          const startDate =
            queryParams.startDate instanceof Date
              ? queryParams.startDate.toISOString()
              : queryParams.startDate;
          url.searchParams.append("startDate", startDate);
        }

        if (queryParams.endDate) {
          const endDate =
            queryParams.endDate instanceof Date
              ? queryParams.endDate.toISOString()
              : queryParams.endDate;
          url.searchParams.append("endDate", endDate);
        }

        if (queryParams.lastEvaluatedKey) {
          url.searchParams.append(
            "lastEvaluatedKey",
            queryParams.lastEvaluatedKey,
          );
        }
      }

      // Fetch user events from the backend
      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl,
  });

  return {
    events: eventsResponse?.data || [],
    pagination: eventsResponse?.meta,
    isLoading: authLoading || eventsLoading,
    error: authError || eventsError,
    refetch,
  };
};

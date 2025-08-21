import Search from "@/components/Search";
import { Badge } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";
import { router, useLocalSearchParams } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";

export interface IncidentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
}

const IncidentSearch: React.FC<IncidentSearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId
    ? parseInt(params.propertyId as string)
    : undefined;

  const { property, isLoading: propertyLoading } = useGetProperty(
    propertyId ? propertyId.toString() : "",
  );

  const incidentFilterOptions = [
    { label: "All", value: null },
    { label: "Urgent", value: "High" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
  ];

  const hasPropertyFilter = !!propertyId;
  const hasStatusFilter = !!statusFilter;
  const hasAnyFilters = hasPropertyFilter || hasStatusFilter;

  const handleClearPropertyFilter = () => {
    router.push("/(incidents)");
  };

  const getPropertyDisplayName = () => {
    if (propertyLoading) return "Loading...";
    if (!property) return `Property #${propertyId}`;
    return property.address;
  };

  return (
    <View>
      <Search
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        placeholderText="Search Incidents..."
        filterOptions={incidentFilterOptions}
        onSearchSubmit={function (query: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      {hasAnyFilters && (
        <View className="flex flex-row items-center w-full gap-2 ">
          <HStack className=" items-center gap-2 flex-wrap">
            <Text className="text-sm text-primary-500 mr-1">Filtering by:</Text>

            {hasPropertyFilter && (
              <Badge className="py-1 rounded-full">
                <HStack className="items-center">
                  <IconSymbol name="house.fill" size={12} color="#000000" />
                  <Text className="text-primary-500 text-sm ml-1 mr-10">
                    {getPropertyDisplayName()}
                  </Text>
                  <TouchableOpacity onPress={handleClearPropertyFilter}>
                    <IconSymbol name="xmark" size={12} color="#000000" />
                  </TouchableOpacity>
                </HStack>
              </Badge>
            )}
          </HStack>
        </View>
      )}
    </View>
  );
};

export default IncidentSearch;

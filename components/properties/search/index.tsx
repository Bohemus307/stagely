import React, { useState, useEffect } from "react";
import { SearchIcon, CheckIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "@/components/ui/pressable";
import { Colors } from "@/constants/Colors";
import { Button, ButtonText } from "@/components/ui/button";
import { Menu, MenuItem } from "@/components/ui/menu";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxGroup,
} from "@/components/ui/checkbox";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import { VStack } from "@/components/ui/vstack";
import { usePropertySearch } from "@/hooks/properties/usePropertiesSearch";

// Define filter types
type FilterId = "recent" | "active" | "maintenance" | "archived" | null;

interface Filter {
  id: Exclude<FilterId, null>;
  label: string;
}

// Incident types
type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Closed";

// Props interface for PropertySearch
interface PropertySearchProps {
  onSearchResults?: (properties: any[]) => void;
  onSearchCleared?: () => void;
}

const PropertySearch: React.FC<PropertySearchProps> = ({
  onSearchResults,
  onSearchCleared,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterId>("recent");
  const [incidentSeverityValues, setIncidentSeverityValues] = useState<
    string[]
  >([]);
  const [incidentStatusValues, setIncidentStatusValues] = useState<string[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  // Use the property search hook - don't load on initial render unless there's a query
  const { properties, isLoading, error, refetch } = usePropertySearch(
    debouncedQuery,
    1,
    10,
  );

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Update parent component with search results
  useEffect(() => {
    if (debouncedQuery && properties && onSearchResults) {
      onSearchResults(properties);
    } else if (!debouncedQuery && onSearchCleared) {
      onSearchCleared();
    }
  }, [properties, debouncedQuery, onSearchResults, onSearchCleared]);

  const filters: Filter[] = [
    { id: "recent", label: "Recent" },
    { id: "active", label: "Active" },
    { id: "maintenance", label: "Maintenance" },
    { id: "archived", label: "Archived" },
  ];

  const handleFilterPress = (filterId: Exclude<FilterId, null>): void => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
    // Refetch with current query and updated filter
    if (debouncedQuery) {
      refetch();
    }
  };

  const applyFilters = (): void => {
    // Apply the filters and refetch
    console.log("Applying filters:", {
      incidentSeverity: incidentSeverityValues,
      incidentStatus: incidentStatusValues,
    });

    // Refetch with current query and filters
    if (debouncedQuery) {
      refetch();
    }
  };

  const resetFilters = (): void => {
    setIncidentSeverityValues([]);
    setIncidentStatusValues([]);
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    if (onSearchCleared) {
      onSearchCleared();
    }
  };

  const incidentSeverities: IncidentSeverity[] = [
    "Low",
    "Medium",
    "High",
    "Critical",
  ];
  const statusOptions: IncidentStatus[] = [
    "Open",
    "In Progress",
    "Resolved",
    "Closed",
  ];

  return (
    <View>
      <View className="flex flex-row items-center w-full gap-2">
        <Input className="w-11/12 rounded-2xl border">
          <InputSlot className="pl-3">
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.light.tint} />
            ) : (
              <InputIcon as={SearchIcon} />
            )}
          </InputSlot>
          <InputField
            placeholder="Search Properties..."
            value={searchQuery}
            onChangeText={handleSearchInputChange}
          />
          {searchQuery ? (
            <InputSlot>
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={18} color="gray" />
              </TouchableOpacity>
            </InputSlot>
          ) : null}
        </Input>

        <Menu
          placement="bottom right"
          trigger={({ ...triggerProps }) => (
            <Pressable {...triggerProps}>
              <Ionicons
                name="filter"
                size={24}
                color={Colors.light.tabIconDefault}
              />
            </Pressable>
          )}
        >
          <MenuItem>
            <View className="w-72">
              <View className="p-3 border-b border-gray-200">
                <Text className="text-lg font-bold">Filter Properties</Text>
              </View>

              <View className="p-3">
                <VStack space="md">
                  {/* Incident Severity Section */}
                  <View>
                    <Text className="font-semibold mb-2">
                      Incident Severity
                    </Text>
                    <CheckboxGroup
                      value={incidentSeverityValues}
                      onChange={setIncidentSeverityValues}
                    >
                      <VStack space="sm">
                        {incidentSeverities.map((severity) => (
                          <Checkbox key={severity} value={severity}>
                            <CheckboxIndicator>
                              <CheckboxIcon as={CheckIcon} />
                            </CheckboxIndicator>
                            <CheckboxLabel>{severity}</CheckboxLabel>
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </View>

                  <Divider />

                  {/* Incident Status Section */}
                  <View>
                    <Text className="font-semibold mb-2">Incident Status</Text>
                    <CheckboxGroup
                      value={incidentStatusValues}
                      onChange={setIncidentStatusValues}
                    >
                      <VStack space="sm">
                        {statusOptions.map((status) => (
                          <Checkbox key={status} value={status}>
                            <CheckboxIndicator>
                              <CheckboxIcon as={CheckIcon} />
                            </CheckboxIndicator>
                            <CheckboxLabel>{status}</CheckboxLabel>
                          </Checkbox>
                        ))}
                      </VStack>
                    </CheckboxGroup>
                  </View>
                </VStack>
              </View>

              <View className="p-3 border-t border-gray-200">
                <HStack space="md" className="justify-between">
                  <Button variant="outline" onPress={resetFilters}>
                    <ButtonText>Reset</ButtonText>
                  </Button>
                  <Button onPress={applyFilters}>
                    <ButtonText>Apply</ButtonText>
                  </Button>
                </HStack>
              </View>
            </View>
          </MenuItem>
        </Menu>
      </View>

      <View className="flex flex-row flex-wrap gap-2 mt-3 px-1">
        {filters.map((filter) => (
          <Pressable
            key={filter.id}
            onPress={() => handleFilterPress(filter.id)}
            className={`px-3 py-1.5 rounded-full border ${
              activeFilter === filter.id
                ? "bg-primary-500 border-primary-500"
                : "bg-white border-gray-300"
            }`}
          >
            <Text
              className={`text-sm ${
                activeFilter === filter.id ? "text-white" : "text-gray-700"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && (
        <Text className="text-red-500 mt-2 px-1">
          Error searching properties: {error.message}
        </Text>
      )}
    </View>
  );
};

export default PropertySearch;

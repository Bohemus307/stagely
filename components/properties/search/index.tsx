import React, { useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { SearchIcon, CheckIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text } from "react-native";
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

// Define filter types
type FilterId = "recent" | "active" | "maintenance" | "archived" | null;

interface Filter {
  id: Exclude<FilterId, null>;
  label: string;
}

// Incident types
type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
type IncidentStatus = "Open" | "In Progress" | "Resolved" | "Closed";

const PropertySearch: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterId>("recent");
  const [incidentSeverityValues, setIncidentSeverityValues] = useState<
    string[]
  >([]);
  const [incidentStatusValues, setIncidentStatusValues] = useState<string[]>(
    [],
  );

  const filters: Filter[] = [
    { id: "recent", label: "Recent" },
    { id: "active", label: "Active" },
    { id: "maintenance", label: "Maintenance" },
    { id: "archived", label: "Archived" },
  ];

  const handleFilterPress = (filterId: Exclude<FilterId, null>): void => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
    // Here you would eventually implement the actual filtering logic
  };

  const applyFilters = (): void => {
    // Here you would implement the logic to apply the filters
    console.log("Applying filters:", {
      incidentSeverity: incidentSeverityValues,
      incidentStatus: incidentStatusValues,
    });
  };

  const resetFilters = (): void => {
    setIncidentSeverityValues([]);
    setIncidentStatusValues([]);
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
    <ThemedView>
      <View className="flex flex-row items-center w-full gap-2">
        <Input className="w-11/12 rounded-2xl border">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField placeholder="Search Properties..." />
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
    </ThemedView>
  );
};

export default PropertySearch;

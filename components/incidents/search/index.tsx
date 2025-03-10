import React from "react";
import { ThemedView } from "@/components/ThemedView";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Pressable } from "@/components/ui/pressable";

interface IncidentSearchProps {
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
  const statuses = [
    { label: "All", value: null },
    { label: "Urgent", value: "High" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
  ];

  const handleStatusSelect = (status: string | null) => {
    onStatusFilterChange(status);
  };

  return (
    <ThemedView>
      <View className="flex flex-row items-center w-full gap-2">
        <Input className="w-11/12 rounded-2xl border">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder="Search Incidents..."
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </Input>
        <Pressable>
          <Ionicons
            name="filter"
            size={24}
            color={Colors.light.tabIconDefault}
          />
        </Pressable>
      </View>

      <View className="flex flex-row flex-wrap gap-2 mt-3 px-1">
        {statuses.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => handleStatusSelect(item.value)}
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === item.value ||
              (statusFilter === null && item.value === null)
                ? "bg-primary-500 border-primary-500"
                : "bg-white border-gray-300"
            }`}
          >
            <Text
              className={`text-sm ${
                statusFilter === item.value ||
                (statusFilter === null && item.value === null)
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
};

export default IncidentSearch;

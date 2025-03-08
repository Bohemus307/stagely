import React from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Badge } from "@/components/ui/badge";
import { Pressable } from "@/components/ui/pressable";

interface FilterOption {
  label: string;
  value: string | null;
}

interface SearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  placeholderText: string;
  filterOptions: FilterOption[];
}

const Search: React.FC<SearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  placeholderText,
  filterOptions,
}) => {
  const handleStatusSelect = (status: string | null) => {
    onStatusFilterChange(status);
  };

  return (
    <ThemedView>
      {/* Search Input */}
      <View className="flex flex-row items-center w-full gap-2">
        <Input className="flex-1 rounded-2xl border ml-2">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder={placeholderText}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </Input>
        <Pressable className="p-2">
          <Ionicons
            name="filter"
            size={24}
            color={Colors.light.tabIconDefault}
          />
        </Pressable>
      </View>

      {/* Filter Badges */}
      <Box className="mt-2 w-full">
        <HStack className="flex-wrap gap-2 ml-2 mr-2 mb-0">
          {filterOptions.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handleStatusSelect(item.value)}
            >
              <Badge
                className={`py-1 px-3 rounded-full ${
                  statusFilter === item.value ||
                  (statusFilter === null && item.value === null)
                    ? "bg-primary-500"
                    : "bg-gray-100"
                }`}
              >
                <ThemedText
                  className={`text-sm font-medium ${
                    statusFilter === item.value ||
                    (statusFilter === null && item.value === null)
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </ThemedText>
              </Badge>
            </Pressable>
          ))}
        </HStack>
      </Box>
    </ThemedView>
  );
};

export default Search;

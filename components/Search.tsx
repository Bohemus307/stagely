import React from "react";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text } from "react-native";
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
    <View>
      {/* Search Input */}
      <View className="flex flex-row items-center w-full gap-2">
        <Input className="w-full rounded-2xl border">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder={placeholderText}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </Input>
      </View>

      {/* Filter Badges */}
      <View className="flex flex-row flex-wrap gap-2 mt-3 px-1">
        {filterOptions.map((item) => (
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
    </View>
  );
};

export default Search;

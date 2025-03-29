import React, { useState, useEffect } from "react";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "@/components/ui/pressable";
import { Colors } from "@/constants/Colors";
import { usePropertySearch } from "@/hooks/properties/usePropertiesSearch";

// Define filter types
type FilterId = "recent" | "active" | "maintenance" | "archived" | null;

interface Filter {
  id: Exclude<FilterId, null>;
  label: string;
}

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

  return (
    <View>
      <View className="flex flex-row items-center w-full">
        <Input className="w-full rounded-2xl border">
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

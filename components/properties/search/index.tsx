import React, { useState, useEffect } from "react";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

// Props interface for PropertySearch
interface PropertySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  error?: any;
}

const PropertySearch: React.FC<PropertySearchProps> = ({
  searchQuery,
  onSearchChange,
  isLoading = false,
  error,
}) => {
  const [inputValue, setInputValue] = useState<string>(searchQuery);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange, searchQuery]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  const clearSearch = () => {
    setInputValue("");
    onSearchChange("");
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
            value={inputValue}
            onChangeText={handleInputChange}
          />
          {inputValue ? (
            <InputSlot>
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color="gray"
                  className="mr-2"
                />
              </TouchableOpacity>
            </InputSlot>
          ) : null}
        </Input>
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

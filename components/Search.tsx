import React from "react";
import { CheckIcon, SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Pressable } from "@/components/ui/pressable";
import { Menu, MenuItem } from "@/components/ui/menu";
import { Button, ButtonText } from "@/components/ui/button";
import {
  CheckboxGroup,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";

interface FilterOption {
  label: string;
  value: string | null;
}

interface FilterSection {
  title: string;
  options: { label: string; value: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}

interface SearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  placeholderText: string;
  filterOptions: FilterOption[];
  menuTitle?: string;
  filterSections?: FilterSection[];
  onResetFilters?: () => void;
  onApplyFilters?: () => void;
  showAdvancedFilters?: boolean;
}

const Search: React.FC<SearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  placeholderText,
  filterOptions,
  menuTitle = "Filter",
  filterSections = [],
  onResetFilters = () => {},
  onApplyFilters = () => {},
  showAdvancedFilters = false,
}) => {
  const handleStatusSelect = (status: string | null) => {
    onStatusFilterChange(status);
  };

  return (
    <View>
      {/* Search Input */}
      <View className="flex flex-row items-center w-full gap-2">
        <Input className="w-11/12 rounded-2xl border">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder={placeholderText}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </Input>
        {showAdvancedFilters && filterSections.length > 0 ? (
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
                  <Text className="text-lg font-bold">{menuTitle}</Text>
                </View>

                <View className="p-3">
                  <VStack space="md">
                    {filterSections.map((section, index) => (
                      <React.Fragment key={section.title}>
                        {index > 0 && <Divider />}
                        <View>
                          <Text className="font-semibold mb-2">
                            {section.title}
                          </Text>
                          <CheckboxGroup
                            value={section.values}
                            onChange={section.onChange}
                          >
                            <VStack space="sm">
                              {section.options.map((option) => (
                                <Checkbox
                                  key={option.value}
                                  value={option.value}
                                >
                                  <CheckboxIndicator>
                                    <CheckboxIcon as={CheckIcon} />
                                  </CheckboxIndicator>
                                  <CheckboxLabel>{option.label}</CheckboxLabel>
                                </Checkbox>
                              ))}
                            </VStack>
                          </CheckboxGroup>
                        </View>
                      </React.Fragment>
                    ))}
                  </VStack>
                </View>

                <View className="p-3 border-t border-gray-200">
                  <HStack space="md" className="justify-between">
                    <Button variant="outline" onPress={onResetFilters}>
                      <ButtonText>Reset</ButtonText>
                    </Button>
                    <Button onPress={onApplyFilters}>
                      <ButtonText>Apply</ButtonText>
                    </Button>
                  </HStack>
                </View>
              </View>
            </MenuItem>
          </Menu>
        ) : (
          <Pressable>
            <Ionicons
              name="filter"
              size={24}
              color={Colors.light.tabIconDefault}
            />
          </Pressable>
        )}
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

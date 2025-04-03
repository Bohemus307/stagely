import { Pressable, Text, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { Property } from "@/lib/@types/properties";
import { getStatusBadge } from "@/components/properties/lib/utils/detailsHelpers";
import { Dispatch, SetStateAction } from "react";

// Define filter types
type FilterId = "recent" | "all" | "spaces" | null;

interface Filter {
  id: Exclude<FilterId, null>;
  label: string;
}

const PhotoSearch = ({
  property,
  setActiveFilter,
  activeFilter,
}: {
  property: Property;
  setActiveFilter: Dispatch<SetStateAction<string>>;
  activeFilter: string;
}) => {
  const filters: Filter[] = [
    { id: "all", label: "All" },
    { id: "recent", label: "Recent" },
    { id: "spaces", label: "By Space" },
  ];

  const statusBadge = getStatusBadge(property?.status);
  return (
    <Box className="px-4 pb-3">
      {/* Property Info Summary */}
      <Box>
        <HStack className="justify-between items-start p-4 mb-4 mt-2 bg-primary-50 rounded-2xl">
          <Heading className="text-lg w-3/4 font-bold">
            <ThemedText>{property.address}</ThemedText>
          </Heading>
          <Badge className={`${statusBadge.color} py-1 px-3 rounded-full`}>
            <ThemedText>{statusBadge.text}</ThemedText>
          </Badge>
        </HStack>
      </Box>

      {/* Search Bar */}
      <Box className="flex-row items-center mb-4">
        <Input className="w-full rounded-2xl border">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder={"Search photos..."}
            //value={searchQuery}
            //onChangeText={onSearchChange}
          />
        </Input>
      </Box>
      {/* Filter Chips */}
      <View className="flex flex-row flex-wrap gap-2">
        {filters.map((filter) => (
          <Pressable
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
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
    </Box>
  );
};

export default PhotoSearch;

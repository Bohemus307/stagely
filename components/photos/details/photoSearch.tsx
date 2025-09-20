import React from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Property } from "@/lib/@types/properties";

interface PhotoSearchProps {
  property: Property | null;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  spaceTypes?: string[];
}

const PhotoSearch: React.FC<PhotoSearchProps> = ({
  property,
  activeFilter,
  setActiveFilter,
  spaceTypes = ["all"],
}) => {
  return (
    <View className="px-4">
      <ThemedText className="text-2xl font-bold mb-2">
        {property?.address || "Property"} Photos
      </ThemedText>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row py-2"
      >
        {spaceTypes.map((type) => (
          <Pressable
            key={type}
            onPress={() => setActiveFilter(type)}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              className={`px-4 py-2 mr-2 rounded-full ${
                activeFilter === type
                  ? "bg-primary-500"
                  : "bg-white dark:bg-primary-700"
              }`}
            >
              <Text
                className={`${
                  activeFilter === type
                    ? "text-white"
                    : "text-gray-800 dark:text-gray-200"
                } capitalize`}
              >
                {type}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default PhotoSearch;

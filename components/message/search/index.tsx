import React, { useState, useCallback, useRef } from "react";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputSlot, InputIcon, InputField } from "@/components/ui/input";
import { View, Text, Keyboard } from "react-native";
import { Pressable } from "@/components/ui/pressable";

export interface MessageSearchProps {
  onSearchSubmit: (query: string) => void;
  onSearchClear: () => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  initialQuery?: string;
}

const MESSAGE_FILTER_OPTIONS = [
  { label: "All", value: null },
  { label: "Unread", value: "Unread" },
];

const MessageSearch: React.FC<MessageSearchProps> = React.memo(
  ({
    onSearchSubmit,
    onSearchClear,
    statusFilter,
    onStatusFilterChange,
    initialQuery = "",
  }) => {
    const [localSearchQuery, setLocalSearchQuery] = useState(initialQuery);
    const inputRef = useRef<any>(null);

    const handleStatusSelect = useCallback(
      (status: string | null) => {
        onStatusFilterChange(status);
      },
      [onStatusFilterChange],
    );

    const handleTextChange = useCallback(
      (text: string) => {
        console.log("🔍 Local search changed:", text);
        setLocalSearchQuery(text);

        if (text.trim() === "") {
          onSearchClear();
        }
      },
      [onSearchClear],
    );

    const handleSubmitEditing = useCallback(() => {
      onSearchSubmit(localSearchQuery.trim());
      Keyboard.dismiss();
    }, [localSearchQuery, onSearchSubmit]);

    return (
      <View>
        {/* Search Input */}
        <View className="flex flex-row items-center w-full gap-2">
          <Input className="w-full rounded-2xl border">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField
              ref={inputRef}
              placeholder="Search Messages..."
              value={localSearchQuery}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              selectTextOnFocus={false}
            />
          </Input>
        </View>

        {/* Filter Badges */}
        {MESSAGE_FILTER_OPTIONS.length > 0 && (
          <View className="flex flex-row flex-wrap gap-2 mt-3 px-1">
            {MESSAGE_FILTER_OPTIONS.map((item) => (
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
        )}
      </View>
    );
  },
);

MessageSearch.displayName = "MessageSearch";

export default MessageSearch;

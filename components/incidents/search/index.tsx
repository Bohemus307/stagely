import React from 'react'
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchIcon } from '@/components/ui/icon';
import { Input, InputSlot, InputIcon, InputField } from '@/components/ui/input';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Badge } from '@/components/ui/badge';
import { Pressable } from '@/components/ui/pressable';

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
  onStatusFilterChange
}) => {


  const statuses = [
    { label: 'All', value: null },
    { label: 'Urgent', value: 'High' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
  ];

  const handleStatusSelect = (status: string | null) => {
    onStatusFilterChange(status);
  }

  return (
    <ThemedView>
    <View className='flex flex-row items-center w-full'>
      <Input className="flex-1 rounded-2xl border">
        <InputSlot className="pl-3">
          <InputIcon as={SearchIcon} />
        </InputSlot>
        <InputField
          placeholder="Search Incidents..."
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </Input>
      <Pressable className="p-2">
        <Ionicons name="filter" size={24} color={Colors.light.tabIconDefault} />
      </Pressable>
    </View>

    <Box className="mt-2 w-full">
      <HStack className="flex-wrap gap-1 mr-2 mb-0">
        {statuses.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => handleStatusSelect(item.value)}
          >
            <Badge
              className={`py-1 px-3 rounded-full ${
                statusFilter === item.value ||
                (statusFilter === null && item.value === null)
                  ? 'bg-primary-500'
                  : 'bg-gray-100'
              }`}
            >
              <ThemedText
                className={`text-sm font-medium ${
                  statusFilter === item.value ||
                  (statusFilter === null && item.value === null)
                    ? 'text-white'
                    : 'text-gray-700'
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
}

export default IncidentSearch;

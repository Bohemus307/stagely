import React from 'react'
import { ThemedView } from '@/components/ThemedView';
import { SearchIcon } from '@/components/ui/icon';
import { Input, InputSlot, InputIcon, InputField } from '@/components/ui/input';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from '@/components/ui/pressable';
import { Colors } from "@/constants/Colors";

const PropertySearch = () => {
  return (
    <ThemedView>
      <View className='flex flex-row items-center w-full gap-2'>
        <Input className=" w-11/12 rounded-2xl border">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField placeholder="Search Properties..." />
        </Input>
        <Pressable>
          <Ionicons name="filter" size={24} color={Colors.light.tabIconDefault} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

export default PropertySearch;
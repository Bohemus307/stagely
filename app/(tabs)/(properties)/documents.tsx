import { SafeAreaView } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/ui/BackButton';
import { ThemedText } from '@/components/ThemedText';

const Documents = () => {
  return (
    <ThemedView className="flex-1">
      <BackButton />
      <SafeAreaView className="flex-1">
        <ThemedText>PHOTOS</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

export default Documents
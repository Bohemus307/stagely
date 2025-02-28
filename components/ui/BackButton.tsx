import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ThemedText } from '../ThemedText';

const BackButton = () => {
  const handleBack = () => {
    router.back();
  };
  
  return (
    <TouchableOpacity onPress={handleBack} className="flex flex-row px-1 py-3">
      <Ionicons
        name="chevron-back"
        size={24}
        color={Colors.light.tabIconDefault}
      />
      <ThemedText>Back</ThemedText>
    </TouchableOpacity>
  );
}

export default BackButton;
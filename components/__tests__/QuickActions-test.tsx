import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuickActions from '../QuickActions';
import { Text, View } from 'react-native';

// Mock the necessary components
jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
}));

jest.mock('@/components/ui/hstack', () => ({
  HStack: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock('@/components/ui/box', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: ({ name, size, color }: { name: string, size: number, color: string }) => <Text>{name}</Text>,
}));

// Ensure the router is mocked correctly
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

describe('QuickActions Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<QuickActions />);

    // Check if the component renders the "Quick Actions" text and the button texts
    expect(getByText('Quick Actions')).toBeTruthy();
    expect(getByText('Add Property')).toBeTruthy();
    expect(getByText('New Incident')).toBeTruthy();
  });

  it('navigates to the correct routes when buttons are pressed', () => {
    const { getByText } = render(<QuickActions />);

    // Get the router mock
    const { push } = require('expo-router').useRouter();

    // Simulate pressing the "Add Property" button
    fireEvent.press(getByText('Add Property'));
    expect(push).toHaveBeenCalledWith('/properties'); // Expect navigation to /properties

    // Simulate pressing the "New Incident" button
    fireEvent.press(getByText('New Incident'));
    expect(push).toHaveBeenCalledWith('/incidents'); // Expect navigation to /incidents
  });
});


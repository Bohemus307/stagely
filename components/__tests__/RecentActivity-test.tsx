import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import RecentActivity from '../RecentActivity';
import { Text, View } from 'react-native';

// Mock necessary components
jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
}));

jest.mock('@/components/ThemedView', () => ({
  ThemedView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock('@/components/ui/box', () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

describe('RecentActivity Component', () => {
  it('renders correctly and shows "Recent Activity" text', () => {
    render(<RecentActivity />);

    // Check if the component renders the "Recent Activity" text
    expect(screen.getByText('Recent Activity')).toBeTruthy();
  });

  it('displays the recent activity after state is updated', async () => {
    render(<RecentActivity />);

    // Wait for the useEffect to complete and for the state to update
    await waitFor(() => screen.getByText('New incident reported at Property A'));

    // Check if the component renders the activity descriptions after the state update
    expect(screen.getByText('New incident reported at Property A')).toBeTruthy();
    expect(screen.getByText('Maintenance completed at Property B')).toBeTruthy();
    expect(screen.getByText('Document updated for Property C')).toBeTruthy();
  });
});

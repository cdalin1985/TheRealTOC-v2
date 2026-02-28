/**
 * Test to verify relative imports work
 */

import React from 'react';
import { Text, View } from 'react-native';
import { renderWithProviders } from './test-utils';

// Simple test component
const TestComponent = () => (
  <View>
    <Text testID="test-text">Hello Test</Text>
  </View>
);

describe('Relative Import Test', () => {
  it('should render test component', () => {
    const { getByTestId } = renderWithProviders(<TestComponent />);
    expect(getByTestId('test-text')).toBeTruthy();
  });
});

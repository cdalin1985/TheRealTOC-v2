import React from 'react';
import { render, fireEvent } from './test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press Me</Button>);
    
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { queryByText } = render(
      <Button loading>Loading</Button>
    );
    expect(queryByText('Loading')).toBeNull();
  });

  it('is disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} loading>Loading</Button>
    );
    
    fireEvent.press(getByText('Loading'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
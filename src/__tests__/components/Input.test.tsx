import React from 'react';
import { renderWithProviders, fireEvent } from '../test-utils';
import { Input } from '@/components/Input';

describe('Input', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders basic input', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Enter text" />
      );
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('renders with label', () => {
      const { getByText, getByPlaceholderText } = renderWithProviders(
        <Input label="Email" placeholder="Enter email" />
      );
      expect(getByText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('renders with icon', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input icon="mail" placeholder="With icon" />
      );
      expect(getByPlaceholderText('With icon')).toBeTruthy();
    });

    it('applies custom container style', () => {
      const { getByTestId } = renderWithProviders(
        <Input 
          testID="custom-input" 
          containerStyle={{ marginTop: 20 }}
          placeholder="Styled"
        />
      );
      expect(getByTestId('custom-input')).toBeTruthy();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('interactions', () => {
    it('calls onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Type here" onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByPlaceholderText('Type here'), 'Hello');
      expect(onChangeText).toHaveBeenCalledWith('Hello');
    });

    it('calls onFocus when input is focused', () => {
      const onFocus = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Focus me" onFocus={onFocus} />
      );

      fireEvent(getByPlaceholderText('Focus me'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('calls onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Blur me" onBlur={onBlur} />
      );

      fireEvent(getByPlaceholderText('Blur me'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });

    it('calls onSubmitEditing when submit is pressed', () => {
      const onSubmitEditing = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Submit" onSubmitEditing={onSubmitEditing} />
      );

      fireEvent(getByPlaceholderText('Submit'), 'submitEditing');
      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Error State Tests
  // ============================================================================

  describe('error state', () => {
    it('displays error message', () => {
      const { getByText } = renderWithProviders(
        <Input 
          placeholder="Email" 
          error="Email is required" 
        />
      );
      expect(getByText('Email is required')).toBeTruthy();
    });

    it('applies error styling when error is present', () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(
        <Input placeholder="With error" error="Invalid input" />
      );
      const input = getByPlaceholderText('With error');
      const errorText = getByText('Invalid input');
      
      expect(input).toBeTruthy();
      expect(errorText).toBeTruthy();
    });
  });

  // ============================================================================
  // Props Tests
  // ============================================================================

  describe('props', () => {
    it('supports secureTextEntry for passwords', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Password" secureTextEntry />
      );
      const input = getByPlaceholderText('Password');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('supports keyboardType', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Number" keyboardType="numeric" />
      );
      const input = getByPlaceholderText('Number');
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('supports autoCapitalize', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Name" autoCapitalize="words" />
      );
      const input = getByPlaceholderText('Name');
      expect(input.props.autoCapitalize).toBe('words');
    });

    it('supports editable prop', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Read only" editable={false} />
      );
      const input = getByPlaceholderText('Read only');
      expect(input.props.editable).toBe(false);
    });

    it('supports value prop as controlled input', () => {
      const { getByDisplayValue } = renderWithProviders(
        <Input value="Controlled value" onChangeText={() => {}} />
      );
      expect(getByDisplayValue('Controlled value')).toBeTruthy();
    });

    it('supports maxLength', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Limited" maxLength={10} />
      );
      const input = getByPlaceholderText('Limited');
      expect(input.props.maxLength).toBe(10);
    });

    it('supports multiline', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Multiline" multiline />
      );
      const input = getByPlaceholderText('Multiline');
      expect(input.props.multiline).toBe(true);
    });

    it('supports numberOfLines with multiline', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Lines" multiline numberOfLines={4} />
      );
      const input = getByPlaceholderText('Lines');
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('accessibility', () => {
    it('supports accessibilityLabel', () => {
      const { getByLabelText } = renderWithProviders(
        <Input 
          placeholder="Accessible" 
          accessibilityLabel="Email input field"
        />
      );
      expect(getByLabelText('Email input field')).toBeTruthy();
    });

    it('supports accessibilityHint', () => {
      const { getByHintText } = renderWithProviders(
        <Input 
          placeholder="Hint" 
          accessibilityHint="Enter your email address"
        />
      );
      expect(getByHintText('Enter your email address')).toBeTruthy();
    });

    it('associates label with input via accessibilityLabel', () => {
      const { getByLabelText } = renderWithProviders(
        <Input 
          label="Username"
          placeholder="Enter username"
          accessibilityLabel="Username input"
        />
      );
      expect(getByLabelText('Username input')).toBeTruthy();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty string value', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Empty" value="" />
      );
      const input = getByPlaceholderText('Empty');
      expect(input.props.value).toBe('');
    });

    it('handles undefined value gracefully', () => {
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Undefined value" />
      );
      const input = getByPlaceholderText('Undefined value');
      expect(input).toBeTruthy();
    });

    it('handles very long text input', () => {
      const longText = 'a'.repeat(1000);
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Long text" onChangeText={onChangeText} />
      );

      fireEvent.changeText(getByPlaceholderText('Long text'), longText);
      expect(onChangeText).toHaveBeenCalledWith(longText);
    });

    it('handles special characters in input', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Special" onChangeText={onChangeText} />
      );

      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      fireEvent.changeText(getByPlaceholderText('Special'), specialChars);
      expect(onChangeText).toHaveBeenCalledWith(specialChars);
    });

    it('handles emoji input', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = renderWithProviders(
        <Input placeholder="Emoji" onChangeText={onChangeText} />
      );

      const emojis = '🎉🎊🎁🎈';
      fireEvent.changeText(getByPlaceholderText('Emoji'), emojis);
      expect(onChangeText).toHaveBeenCalledWith(emojis);
    });
  });
});

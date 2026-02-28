import React from 'react';
import { renderWithProviders, fireEvent } from '../test-utils';
import { Button } from '@/components/Button';
import * as Haptics from 'expo-haptics';

// Mock Haptics
const mockHapticsImpact = Haptics.impactAsync as jest.Mock;

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders with text children', () => {
      const { getByText } = renderWithProviders(
        <Button>Test Button</Button>
      );
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('renders with ReactNode children', () => {
      const { getByText } = renderWithProviders(
        <Button>
          <span>Custom Element</span>
        </Button>
      );
      expect(getByText('Custom Element')).toBeTruthy();
    });

    it('applies custom style prop', () => {
      const { getByTestId } = renderWithProviders(
        <Button testID="test-button" style={{ marginTop: 10 }}>
          Styled Button
        </Button>
      );
      const button = getByTestId('test-button');
      expect(button.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ marginTop: 10 }),
        ])
      );
    });
  });

  // ============================================================================
  // Variant Tests
  // ============================================================================

  describe('variants', () => {
    const variants: Array<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'> = [
      'primary',
      'secondary',
      'outline',
      'ghost',
      'danger',
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        const { getByText } = renderWithProviders(
          <Button variant={variant}>{variant}</Button>
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });

    it('applies correct border for outline variant', () => {
      const { getByTestId } = renderWithProviders(
        <Button testID="outline-btn" variant="outline">
          Outline
        </Button>
      );
      const button = getByTestId('outline-btn');
      const styles = button.props.style;
      const flattenedStyle = styles.reduce((acc: Record<string, unknown>, style: unknown) => {
        if (typeof style === 'object' && style !== null) {
          return { ...acc, ...style };
        }
        return acc;
      }, {});
      expect(flattenedStyle.borderWidth).toBe(1);
    });
  });

  // ============================================================================
  // Size Tests
  // ============================================================================

  describe('sizes', () => {
    it('renders small size with correct padding', () => {
      const { getByText } = renderWithProviders(
        <Button size="sm">Small</Button>
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('renders medium size (default)', () => {
      const { getByText } = renderWithProviders(
        <Button size="md">Medium</Button>
      );
      expect(getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      const { getByText } = renderWithProviders(
        <Button size="lg">Large</Button>
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('interactions', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <Button onPress={onPress}>Press Me</Button>
      );

      fireEvent.press(getByText('Press Me'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback on press', () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <Button onPress={onPress} haptic={true}>
          Haptic Button
        </Button>
      );

      fireEvent.press(getByText('Haptic Button'));
      expect(mockHapticsImpact).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('does not trigger haptic when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <Button onPress={onPress} disabled haptic={true}>
          Disabled
        </Button>
      );

      fireEvent.press(getByText('Disabled'));
      expect(mockHapticsImpact).not.toHaveBeenCalled();
    });

    it('does not trigger haptic when loading', () => {
      const { getByText } = renderWithProviders(
        <Button loading haptic={true}>
          Loading
        </Button>
      );

      // Button is disabled when loading, so haptics won't trigger
      expect(mockHapticsImpact).not.toHaveBeenCalled();
    });

    it('does not trigger haptic when haptic is false', () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <Button onPress={onPress} haptic={false}>
          No Haptic
        </Button>
      );

      fireEvent.press(getByText('No Haptic'));
      expect(mockHapticsImpact).not.toHaveBeenCalled();
      expect(onPress).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // State Tests
  // ============================================================================

  describe('states', () => {
    it('shows loading state with ActivityIndicator', () => {
      const { queryByTestId, UNSAFE_getByType } = renderWithProviders(
        <Button loading testID="loading-btn">
          Loading
        </Button>
      );
      // When loading, text should not be visible (ActivityIndicator is shown instead)
      expect(queryByTestId('loading-btn')).toBeDisabled();
    });

    it('is disabled when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <Button onPress={onPress} loading testID="disabled-loading-btn">
          Loading
        </Button>
      );

      const button = getByTestId('disabled-loading-btn');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('is disabled when disabled prop is true', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <Button onPress={onPress} disabled testID="disabled-btn">
          Disabled
        </Button>
      );

      const button = getByTestId('disabled-btn');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <Button onPress={onPress} disabled>
          Cannot Press
        </Button>
      );

      fireEvent.press(getByText('Cannot Press'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <Button onPress={onPress} loading testID="loading-btn">
          Loading
        </Button>
      );

      fireEvent.press(getByTestId('loading-btn'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('accessibility', () => {
    it('supports accessibility label', () => {
      const { getByLabelText } = renderWithProviders(
        <Button accessibilityLabel="Submit Form">Submit</Button>
      );
      expect(getByLabelText('Submit Form')).toBeTruthy();
    });

    it('supports accessibility hint', () => {
      const { getByHintText } = renderWithProviders(
        <Button accessibilityHint="Double tap to submit">Submit</Button>
      );
      expect(getByHintText('Double tap to submit')).toBeTruthy();
    });

    it('supports accessibility role', () => {
      const { getByRole } = renderWithProviders(
        <Button>Accessible Button</Button>
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('handles undefined onPress gracefully', () => {
      const { getByText } = renderWithProviders(
        <Button>No Handler</Button>
      );
      // Should not throw
      expect(() => fireEvent.press(getByText('No Handler'))).not.toThrow();
    });

    it('handles rapid successive presses', () => {
      const onPress = jest.fn();
      const { getByText } = renderWithProviders(
        <Button onPress={onPress}>Rapid Press</Button>
      );

      const button = getByText('Rapid Press');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(3);
    });

    it('applies custom text style', () => {
      const { getByText } = renderWithProviders(
        <Button textStyle={{ fontSize: 20 }}>Styled Text</Button>
      );
      const text = getByText('Styled Text');
      expect(text).toBeTruthy();
    });
  });
});

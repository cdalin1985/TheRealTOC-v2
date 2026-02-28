import React from 'react';
import { Text, View } from 'react-native';
import { renderWithProviders } from '../test-utils';
import { Card, CardHeader } from '@/components/Card';

describe('Card', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders with children', () => {
      const { getByText } = renderWithProviders(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('renders with default variant', () => {
      const { getByTestId } = renderWithProviders(
        <Card testID="default-card">
          <Text>Content</Text>
        </Card>
      );
      expect(getByTestId('default-card')).toBeTruthy();
    });

    it('renders with custom style', () => {
      const { getByTestId } = renderWithProviders(
        <Card testID="styled-card" style={{ margin: 10 }}>
          <Text>Content</Text>
        </Card>
      );
      expect(getByTestId('styled-card')).toBeTruthy();
    });
  });

  // ============================================================================
  // Variant Tests
  // ============================================================================

  describe('variants', () => {
    it('renders default variant', () => {
      const { getByTestId } = renderWithProviders(
        <Card testID="default" variant="default">
          <Text>Default</Text>
        </Card>
      );
      const card = getByTestId('default');
      expect(card).toBeTruthy();
    });

    it('renders elevated variant', () => {
      const { getByTestId } = renderWithProviders(
        <Card testID="elevated" variant="elevated">
          <Text>Elevated</Text>
        </Card>
      );
      expect(getByTestId('elevated')).toBeTruthy();
    });

    it('renders outlined variant', () => {
      const { getByTestId } = renderWithProviders(
        <Card testID="outlined" variant="outlined">
          <Text>Outlined</Text>
        </Card>
      );
      const card = getByTestId('outlined');
      const styles = card.props.style;
      const flattenedStyle = styles.reduce((acc: Record<string, unknown>, style: unknown) => {
        if (typeof style === 'object' && style !== null) {
          return { ...acc, ...style };
        }
        return acc;
      }, {});
      expect(flattenedStyle.borderWidth).toBe(1);
    });

    it('renders glass variant', () => {
      const { getByTestId } = renderWithProviders(
        <Card testID="glass" variant="glass">
          <Text>Glass</Text>
        </Card>
      );
      const card = getByTestId('glass');
      const styles = card.props.style;
      const flattenedStyle = styles.reduce((acc: Record<string, unknown>, style: unknown) => {
        if (typeof style === 'object' && style !== null) {
          return { ...acc, ...style };
        }
        return acc;
      }, {});
      expect(flattenedStyle.backgroundColor).toContain('rgba');
    });
  });

  // ============================================================================
  // Padding Tests
  // ============================================================================

  describe('padding', () => {
    const paddingSizes = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] as const;
    
    paddingSizes.forEach((padding) => {
      it(`renders with padding size ${padding}`, () => {
        const { getByTestId } = renderWithProviders(
          <Card testID={`padding-${padding}`} padding={padding}>
            <Text>Content</Text>
          </Card>
        );
        expect(getByTestId(`padding-${padding}`)).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // Nested Content Tests
  // ============================================================================

  describe('nested content', () => {
    it('renders nested Views', () => {
      const { getByTestId } = renderWithProviders(
        <Card>
          <View testID="nested-view">
            <Text>Nested</Text>
          </View>
        </Card>
      );
      expect(getByTestId('nested-view')).toBeTruthy();
    });

    it('renders multiple children', () => {
      const { getByText } = renderWithProviders(
        <Card>
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </Card>
      );
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });

    it('renders complex nested structure', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <Card testID="complex-card">
          <View testID="header">
            <Text>Header</Text>
          </View>
          <View testID="body">
            <Text>Body Content</Text>
          </View>
          <View testID="footer">
            <Text>Footer</Text>
          </View>
        </Card>
      );
      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Body Content')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
      expect(getByTestId('complex-card')).toBeTruthy();
    });
  });
});

describe('CardHeader', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders with title only', () => {
      const { getByText } = renderWithProviders(
        <CardHeader title="Card Title" />
      );
      expect(getByText('Card Title')).toBeTruthy();
    });

    it('renders with title and subtitle', () => {
      const { getByText } = renderWithProviders(
        <CardHeader title="Title" subtitle="Subtitle text" />
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle text')).toBeTruthy();
    });

    it('renders with action', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <CardHeader 
          title="With Action" 
          action={<View testID="action-button"><Text>Action</Text></View>}
        />
      );
      expect(getByText('With Action')).toBeTruthy();
      expect(getByTestId('action-button')).toBeTruthy();
    });

    it('renders with all props', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <CardHeader 
          title="Complete Header"
          subtitle="Complete subtitle"
          action={<View testID="complete-action"><Text>Do It</Text></View>}
        />
      );
      expect(getByText('Complete Header')).toBeTruthy();
      expect(getByText('Complete subtitle')).toBeTruthy();
      expect(getByTestId('complete-action')).toBeTruthy();
    });
  });

  // ============================================================================
  // Integration with Card
  // ============================================================================

  describe('integration with Card', () => {
    it('renders CardHeader inside Card', () => {
      const { getByText } = renderWithProviders(
        <Card>
          <CardHeader title="Integrated" subtitle="Works together" />
          <Text>Card body content</Text>
        </Card>
      );
      expect(getByText('Integrated')).toBeTruthy();
      expect(getByText('Works together')).toBeTruthy();
      expect(getByText('Card body content')).toBeTruthy();
    });

    it('renders complete card structure', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <Card testID="complete-card">
          <CardHeader 
            title="Match Details"
            subtitle="View match information"
            action={<View testID="edit-btn"><Text>Edit</Text></View>}
          />
          <View testID="card-content">
            <Text>Player 1 vs Player 2</Text>
            <Text>Score: 5-3</Text>
          </View>
        </Card>
      );
      expect(getByText('Match Details')).toBeTruthy();
      expect(getByText('View match information')).toBeTruthy();
      expect(getByText('Edit')).toBeTruthy();
      expect(getByText('Player 1 vs Player 2')).toBeTruthy();
      expect(getByText('Score: 5-3')).toBeTruthy();
    });
  });
});

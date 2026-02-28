import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../test-utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';

describe('LoadingState', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders with default message', () => {
      const { getByText } = renderWithProviders(<LoadingState />);
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders with custom message', () => {
      const { getByText } = renderWithProviders(
        <LoadingState message="Fetching data..." />
      );
      expect(getByText('Fetching data...')).toBeTruthy();
    });

    it('renders with long message', () => {
      const longMessage = 'This is a very long loading message that describes what is happening';
      const { getByText } = renderWithProviders(
        <LoadingState message={longMessage} />
      );
      expect(getByText(longMessage)).toBeTruthy();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('accessibility', () => {
    it('has proper accessibility role', () => {
      const { getByRole } = renderWithProviders(<LoadingState />);
      expect(getByRole('progressbar')).toBeTruthy();
    });
  });
});

describe('ErrorState', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders with default message', () => {
      const { getByText } = renderWithProviders(<ErrorState />);
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('renders with custom message', () => {
      const { getByText } = renderWithProviders(
        <ErrorState message="Network error occurred" />
      );
      expect(getByText('Network error occurred')).toBeTruthy();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('interactions', () => {
    it('calls onRetry when retry text is pressed', () => {
      const onRetry = jest.fn();
      const { getByText } = renderWithProviders(
        <ErrorState message="Failed to load" onRetry={onRetry} />
      );

      fireEvent.press(getByText('Tap to retry'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not show retry text when onRetry is not provided', () => {
      const { queryByText } = renderWithProviders(
        <ErrorState message="Error without retry" />
      );
      expect(queryByText('Tap to retry')).toBeNull();
    });

    it('handles multiple retry presses', () => {
      const onRetry = jest.fn();
      const { getByText } = renderWithProviders(
        <ErrorState onRetry={onRetry} />
      );

      const retryText = getByText('Tap to retry');
      fireEvent.press(retryText);
      fireEvent.press(retryText);
      fireEvent.press(retryText);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================================
  // Error Types Tests
  // ============================================================================

  describe('error types', () => {
    it('renders network error', () => {
      const { getByText } = renderWithProviders(
        <ErrorState message="No internet connection" />
      );
      expect(getByText('No internet connection')).toBeTruthy();
    });

    it('renders server error', () => {
      const { getByText } = renderWithProviders(
        <ErrorState message="Server error (500)" />
      );
      expect(getByText('Server error (500)')).toBeTruthy();
    });

    it('renders not found error', () => {
      const { getByText } = renderWithProviders(
        <ErrorState message="Resource not found" />
      );
      expect(getByText('Resource not found')).toBeTruthy();
    });

    it('renders validation error', () => {
      const { getByText } = renderWithProviders(
        <ErrorState message="Invalid input data" />
      );
      expect(getByText('Invalid input data')).toBeTruthy();
    });
  });
});

describe('EmptyState', () => {
  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('rendering', () => {
    it('renders with title only', () => {
      const { getByText } = renderWithProviders(
        <EmptyState title="No items" />
      );
      expect(getByText('No items')).toBeTruthy();
    });

    it('renders with title and message', () => {
      const { getByText } = renderWithProviders(
        <EmptyState title="No matches" message="Create your first match to get started" />
      );
      expect(getByText('No matches')).toBeTruthy();
      expect(getByText('Create your first match to get started')).toBeTruthy();
    });

    it('renders with default icon', () => {
      const { getByText } = renderWithProviders(
        <EmptyState title="Empty" />
      );
      expect(getByText('Empty')).toBeTruthy();
    });

    it('renders with custom icon', () => {
      const { getByText } = renderWithProviders(
        <EmptyState title="No users" icon="people-outline" />
      );
      expect(getByText('No users')).toBeTruthy();
    });
  });

  // ============================================================================
  // Icon Variations Tests
  // ============================================================================

  describe('icon variations', () => {
    const iconVariations: Array<{
      icon: React.ComponentProps<typeof EmptyState>['icon'];
      description: string;
    }> = [
      { icon: 'file-tray-outline', description: 'file tray' },
      { icon: 'search-outline', description: 'search' },
      { icon: 'folder-open-outline', description: 'folder' },
      { icon: 'document-text-outline', description: 'document' },
      { icon: 'people-outline', description: 'people' },
      { icon: 'calendar-outline', description: 'calendar' },
      { icon: 'notifications-off-outline', description: 'notifications off' },
      { icon: 'trophy-outline', description: 'trophy' },
    ];

    iconVariations.forEach(({ icon, description }) => {
      it(`renders with ${description} icon`, () => {
        const { getByText } = renderWithProviders(
          <EmptyState title={`${description} empty`} icon={icon} />
        );
        expect(getByText(`${description} empty`)).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // Empty State Scenarios Tests
  // ============================================================================

  describe('scenarios', () => {
    it('renders empty challenges state', () => {
      const { getByText } = renderWithProviders(
        <EmptyState 
          title="No challenges" 
          message="You have no pending challenges"
          icon="flash-outline"
        />
      );
      expect(getByText('No challenges')).toBeTruthy();
      expect(getByText('You have no pending challenges')).toBeTruthy();
    });

    it('renders empty matches state', () => {
      const { getByText } = renderWithProviders(
        <EmptyState 
          title="No matches scheduled" 
          message="Challenge a player to schedule a match"
          icon="calendar-outline"
        />
      );
      expect(getByText('No matches scheduled')).toBeTruthy();
      expect(getByText('Challenge a player to schedule a match')).toBeTruthy();
    });

    it('renders empty rankings state', () => {
      const { getByText } = renderWithProviders(
        <EmptyState 
          title="No rankings yet" 
          message="Rankings will appear after the first match"
          icon="trophy-outline"
        />
      );
      expect(getByText('No rankings yet')).toBeTruthy();
      expect(getByText('Rankings will appear after the first match')).toBeTruthy();
    });

    it('renders empty activity state', () => {
      const { getByText } = renderWithProviders(
        <EmptyState 
          title="No activity" 
          message="Activity will appear here when you start playing"
          icon="pulse-outline"
        />
      );
      expect(getByText('No activity')).toBeTruthy();
      expect(getByText('Activity will appear here when you start playing')).toBeTruthy();
    });

    it('renders empty search results', () => {
      const { getByText } = renderWithProviders(
        <EmptyState 
          title="No results found" 
          message="Try adjusting your search terms"
          icon="search-outline"
        />
      );
      expect(getByText('No results found')).toBeTruthy();
      expect(getByText('Try adjusting your search terms')).toBeTruthy();
    });
  });

  // ============================================================================
  // Long Content Tests
  // ============================================================================

  describe('long content', () => {
    it('handles long title', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in the UI';
      const { getByText } = renderWithProviders(
        <EmptyState title={longTitle} />
      );
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('handles long message', () => {
      const longMessage = 'This is a very detailed message explaining exactly what the user needs to do to get started with the application and see content here';
      const { getByText } = renderWithProviders(
        <EmptyState title="Empty" message={longMessage} />
      );
      expect(getByText(longMessage)).toBeTruthy();
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('State Components Integration', () => {
  it('renders loading then switches to content', () => {
    const { getByText, queryByText, rerender } = renderWithProviders(
      <LoadingState message="Loading content..." />
    );
    
    expect(getByText('Loading content...')).toBeTruthy();
    
    // Simulate content loaded
    rerender(
      <EmptyState title="Content loaded" message="Here is your data" />
    );
    
    expect(queryByText('Loading content...')).toBeNull();
    expect(getByText('Content loaded')).toBeTruthy();
  });

  it('renders error state with retry that leads to loading', () => {
    const onRetry = jest.fn();
    const { getByText, queryByText, rerender } = renderWithProviders(
      <ErrorState message="Failed to load" onRetry={onRetry} />
    );
    
    expect(getByText('Failed to load')).toBeTruthy();
    
    // Retry
    fireEvent.press(getByText('Tap to retry'));
    expect(onRetry).toHaveBeenCalled();
    
    // Simulate retry starts loading
    rerender(<LoadingState message="Retrying..." />);
    expect(getByText('Retrying...')).toBeTruthy();
    expect(queryByText('Failed to load')).toBeNull();
  });
});

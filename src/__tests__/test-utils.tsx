import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ============================================================================
// Test Query Client Factory
// ============================================================================

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ============================================================================
// Wrapper Component with All Providers
// ============================================================================

interface WrapperProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AllProviders({ children, queryClient }: WrapperProps): ReactElement {
  const client = queryClient || createTestQueryClient();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <QueryClientProvider client={client}>
          {children}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ============================================================================
// Custom Render Functions
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialState?: Record<string, unknown>;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { queryClient: customQueryClient, ...renderOptions } = options;
  const queryClient = customQueryClient || createTestQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders queryClient={queryClient}>{children}</AllProviders>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// ============================================================================
// Async Utilities
// ============================================================================

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForQuery<TResult = unknown>(
  queryClient: QueryClient,
  queryKey: unknown[],
  timeout = 1000
): Promise<TResult | undefined> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const state = queryClient.getQueryState(queryKey);
    if (state?.status === 'success') {
      return queryClient.getQueryData(queryKey) as TResult;
    }
    if (state?.status === 'error') {
      throw state.error;
    }
    await wait(10);
  }
  throw new Error(`Query ${JSON.stringify(queryKey)} did not complete within ${timeout}ms`);
}

// ============================================================================
// Mock Response Helpers
// ============================================================================

export function mockResolvedValue<T>(value: T): Promise<{ data: T; error: null }> {
  return Promise.resolve({ data: value, error: null });
}

export function mockRejectedValue(error: Error): Promise<{ data: null; error: Error }> {
  return Promise.resolve({ data: null, error });
}

export function mockSupabaseResponse<T>(data: T | null, error: Error | null = null) {
  return Promise.resolve({ data, error });
}

// ============================================================================
// Event Helpers
// ============================================================================

import { fireEvent } from '@testing-library/react-native';

export const events = {
  press: (element: ReturnType<typeof render>['getByTestId'] extends (...args: any[]) => infer R ? R : never) => {
    fireEvent.press(element);
  },
  changeText: (element: any, text: string) => {
    fireEvent.changeText(element, text);
  },
  submitEditing: (element: any) => {
    fireEvent(element, 'submitEditing');
  },
  scroll: (element: any, { x = 0, y = 0 }: { x?: number; y?: number } = {}) => {
    fireEvent.scroll(element, {
      nativeEvent: {
        contentOffset: { x, y },
        contentSize: { width: 500, height: 500 },
        layoutMeasurement: { width: 100, height: 100 },
      },
    });
  },
  layout: (element: any, { width = 100, height = 100 }: { width?: number; height?: number } = {}) => {
    fireEvent(element, 'layout', {
      nativeEvent: {
        layout: { width, height, x: 0, y: 0 },
      },
    });
  },
};

// ============================================================================
// Re-exports
// ============================================================================

export * from '@testing-library/react-native';
export { QueryClient } from '@tanstack/react-query';

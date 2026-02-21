import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function render(ui: React.ReactElement, options?: Parameters<typeof rtlRender>[1]) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react-native';
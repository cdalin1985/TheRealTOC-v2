# TheRealTOC v2 - Agent Development Guide

This file provides essential information for AI coding agents working on TheRealTOC v2 mobile application.

## Project Overview

**TheRealTOC v2** is a production-ready React Native mobile application for a table tennis/tennis club management system. It handles player challenges, match scheduling, rankings, and treasury management.

- **Framework**: Expo SDK 54 with React Native 0.81.5
- **Language**: TypeScript (strict mode enabled)
- **Platforms**: iOS, Android, Web
- **Backend**: Supabase (PostgreSQL + Auth + Realtime subscriptions)

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Expo SDK 54 | Cross-platform mobile development |
| Routing | Expo Router v4 | File-based navigation with deep linking |
| State (Client) | Zustand 5.x | Local UI state, auth state |
| State (Server) | TanStack Query 5.x | Server state, caching, mutations |
| Backend | Supabase JS 2.x | Auth, database, realtime subscriptions |
| Animations | React Native Reanimated 3.x | 60fps UI animations |
| Styling | StyleSheet | React Native standard styling |
| Icons | @expo/vector-icons | Ionicons and other icon sets |
| Storage | expo-secure-store | Encrypted token storage (iOS Keychain/Android Keystore) |

## Project Structure

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/            # Auth group: login.tsx, register.tsx, _layout.tsx
│   ├── (tabs)/            # Main tab group: index, standings, challenges, matches, profile, treasury
│   │   ├── _layout.tsx    # Tab navigation configuration
│   │   └── [screen].tsx   # Individual screens
│   ├── admin/             # Admin-only screens
│   ├── player/[id].tsx    # Dynamic player profile route
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable UI components
│   ├── Button.tsx         # Pressable button with variants + haptics
│   ├── Input.tsx          # Text input component
│   ├── Card.tsx           # Card container with header
│   └── States.tsx         # Loading, Error, Empty state components
├── hooks/                 # React Query hooks and custom hooks
│   ├── useAuth.ts         # Login, signup, logout, current user
│   ├── useChallenges.ts   # Challenge CRUD operations
│   ├── useMatches.ts      # Match management
│   ├── useRankings.ts     # Leaderboard data
│   ├── useTreasury.ts     # Financial transactions
│   └── useAnimations.ts   # Reanimated animation hooks
├── stores/                # Zustand state stores
│   ├── authStore.ts       # Auth state, token management
│   ├── challengeStore.ts  # Challenge UI state
│   ├── matchStore.ts      # Match UI state
│   └── activityStore.ts   # Activity feed state
├── api/                   # API clients
│   ├── supabase.ts        # Supabase client with AES-256 encryption
│   └── queryClient.ts     # TanStack Query client config
├── types/                 # TypeScript type definitions
│   └── index.ts           # All domain types (User, Challenge, Match, etc.)
├── constants/             # Theme and configuration
│   └── theme.ts           # Colors, spacing, typography (dark theme)
└── utils/                 # Utility functions
    └── errors.ts          # Error handling utilities

supabase/migrations/       # Database schema files
.maestro/flows/           # E2E test flows
```

## Build and Development Commands

```bash
# Development
npm start              # Start Expo development server
npm run android        # Start with Android emulator
npm run ios            # Start with iOS simulator
npm run web            # Start web version

# Testing
npm test               # Run Jest tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run with coverage report
npm run test:unit      # Unit tests only (exclude integration)
npm run test:components # Component tests only
npm run test:hooks     # Hook tests only
npm run test:stores    # Store tests only
npm run test:integration # Integration tests only
npm run test:ci        # CI mode with JUnit reports
npm run test:ralph     # Watch all with verbose coverage

# E2E Testing (requires Maestro)
npm run e2e:smoke      # Run smoke test suite
npm run e2e:all        # Run all E2E flows

# Code Quality
npm run lint           # Check ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format with Prettier
npm run format:check   # Check formatting
npm run typecheck      # TypeScript check (tsc --noEmit)
npm run validate       # Run typecheck + lint + test:unit
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run database migration `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled
- Path alias `@/` maps to `./src/*`
- No unchecked indexed access (`noUncheckedIndexedAccess: true`)
- Exact optional property types enabled

### Import Conventions
Always use path aliases:
```typescript
// Good
import { Button } from '@/components';
import { useAuth } from '@/hooks';
import { colors } from '@/constants/theme';
import type { User } from '@/types';

// Avoid
import { Button } from '../../components/Button';
```

### Component Structure
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface Props {
  // Define props here
}

export function ComponentName({ prop }: Props) {
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
    backgroundColor: colors.background.primary,
  },
});
```

### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (`useAuth.ts`, `useChallenges.ts`)
- **Stores**: camelCase ending with `Store` (`authStore.ts`)
- **Types/Interfaces**: PascalCase (`User`, `ChallengeStatus`)
- **Constants**: UPPER_SNAKE_CASE for true constants

### Theme Usage
Always use the theme system from `@/constants/theme`:
```typescript
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

// Colors - dark theme only
colors.background.primary    // #0F0F0F
colors.background.secondary  // #1A1A1A
colors.primary[500]          // Indigo #6366F1
colors.success.DEFAULT       // Green #22C55E
colors.error.DEFAULT         // Red #EF4444

// Spacing (4px base)
spacing[4]  // 16px
spacing[6]  // 24px

// Typography
typography.fontSize.lg       // 18px
typography.fontWeight.bold   // { fontWeight: '700' }
```

## Testing Instructions

### Unit Tests
Located in `src/__tests__/` with parallel structure:
```
src/__tests__/
├── components/          # Component unit tests
├── hooks/               # Hook tests (useAuth, useChallenges, etc.)
├── stores/              # Zustand store tests
├── integration/         # Integration tests
├── fixtures/factories.ts # Test data factories
├── setup.ts             # Jest setup and mocks
└── test-utils.tsx       # Custom render utilities
```

### Test Pattern Example
```typescript
import { renderWithProviders, screen, fireEvent } from '@/__tests__/test-utils';
import { createUser } from '@/__tests__/fixtures/factories';
import { Button } from '@/components';

describe('Button', () => {
  it('handles press with haptic feedback', () => {
    const onPress = jest.fn();
    renderWithProviders(<Button onPress={onPress}>Press Me</Button>);
    
    fireEvent.press(screen.getByText('Press Me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Mock Supabase in Tests
```typescript
// Supabase client is automatically mocked in setup.ts
// Access mock via global.mockSupabaseClient
global.mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
  data: { user: createUser(), session: { access_token: 'test' } },
  error: null,
});
```

### Coverage Requirements
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## State Management Patterns

### Server State (React Query)
```typescript
const CHALLENGES_KEY = 'challenges';

// Query
export function useChallenges() {
  return useQuery({
    queryKey: [CHALLENGES_KEY],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*');
      if (error) throw error;
      return data;
    },
  });
}

// Mutation with invalidation
export function useSendChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (challengeData) => {
      const { data, error } = await supabase.from('challenges').insert(challengeData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHALLENGES_KEY] });
    },
  });
}
```

### Client State (Zustand)
```typescript
import { create } from 'zustand';

interface StoreState {
  value: string;
  setValue: (value: string) => void;
}

export const useStore = create<StoreState>()((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

## Security Considerations

### Session Storage
- Tokens stored in `expo-secure-store` (iOS Keychain / Android Keystore)
- AES-256-CTR encryption for large values via `LargeSecureStore` class
- Web fallback uses localStorage

### Environment Variables
- All Supabase config uses `EXPO_PUBLIC_` prefix (required by Expo)
- Never commit `.env` file
- RLS (Row Level Security) enabled on all tables

### Authentication Flow
1. User signs in via Supabase Auth
2. Session tokens stored in SecureStore
3. Zustand auth store updated with user
4. React Query cache cleared on logout

## Key Domain Types

```typescript
// Core entities
User: { id, email, displayName, avatarUrl, isAdmin }
Player: { id, userId, displayName, fargoRating, robustness }
Challenge: { id, challengerId, challengedId, status, expiresAt }
Match: { id, player1Id, player2Id, status, scheduledAt, winnerId }
Ranking: { id, playerId, position, points }
Transaction: { id, playerId, type, category, amount, balanceAfter }
Activity: { id, type, actorId, targetId, description, metadata }
```

## Navigation Structure

```
/(auth)/
  ├── login
  └── register
/(tabs)/
  ├── index          # Home / Activity feed
  ├── standings      # Rankings/Leaderboard
  ├── challenges     # Challenge management
  ├── matches        # Match history
  ├── profile        # User profile
  └── treasury       # Financial (hidden tab)
/admin/              # Admin screens
/player/[id]         # Player detail (dynamic)
```

## Common Gotchas

1. **Windows Jest Path Resolution**: Known issue with `moduleNameMapper` on Windows producing incorrect paths. Works correctly on Linux/Mac and in CI.

2. **Supabase Realtime**: Requires proper RLS policies for subscriptions to work.

3. **Reanimated**: Must include `react-native-reanimated/plugin` in babel config.

4. **Expo Go Compatibility**: All native modules must be compatible with Expo Go (no custom native code).

5. **Test Timers**: Tests use fake timers by default (`jest.useFakeTimers({ legacyFakeTimers: false })`).

## Pre-commit Hooks

Husky + lint-staged configured:
- ESLint auto-fix
- Prettier formatting
- Runs on `*.ts` and `*.tsx` files

## Useful Resources

- [Expo Documentation](https://docs.expo.dev)
- [Supabase JavaScript Reference](https://supabase.com/docs/reference/javascript)
- [TanStack Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

# Testing Guide - TheRealTOC v2

This guide covers the comprehensive testing strategy for TheRealTOC v2, designed for **Ralph Loop** - a continuous iteration paradigm for AI programming agents.

## 🎯 Testing Philosophy

- **Test behavior, not implementation**: Focus on what users see and do
- **Fast feedback**: Tests should run in under 30 seconds
- **Reliable**: Flaky tests are worse than no tests
- **Maintainable**: Tests should be easy to understand and update
- **Comprehensive**: Cover unit, integration, and E2E levels

## 📁 Test Structure

```
src/__tests__/
├── setup.ts              # Global test configuration & mocks
├── test-utils.tsx        # Custom render functions & utilities
├── components/           # Component tests
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   ├── Card.test.tsx
│   └── States.test.tsx
├── hooks/                # React Query & custom hook tests
│   ├── useAuth.test.ts
│   └── useChallenges.test.ts
├── stores/               # Zustand store tests
│   └── authStore.test.ts
├── fixtures/             # Test data factories
│   └── factories.ts
└── integration/          # Integration tests
    └── auth-flow.test.tsx
```

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch

# Ralph Loop mode (continuous testing with full coverage)
npm run test:ralph

# Run specific test types
npm run test:unit
npm run test:components
npm run test:hooks
npm run test:stores
npm run test:integration

# Validate everything (typecheck + lint + test)
npm run validate
```

## 🧪 Test Categories

### 1. Unit Tests

Test individual functions and utilities in isolation.

```typescript
// Example: Testing a utility function
describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('Jan 15, 2024');
  });
});
```

### 2. Component Tests

Test React components with user-centric queries.

```typescript
import { renderWithProviders, fireEvent } from '../test-utils';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <Button onPress={onPress}>Press Me</Button>
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 3. Hook Tests

Test React hooks with `renderHook`.

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useLogin } from '@/hooks/useAuth';

describe('useLogin', () => {
  it('logs in successfully', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProviders,
    });

    result.current.mutate({ email: 'test@test.com', password: 'pass' });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### 4. Store Tests

Test Zustand stores.

```typescript
describe('useAuthStore', () => {
  it('updates user correctly', () => {
    const store = useAuthStore.getState();
    
    act(() => {
      store.setUser(mockUser);
    });
    
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });
});
```

### 5. Integration Tests

Test multiple components/hooks working together.

```typescript
describe('Auth Flow', () => {
  it('completes full login flow', async () => {
    // Test login → store update → navigation
  });
});
```

## 🏭 Test Factories

Use factories to create consistent test data:

```typescript
import { createUser, createChallenge, createMatch } from './fixtures/factories';

// Create a user with defaults
const user = createUser();

// Override specific properties
const admin = createUser({ isAdmin: true, email: 'admin@test.com' });

// Create related entities
const challenge = createChallenge({
  challenger: createPlayer({ displayName: 'John' }),
  challenged: createPlayer({ displayName: 'Jane' }),
});

// Create lists
const challenges = createChallengeList(5);
```

## 🎭 Mocks

### Supabase Mock

All Supabase calls are automatically mocked. Access the mock:

```typescript
import { mockSupabaseClient } from '../setup';

mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
  data: { user: mockUser, session: mockSession },
  error: null,
});
```

### Expo Modules

All Expo modules are mocked in `setup.ts`:
- `expo-router`
- `expo-secure-store`
- `expo-haptics`
- `expo-notifications`
- `expo-image`
- `expo-linear-gradient`

### React Native Modules

- `@react-native-async-storage/async-storage`
- `react-native-reanimated`
- `react-native-gesture-handler`

## 🎨 Custom Render

Always use `renderWithProviders` for proper context:

```typescript
import { renderWithProviders } from '../test-utils';

const { getByText, queryByTestId, getByTestId } = renderWithProviders(
  <MyComponent />,
  { queryClient } // Optional custom QueryClient
);
```

## 📊 Coverage

Coverage thresholds are enforced in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
},
```

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🔄 Ralph Loop Testing

For continuous iteration with AI agents:

```bash
# Run tests continuously with coverage
npm run test:ralph

# This runs:
# jest --watchAll --coverage --verbose
```

### Ralph Loop Workflow

1. **Make changes** to code
2. **Watch tests** run automatically
3. **Fix failures** immediately
4. **Check coverage** doesn't drop
5. **Repeat** until all tests pass

## 🎪 E2E Testing with Maestro

### Setup

```bash
# Install Maestro
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Add to PATH
export PATH="$HOME/.maestro/bin:$PATH"
```

### Run E2E Tests

```bash
# Start Metro
npm start

# Run smoke tests (in another terminal)
npm run e2e:smoke

# Run all E2E tests
npm run e2e:all
```

### Writing E2E Flows

```yaml
# .maestro/flows/my-flow.yaml
appId: com.therealtoc.app
---
- launchApp:
    clearState: true

- tapOn: "Sign In"
- inputText: "user@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Home"
```

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run specific test with debug
npm test -- --testNamePattern="Button" --verbose

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Common Issues

**"Unable to find element"**
- Use `getByTestId` for implementation details
- Use `getByText`/`getByLabelText` for user-facing elements
- Check if element is rendered conditionally

**"Async timeout"**
- Increase timeout: `jest.setTimeout(10000)`
- Use `waitFor` for async operations
- Check for infinite loops in useEffect

**"Mock not working"**
- Ensure mock is defined before imports
- Check mock path matches import exactly
- Use `jest.mock` at top level

## 📈 Best Practices

### DO ✅

- Use semantic queries (`getByText`, `getByLabelText`)
- Test user behavior, not implementation
- Use factories for test data
- Keep tests independent
- Clean up after each test
- Use `testId` only when necessary

### DON'T ❌

- Test implementation details
- Share state between tests
- Mock what you don't own (unless necessary)
- Write tests that depend on execution order
- Use `getByTestId` for everything

### Example: Good vs Bad

```typescript
// ❌ BAD: Testing implementation
test('button calls onPress', () => {
  const onPress = jest.fn();
  const wrapper = shallow(<Button onPress={onPress} />);
  wrapper.find('TouchableOpacity').prop('onPress')();
  expect(onPress).toHaveBeenCalled();
});

// ✅ GOOD: Testing user behavior
test('user can press button', () => {
  const onPress = jest.fn();
  const { getByText } = renderWithProviders(
    <Button onPress={onPress}>Click Me</Button>
  );
  fireEvent.press(getByText('Click Me'));
  expect(onPress).toHaveBeenCalled();
});
```

## 🚦 CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Scheduled nightly runs

See `.github/workflows/test.yml` for configuration.

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro Documentation](https://maestro.mobile.dev/)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)

## 🐛 Known Issues

### Windows Path Resolution

On Windows, Jest's `moduleNameMapper` may produce incorrect relative paths (one level too high) when resolving `@/` aliases. This is a known issue with Jest on Windows.

**Workarounds:**

1. **Use relative imports in test files** (recommended for Windows dev):
   ```typescript
   // Instead of:
   import { Button } from '@/components/Button';
   
   // Use:
   import { Button } from '../../components/Button';
   ```

2. **Run tests in WSL** - The issue does not occur in WSL/Linux

3. **Use CI for full test runs** - CI runs on Linux where the issue doesn't occur

**Note:** This issue only affects local development on Windows. CI/CD pipelines and Mac/Linux environments work correctly.

## 🆘 Support

For testing issues:
1. Check this guide
2. Review existing tests in `src/__tests__/`
3. Run with `--verbose` flag for more details
4. Check CI logs for patterns
5. For Windows path issues, use relative imports or WSL

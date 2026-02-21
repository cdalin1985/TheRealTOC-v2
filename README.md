# TheRealTOC v2 - Complete Rewrite

A production-ready React Native app built with Expo SDK 54, featuring a complete rewrite with modern architecture, improved UI/UX, and full Expo Go compatibility.

## 🚀 Quick Start

```bash
# 1. Clone and install
cd TheRealTOC-v2
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start the app
npx expo start
# Press 'w' for web, scan QR code for mobile
```

## 📁 Project Structure

```
TheRealTOC-v2/
├── src/
│   ├── app/                 # Expo Router file-based routing
│   │   ├── (auth)/          # Auth screens (login, register)
│   │   └── (tabs)/          # Main app tabs
│   ├── components/          # Reusable UI components
│   ├── hooks/               # React Query hooks + custom hooks
│   ├── stores/              # Zustand state management
│   ├── api/                 # Supabase client + query client
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── constants/           # Theme, colors, spacing
├── supabase/
│   └── migrations/          # Database schema
└── docs/                    # Documentation
```

## 🏗 Architecture

### State Management
- **Zustand**: Client state (auth, UI state)
- **React Query**: Server state with caching, optimistic updates
- **Supabase**: Real-time subscriptions for live data

### Navigation
- **Expo Router v4**: File-based routing with deep linking
- Type-safe navigation with generated routes

### UI/UX
- **React Native Reanimated**: 60fps animations
- **Expo Haptics**: Tactile feedback
- **Unified Design System**: Dark theme only
- **Accessible**: Screen reader support, proper labels

### Security
- **AES-256 Encryption**: Session storage
- **Secure Store**: Tokens in iOS Keychain / Android Keystore
- **Environment Variables**: No secrets in code

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Expo SDK 54 |
| React | React 19.1.0 |
| React Native | 0.81.5 |
| Navigation | Expo Router v4 |
| State | Zustand + React Query |
| Backend | Supabase |
| Animations | React Native Reanimated |
| Icons | @expo/vector-icons |
| Testing | Jest + React Native Testing Library |

## 📱 Features

### Authentication
- Email/password sign in/up
- Secure session persistence
- Automatic token refresh

### Challenges
- Create, accept, decline challenges
- Real-time status updates
- Expiry handling

### Matches
- Schedule matches
- Score tracking
- Match history

### Treasury
- Transaction tracking
- Balance overview
- Financial summaries

### Activity Feed
- Real-time updates
- Challenge notifications
- Match results

## 🎨 Design System

### Colors
- Primary: Indigo (#6366F1)
- Background: Dark (#0F0F0F)
- Success: Green (#22C55E)
- Error: Red (#EF4444)

### Spacing (4px base)
- `spacing[4]` = 16px
- `spacing[6]` = 24px

### Typography
- Sans-serif system font
- Sizes: xs (12px) to 6xl (60px)

## 🔧 Configuration

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Deep Linking
- Scheme: `therealtoc://`
- Universal Links: `https://therealtoc.com`

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📦 Building

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Production build
npx eas build --platform all
```

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

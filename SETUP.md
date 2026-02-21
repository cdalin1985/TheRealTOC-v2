# Setup Guide - TheRealTOC v2

Complete step-by-step guide to get the app running.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app on your phone (iOS/Android)
- Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
cd TheRealTOC-v2
npm install
```

This installs all dependencies including:
- Expo SDK 54
- React Native 0.81.5
- React 19
- Supabase client
- React Query
- Zustand
- Reanimated
- And more...

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "therealtoc"
4. Choose a region close to your users
5. Save the database password securely

### 2.2 Get Your API Keys

1. In your Supabase dashboard, go to Project Settings → API
2. Copy:
   - `Project URL` (e.g., `https://abcdefgh12345678.supabase.co`)
   - `anon public` API key

### 2.3 Run the Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"

This creates all tables, indexes, RLS policies, and triggers.

### 2.4 Configure Auth

1. Go to Authentication → Settings
2. Under "Site URL", add:
   - `therealtoc://` (for deep linking)
   - `http://localhost:8081` (for web)
3. Enable "Email confirmations" (optional for development)

## Step 3: Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.2.

## Step 4: Start the App

```bash
npx expo start
```

You'll see options:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web
- Scan QR code with Expo Go app on your phone

## Step 5: Test the Setup

1. Open the app on your device
2. Tap "Sign Up"
3. Create an account with email/password
4. You should be redirected to the home screen

If you see errors, check the console for details.

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env` file exists and has correct values
- Restart the Expo server after editing `.env`

### "Network request failed"
- Check your internet connection
- Verify Supabase URL is correct
- Ensure you're not using a VPN that blocks Supabase

### "RLS policy violation"
- Database schema wasn't applied correctly
- Re-run the SQL migration in Supabase

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```

## Development Workflow

### Running Tests
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Linting
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier
```

### Type Checking
```bash
npx tsc --noEmit
```

## Project Structure Overview

```
src/
├── app/              # Screens (Expo Router)
│   ├── (auth)/       # Login, Register
│   └── (tabs)/       # Main app screens
├── components/       # Reusable UI
├── hooks/            # React Query + custom hooks
├── stores/           # Zustand state
├── api/              # Supabase client
├── types/            # TypeScript types
├── utils/            # Helpers
└── constants/        # Theme, colors
```

## Next Steps

1. **Customize the theme**: Edit `src/constants/theme.ts`
2. **Add more screens**: Create files in `src/app/`
3. **Add features**: Extend the API layer in `src/api/`
4. **Deploy**: Use EAS Build for production

## Need Help?

- Check the [Expo documentation](https://docs.expo.dev)
- Visit [Supabase docs](https://supabase.com/docs)
- Review the code in `src/` for examples

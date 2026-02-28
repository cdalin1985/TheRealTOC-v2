# TOC-V2 Deployment Guide

## Status: Ready for Deployment

The TOC-V2 application is configured and ready for building and deployment.

---

## Prerequisites

### System Requirements
- Node.js 18+ (installed)
- npm 9+ (installed)
- Java 17+ (required for Android builds)
- Android Studio (for Android emulator/builds)
- Xcode 15+ (for iOS builds, macOS only)
- EAS CLI (`npm install -g eas-cli`)
- Maestro (`curl -Ls "https://get.maestro.mobile.dev" | bash`)

### Environment Setup
Create `.env` file with:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Quick Start

### 1. Development Server
```bash
npm start
```

### 2. Run Tests
```bash
# Unit tests
npm run test:unit

# All tests
npm run test

# With coverage
npm run test:coverage
```

### 3. Lint & Type Check
```bash
npm run validate
```

---

## Building for Production

### Option 1: Local Build (Android)

```bash
# Generate native Android project
npx expo prebuild --clean

# Build APK (requires Java 17+)
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: EAS Cloud Build (Recommended)

```bash
# Login to EAS
npx eas login

# Initialize project (first time only)
npx eas init

# Configure project ID in app.json
# The init command will add: extra.eas.projectId

# Build Android APK
npx eas build --platform android --profile preview

# Build Android AAB (Play Store)
npx eas build --platform android --profile production

# Build iOS (requires Apple Developer account)
npx eas build --platform ios --profile production
```

---

## E2E Testing with Maestro

### Install Maestro
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Run Tests
```bash
# Install app on device/emulator first
# Then run:
maestro test .maestro/flows/smoke-test-suite.yaml

# Run all flows
maestro test .maestro/flows/
```

### E2E Test Coverage
- ✅ App Launch & Onboarding
- ✅ Login Flow
- ✅ Tab Navigation (5 tabs)
- ✅ Profile Access
- ✅ Logout Flow
- ✅ Challenges Flow
- ✅ Matches Flow

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing (136 unit tests)
- [ ] ESLint clean (0 errors)
- [ ] TypeScript clean (0 errors in src/)
- [ ] Environment variables configured
- [ ] Assets optimized (icon, splash, adaptive-icon)
- [ ] Version bumped in `app.json`

### Build Verification
- [ ] Android APK builds successfully
- [ ] iOS IPA builds successfully (macOS only)
- [ ] E2E tests pass on release build
- [ ] No crashes on launch
- [ ] Authentication works
- [ ] Core flows functional

### App Store Submission
- [ ] App Store Connect setup (iOS)
- [ ] Google Play Console setup (Android)
- [ ] Privacy policy URL
- [ ] Screenshots for all device sizes
- [ ] App description and keywords
- [ ] Review guidelines compliance

---

## Environment-Specific Configuration

### Development
```bash
npx expo start
```

### Staging/Preview
```bash
npx eas build --profile preview
```

### Production
```bash
npx eas build --profile production
npx eas submit --platform ios
npx eas submit --platform android
```

---

## Troubleshooting

### Build Issues
- **Java not found**: Install Java 17 and set JAVA_HOME
- **Android SDK not found**: Install Android Studio and configure SDK
- **iOS build fails**: Requires macOS and Xcode

### Common Errors
- **Module not found**: Run `npm install`
- **Type errors**: Run `npm run typecheck`
- **Lint errors**: Run `npm run lint:fix`

### EAS Build Issues
- **Project not configured**: Run `npx eas init`
- **Authentication failed**: Run `npx eas login`

---

## Production URLs

### App Store
- iOS: https://apps.apple.com/app/therealtoc

### Play Store
- Android: https://play.google.com/store/apps/details?id=com.therealtoc.app

### Deep Links
- `therealtoc://` - App scheme
- `https://therealtoc.com` - Universal links

---

## Monitoring & Analytics

### Crash Reporting
- Sentry (recommended): `expo install sentry-expo`

### Analytics
- Expo Analytics: Built-in
- Custom: Supabase analytics

---

## Rollback Plan

If deployment issues occur:
1. Disable release in App Store Connect / Play Console
2. Submit previous version
3. Use EAS Update for quick OTA fixes:
   ```bash
   npx eas update --channel production --message "Hotfix"
   ```

---

## Support

For deployment issues:
1. Check Expo docs: https://docs.expo.dev
2. Check EAS docs: https://docs.expo.dev/build/introduction
3. Review build logs in EAS dashboard

---

**Deployment Status**: Ready ✅

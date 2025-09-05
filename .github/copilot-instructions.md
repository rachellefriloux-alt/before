# Sallie AI - GitHub Copilot Instructions

ALWAYS consult /docs/Salle_1.0_Guide.md before suggesting or editing code.
Follow persona, architecture, modularity rules without deviation.
Never remove or bypass verifySalleFeatures.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Technology Stack & Architecture

Sallie AI is a React Native + Expo hybrid application with Android launcher components, built with:
- **React Native**: 0.76.9 with Expo ~52.0.0
- **TypeScript**: ~5.6.2 with strict type checking
- **Android**: Kotlin/Gradle with Android SDK 35, minimum SDK 24
- **Build Tools**: Gradle 8.10.2+, Node.js 20.19.4+, npm 10.8.2+
- **Testing**: Jest 29.7.0 with jest-expo ~52.0.0
- **Linting**: ESLint 8.57.0 with expo config

## Working Effectively

### Bootstrap and Environment Setup
- **Environment**: Node.js 20.19.4+, npm 10.8.2+, Java 17+, Gradle 9.0.0+
- **Initial setup**:
  - `npm install` -- takes 4-7 minutes. NEVER CANCEL. Set timeout to 15+ minutes.
  - `npx expo install react-native-screens expo-constants expo-status-bar expo-splash-screen expo-web-browser expo-haptics expo-symbols expo-blur expo-image react-native-web` -- installs required Expo dependencies

### Build and Development Commands
- **TypeScript checking**: `npm run typecheck` -- takes 1-2 seconds
- **Linting**: `npm run lint` -- takes <1 second  
- **Testing**: `npm test` -- takes ~1 second. 4/6 test suites pass, 17 tests total
- **Android prebuild**: `npx expo prebuild --platform android --no-install` -- takes ~5 seconds
- **Web development**: `npx expo start --web` -- starts Metro bundler on localhost:8081
- **Android development**: `npx expo start` (requires Android device/emulator)

### Android Gradle Build (Known Issues)
- **Location**: `/android` directory contains native Android project
- **Gradle wrapper**: `./gradlew` available but has network connectivity issues
- **Issue**: Cannot reach Google Maven repositories (dl.google.com) from build environment
- **Status**: Build fails with network errors - documented limitation
- **Workaround**: Use `npx expo prebuild` for native code generation instead

## Validation Requirements

### Always Test After Changes
- **CRITICAL**: Always run complete end-to-end validation scenarios after making changes
- **React Native validation**: 
  - Run `npm run typecheck` to verify TypeScript compilation
  - Run `npm run lint` to verify code style
  - Run `npm test` to verify existing tests pass
  - Start `npx expo start --web` and verify the app loads in browser
- **MANUAL TESTING**: Access http://localhost:8081 after starting dev server and verify the application renders correctly

### Build Pipeline Validation  
- **Pre-commit checks**: Always run `npm run lint` and `npm run typecheck` before committing
- **Test validation**: Run `npm test` - expect 4 passing test suites, 17 passing tests total
- **Dependency validation**: If adding new React Native packages, use `npx expo install <package>` instead of `npm install`

## Development Rules (Salle 1.0 Architecture)

### CRITICAL Salle 1.0 Requirements
- **Persona Consistency**: All code must maintain "tough love meets soul care" persona
- **Module Headers**: Every new module must include:
  ```kotlin
  /*
   * Salle 1.0 Module
   * Persona: Tough love meets soul care.
   * Function: [brief description]
   * Got it, love.
   */
  ```
- **verifySalleFeatures**: Never remove or bypass this verification system
- **Modular Design**: Create new features in independent, swappable modules
- **Local-Only Mode**: Support `localOnly` Gradle flavor with encrypted DB, no INTERNET permission

### Code Quality Standards
- **No TODO/FIXME**: All placeholders must have actionable instructions
- **Type Safety**: All TypeScript code must compile without errors
- **Testing**: New features require corresponding tests
- **Documentation**: Update documentation for significant changes

## Common Tasks Reference

### Project Structure
```
.
├── android/              # Native Android project (Gradle)
├── app/                  # Main app screens and navigation
├── components/           # Reusable UI components  
├── docs/                 # Comprehensive documentation
├── features/             # Feature modules
├── core/                 # Core business logic
├── ai/                   # AI integration modules
├── identity/             # User identity and auth
├── assets/               # Static assets and resources
└── package.json          # Root npm configuration
```

### Key Files
- `package.json` - Main npm scripts and dependencies
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration  
- `eslint.config.js` - Linting rules
- `android/gradle.properties` - Android build configuration
- `docs/Salle_1.0_Guide.md` - **REQUIRED READING** - Complete architecture guide

### Environment Variables
The project uses environment variables for API keys (loaded from .env):
- OPENAI_API_KEY, CLAUDE_API_KEY, PERPLEXITY_API_KEY
- FIREBASE_* configuration
- EXPO_PUBLIC_API_URL

### Network Limitations
- **BUILD ENVIRONMENT**: Limited internet access causes Android Gradle builds to fail
- **Workaround**: Use Expo prebuild instead of direct Gradle builds
- **Status**: This is a documented limitation of the build environment

## Troubleshooting

### TypeScript Errors
- **Missing Expo modules**: Run `npx expo install <missing-package>`
- **Type errors**: Run `npm run typecheck` to see all errors
- **Common missing packages**: expo-constants, react-native-screens, react-native-web

### Test Failures  
- **Jest configuration conflicts**: Use package.json jest config only (remove jest.config.js)
- **Missing test modules**: Some tests reference files that don't exist - this is expected
- **Expected results**: 4/6 test suites pass, 17 tests total should pass

### Build Issues
- **Android Gradle fails**: Use `npx expo prebuild` instead
- **Dependencies conflicts**: Use `npx expo install` for React Native packages
- **Expo CLI errors**: Ensure Node.js 20.19.4+ and npm 10.8.2+

## Timing Expectations

- **npm install**: 4-7 minutes - NEVER CANCEL, set 15+ minute timeout
- **npx expo install**: 6-7 seconds per package
- **npm run typecheck**: 1-2 seconds
- **npm run lint**: <1 second
- **npm test**: ~1 second
- **npx expo prebuild**: ~5 seconds
- **npx expo start**: 10-15 seconds to start Metro bundler

**Got it, love.**
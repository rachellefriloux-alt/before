# Overview

This is an Expo React Native application featuring a complete onboarding experience for an AI assistant named "Sallie". The app presents a cinematic convergence flow where users go through 7 sequential stages of introduction, calibration, and partnership establishment with Sallie. The onboarding includes interactive Q&A sessions that adapt Sallie's responses based on user input, creating a personalized experience before entering the main app interface.

The onboarding flow is fully implemented with:
- Stage 0: The Signal (animated pulse introduction)
- Stage 1: The Arrival (Sallie's introduction)
- Stage 2: The Pact (partnership agreement)
- Stage 3: The Calibration (10-question Q&A system)
- Stage 4: The Facets (Sallie's capabilities display)
- Stage 5: The First Move (adaptive action based on answers)
- Stage 6: The Seal (completion and transition to main app)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Expo SDK 53 with React Native 0.79.2 and React 19
- **Navigation**: Expo Router v5 with file-based routing and typed routes
- **UI Components**: Custom themed components with automatic light/dark mode support
- **Animations**: React Native Reanimated v3 for smooth transitions and pulse effects
- **State Management**: React Context API with useReducer for onboarding flow state

## Routing Structure
- **File-based routing** with nested route groups
- **Onboarding flow**: `(onboarding)` group with 7 sequential stages (stage0-stage6)
- **Main app**: `(tabs)` group with bottom tab navigation
- **Conditional routing**: Index route redirects based on onboarding completion status

## Onboarding System Design
- **Multi-stage flow**: 7 distinct stages from initial signal to completion
- **Adaptive responses**: Sallie's dialogue changes based on user Q&A answers
- **State persistence**: React Context with useReducer for onboarding state management
- **Interactive elements**: Custom Q&A system with 10 calibration questions
- **Visual feedback**: React Native Reanimated pulse animations and themed UI components
- **Seamless navigation**: Expo Router-based navigation between onboarding stages
- **Conditional routing**: App automatically redirects to onboarding if not completed

## Component Architecture
- **Modular design**: Reusable onboarding components in `/components/onboarding/` directory
  - `OnboardingStage`: Container component for stage layouts
  - `OnboardingButton`: Styled button component with golden theme
  - `PulseAnimation`: React Native Reanimated pulse effect
  - `QASystem`: Interactive Q&A component with progress tracking
- **Context system**: `OnboardingContext` manages state across all stages
- **Themed system**: Dark theme with golden (#FFD700) accent colors
- **Platform-specific optimizations**: Safe area handling and responsive layouts

## Development Tooling
- **TypeScript**: Full type safety with strict mode enabled
- **ESLint**: Expo-specific linting configuration
- **Jest**: Testing framework with Expo preset
- **Asset management**: Optimized image and font loading with Expo tools

# External Dependencies

## Core Expo Modules
- **expo-router**: File-based navigation and routing system
- **expo-font**: Custom font loading (SpaceMono)
- **expo-splash-screen**: Launch screen management
- **expo-constants**: Environment and device information access

## Navigation & UI
- **@react-navigation/native**: Core navigation functionality
- **@react-navigation/bottom-tabs**: Tab-based navigation
- **react-native-safe-area-context**: Safe area handling across devices
- **react-native-screens**: Native screen optimization

## Animation & Interaction
- **react-native-reanimated**: High-performance animations
- **react-native-gesture-handler**: Touch gesture recognition
- **expo-haptics**: Tactile feedback for iOS devices

## Visual Elements
- **expo-symbols**: iOS SF Symbols integration
- **@expo/vector-icons**: Cross-platform icon library
- **expo-blur**: iOS blur effects for tab bar background
- **expo-image**: Optimized image component

## Platform Support
- **react-native-web**: Web platform compatibility
- **expo-web-browser**: In-app browser functionality
- **react-native-webview**: WebView component integration

## Development Tools
- **eslint-config-expo**: Expo-specific linting rules
- **jest-expo**: Expo-optimized testing environment
- **@babel/core**: JavaScript compilation and transformation

Note: The application currently uses React Context for state management but could be extended with external database integration for persistent user data storage.
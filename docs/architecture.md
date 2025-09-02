# Sallie Architecture

<!-- Provenance: Merged from SalleCompanion on 2025-08-27 by Rachelle Friloux -->

## Overview
Sallie is a unified Android app and launcher platform, integrating all features, UI flows, assets, and logic from SalleCompanion. The architecture is modular, scalable, and production-ready.

## Modules
- Persona Engine
- Emotional Intelligence
- Secure Identity & Onboarding
- Dashboard (side-screen, 6 layout variants, modular gestures)
- Appearance & Gestures (setup-time picker, in-app editor)
- Shared Models & Services (CompanionUser, ApiClient, ValidationUtils)

## UI
- Jetpack Compose for all screens and flows
- Launcher side-screen dashboard with selectable layouts/gestures
- Persona theme support (ToughLove, SoulCare, WiseSister, Balanced)

## Assets
- Unified asset manifests (avatars, icons, illustrations, animations)
- Persona themes in colors.xml/styles.xml

## Provenance
All merged files include provenance tags at the top, indicating source and merge date.

## Build & Test
- Build: `./gradlew.bat clean build test assemble`
- Test: `./gradlew.bat test`
- Lint: ktlint, detekt

## Notes
- All web-only code replaced with Compose equivalents
- No duplicate modules, assets, or namespaces remain
- All features and flows are fully integrated

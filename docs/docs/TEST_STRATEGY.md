# Sallie Test Strategy

## Unit Testing
- Kotlin: JUnit tests for all core, feature, onboarding, and Compose modules.
- JS: Vitest/Jest tests for all core, feature, and utility modules.
- Vue: Vue Test Utils for all UI components, overlays, and panels.

## Integration Testing
- Persona+Tone, Device+Voice, Onboarding+Memory, and cross-module flows.
- Android Instrumentation tests for device and onboarding flows.
- JS/Vue integration tests for dashboard, chat, and device control.

## E2E Testing
- Cypress/Playwright for onboarding, device control, and user journeys.
- Android UI Automator for full app flows.

## Coverage & CI
- Codecov integration for coverage reporting.
- CI enforcement of test pass and coverage thresholds.

## Accessibility & Localization
- Automated accessibility checks for all UI components.
- Localization tests for all user-facing strings and flows.

## Continuous Improvement
- All new features require corresponding tests and coverage updates.
- Test strategy reviewed and updated quarterly.

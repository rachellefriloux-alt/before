# Sallie CI/CD Pipeline

## Linting & Formatting
- ESLint, Detekt, Prettier, and ktlint enforced on all code.
- CI workflows block merges on lint/format errors.

## Testing & Coverage
- All tests (unit, integration, E2E) run on every push and PR.
- Codecov integration for coverage reporting.
- CI enforces minimum coverage thresholds.

## Build & Deployment
- Gradle and Vite build steps for Android and web.
- Automated deployment to Play Store, Firebase, and web hosting.
- Dockerfile for containerized builds and local testing.

## Release Management
- Automated changelog generation and release notes.
- Versioning and tagging for all releases.

## Security & Compliance
- Secrets scanning, dependency checks, and permission audits in CI.
- Accessibility and localization checks in CI.

## Continuous Improvement
- CI/CD pipeline reviewed and updated quarterly.
- All new features require corresponding CI/CD updates.

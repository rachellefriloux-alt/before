# Sallie Asset Requirements

## Icons
- All persona modes, features, and UI components must have unique, high-resolution icons (SVG/PNG).
- Icons must be present in asset manifests and referenced in code.

## Avatars
- Persona-driven avatars for all modes (loyal, playful, resourceful, critical, etc.).
- Avatars must support dynamic theming and accessibility.

## Audio
- Sample wake word, response, and notification audio files for voice/ASR modules.
- Audio assets must be optimized for mobile and web playback.

## Vectors & Animations
- Vector assets for Compose and Vue UI, including animated overlays and micro-interactions.

## Asset Manifest
- All assets must be listed in asset manifests (see assetManifest-advanced.json).
- AssetManager must validate presence and usage of all assets at build time.

## Accessibility
- All visual and audio assets must meet accessibility standards (contrast, alt text, ARIA, etc.).

## Localization
- Asset names and descriptions must support localization for all supported languages.

# Sallie's Complete Visual Library

## Overview
This library contains all visual assets for Sallie's different moods and personalities, designed to create a rich, immersive experience that reflects her emotional and personality states.

## Mood Visuals
- **calm**: Serene blues and purples with gentle flowing elements
- **focused**: Sharp, geometric designs in cool blues
- **energetic**: Vibrant oranges and yellows with dynamic shapes
- **creative**: Purple and rainbow gradients with artistic elements
- **supportive**: Green tones with heart and care motifs
- **protective**: Red and orange with shield and strength symbols
- **playful**: Pink and bright colors with fun, bouncy elements
- **wise**: Deep purples with mystical symbols
- **mystical**: Teal and turquoise with magical elements
- **determined**: Strong reds with power symbols

## Personality Visuals
- **Grace & Grind**: Purple and gold with elegant professional elements
- **Southern Grit**: Warm browns and oranges with authentic symbols
- **Soul Care**: Green with nurturing, healing motifs
- **Midnight Hustle**: Dark blues with sleek, efficient designs
- **Creative Visionary**: Multi-colored with artistic, innovative elements

## Usage Guidelines
1. Use mood visuals for emotional state representation
2. Use personality visuals for overall character expression
3. Combine elements for complex emotional states
4. Maintain consistent color palettes within each theme
5. Ensure accessibility with proper contrast ratios

## File Organization
```
assets/images/sallie/
├── moods/
│   ├── [mood]_avatar.svg
│   ├── [mood]_icon.svg
│   ├── [mood]_decoration.svg
│   └── [mood]_background.svg
├── personalities/
│   ├── [personality]_avatar.svg
│   ├── [personality]_icon.svg
│   └── [personality]_theme.json
├── icons/
│   └── [general icons]
└── backgrounds/
    └── [background patterns]
```

## Integration
Import the visual library constants from:
```typescript
import {
  MoodThemes,
  PersonalityThemes,
  getMoodIcon,
  getMoodTheme
} from '@/constants/SallieVisualLibrary';
```

## Contributing
When adding new visuals:
1. Follow the established color palettes
2. Maintain consistent sizing (100x100 for avatars, 24x24 for icons)
3. Use SVG format for scalability
4. Include appropriate motifs and symbols
5. Test across different color schemes

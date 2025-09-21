# Android Launcher Structure

This directory contains the organized Android launcher project with AI integration.

## Directory Structure

```
/android/app/src/main/
├── kotlin/com/sallie/launcher/      # Main package
│   ├── activities/                  # Activity classes
│   │   ├── MainActivity.kt
│   │   ├── EmotionalIntelligenceDemoActivity.kt
│   │   ├── VoiceSystemDemoActivity.kt
│   │   ├── MemorySystemDemoActivity.kt
│   │   └── CommunicationDemoActivity.kt
│   ├── fragments/                   # Fragment classes (empty, ready for future use)
│   ├── adapters/                    # RecyclerView/ListView adapters (empty, ready for future use)
│   ├── services/                    # Background services
│   │   ├── ConversationExportWorker.kt
│   │   └── VisualStateWorker.kt
│   ├── ai/                          # AI-related Kotlin code
│   │   ├── SallieSystem.kt
│   │   ├── SallieViewModel.kt
│   │   ├── models/                  # AI model definitions (ready for future use)
│   │   ├── inference/               # Inference logic (ready for future use)
│   │   ├── data/                    # Data handling for AI
│   │   │   └── ConversationEntry.kt
│   │   ├── pipeline/                # AI processing pipeline
│   │   │   └── SalleMoodOrb.kt
│   │   └── utils/                   # AI-specific utilities (ready for future use)
│   └── utils/                       # Utility classes
│       ├── AllAliases.kt
│       ├── Persistence.kt
│       ├── PlatformSpeech.kt
│       ├── ThemeColors.kt
│       └── ThemeController.kt
├── res/                             # Android resources
│   ├── layout/                      # XML layout files
│   ├── drawable/                    # Images and drawables
│   └── values/                      # Strings, styles, colors, etc.
├── assets/                          # Web assets
│   ├── html/                        # HTML content
│   ├── js/                          # JavaScript files
│   ├── ts/                          # TypeScript source files
│   │   └── AdvancedAIService.ts
│   └── vue/                         # Vue components
│       ├── App.vue
│       ├── LearningDashboard.vue
│       └── toneEditor.vue
└── AndroidManifest.xml

/android/app/src/test/kotlin/com/sallie/launcher/
└── SallieViewModelTest.kt           # Test files
```

## Key Features

- **Organized Structure**: Files are organized by functionality (activities, services, AI, utilities)
- **AI Integration**: Dedicated AI directory with subdirectories for models, inference, data, and utilities
- **Modular Design**: Clear separation of concerns with distinct directories for each component type
- **Asset Support**: Web assets (HTML, JS, TS, Vue) properly organized in assets directory
- **Test Structure**: Tests are properly separated in the test directory

## Usage

This structure follows Android best practices and provides a clear organization for:
- Activities (UI components)
- Services (background processing)
- AI components (machine learning and intelligence features)
- Utilities (helper classes)
- Web assets (for hybrid functionality)

The structure is designed to be scalable and maintainable as the project grows.
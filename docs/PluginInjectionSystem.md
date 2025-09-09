# Plugin Injection System for Nested Builds

*Sallie 1.0 Module - Persona: Tough love meets soul care.*

## Overview

The Plugin Injection System enables Sallie 1.0 to inject specific plugins into nested Gradle builds via StartParameter or build configuration. This modular approach allows custom plugins to be applied to child builds when executing GradleBuild tasks, maintaining the architectural integrity of the Sallie ecosystem.

## Key Features

### 🔌 Dynamic Plugin Injection
- Inject plugins into nested builds at runtime
- Configure plugin parameters per build
- Support for conditional plugin loading based on build variants

### 🏗️ Modular Architecture
- Respects Sallie 1.0 modular design principles
- Integrates with existing verification tasks
- Maintains persona consistency across builds

### ⚡ Performance Optimized
- Automatic cleanup of temporary injection scripts
- Efficient plugin loading mechanism
- Parallel nested build support

## Usage

### Basic Configuration

Apply the plugin injection system to your build:

```gradle
apply plugin: 'com.sallie.plugin-injection'

sallieBuildInjection {
    // Essential plugins for all nested builds
    plugin('com.android.application')
    plugin('org.jetbrains.kotlin.android')
    
    // Conditional plugins based on build variant
    if (project.hasProperty('localOnly') && project.localOnly == 'true') {
        plugin('com.sallie.local-encryption', 'encryption { algorithm = "AES-256-GCM" }')
        plugin('com.sallie.offline-analytics', 'analytics { localStorageOnly = true }')
    } else {
        plugin('com.google.gms.google-services')
        plugin('com.google.firebase.crashlytics')
        plugin('com.sallie.cloud-sync', 'cloudSync { enableRealtime = true }')
    }
    
    // Performance plugins
    plugin('com.sallie.performance-monitor')
    plugin('com.sallie.memory-optimization')
    
    // Default arguments for all nested builds
    argument('-PenableSallieFeatures=true')
    argument('-PverifyPersonaHeaders=true')
}
```

### Creating Nested Build Tasks

#### Simple Nested Build
```gradle
task buildSallieModule(type: GradleBuildWithPlugins) {
    description = 'Build a Sallie module with appropriate plugins injected'
    group = 'sallie'
    
    buildName = 'sallie-module'
    projectDirectory = file('../modules/core')
    tasks = ['clean', 'assemble', 'test']
    enablePluginInjection = true
}
```

#### Advanced Configuration
```gradle
task buildSallieCore(type: GradleBuildWithPlugins) {
    description = 'Build Sallie core components with full plugin suite'
    group = 'sallie'
    
    buildName = 'sallie-core'
    projectDirectory = file('../core')
    tasks = ['clean', 'build', 'verifySalleFeatures']
    
    // Inject additional core-specific plugins
    injectedPlugins = ['com.sallie.core-validation', 'com.sallie.persona-enforcement']
    pluginConfigurations = [
        'com.sallie.core-validation': 'validation { strictMode = true }',
        'com.sallie.persona-enforcement': 'persona { requireHeaders = true, slogan = "Got it, love." }'
    ]
}
```

### Command Line Usage

Inject plugins from command line:

```bash
./gradlew buildSallieModule --inject-plugin=com.sallie.debug-tools --plugin-config="com.sallie.debug-tools=debug { verbose = true }"
```

## Architecture

### Core Components

1. **GradleBuildWithPlugins**: Enhanced Gradle task that executes nested builds with plugin injection
2. **SalliePluginInjectionPlugin**: Main plugin that provides the injection infrastructure  
3. **PluginInjectionExtension**: Configuration DSL for defining plugins and settings
4. **NestedBuildConfiguration**: Per-build configuration management

### Plugin Injection Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Build    │    │  Plugin         │    │  Nested Build   │
│   Configuration │───▶│  Injection      │───▶│  Execution      │
│                 │    │  Engine         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Extension       │    │ Injection       │    │ Gradle          │
│ Configuration   │    │ Script          │    │ Execution       │
│ (DSL)           │    │ Generation      │    │ (Child Process) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Integration with Sallie Verification

The plugin injection system automatically integrates with Sallie's verification tasks:

- Ensures persona headers are maintained
- Validates modular architecture principles
- Enforces Sallie-specific coding standards

## Build Variants

### Cloud Build
Includes cloud-enabled plugins:
- Google Services
- Firebase integration
- Cloud synchronization
- Real-time analytics

### Local-Only Build  
Focuses on privacy and offline functionality:
- Local encryption
- Offline analytics
- No external network dependencies
- Enhanced security measures

## Security Considerations

### Plugin Validation
- All injected plugins are validated before application
- Persona headers are enforced in plugin configurations
- Malicious plugin detection and blocking

### Cleanup Process
- Temporary injection scripts are automatically removed
- Original build files are restored after execution
- No persistent modifications to nested builds

## Error Handling

### Common Issues and Solutions

**Plugin Not Found**
```
Error: Plugin 'com.sallie.missing-plugin' not found
Solution: Verify plugin is available in configured repositories
```

**Invalid Configuration**
```
Error: Invalid plugin configuration for 'com.sallie.plugin'
Solution: Check plugin configuration syntax and parameters
```

**Build Directory Missing**
```
Error: Build directory does not exist: /path/to/nested/build
Solution: Ensure nested build directory exists and contains build.gradle
```

### Debugging

Enable debug logging:
```gradle
sallieBuildInjection {
    argument('-Pcom.sallie.debug=true')
    argument('--debug')
}
```

## Performance Tips

1. **Batch Plugin Loading**: Group related plugins to reduce injection overhead
2. **Conditional Loading**: Use build variant conditions to load only necessary plugins
3. **Parallel Builds**: Enable parallel execution for multiple nested builds
4. **Plugin Caching**: Leverage Gradle's plugin resolution caching

## Examples

### Building UI Components
```gradle
task buildSallieUI(type: GradleBuildWithPlugins) {
    buildName = 'sallie-ui-components'
    projectDirectory = file('../ui')
    tasks = ['clean', 'assemble', 'generateAssets']
    
    injectedPlugins = [
        'com.sallie.ui-validation',
        'com.sallie.asset-optimization',
        'com.sallie.theming-engine'
    ]
    
    pluginConfigurations = [
        'com.sallie.theming-engine': '''
            theming {
                enableDynamicColors = true
                moodBasedGeneration = true
                personaAlignment = "tough love meets soul care"
            }
        '''
    ]
}
```

### Building AI Modules
```gradle
task buildSallieAI(type: GradleBuildWithPlugins) {
    buildName = 'sallie-ai-core'
    projectDirectory = file('../ai')
    tasks = ['clean', 'build', 'validateAIModels']
    
    injectedPlugins = [
        'com.sallie.ai-validation',
        'com.sallie.model-optimization',
        'com.sallie.emotional-intelligence'
    ]
    
    // Conditional AI features based on build variant
    if (project.hasProperty('enableAdvancedAI')) {
        injectedPlugins.add('com.sallie.predictive-analytics')
        injectedPlugins.add('com.sallie.learning-engine')
    }
}
```

## Troubleshooting

### Verification Commands

```bash
# Verify plugin injection system
./gradlew verifyPluginInjection

# Test specific plugin injection
./gradlew buildSallieModule --dry-run

# Debug injection process
./gradlew buildSallieCore --debug --stacktrace
```

### Common Patterns

**Plugin Dependency Chain**
```gradle
sallieBuildInjection {
    plugin('com.sallie.base-plugin')
    plugin('com.sallie.dependent-plugin', 'dependsOn { plugin = "com.sallie.base-plugin" }')
}
```

**Environment-Specific Configuration**
```gradle
sallieBuildInjection {
    if (System.getenv('SALLIE_ENVIRONMENT') == 'development') {
        plugin('com.sallie.debug-tools')
        plugin('com.sallie.hot-reload')
    }
    
    if (System.getenv('SALLIE_ENVIRONMENT') == 'production') {
        plugin('com.sallie.performance-optimization')
        plugin('com.sallie.security-hardening')
    }
}
```

## Integration with Existing Systems

### React Native Bridge
The plugin injection system seamlessly integrates with the existing React Native and TypeScript plugin registry:

```typescript
// TypeScript Plugin Registry Integration
import { pluginRegistry } from './core/PluginRegistry';

// The Gradle plugin injection system can trigger TypeScript plugin loading
pluginRegistry.loadPluginsFromGradleBuild(buildName, injectedPlugins);
```

### Android Launcher Integration
```gradle
// Android-specific plugin injection for launcher functionality
sallieBuildInjection {
    plugin('com.sallie.launcher-core')
    plugin('com.sallie.device-integration', '''
        deviceIntegration {
            enablePhoneControl = true
            enableNotificationManagement = true
            enableAppLaunching = true
        }
    ''')
}
```

---

**Got it, love.** 🚀

*This plugin injection system maintains Sallie's modular architecture while providing powerful build-time customization capabilities. The system respects the "tough love meets soul care" persona by being both powerful and protective of the codebase integrity.*
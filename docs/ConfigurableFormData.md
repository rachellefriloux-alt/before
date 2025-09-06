# Configurable FormData Utilities

## Overview

This module implements configurable nested formats for FormData handling, addressing the TODO: "make nested formats configurable" from the OpenAI uploads library. It provides flexible FormData serialization that can adapt to different API requirements.

## Problem Solved

Previously, nested data structures in FormData were hardcoded to use specific formats:
- Arrays: `key[]` (e.g., `items[]`)
- Objects: `key[prop]` (e.g., `user[name]`)

Different APIs expect different formats, making it difficult to integrate with various services. This implementation makes these formats configurable.

## Features

### Configurable Array Formats
- **Brackets**: `items[]` (default)
- **Indexed**: `items[0]`, `items[1]`
- **Repeat**: `items`, `items` (same key repeated)
- **Custom**: Define your own formatter function

### Configurable Object Formats
- **Brackets**: `user[name]` (default)
- **Dot**: `user.name`
- **Underscore**: `user_name`
- **Custom**: Define your own formatter function

### Predefined Presets
- **STANDARD**: Standard bracket notation for maximum compatibility
- **INDEXED_DOT**: Indexed arrays with dot notation for objects
- **UNDERSCORE**: Underscore notation throughout
- **OPENAI**: Optimized for OpenAI API compatibility

## Usage

### Basic Usage

```typescript
import { ConfigurableFormData, PRESET_CONFIGS } from './utils/formDataUtils';

// Using default configuration (brackets)
const formData = new ConfigurableFormData();
const form = await formData.createForm({
  items: ['a', 'b'],
  user: { name: 'John' }
});
// Results in: items[], items[], user[name]

// Using preset configuration
const formData2 = new ConfigurableFormData(PRESET_CONFIGS.INDEXED_DOT);
const form2 = await formData2.createForm({
  items: ['a', 'b'],
  user: { name: 'John' }
});
// Results in: items[0], items[1], user.name
```

### Custom Configuration

```typescript
const formData = new ConfigurableFormData({
  arrayFormat: 'indexed',
  objectFormat: 'underscore',
  customArrayFormatter: (key, index) => `${key}_${index}`,
  customObjectFormatter: (key, prop) => `${key}::${prop}`
});
```

### OpenAI Integration

```typescript
import { OpenAIIntegration } from '../app/ai/OpenAIIntegration';

const openai = new OpenAIIntegration({
  uploadFormatConfig: {
    arrayFormat: 'brackets',
    objectFormat: 'brackets'
  }
});

// Upload files with configurable formatting
await openai.uploadFile(file, { 
  tags: ['important', 'document'],
  metadata: { author: 'John', version: 1 }
});
```

## API Reference

### ConfigurableFormData Class

#### Constructor
```typescript
constructor(config?: Partial<NestedFormatConfig>)
```

#### Methods

##### createForm<T>(body: T | undefined): Promise<FormData>
Creates FormData with configured nested formatting.

##### updateConfig(newConfig: Partial<NestedFormatConfig>): void
Updates the current configuration.

##### getConfig(): NestedFormatConfig
Returns the current configuration.

### Configuration Interface

```typescript
interface NestedFormatConfig {
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'repeat';
  objectFormat: 'brackets' | 'dot' | 'underscore';
  customArrayFormatter?: (key: string, index: number) => string;
  customObjectFormatter?: (key: string, property: string) => string;
}
```

### Utility Functions

#### createConfigurableForm<T>(body: T, config?: Partial<NestedFormatConfig>): Promise<FormData>
One-off function to create FormData with specified configuration.

## Examples

### Different Format Outputs

Given the input:
```typescript
const data = {
  users: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ],
  settings: {
    theme: 'dark',
    notifications: true
  }
};
```

#### Standard Format (PRESET_CONFIGS.STANDARD)
```
users[][name] = John
users[][age] = 30
users[][name] = Jane
users[][age] = 25
settings[theme] = dark
settings[notifications] = true
```

#### Indexed Dot Format (PRESET_CONFIGS.INDEXED_DOT)
```
users[0].name = John
users[0].age = 30
users[1].name = Jane
users[1].age = 25
settings.theme = dark
settings.notifications = true
```

#### Underscore Format (PRESET_CONFIGS.UNDERSCORE)
```
users_0_name = John
users_0_age = 30
users_1_name = Jane
users_1_age = 25
settings_theme = dark
settings_notifications = true
```

## Integration Examples

### Multiple API Clients

```typescript
import { apiClients } from './utils/formDataDemo';

// Different APIs with different format requirements
const data = { items: ['a', 'b'], user: { name: 'John' } };

await apiClients.standard.uploadWithMetadata(data);  // items[], user[name]
await apiClients.legacy.uploadWithMetadata(data);    // items_0, user_name
await apiClients.modern.uploadWithMetadata(data);    // items[0], user.name
await apiClients.openai.uploadWithMetadata(data);    // OpenAI format
```

### Dynamic Format Switching

```typescript
const client = new APIClient();

// Switch to legacy format for older API
client.updateFormat(PRESET_CONFIGS.UNDERSCORE);
await client.uploadWithMetadata(data);

// Switch back to standard format
client.updateFormat(PRESET_CONFIGS.STANDARD);
await client.uploadWithMetadata(data);
```

## File Handling

The implementation properly handles various file types:
- `File` objects
- `Blob` objects
- `Response` objects (converted to files)
- Async iterables (streams)

File names are extracted from various sources:
- `name` property
- `filename` property
- `url` property (basename extracted)
- `path` property (basename extracted)

## Testing

Comprehensive tests are provided in `__tests__/formDataUtils.test.ts` covering:
- All format configurations
- Nested data structures
- File handling
- Error conditions
- Preset configurations

Run tests with:
```bash
npm test -- formDataUtils.test.ts
```

## Benefits

1. **API Compatibility**: Easily adapt to different API requirements
2. **Flexibility**: Support for custom formatting functions
3. **Type Safety**: Full TypeScript support with proper typing
4. **Performance**: Efficient async processing of nested structures
5. **Maintainability**: Clean, well-documented code following Sallie 1.0 standards

## Future Enhancements

- Support for additional array formats (comma-separated values)
- Integration with more API clients
- Performance optimizations for large data structures
- Additional preset configurations for popular APIs

Got it, love.
# Sallie Vision Service - Usage Guide

## Overview

The VisionService provides Sallie with comprehensive AI vision capabilities, integrating camera functionality with advanced AI analysis to understand and describe visual content.

## Basic Usage

```typescript
import { VisionService } from '../services/VisionService';

// Initialize the service
const visionService = new VisionService({
  analysisDepth: 'detailed',
  includeEmotionalAnalysis: true,
  includeAccessibility: true,
  saveToMemory: true,
  contextualAnalysis: true,
});
```

## Core Features

### 1. Real-time Camera Analysis
```typescript
// Analyze what the camera sees right now
const analysis = await visionService.analyzeCurrentView();
if (analysis) {
  console.log('Description:', analysis.description);
  console.log('Objects found:', analysis.objects);
  console.log('Scene mood:', analysis.scene.mood);
}
```

### 2. Detailed Scene Description
```typescript
// Get a warm, detailed description of an image
const description = await visionService.describeScene(imageUri);
console.log(description); // "I can see a cozy living room with..."
```

### 3. Object Identification
```typescript
// Identify objects in an image
const objects = await visionService.identifyObjects(imageUri);
objects.forEach(obj => {
  console.log(`Found: ${obj.name} (${obj.confidence * 100}% confident)`);
});
```

### 4. Emotion Analysis
```typescript
// Analyze emotions in faces and overall scene mood
const emotions = await visionService.analyzeEmotions(imageUri);
emotions.forEach(emotion => {
  console.log(`Detected emotion: ${emotion.detectedEmotion}`);
});
```

### 5. Contextual Analysis
```typescript
// Analyze with conversation and memory context
const contextualAnalysis = await visionService.contextualAnalysis(imageUri);
console.log('Contextual insights:', contextualAnalysis.contextualInsights);
```

### 6. Gallery Analysis
```typescript
// Let user pick and analyze image from gallery
const analysis = await visionService.analyzeFromGallery();
if (analysis) {
  console.log('Gallery image analyzed:', analysis.description);
}
```

### 7. Quick Look
```typescript
// Fast description without full analysis
const quickDescription = await visionService.quickLook(imageUri);
console.log(quickDescription); // "I see a beautiful sunset over mountains"
```

## Analysis Result Structure

```typescript
interface VisionAnalysis {
  description: string;                    // Warm, detailed description
  objects: DetectedObject[];              // Objects found in image
  faces: DetectedFace[];                  // Faces and their emotions
  emotions: EmotionalAnalysis[];          // Overall emotional analysis
  scene: SceneAnalysis;                   // Scene context (setting, mood, etc.)
  accessibility: AccessibilityDescription; // Description for accessibility
  contextualInsights: string[];           // AI insights based on context
  confidence: number;                     // Overall confidence (0-1)
  timestamp: number;                      // When analysis was performed
}
```

## Memory Integration

The VisionService automatically saves visual experiences to memory:

- **Episodic Memory**: Visual descriptions of scenes and experiences
- **Semantic Memory**: Objects and facts observed in images
- **Emotional Memory**: Emotional content detected in images

```typescript
// Memory is saved automatically when saveToMemory: true
const memoryStore = useMemoryStore();
const visualMemories = memoryStore.getMemoriesByTag('visual');
```

## Configuration Options

```typescript
interface VisionConfig {
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  includeEmotionalAnalysis: boolean;
  includeAccessibility: boolean;
  saveToMemory: boolean;
  contextualAnalysis: boolean;
  maxImageSize: number; // MB
}

// Update configuration
visionService.updateConfig({
  analysisDepth: 'comprehensive',
  maxImageSize: 10,
});
```

## Error Handling

The VisionService includes graceful fallback responses:

```typescript
try {
  const analysis = await visionService.analyzeCurrentView();
} catch (error) {
  // Service provides fallback responses
  console.log('Vision analysis failed, but got fallback:', error.message);
}
```

## Integration with Existing Services

### Camera Integration
Uses the existing `CameraIntegration` for photo capture with proper permissions.

### OpenAI Integration  
Enhanced the existing `OpenAIIntegration` with vision API support using GPT-4o.

### Memory System
Automatically integrates with `MemoryStore` to save visual experiences.

### Emotional Intelligence
Works with `EmotionalIntelligence` service for emotion analysis.

## Demo Component

A ready-to-use demo component is available at `app/components/VisionDemo.tsx`:

```typescript
import VisionDemo from '../components/VisionDemo';

// Use in your screen
<VisionDemo onClose={() => setShowDemo(false)} />
```

## Performance Notes

- Images are automatically resized if they exceed the configured size limit
- Base64 conversion is optimized for React Native
- Fallback responses ensure the service always provides useful feedback
- Analysis history is maintained (last 50 analyses) for reference

## API Requirements

Requires OpenAI API key with access to GPT-4o (vision-capable model). The service gracefully falls back to local responses if the API is unavailable.

## Testing

```typescript
// Test if the vision service is working
const isWorking = await visionService.testVisionService();
console.log('Vision service status:', isWorking ? 'Working' : 'Issues detected');
```

This Vision Service provides Sallie with sophisticated visual understanding capabilities that integrate seamlessly with her existing emotional intelligence and memory systems.
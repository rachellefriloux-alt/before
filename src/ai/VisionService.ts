import * as FileSystem from 'expo-file-system';
import { CameraIntegration, CameraResult } from './utils/CameraIntegration';
import { OpenAIIntegration, OpenAIResponse } from './OpenAIIntegration';
import { EmotionalIntelligence, EmotionalAnalysis } from './EmotionalIntelligence';
import { useMemoryStore, MemoryItem } from '../store/memory';
import { usePersonaStore } from '../store/persona';
import { useDeviceStore } from '../store/device';

export interface VisionAnalysis {
  description: string;
  objects: DetectedObject[];
  faces: DetectedFace[];
  emotions: EmotionalAnalysis[];
  scene: SceneAnalysis;
  accessibility: AccessibilityDescription;
  contextualInsights: string[];
  confidence: number;
  timestamp: number;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: string[];
}

export interface DetectedFace {
  confidence: number;
  emotions: {
    emotion: string;
    confidence: number;
  }[];
  age?: number;
  gender?: string;
  expressions: string[];
}

export interface SceneAnalysis {
  setting: string;
  lighting: string;
  mood: string;
  activity: string;
  timeOfDay?: string;
  weather?: string;
  colors: string[];
}

export interface AccessibilityDescription {
  summary: string;
  detailedDescription: string;
  importantElements: string[];
  navigationHints: string[];
}

export interface VisionConfig {
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  includeEmotionalAnalysis: boolean;
  includeAccessibility: boolean;
  saveToMemory: boolean;
  contextualAnalysis: boolean;
  maxImageSize: number; // in MB
}

export class VisionService {
  private cameraIntegration: CameraIntegration;
  private openAI: OpenAIIntegration;
  private emotionalIntelligence: EmotionalIntelligence;
  private config: VisionConfig;
  private analysisHistory: VisionAnalysis[] = [];

  constructor(config?: Partial<VisionConfig>) {
    this.cameraIntegration = CameraIntegration.getInstance();
    this.openAI = new OpenAIIntegration();
    this.emotionalIntelligence = new EmotionalIntelligence();
    
    this.config = {
      analysisDepth: 'detailed',
      includeEmotionalAnalysis: true,
      includeAccessibility: true,
      saveToMemory: true,
      contextualAnalysis: true,
      maxImageSize: 5, // 5MB max
      ...config,
    };
  }

  /**
   * Analyze what the camera sees right now
   */
  async analyzeCurrentView(): Promise<VisionAnalysis | null> {
    try {
      // Take a photo using the camera integration
      const photo = await this.cameraIntegration.takePhoto();
      if (!photo) {
        throw new Error('Failed to capture photo for analysis');
      }

      return await this.analyzeImage(photo.uri);
    } catch (error) {
      console.error('Error analyzing current view:', error);
      return null;
    }
  }

  /**
   * Provide detailed scene description
   */
  async describeScene(imageUri: string): Promise<string> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const prompt = this.buildSceneDescriptionPrompt();
      const response = await this.callVisionAPI(base64Image, prompt);
      
      return response.content || 'Unable to describe the scene at this time.';
    } catch (error) {
      console.error('Error describing scene:', error);
      return 'I\'m having trouble seeing the image clearly right now. Could you try taking another photo?';
    }
  }

  /**
   * Identify and categorize objects in the image
   */
  async identifyObjects(imageUri: string): Promise<DetectedObject[]> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const prompt = this.buildObjectDetectionPrompt();
      const response = await this.callVisionAPI(base64Image, prompt);
      
      return this.parseObjectDetectionResponse(response.content || '');
    } catch (error) {
      console.error('Error identifying objects:', error);
      return [];
    }
  }

  /**
   * Analyze emotions in faces and overall scene mood
   */
  async analyzeEmotions(imageUri: string): Promise<EmotionalAnalysis[]> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const prompt = this.buildEmotionAnalysisPrompt();
      const response = await this.callVisionAPI(base64Image, prompt);
      
      return this.parseEmotionalAnalysis(response.content || '');
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      return [];
    }
  }

  /**
   * Perform contextual analysis based on conversation history
   */
  async contextualAnalysis(imageUri: string): Promise<VisionAnalysis> {
    try {
      // Get current context from stores
      const personaState = usePersonaStore.getState();
      const memoryState = useMemoryStore.getState();
      const deviceState = useDeviceStore.getState();

      // Get recent visual memories for context
      const recentVisualMemories = memoryState.getMemoriesByTag('visual').slice(0, 5);
      
      // Build contextual prompt
      const contextualPrompt = this.buildContextualPrompt(
        personaState,
        recentVisualMemories,
        deviceState
      );

      const base64Image = await this.convertImageToBase64(imageUri);
      const response = await this.callVisionAPI(base64Image, contextualPrompt);
      
      return this.parseComprehensiveAnalysis(response, imageUri);
    } catch (error) {
      console.error('Error in contextual analysis:', error);
      return this.getFailsafeAnalysis(imageUri);
    }
  }

  /**
   * Main image analysis method
   */
  async analyzeImage(imageUri: string): Promise<VisionAnalysis> {
    try {
      // Validate image size
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (imageInfo.exists && imageInfo.size) {
        const sizeInMB = imageInfo.size / (1024 * 1024);
        if (sizeInMB > this.config.maxImageSize) {
          throw new Error(`Image too large: ${sizeInMB.toFixed(2)}MB (max: ${this.config.maxImageSize}MB)`);
        }
      }

      const base64Image = await this.convertImageToBase64(imageUri);
      
      let analysis: VisionAnalysis;
      
      if (this.config.contextualAnalysis) {
        analysis = await this.contextualAnalysis(imageUri);
      } else {
        const prompt = this.buildComprehensivePrompt();
        const response = await this.callVisionAPI(base64Image, prompt);
        analysis = this.parseComprehensiveAnalysis(response, imageUri);
      }

      // Save to memory if configured
      if (this.config.saveToMemory) {
        await this.saveVisualMemory(analysis, imageUri);
      }

      // Update analysis history
      this.analysisHistory.push(analysis);
      if (this.analysisHistory.length > 50) {
        this.analysisHistory = this.analysisHistory.slice(-30);
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return this.getFailsafeAnalysis(imageUri);
    }
  }

  /**
   * Convert image to base64 for API consumption
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // Handle different URI formats
      const cleanUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
      
      const base64 = await FileSystem.readAsStringAsync(cleanUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image for analysis');
    }
  }

  /**
   * Call OpenAI Vision API with base64 image
   */
  private async callVisionAPI(base64Image: string, prompt: string): Promise<OpenAIResponse> {
    try {
      // Use the enhanced OpenAI integration to call vision-capable model
      const systemPrompt = `You are Sallie's vision system. Analyze images with emotional intelligence and provide helpful, caring insights. Be descriptive but warm and personal.`;
      
      return await this.openAI.generateVisionResponse(systemPrompt, prompt, base64Image);
    } catch (error) {
      console.error('Vision API call error:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildComprehensivePrompt(): string {
    return `
Analyze this image comprehensively and respond with a JSON object containing:

{
  "description": "Detailed, warm description of what you see",
  "objects": [
    {
      "name": "object name",
      "confidence": 0.95,
      "attributes": ["attribute1", "attribute2"]
    }
  ],
  "faces": [
    {
      "confidence": 0.9,
      "emotions": [{"emotion": "happy", "confidence": 0.8}],
      "expressions": ["smiling", "relaxed"]
    }
  ],
  "scene": {
    "setting": "indoor/outdoor location",
    "lighting": "natural/artificial/mixed",
    "mood": "cheerful/calm/energetic/etc",
    "activity": "what's happening",
    "colors": ["dominant", "colors", "present"]
  },
  "accessibility": {
    "summary": "Brief accessible description",
    "detailedDescription": "Comprehensive description for visually impaired users",
    "importantElements": ["key visual elements"],
    "navigationHints": ["spatial relationships"]
  },
  "contextualInsights": ["meaningful observations", "emotional context", "suggestions"],
  "confidence": 0.85
}

Focus on being helpful, warm, and emotionally intelligent in your analysis.
`;
  }

  /**
   * Build scene description prompt
   */
  private buildSceneDescriptionPrompt(): string {
    return `
Describe this scene in a warm, detailed way as if you're helping a friend understand what they're looking at. 
Include:
- The overall setting and atmosphere
- Key objects and their relationships
- The mood and emotional feel of the scene
- Any activities or interactions happening
- Lighting, colors, and aesthetic details

Be conversational and caring in your description.
`;
  }

  /**
   * Build object detection prompt
   */
  private buildObjectDetectionPrompt(): string {
    return `
Identify and list all the objects you can see in this image. For each object, provide:
- Name of the object
- Your confidence level (0-1)
- Notable attributes or characteristics

Respond in JSON format as an array of objects with "name", "confidence", and "attributes" fields.
`;
  }

  /**
   * Build emotion analysis prompt
   */
  private buildEmotionAnalysisPrompt(): string {
    return `
Analyze the emotional content of this image:
- If there are faces, identify emotions for each
- Assess the overall mood/atmosphere of the scene
- Consider lighting, colors, and composition for emotional impact

Respond in JSON format with emotional analysis details.
`;
  }

  /**
   * Build contextual analysis prompt
   */
  private buildContextualPrompt(
    personaState: any,
    recentMemories: MemoryItem[],
    deviceState: any
  ): string {
    const memoryContext = recentMemories
      .map(m => `- ${m.content} (${m.emotion})`)
      .join('\n');

    return `
CONTEXT:
Current Personality: ${personaState.personality}
Current Emotion: ${personaState.emotion}

Recent Visual Memories:
${memoryContext || 'No recent visual memories'}

Please analyze this image in the context of our ongoing relationship and recent experiences.
Consider:
- How this relates to recent conversations or memories
- The emotional significance for the user
- Potential personal meaning or connections
- Appropriate emotional response based on the context

${this.buildComprehensivePrompt()}

Add special attention to personal context and emotional relevance.
`;
  }

  /**
   * Parse comprehensive analysis response
   */
  private parseComprehensiveAnalysis(response: OpenAIResponse, imageUri: string): VisionAnalysis {
    try {
      const parsed = JSON.parse(response.content || '{}');
      
      return {
        description: parsed.description || 'I can see an image, but I\'m having trouble describing it clearly.',
        objects: parsed.objects || [],
        faces: parsed.faces || [],
        emotions: parsed.emotions || [],
        scene: parsed.scene || {
          setting: 'unknown',
          lighting: 'unknown',
          mood: 'neutral',
          activity: 'unknown',
          colors: [],
        },
        accessibility: parsed.accessibility || {
          summary: 'Image present',
          detailedDescription: 'Unable to provide detailed description',
          importantElements: [],
          navigationHints: [],
        },
        contextualInsights: parsed.contextualInsights || [],
        confidence: parsed.confidence || response.confidence || 0.6,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error parsing vision analysis:', error);
      return this.getFailsafeAnalysis(imageUri);
    }
  }

  /**
   * Parse object detection response
   */
  private parseObjectDetectionResponse(content: string): DetectedObject[] {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing object detection:', error);
      return [];
    }
  }

  /**
   * Parse emotional analysis response
   */
  private parseEmotionalAnalysis(content: string): EmotionalAnalysis[] {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('Error parsing emotional analysis:', error);
      return [];
    }
  }

  /**
   * Save visual analysis to memory store
   */
  private async saveVisualMemory(analysis: VisionAnalysis, imageUri: string): Promise<void> {
    try {
      const memoryStore = useMemoryStore.getState();
      
      // Save as episodic memory
      memoryStore.addEpisodic({
        type: 'episodic',
        content: `Visual: ${analysis.description}`,
        tags: ['visual', 'camera', 'analysis', ...analysis.scene.colors, analysis.scene.setting],
        importance: 0.7,
        emotion: analysis.scene.mood,
        confidence: analysis.confidence,
        source: 'vision_service',
        sha256: `vision_${Date.now()}`,
      });

      // Save semantic memory for important objects
      if (analysis.objects.length > 0) {
        const objectNames = analysis.objects
          .filter(obj => obj.confidence > 0.7)
          .map(obj => obj.name)
          .join(', ');
        
        if (objectNames) {
          memoryStore.addSemantic({
            type: 'semantic',
            content: `Observed objects: ${objectNames}`,
            tags: ['visual', 'objects', 'semantic'],
            importance: 0.6,
            emotion: 'neutral',
            confidence: analysis.confidence,
            source: 'vision_service',
            sha256: `objects_${Date.now()}`,
          });
        }
      }

      // Save emotional memory if faces or strong emotions detected
      if (analysis.faces.length > 0 || analysis.emotions.length > 0) {
        memoryStore.addEmotional({
          type: 'emotional',
          content: `Visual emotions: ${analysis.scene.mood} scene with ${analysis.faces.length} faces detected`,
          tags: ['visual', 'emotions', 'faces'],
          importance: 0.8,
          emotion: analysis.scene.mood,
          confidence: analysis.confidence,
          source: 'vision_service',
          sha256: `emotions_${Date.now()}`,
        });
      }
    } catch (error) {
      console.error('Error saving visual memory:', error);
    }
  }

  /**
   * Get failsafe analysis when errors occur
   */
  private getFailsafeAnalysis(imageUri: string): VisionAnalysis {
    return {
      description: 'I can see that there\'s an image here, but I\'m having some difficulty analyzing it clearly right now. Could you try taking another photo or describing what you\'d like me to focus on?',
      objects: [],
      faces: [],
      emotions: [],
      scene: {
        setting: 'unknown',
        lighting: 'unknown',
        mood: 'neutral',
        activity: 'unknown',
        colors: [],
      },
      accessibility: {
        summary: 'Image is present but cannot be analyzed',
        detailedDescription: 'Unable to provide detailed visual description at this time',
        importantElements: [],
        navigationHints: [],
      },
      contextualInsights: [
        'I\'m having some trouble with my vision analysis right now',
        'Feel free to ask me to try again or describe what you\'re looking at',
      ],
      confidence: 0.2,
      timestamp: Date.now(),
    };
  }

  // Public utility methods
  
  /**
   * Get analysis history
   */
  getAnalysisHistory(): VisionAnalysis[] {
    return [...this.analysisHistory];
  }

  /**
   * Clear analysis history
   */
  clearHistory(): void {
    this.analysisHistory = [];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VisionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): VisionConfig {
    return { ...this.config };
  }

  /**
   * Test vision service functionality
   */
  async testVisionService(): Promise<boolean> {
    try {
      // Test camera permissions and functionality
      const hasPermissions = await this.cameraIntegration.requestPermissions();
      if (!hasPermissions) {
        return false;
      }

      // Test OpenAI connectivity
      const openAIWorking = await this.openAI.testConnection();
      
      return openAIWorking;
    } catch (error) {
      console.error('Vision service test failed:', error);
      return false;
    }
  }

  /**
   * Analyze image from gallery
   */
  async analyzeFromGallery(): Promise<VisionAnalysis | null> {
    try {
      const image = await this.cameraIntegration.pickFromGallery();
      if (!image) {
        return null;
      }

      return await this.analyzeImage(image.uri);
    } catch (error) {
      console.error('Error analyzing image from gallery:', error);
      return null;
    }
  }

  /**
   * Get recent photos for analysis
   */
  async getRecentPhotosForAnalysis(limit: number = 5): Promise<CameraResult[]> {
    try {
      return await this.cameraIntegration.getRecentPhotos(limit);
    } catch (error) {
      console.error('Error getting recent photos:', error);
      return [];
    }
  }

  /**
   * Quick scene understanding without full analysis
   */
  async quickLook(imageUri: string): Promise<string> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const quickPrompt = `
Quickly describe what you see in this image in 1-2 sentences. 
Be warm and conversational, as if you're helping a friend understand what they're looking at.
`;

      const response = await this.callVisionAPI(base64Image, quickPrompt);
      return response.content || 'I can see an image, but I\'m having trouble describing it right now.';
    } catch (error) {
      console.error('Error in quick look:', error);
      return 'I\'m having a moment of technical difficulty with my vision. Can you try again?';
    }
  }
}

export default VisionService;
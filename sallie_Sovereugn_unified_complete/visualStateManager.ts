

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visual state management and persistence for avatar system.
 * Got it, love.
 */

import { AvatarOptions, VisualPreference } from '../ui/visual/avatarGenerator';
import { VisualCustomizationManager } from '../ui/visual/customizationManager';

interface VisualState {
  currentAvatar: AvatarOptions;
  activeTheme: string;
  seasonalUpdates: boolean;
  moodBasedChanges: boolean;
  lastUpdated: number;
  userPreferences: {
    preferredStyles: string[];
    colorPreferences: string[];
    accessoryPreferences: string[];
  };
}

export class VisualStateManager {
  private customizationManager: VisualCustomizationManager;
  private state: VisualState;
  private persistenceKey = 'sallie-visual-state-v1';

  constructor() {
    this.customizationManager = new VisualCustomizationManager();
    this.state = this.loadState();
    this.setupEventListeners();
  }

  /**
   * Initialize visual system with user preferences
   */
  async initialize(): Promise<void> {
    // Apply saved state
    if (this.state.currentAvatar) {
      this.customizationManager.updateAvatar(this.state.currentAvatar);
    }

    // Setup automatic updates
    if (this.state.seasonalUpdates) {
      this.setupSeasonalUpdates();
    }

    // Generate initial avatar if none exists
    if (!this.state.currentAvatar) {
      await this.generateDefaultAvatar();
    }
  }

  /**
   * Get current visual state
   */
  getCurrentState(): VisualState {
    return { ...this.state };
  }

  /**
   * Update avatar with new options
   */
  updateAvatar(options: Partial<AvatarOptions>): void {
    this.customizationManager.updateAvatar(options);
    this.state.currentAvatar = { ...this.state.currentAvatar, ...options };
    this.state.lastUpdated = Date.now();
    this.saveState();
  }

  /**
   * Apply a preset and learn from user choice
   */
  applyPreset(presetId: string): void {
    this.customizationManager.applyPreset(presetId);
    const preset = this.customizationManager.getPresets().find(p => p.id === presetId);
    
    if (preset) {
      this.state.currentAvatar = { ...preset.options };
      this.learnFromUserChoice(preset);
      this.state.lastUpdated = Date.now();
      this.saveState();
    }
  }

  /**
   * Get personalized recommendations based on usage patterns
   */
  getPersonalizedRecommendations(): VisualPreference[] {
    const preferences = this.state.userPreferences;
    const variations = this.customizationManager.generateVariations();
    
    // Filter and score based on user preferences
    return variations
      .map(variation => ({
        ...variation,
        score: this.calculateRecommendationScore(variation)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score, ...variation }) => variation);
  }

  /**
   * Update for seasonal changes
   */
  updateForSeason(): void {
    if (this.state.seasonalUpdates) {
      const currentSeason = this.getCurrentSeason();
      if (this.state.currentAvatar.season !== currentSeason) {
        this.updateAvatar({ season: currentSeason });
      }
    }
  }

  /**
   * Update based on mood detection
   */
  updateForMood(mood: string, confidence: number = 0.8): void {
    if (this.state.moodBasedChanges && confidence > 0.6) {
      const validMoods = ['confident', 'calm', 'focused', 'creative', 'determined'];
      if (validMoods.includes(mood) && this.state.currentAvatar.mood !== mood) {
        this.updateAvatar({ mood: mood as any });
      }
    }
  }

  /**
   * Generate avatar suggestions based on context
   */
  generateContextualSuggestions(context: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    workMode?: 'focus' | 'creative' | 'meeting' | 'break';
    mood?: string;
    season?: string;
  }): VisualPreference[] {
    const suggestions: VisualPreference[] = [];
    const baseAvatar = this.state.currentAvatar;

    // Time-based suggestions
    if (context.timeOfDay === 'morning') {
      suggestions.push({
        id: 'morning-energy',
        name: 'Morning Energy',
        description: 'Bright and energizing for a fresh start',
        preview: this.customizationManager.generateCurrentAvatar(),
        options: {
          ...baseAvatar,
          primaryColor: '#f59e0b',
          mood: 'confident',
          animated: true
        }
      });
    }

    if (context.timeOfDay === 'night') {
      suggestions.push({
        id: 'midnight-mode',
        name: 'Midnight Focus',
        description: 'Calming colors for late-night productivity',
        preview: this.customizationManager.generateCurrentAvatar(),
        options: {
          ...baseAvatar,
          primaryColor: '#1f2937',
          secondaryColor: '#6366f1',
          mood: 'focused'
        }
      });
    }

    // Work mode suggestions
    if (context.workMode === 'creative') {
      suggestions.push({
        id: 'creative-mode',
        name: 'Creative Flow',
        description: 'Inspiring visuals for creative work',
        preview: this.customizationManager.generateCurrentAvatar(),
        options: {
          ...baseAvatar,
          style: 'artistic',
          primaryColor: '#8b5cf6',
          mood: 'creative',
          animated: true
        }
      });
    }

    return suggestions.slice(0, 4);
  }

  /**
   * Save current look with auto-generated name
   */
  saveCurrentLookSmart(): void {
    const avatar = this.state.currentAvatar;
    const name = this.generateSmartName(avatar);
    const description = this.generateDescription(avatar);
    
    this.customizationManager.saveCurrentLook(name, description);
  }

  /**
   * Export avatar as different formats
   */
  exportAvatar(format: 'svg' | 'png' | 'config' = 'svg'): string {
    const avatar = this.customizationManager.generateCurrentAvatar();
    
    switch (format) {
      case 'config':
        return JSON.stringify(this.state.currentAvatar, null, 2);
      case 'png':
        // Convert SVG to PNG (would need canvas in real implementation)
        return this.svgToPng(avatar);
      default:
        return avatar;
    }
  }

  /**
   * Import avatar configuration
   */
  importAvatar(config: string | AvatarOptions): void {
    try {
      const options = typeof config === 'string' ? JSON.parse(config) : config;
      this.updateAvatar(options);
    } catch (error) {
      console.error('Failed to import avatar configuration:', error);
    }
  }

  /**
   * Get usage analytics for the visual system
   */
  getUsageAnalytics() {
    return {
      totalCustomizations: this.getCustomizationCount(),
      favoriteStyles: this.state.userPreferences.preferredStyles,
      favoriteColors: this.state.userPreferences.colorPreferences,
      lastUpdated: new Date(this.state.lastUpdated).toLocaleDateString(),
      seasonalUpdatesEnabled: this.state.seasonalUpdates,
      moodBasedChangesEnabled: this.state.moodBasedChanges
    };
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.state = this.getDefaultState();
    this.customizationManager = new VisualCustomizationManager();
    this.saveState();
  }

  // Private methods
  private loadState(): VisualState {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.persistenceKey);
      if (saved) {
        try {
          return { ...this.getDefaultState(), ...JSON.parse(saved) };
        } catch (error) {
          console.warn('Failed to load visual state:', error);
        }
      }
    }
    return this.getDefaultState();
  }

  private saveState(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.persistenceKey, JSON.stringify(this.state));
    }
  }

  private getDefaultState(): VisualState {
    return {
      currentAvatar: {
        style: 'portrait',
        primaryColor: '#8b5cf6',
        secondaryColor: '#f59e0b',
        accentColor: '#ec4899',
        hairStyle: 2,
        eyeStyle: 1,
        faceShape: 0,
        accessories: ['earrings'],
        mood: 'confident',
        season: this.getCurrentSeason(),
        animated: false,
        seed: Math.floor(Math.random() * 1000)
      },
      activeTheme: 'Grace & Grind',
      seasonalUpdates: true,
      moodBasedChanges: true,
      lastUpdated: Date.now(),
      userPreferences: {
        preferredStyles: ['portrait'],
        colorPreferences: ['#8b5cf6'],
        accessoryPreferences: ['earrings']
      }
    };
  }

  private setupEventListeners(): void {
    // Listen for customization changes
    this.customizationManager.onAvatarChange((avatar) => {
      // Avatar changed, could trigger additional logic here
    });
  }

  private setupSeasonalUpdates(): void {
    // Check for season changes daily
    setInterval(() => {
      this.updateForSeason();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  private async generateDefaultAvatar(): Promise<void> {
    const presets = this.customizationManager.getPresets();
    const defaultPreset = presets.find(p => p.id === 'grace-and-grind') || presets[0];
    
    if (defaultPreset) {
      this.applyPreset(defaultPreset.id);
    }
  }

  private learnFromUserChoice(preset: VisualPreference): void {
    const { style, primaryColor, accessories = [] } = preset.options;
    
    // Learn style preferences
    if (style && !this.state.userPreferences.preferredStyles.includes(style)) {
      this.state.userPreferences.preferredStyles.push(style);
    }
    
    // Learn color preferences
    if (primaryColor && !this.state.userPreferences.colorPreferences.includes(primaryColor)) {
      this.state.userPreferences.colorPreferences.push(primaryColor);
    }
    
    // Learn accessory preferences
    accessories.forEach(accessory => {
      if (!this.state.userPreferences.accessoryPreferences.includes(accessory)) {
        this.state.userPreferences.accessoryPreferences.push(accessory);
      }
    });
  }

  private calculateRecommendationScore(variation: VisualPreference): number {
    let score = 0;
    const preferences = this.state.userPreferences;
    const options = variation.options;
    
    // Score based on preferred styles
    if (options.style && preferences.preferredStyles.includes(options.style)) {
      score += 30;
    }
    
    // Score based on color preferences
    if (options.primaryColor && preferences.colorPreferences.includes(options.primaryColor)) {
      score += 25;
    }
    
    // Score based on accessory preferences
    options.accessories?.forEach(accessory => {
      if (preferences.accessoryPreferences.includes(accessory)) {
        score += 15;
      }
    });
    
    // Random factor to ensure variety
    score += Math.random() * 10;
    
    return score;
  }

  private generateSmartName(avatar: AvatarOptions): string {
    const styleNames: { [key: string]: string } = {
      geometric: 'Geometric',
      abstract: 'Abstract',
      portrait: 'Classic',
      minimal: 'Minimal',
      artistic: 'Artistic'
    };
    
    const moodNames: { [key: string]: string } = {
      confident: 'Confident',
      calm: 'Zen',
      focused: 'Focus',
      creative: 'Creative',
      determined: 'Power'
    };
    
    const style = styleNames[avatar.style || 'portrait'] || 'Custom';
    const mood = moodNames[avatar.mood || 'confident'] || 'Mood';
    
    return `${style} ${mood} Look`;
  }

  private generateDescription(avatar: AvatarOptions): string {
    const descriptions = [
      `A ${avatar.style} look with ${avatar.mood} energy`,
      `Perfect for ${avatar.season} vibes`,
      `Custom ${avatar.style} style with personal touches`,
      `${avatar.mood} mood with ${avatar.style} aesthetics`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    switch (true) {
      case month >= 2 && month <= 4: return 'spring';
      case month >= 5 && month <= 7: return 'summer';
      case month >= 8 && month <= 10: return 'autumn';
      default: return 'winter';
    }
  }

  private getCustomizationCount(): number {
    // Count changes from default
    const defaults = this.getDefaultState().currentAvatar;
    const current = this.state.currentAvatar;
    
    let changes = 0;
    Object.keys(current).forEach(key => {
      if (JSON.stringify(current[key as keyof AvatarOptions]) !== 
          JSON.stringify(defaults[key as keyof AvatarOptions])) {
        changes++;
      }
    });
    
    return changes;
  }

  private svgToPng(svg: string): string {
    // In a real implementation, this would use canvas to convert SVG to PNG
    // For now, return the SVG as a data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

export default VisualStateManager;

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visual state management and persistence for avatar system.
 * Got it, love.
 */

import { AvatarOptions, VisualPreference } from '../ui/visual/avatarGenerator';
import { VisualCustomizationManager } from '../ui/visual/customizationManager';

interface VisualState {
  currentAvatar: AvatarOptions;
  activeTheme: string;
  seasonalUpdates: boolean;
  moodBasedChanges: boolean;
  lastUpdated: number;
  userPreferences: {
    preferredStyles: string[];
    colorPreferences: string[];
    accessoryPreferences: string[];
  };
}

export class VisualStateManager {
  private customizationManager: VisualCustomizationManager;
  private state: VisualState;
  private persistenceKey = 'sallie-visual-state-v1';

  constructor() {
    this.customizationManager = new VisualCustomizationManager();
    this.state = this.loadState();
    this.setupEventListeners();
  }

  /**
   * Initialize visual system with user preferences
   */
  async initialize(): Promise<void> {
    // Apply saved state
    if (this.state.currentAvatar) {
      this.customizationManager.updateAvatar(this.state.currentAvatar);
    }

    // Setup automatic updates
    if (this.state.seasonalUpdates) {
      this.setupSeasonalUpdates();
    }

    // Generate initial avatar if none exists
    if (!this.state.currentAvatar) {
      await this.generateDefaultAvatar();
    }
  }

  /**
   * Get current visual state
   */
  getCurrentState(): VisualState {
    return { ...this.state };
  }

  /**
   * Update avatar with new options
   */
  updateAvatar(options: Partial<AvatarOptions>): void {
    this.customizationManager.updateAvatar(options);
    this.state.currentAvatar = { ...this.state.currentAvatar, ...options };
    this.state.lastUpdated = Date.now();
    this.saveState();
  }

  /**
   * Apply a preset and learn from user choice
   */
  applyPreset(presetId: string): void {
    this.customizationManager.applyPreset(presetId);
    const preset = this.customizationManager.getPresets().find(p => p.id === presetId);
    
    if (preset) {
      this.state.currentAvatar = { ...preset.options };
      this.learnFromUserChoice(preset);
      this.state.lastUpdated = Date.now();
      this.saveState();
    }
  }

  /**
   * Get personalized recommendations based on usage patterns
   */
  getPersonalizedRecommendations(): VisualPreference[] {
    const preferences = this.state.userPreferences;
    const variations = this.customizationManager.generateVariations();
    
    // Filter and score based on user preferences
    return variations
      .map(variation => ({
        ...variation,
        score: this.calculateRecommendationScore(variation)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ score, ...variation }) => variation);
  }

  /**
   * Update for seasonal changes
   */
  updateForSeason(): void {
    if (this.state.seasonalUpdates) {
      const currentSeason = this.getCurrentSeason();
      if (this.state.currentAvatar.season !== currentSeason) {
        this.updateAvatar({ season: currentSeason });
      }
    }
  }

  /**
   * Update based on mood detection
   */
  updateForMood(mood: string, confidence: number = 0.8): void {
    if (this.state.moodBasedChanges && confidence > 0.6) {
      const validMoods = ['confident', 'calm', 'focused', 'creative', 'determined'];
      if (validMoods.includes(mood) && this.state.currentAvatar.mood !== mood) {
        this.updateAvatar({ mood: mood as any });
      }
    }
  }

  /**
   * Generate avatar suggestions based on context
   */
  generateContextualSuggestions(context: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    workMode?: 'focus' | 'creative' | 'meeting' | 'break';
    mood?: string;
    season?: string;
  }): VisualPreference[] {
    const suggestions: VisualPreference[] = [];
    const baseAvatar = this.state.currentAvatar;

    // Time-based suggestions
    if (context.timeOfDay === 'morning') {
      suggestions.push({
        id: 'morning-energy',
        name: 'Morning Energy',
        description: 'Bright and energizing for a fresh start',
        preview: this.customizationManager.generateCurrentAvatar(),
        options: {
          ...baseAvatar,
          primaryColor: '#f59e0b',
          mood: 'confident',
          animated: true
        }
      });
    }

    if (context.timeOfDay === 'night') {
      suggestions.push({
        id: 'midnight-mode',
        name: 'Midnight Focus',
        description: 'Calming colors for late-night productivity',
        preview: this.customizationManager.generateCurrentAvatar(),
        options: {
          ...baseAvatar,
          primaryColor: '#1f2937',
          secondaryColor: '#6366f1',
          mood: 'focused'
        }
      });
    }

    // Work mode suggestions
    if (context.workMode === 'creative') {
      suggestions.push({
        id: 'creative-mode',
        name: 'Creative Flow',
        description: 'Inspiring visuals for creative work',
        preview: this.customizationManager.generateCurrentAvatar(),
        options: {
          ...baseAvatar,
          style: 'artistic',
          primaryColor: '#8b5cf6',
          mood: 'creative',
          animated: true
        }
      });
    }

    return suggestions.slice(0, 4);
  }

  /**
   * Save current look with auto-generated name
   */
  saveCurrentLookSmart(): void {
    const avatar = this.state.currentAvatar;
    const name = this.generateSmartName(avatar);
    const description = this.generateDescription(avatar);
    
    this.customizationManager.saveCurrentLook(name, description);
  }

  /**
   * Export avatar as different formats
   */
  exportAvatar(format: 'svg' | 'png' | 'config' = 'svg'): string {
    const avatar = this.customizationManager.generateCurrentAvatar();
    
    switch (format) {
      case 'config':
        return JSON.stringify(this.state.currentAvatar, null, 2);
      case 'png':
        // Convert SVG to PNG (would need canvas in real implementation)
        return this.svgToPng(avatar);
      default:
        return avatar;
    }
  }

  /**
   * Import avatar configuration
   */
  importAvatar(config: string | AvatarOptions): void {
    try {
      const options = typeof config === 'string' ? JSON.parse(config) : config;
      this.updateAvatar(options);
    } catch (error) {
      console.error('Failed to import avatar configuration:', error);
    }
  }

  /**
   * Get usage analytics for the visual system
   */
  getUsageAnalytics() {
    return {
      totalCustomizations: this.getCustomizationCount(),
      favoriteStyles: this.state.userPreferences.preferredStyles,
      favoriteColors: this.state.userPreferences.colorPreferences,
      lastUpdated: new Date(this.state.lastUpdated).toLocaleDateString(),
      seasonalUpdatesEnabled: this.state.seasonalUpdates,
      moodBasedChangesEnabled: this.state.moodBasedChanges
    };
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.state = this.getDefaultState();
    this.customizationManager = new VisualCustomizationManager();
    this.saveState();
  }

  // Private methods
  private loadState(): VisualState {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.persistenceKey);
      if (saved) {
        try {
          return { ...this.getDefaultState(), ...JSON.parse(saved) };
        } catch (error) {
          console.warn('Failed to load visual state:', error);
        }
      }
    }
    return this.getDefaultState();
  }

  private saveState(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.persistenceKey, JSON.stringify(this.state));
    }
  }

  private getDefaultState(): VisualState {
    return {
      currentAvatar: {
        style: 'portrait',
        primaryColor: '#8b5cf6',
        secondaryColor: '#f59e0b',
        accentColor: '#ec4899',
        hairStyle: 2,
        eyeStyle: 1,
        faceShape: 0,
        accessories: ['earrings'],
        mood: 'confident',
        season: this.getCurrentSeason(),
        animated: false,
        seed: Math.floor(Math.random() * 1000)
      },
      activeTheme: 'Grace & Grind',
      seasonalUpdates: true,
      moodBasedChanges: true,
      lastUpdated: Date.now(),
      userPreferences: {
        preferredStyles: ['portrait'],
        colorPreferences: ['#8b5cf6'],
        accessoryPreferences: ['earrings']
      }
    };
  }

  private setupEventListeners(): void {
    // Listen for customization changes
    this.customizationManager.onAvatarChange((avatar) => {
      // Avatar changed, could trigger additional logic here
    });
  }

  private setupSeasonalUpdates(): void {
    // Check for season changes daily
    setInterval(() => {
      this.updateForSeason();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  private async generateDefaultAvatar(): Promise<void> {
    const presets = this.customizationManager.getPresets();
    const defaultPreset = presets.find(p => p.id === 'grace-and-grind') || presets[0];
    
    if (defaultPreset) {
      this.applyPreset(defaultPreset.id);
    }
  }

  private learnFromUserChoice(preset: VisualPreference): void {
    const { style, primaryColor, accessories = [] } = preset.options;
    
    // Learn style preferences
    if (style && !this.state.userPreferences.preferredStyles.includes(style)) {
      this.state.userPreferences.preferredStyles.push(style);
    }
    
    // Learn color preferences
    if (primaryColor && !this.state.userPreferences.colorPreferences.includes(primaryColor)) {
      this.state.userPreferences.colorPreferences.push(primaryColor);
    }
    
    // Learn accessory preferences
    accessories.forEach(accessory => {
      if (!this.state.userPreferences.accessoryPreferences.includes(accessory)) {
        this.state.userPreferences.accessoryPreferences.push(accessory);
      }
    });
  }

  private calculateRecommendationScore(variation: VisualPreference): number {
    let score = 0;
    const preferences = this.state.userPreferences;
    const options = variation.options;
    
    // Score based on preferred styles
    if (options.style && preferences.preferredStyles.includes(options.style)) {
      score += 30;
    }
    
    // Score based on color preferences
    if (options.primaryColor && preferences.colorPreferences.includes(options.primaryColor)) {
      score += 25;
    }
    
    // Score based on accessory preferences
    options.accessories?.forEach(accessory => {
      if (preferences.accessoryPreferences.includes(accessory)) {
        score += 15;
      }
    });
    
    // Random factor to ensure variety
    score += Math.random() * 10;
    
    return score;
  }

  private generateSmartName(avatar: AvatarOptions): string {
    const styleNames: { [key: string]: string } = {
      geometric: 'Geometric',
      abstract: 'Abstract',
      portrait: 'Classic',
      minimal: 'Minimal',
      artistic: 'Artistic'
    };
    
    const moodNames: { [key: string]: string } = {
      confident: 'Confident',
      calm: 'Zen',
      focused: 'Focus',
      creative: 'Creative',
      determined: 'Power'
    };
    
    const style = styleNames[avatar.style || 'portrait'] || 'Custom';
    const mood = moodNames[avatar.mood || 'confident'] || 'Mood';
    
    return `${style} ${mood} Look`;
  }

  private generateDescription(avatar: AvatarOptions): string {
    const descriptions = [
      `A ${avatar.style} look with ${avatar.mood} energy`,
      `Perfect for ${avatar.season} vibes`,
      `Custom ${avatar.style} style with personal touches`,
      `${avatar.mood} mood with ${avatar.style} aesthetics`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    switch (true) {
      case month >= 2 && month <= 4: return 'spring';
      case month >= 5 && month <= 7: return 'summer';
      case month >= 8 && month <= 10: return 'autumn';
      default: return 'winter';
    }
  }

  private getCustomizationCount(): number {
    // Count changes from default
    const defaults = this.getDefaultState().currentAvatar;
    const current = this.state.currentAvatar;
    
    let changes = 0;
    Object.keys(current).forEach(key => {
      if (JSON.stringify(current[key as keyof AvatarOptions]) !== 
          JSON.stringify(defaults[key as keyof AvatarOptions])) {
        changes++;
      }
    });
    
    return changes;
  }

  private svgToPng(svg: string): string {
    // In a real implementation, this would use canvas to convert SVG to PNG
    // For now, return the SVG as a data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

export default VisualStateManager;


/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visual customization interface for Sallie's appearance choices.
 * Got it, love.
 */

import { generateAdvancedAvatar, createAvatarPresets, AvatarOptions, VisualPreference } from './avatarGenerator';

export interface VisualCustomizationState {
  currentAvatar: AvatarOptions;
  selectedPreset?: string;
  customizations: Partial<AvatarOptions>;
  preferences: {
    allowAnimations: boolean;
    autoSeasonalUpdate: boolean;
    moodBasedChanges: boolean;
  };
  savedLooks: VisualPreference[];
}

export class VisualCustomizationManager {
  private state: VisualCustomizationState;
  private presets: VisualPreference[];
  private onChangeCallback?: (avatar: string) => void;

  constructor() {
    this.presets = createAvatarPresets();
    this.state = this.getDefaultState();
  }

  private getDefaultState(): VisualCustomizationState {
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
        season: 'summer',
        animated: false,
        seed: 42
      },
      customizations: {},
      preferences: {
        allowAnimations: true,
        autoSeasonalUpdate: true,
        moodBasedChanges: true
      },
      savedLooks: []
    };
  }

  /**
   * Get available preset options
   */
  getPresets(): VisualPreference[] {
    return this.presets;
  }

  /**
   * Apply a preset to current avatar
   */
  applyPreset(presetId: string): void {
    const preset = this.presets.find(p => p.id === presetId);
    if (preset) {
      this.state.currentAvatar = { ...preset.options };
      this.state.selectedPreset = presetId;
      this.state.customizations = {};
      this.notifyChange();
    }
  }

  /**
   * Update specific avatar properties
   */
  updateAvatar(updates: Partial<AvatarOptions>): void {
    this.state.currentAvatar = { ...this.state.currentAvatar, ...updates };
    this.state.customizations = { ...this.state.customizations, ...updates };
    this.state.selectedPreset = undefined; // Clear preset selection when customizing
    this.notifyChange();
  }

  /**
   * Get current avatar configuration
   */
  getCurrentAvatar(): AvatarOptions {
    return { ...this.state.currentAvatar };
  }

  /**
   * Generate current avatar SVG
   */
  generateCurrentAvatar(): string {
    return generateAdvancedAvatar(this.state.currentAvatar);
  }

  /**
   * Save current look as a custom preset
   */
  saveCurrentLook(name: string, description: string): void {
    const newLook: VisualPreference = {
      id: `custom-${Date.now()}`,
      name,
      description,
      preview: this.generateCurrentAvatar(),
      options: { ...this.state.currentAvatar }
    };
    
    this.state.savedLooks.push(newLook);
    this.persistState();
  }

  /**
   * Delete a saved look
   */
  deleteSavedLook(id: string): void {
    this.state.savedLooks = this.state.savedLooks.filter(look => look.id !== id);
    this.persistState();
  }

  /**
   * Get all saved looks
   */
  getSavedLooks(): VisualPreference[] {
    return [...this.state.savedLooks];
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<typeof this.state.preferences>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    this.persistState();
  }

  /**
   * Auto-update avatar based on current season
   */
  updateForSeason(): void {
    if (!this.state.preferences.autoSeasonalUpdate) return;

    const currentSeason = this.getCurrentSeason();
    if (this.state.currentAvatar.season !== currentSeason) {
      this.updateAvatar({ season: currentSeason });
    }
  }

  /**
   * Update avatar based on mood
   */
  updateForMood(mood: string): void {
    if (!this.state.preferences.moodBasedChanges) return;

    const validMoods = ['confident', 'calm', 'focused', 'creative', 'determined'];
    if (validMoods.includes(mood)) {
      this.updateAvatar({ mood: mood as any });
    }
  }

  /**
   * Get customization options for UI
   */
  getCustomizationOptions() {
    return {
      styles: [
        { value: 'geometric', label: 'Geometric', description: 'Clean, modern shapes' },
        { value: 'abstract', label: 'Abstract', description: 'Artistic and fluid' },
        { value: 'portrait', label: 'Portrait', description: 'Classic and detailed' },
        { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
        { value: 'artistic', label: 'Artistic', description: 'Creative expression' }
      ],
      hairStyles: [
        { value: 0, label: 'Classic', preview: 'Traditional styling' },
        { value: 1, label: 'Pixie Cut', preview: 'Short and edgy' },
        { value: 2, label: 'Professional Bob', preview: 'Polished look' },
        { value: 3, label: 'Curly', preview: 'Natural texture' },
        { value: 4, label: 'Braided', preview: 'Intricate styling' },
        { value: 5, label: 'Long Waves', preview: 'Flowing and graceful' },
        { value: 6, label: 'Afro', preview: 'Bold and beautiful' },
        { value: 7, label: 'Updo', preview: 'Elegant and formal' },
        { value: 8, label: 'Edgy Modern', preview: 'Contemporary edge' }
      ],
      eyeStyles: [
        { value: 0, label: 'Round', preview: 'Friendly and open' },
        { value: 1, label: 'Almond', preview: 'Elegant and sophisticated' },
        { value: 2, label: 'Wide', preview: 'Expressive and bold' },
        { value: 3, label: 'Focused', preview: 'Intense and determined' },
        { value: 4, label: 'Artistic', preview: 'Creative and unique' }
      ],
      faceShapes: [
        { value: 0, label: 'Round', preview: 'Soft and welcoming' },
        { value: 1, label: 'Oval', preview: 'Classic proportions' },
        { value: 2, label: 'Square', preview: 'Strong and confident' },
        { value: 3, label: 'Heart', preview: 'Delicate and refined' }
      ],
      accessories: [
        { value: 'glasses', label: 'Glasses', description: 'Smart and professional' },
        { value: 'earrings', label: 'Earrings', description: 'Elegant accent' },
        { value: 'necklace', label: 'Necklace', description: 'Stylish finishing touch' }
      ],
      moods: [
        { value: 'confident', label: 'Confident', color: '#f59e0b' },
        { value: 'calm', label: 'Calm', color: '#10b981' },
        { value: 'focused', label: 'Focused', color: '#6366f1' },
        { value: 'creative', label: 'Creative', color: '#8b5cf6' },
        { value: 'determined', label: 'Determined', color: '#ef4444' }
      ],
      colorPalettes: [
        {
          name: 'Grace & Grind',
          primary: '#8b5cf6',
          secondary: '#f59e0b',
          accent: '#ec4899'
        },
        {
          name: 'Southern Grit',
          primary: '#d97706',
          secondary: '#92400e',
          accent: '#f59e0b'
        },
        {
          name: 'Midnight Hustle',
          primary: '#1f2937',
          secondary: '#6366f1',
          accent: '#ec4899'
        },
        {
          name: 'Soul Care',
          primary: '#059669',
          secondary: '#10b981',
          accent: '#f472b6'
        },
        {
          name: 'Creative Vision',
          primary: '#7c3aed',
          secondary: '#fbbf24',
          accent: '#ef4444'
        }
      ]
    };
  }

  /**
   * Generate avatar variations for comparison
   */
  generateVariations(): VisualPreference[] {
    const baseAvatar = this.state.currentAvatar;
    const variations: VisualPreference[] = [];

    // Style variations
    const styles = ['geometric', 'abstract', 'portrait', 'minimal', 'artistic'];
    styles.forEach(style => {
      if (style !== baseAvatar.style) {
        const options = { ...baseAvatar, style: style as any };
        variations.push({
          id: `variation-style-${style}`,
          name: `${style.charAt(0).toUpperCase() + style.slice(1)} Style`,
          description: `Current look in ${style} style`,
          preview: generateAdvancedAvatar(options),
          options
        });
      }
    });

    // Hair variations
    for (let i = 0; i < 5; i++) {
      if (i !== baseAvatar.hairStyle) {
        const options = { ...baseAvatar, hairStyle: i };
        variations.push({
          id: `variation-hair-${i}`,
          name: `Hair Style ${i + 1}`,
          description: `Alternative hair styling`,
          preview: generateAdvancedAvatar(options),
          options
        });
      }
    }

    // Color variations
    const colorPalettes = this.getCustomizationOptions().colorPalettes;
    colorPalettes.forEach(palette => {
      const options = {
        ...baseAvatar,
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent
      };
      variations.push({
        id: `variation-color-${palette.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: palette.name,
        description: `Current look in ${palette.name} colors`,
        preview: generateAdvancedAvatar(options),
        options
      });
    });

    return variations.slice(0, 12); // Limit to 12 variations for UI
  }

  /**
   * Set change callback
   */
  onAvatarChange(callback: (avatar: string) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Generate HTML interface for customization
   */
  generateCustomizationUI(): string {
    const currentAvatar = this.generateCurrentAvatar();
    const options = this.getCustomizationOptions();
    const variations = this.generateVariations();

    return `
      <div class="sallie-visual-customization">
        <div class="customization-header">
          <h2>Choose Your Look, Love</h2>
          <p>Express yourself with Sallie's advanced visual customization</p>
        </div>

        <div class="current-avatar">
          <div class="avatar-preview">
            ${currentAvatar}
          </div>
          <div class="avatar-actions">
            <button class="sallie-button save-look" onclick="saveLook()">Save This Look</button>
            <button class="sallie-button randomize" onclick="randomizeAvatar()">Surprise Me</button>
          </div>
        </div>

        <div class="customization-tabs">
          <button class="tab-button active" data-tab="presets">Presets</button>
          <button class="tab-button" data-tab="customize">Customize</button>
          <button class="tab-button" data-tab="variations">Try These</button>
          <button class="tab-button" data-tab="saved">Saved Looks</button>
        </div>

        <div class="tab-content active" data-tab="presets">
          <div class="presets-grid">
            ${this.presets.map(preset => `
              <div class="preset-card" data-preset="${preset.id}">
                <div class="preset-preview">${preset.preview}</div>
                <h3>${preset.name}</h3>
                <p>${preset.description}</p>
                <button class="apply-preset" onclick="applyPreset('${preset.id}')">Try This Look</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-content" data-tab="customize">
          <div class="customization-controls">
            <div class="control-group">
              <label>Style</label>
              <select name="style" onchange="updateAvatar('style', this.value)">
                ${options.styles.map(style => `
                  <option value="${style.value}" ${this.state.currentAvatar.style === style.value ? 'selected' : ''}>
                    ${style.label}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="control-group">
              <label>Hair Style</label>
              <div class="style-grid">
                ${options.hairStyles.map(hair => `
                  <button class="style-option ${this.state.currentAvatar.hairStyle === hair.value ? 'selected' : ''}" 
                          onclick="updateAvatar('hairStyle', ${hair.value})">
                    ${hair.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-group">
              <label>Eye Style</label>
              <div class="style-grid">
                ${options.eyeStyles.map(eye => `
                  <button class="style-option ${this.state.currentAvatar.eyeStyle === eye.value ? 'selected' : ''}" 
                          onclick="updateAvatar('eyeStyle', ${eye.value})">
                    ${eye.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-group">
              <label>Color Palette</label>
              <div class="color-grid">
                ${options.colorPalettes.map(palette => `
                  <button class="color-option" onclick="applyColorPalette('${palette.name}')">
                    <div class="color-swatch">
                      <span style="background: ${palette.primary}"></span>
                      <span style="background: ${palette.secondary}"></span>
                      <span style="background: ${palette.accent}"></span>
                    </div>
                    <span>${palette.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-group">
              <label>Accessories</label>
              <div class="accessory-grid">
                ${options.accessories.map(accessory => `
                  <label class="accessory-option">
                    <input type="checkbox" 
                           ${this.state.currentAvatar.accessories?.includes(accessory.value) ? 'checked' : ''}
                           onchange="toggleAccessory('${accessory.value}')">
                    <span>${accessory.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="tab-content" data-tab="variations">
          <div class="variations-grid">
            ${variations.map(variation => `
              <div class="variation-card" onclick="applyVariation('${variation.id}')">
                <div class="variation-preview">${variation.preview}</div>
                <h4>${variation.name}</h4>
                <p>${variation.description}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-content" data-tab="saved">
          <div class="saved-looks-grid">
            ${this.state.savedLooks.map(look => `
              <div class="saved-look-card">
                <div class="look-preview">${look.preview}</div>
                <h4>${look.name}</h4>
                <p>${look.description}</p>
                <div class="look-actions">
                  <button onclick="applyLook('${look.id}')">Apply</button>
                  <button onclick="deleteLook('${look.id}')" class="delete">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <style>
        .sallie-visual-customization {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .customization-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .customization-header h2 {
          color: #8b5cf6;
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .current-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
        }

        .avatar-preview {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
        }

        .avatar-preview svg {
          width: 100%;
          height: 100%;
        }

        .customization-tabs {
          display: flex;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 30px;
        }

        .tab-button {
          padding: 12px 24px;
          border: none;
          background: none;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          color: #8b5cf6;
          border-bottom-color: #8b5cf6;
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .preset-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .preset-card:hover {
          transform: translateY(-4px);
        }

        .preset-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 15px;
        }

        .preset-preview svg {
          width: 100%;
          height: 100%;
        }

        .apply-preset {
          width: 100%;
          padding: 10px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 15px;
        }

        .customization-controls {
          display: grid;
          gap: 25px;
        }

        .control-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }

        .style-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .style-option {
          padding: 10px 15px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .style-option:hover {
          border-color: #8b5cf6;
        }

        .style-option.selected {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .color-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .color-swatch {
          display: flex;
          gap: 2px;
        }

        .color-swatch span {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .variations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .variation-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .variation-card:hover {
          transform: translateY(-2px);
        }

        .variation-preview {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 10px;
        }

        .sallie-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sallie-button:hover {
          transform: translateY(-1px);
        }

        .save-look {
          background: #10b981;
          color: white;
        }

        .randomize {
          background: #f59e0b;
          color: white;
        }
      </style>
    `;
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

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.generateCurrentAvatar());
    }
    this.persistState();
  }

  private persistState(): void {
    // In a real app, this would save to localStorage or database
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sallie-visual-state', JSON.stringify(this.state));
    }
  }

  private loadState(): void {
    // In a real app, this would load from localStorage or database
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sallie-visual-state');
      if (saved) {
        try {
          this.state = { ...this.state, ...JSON.parse(saved) };
        } catch (e) {
          console.warn('Failed to load visual state:', e);
        }
      }
    }
  }
}

export default VisualCustomizationManager;

/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visual customization interface for Sallie's appearance choices.
 * Got it, love.
 */

import { generateAdvancedAvatar, createAvatarPresets, AvatarOptions, VisualPreference } from './avatarGenerator';

export interface VisualCustomizationState {
  currentAvatar: AvatarOptions;
  selectedPreset?: string;
  customizations: Partial<AvatarOptions>;
  preferences: {
    allowAnimations: boolean;
    autoSeasonalUpdate: boolean;
    moodBasedChanges: boolean;
  };
  savedLooks: VisualPreference[];
}

export class VisualCustomizationManager {
  private state: VisualCustomizationState;
  private presets: VisualPreference[];
  private onChangeCallback?: (avatar: string) => void;

  constructor() {
    this.presets = createAvatarPresets();
    this.state = this.getDefaultState();
  }

  private getDefaultState(): VisualCustomizationState {
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
        season: 'summer',
        animated: false,
        seed: 42
      },
      customizations: {},
      preferences: {
        allowAnimations: true,
        autoSeasonalUpdate: true,
        moodBasedChanges: true
      },
      savedLooks: []
    };
  }

  /**
   * Get available preset options
   */
  getPresets(): VisualPreference[] {
    return this.presets;
  }

  /**
   * Apply a preset to current avatar
   */
  applyPreset(presetId: string): void {
    const preset = this.presets.find(p => p.id === presetId);
    if (preset) {
      this.state.currentAvatar = { ...preset.options };
      this.state.selectedPreset = presetId;
      this.state.customizations = {};
      this.notifyChange();
    }
  }

  /**
   * Update specific avatar properties
   */
  updateAvatar(updates: Partial<AvatarOptions>): void {
    this.state.currentAvatar = { ...this.state.currentAvatar, ...updates };
    this.state.customizations = { ...this.state.customizations, ...updates };
    this.state.selectedPreset = undefined; // Clear preset selection when customizing
    this.notifyChange();
  }

  /**
   * Get current avatar configuration
   */
  getCurrentAvatar(): AvatarOptions {
    return { ...this.state.currentAvatar };
  }

  /**
   * Generate current avatar SVG
   */
  generateCurrentAvatar(): string {
    return generateAdvancedAvatar(this.state.currentAvatar);
  }

  /**
   * Save current look as a custom preset
   */
  saveCurrentLook(name: string, description: string): void {
    const newLook: VisualPreference = {
      id: `custom-${Date.now()}`,
      name,
      description,
      preview: this.generateCurrentAvatar(),
      options: { ...this.state.currentAvatar }
    };
    
    this.state.savedLooks.push(newLook);
    this.persistState();
  }

  /**
   * Delete a saved look
   */
  deleteSavedLook(id: string): void {
    this.state.savedLooks = this.state.savedLooks.filter(look => look.id !== id);
    this.persistState();
  }

  /**
   * Get all saved looks
   */
  getSavedLooks(): VisualPreference[] {
    return [...this.state.savedLooks];
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<typeof this.state.preferences>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    this.persistState();
  }

  /**
   * Auto-update avatar based on current season
   */
  updateForSeason(): void {
    if (!this.state.preferences.autoSeasonalUpdate) return;

    const currentSeason = this.getCurrentSeason();
    if (this.state.currentAvatar.season !== currentSeason) {
      this.updateAvatar({ season: currentSeason });
    }
  }

  /**
   * Update avatar based on mood
   */
  updateForMood(mood: string): void {
    if (!this.state.preferences.moodBasedChanges) return;

    const validMoods = ['confident', 'calm', 'focused', 'creative', 'determined'];
    if (validMoods.includes(mood)) {
      this.updateAvatar({ mood: mood as any });
    }
  }

  /**
   * Get customization options for UI
   */
  getCustomizationOptions() {
    return {
      styles: [
        { value: 'geometric', label: 'Geometric', description: 'Clean, modern shapes' },
        { value: 'abstract', label: 'Abstract', description: 'Artistic and fluid' },
        { value: 'portrait', label: 'Portrait', description: 'Classic and detailed' },
        { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
        { value: 'artistic', label: 'Artistic', description: 'Creative expression' }
      ],
      hairStyles: [
        { value: 0, label: 'Classic', preview: 'Traditional styling' },
        { value: 1, label: 'Pixie Cut', preview: 'Short and edgy' },
        { value: 2, label: 'Professional Bob', preview: 'Polished look' },
        { value: 3, label: 'Curly', preview: 'Natural texture' },
        { value: 4, label: 'Braided', preview: 'Intricate styling' },
        { value: 5, label: 'Long Waves', preview: 'Flowing and graceful' },
        { value: 6, label: 'Afro', preview: 'Bold and beautiful' },
        { value: 7, label: 'Updo', preview: 'Elegant and formal' },
        { value: 8, label: 'Edgy Modern', preview: 'Contemporary edge' }
      ],
      eyeStyles: [
        { value: 0, label: 'Round', preview: 'Friendly and open' },
        { value: 1, label: 'Almond', preview: 'Elegant and sophisticated' },
        { value: 2, label: 'Wide', preview: 'Expressive and bold' },
        { value: 3, label: 'Focused', preview: 'Intense and determined' },
        { value: 4, label: 'Artistic', preview: 'Creative and unique' }
      ],
      faceShapes: [
        { value: 0, label: 'Round', preview: 'Soft and welcoming' },
        { value: 1, label: 'Oval', preview: 'Classic proportions' },
        { value: 2, label: 'Square', preview: 'Strong and confident' },
        { value: 3, label: 'Heart', preview: 'Delicate and refined' }
      ],
      accessories: [
        { value: 'glasses', label: 'Glasses', description: 'Smart and professional' },
        { value: 'earrings', label: 'Earrings', description: 'Elegant accent' },
        { value: 'necklace', label: 'Necklace', description: 'Stylish finishing touch' }
      ],
      moods: [
        { value: 'confident', label: 'Confident', color: '#f59e0b' },
        { value: 'calm', label: 'Calm', color: '#10b981' },
        { value: 'focused', label: 'Focused', color: '#6366f1' },
        { value: 'creative', label: 'Creative', color: '#8b5cf6' },
        { value: 'determined', label: 'Determined', color: '#ef4444' }
      ],
      colorPalettes: [
        {
          name: 'Grace & Grind',
          primary: '#8b5cf6',
          secondary: '#f59e0b',
          accent: '#ec4899'
        },
        {
          name: 'Southern Grit',
          primary: '#d97706',
          secondary: '#92400e',
          accent: '#f59e0b'
        },
        {
          name: 'Midnight Hustle',
          primary: '#1f2937',
          secondary: '#6366f1',
          accent: '#ec4899'
        },
        {
          name: 'Soul Care',
          primary: '#059669',
          secondary: '#10b981',
          accent: '#f472b6'
        },
        {
          name: 'Creative Vision',
          primary: '#7c3aed',
          secondary: '#fbbf24',
          accent: '#ef4444'
        }
      ]
    };
  }

  /**
   * Generate avatar variations for comparison
   */
  generateVariations(): VisualPreference[] {
    const baseAvatar = this.state.currentAvatar;
    const variations: VisualPreference[] = [];

    // Style variations
    const styles = ['geometric', 'abstract', 'portrait', 'minimal', 'artistic'];
    styles.forEach(style => {
      if (style !== baseAvatar.style) {
        const options = { ...baseAvatar, style: style as any };
        variations.push({
          id: `variation-style-${style}`,
          name: `${style.charAt(0).toUpperCase() + style.slice(1)} Style`,
          description: `Current look in ${style} style`,
          preview: generateAdvancedAvatar(options),
          options
        });
      }
    });

    // Hair variations
    for (let i = 0; i < 5; i++) {
      if (i !== baseAvatar.hairStyle) {
        const options = { ...baseAvatar, hairStyle: i };
        variations.push({
          id: `variation-hair-${i}`,
          name: `Hair Style ${i + 1}`,
          description: `Alternative hair styling`,
          preview: generateAdvancedAvatar(options),
          options
        });
      }
    }

    // Color variations
    const colorPalettes = this.getCustomizationOptions().colorPalettes;
    colorPalettes.forEach(palette => {
      const options = {
        ...baseAvatar,
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent
      };
      variations.push({
        id: `variation-color-${palette.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: palette.name,
        description: `Current look in ${palette.name} colors`,
        preview: generateAdvancedAvatar(options),
        options
      });
    });

    return variations.slice(0, 12); // Limit to 12 variations for UI
  }

  /**
   * Set change callback
   */
  onAvatarChange(callback: (avatar: string) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Generate HTML interface for customization
   */
  generateCustomizationUI(): string {
    const currentAvatar = this.generateCurrentAvatar();
    const options = this.getCustomizationOptions();
    const variations = this.generateVariations();

    return `
      <div class="sallie-visual-customization">
        <div class="customization-header">
          <h2>Choose Your Look, Love</h2>
          <p>Express yourself with Sallie's advanced visual customization</p>
        </div>

        <div class="current-avatar">
          <div class="avatar-preview">
            ${currentAvatar}
          </div>
          <div class="avatar-actions">
            <button class="sallie-button save-look" onclick="saveLook()">Save This Look</button>
            <button class="sallie-button randomize" onclick="randomizeAvatar()">Surprise Me</button>
          </div>
        </div>

        <div class="customization-tabs">
          <button class="tab-button active" data-tab="presets">Presets</button>
          <button class="tab-button" data-tab="customize">Customize</button>
          <button class="tab-button" data-tab="variations">Try These</button>
          <button class="tab-button" data-tab="saved">Saved Looks</button>
        </div>

        <div class="tab-content active" data-tab="presets">
          <div class="presets-grid">
            ${this.presets.map(preset => `
              <div class="preset-card" data-preset="${preset.id}">
                <div class="preset-preview">${preset.preview}</div>
                <h3>${preset.name}</h3>
                <p>${preset.description}</p>
                <button class="apply-preset" onclick="applyPreset('${preset.id}')">Try This Look</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-content" data-tab="customize">
          <div class="customization-controls">
            <div class="control-group">
              <label>Style</label>
              <select name="style" onchange="updateAvatar('style', this.value)">
                ${options.styles.map(style => `
                  <option value="${style.value}" ${this.state.currentAvatar.style === style.value ? 'selected' : ''}>
                    ${style.label}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="control-group">
              <label>Hair Style</label>
              <div class="style-grid">
                ${options.hairStyles.map(hair => `
                  <button class="style-option ${this.state.currentAvatar.hairStyle === hair.value ? 'selected' : ''}" 
                          onclick="updateAvatar('hairStyle', ${hair.value})">
                    ${hair.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-group">
              <label>Eye Style</label>
              <div class="style-grid">
                ${options.eyeStyles.map(eye => `
                  <button class="style-option ${this.state.currentAvatar.eyeStyle === eye.value ? 'selected' : ''}" 
                          onclick="updateAvatar('eyeStyle', ${eye.value})">
                    ${eye.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-group">
              <label>Color Palette</label>
              <div class="color-grid">
                ${options.colorPalettes.map(palette => `
                  <button class="color-option" onclick="applyColorPalette('${palette.name}')">
                    <div class="color-swatch">
                      <span style="background: ${palette.primary}"></span>
                      <span style="background: ${palette.secondary}"></span>
                      <span style="background: ${palette.accent}"></span>
                    </div>
                    <span>${palette.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="control-group">
              <label>Accessories</label>
              <div class="accessory-grid">
                ${options.accessories.map(accessory => `
                  <label class="accessory-option">
                    <input type="checkbox" 
                           ${this.state.currentAvatar.accessories?.includes(accessory.value) ? 'checked' : ''}
                           onchange="toggleAccessory('${accessory.value}')">
                    <span>${accessory.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="tab-content" data-tab="variations">
          <div class="variations-grid">
            ${variations.map(variation => `
              <div class="variation-card" onclick="applyVariation('${variation.id}')">
                <div class="variation-preview">${variation.preview}</div>
                <h4>${variation.name}</h4>
                <p>${variation.description}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-content" data-tab="saved">
          <div class="saved-looks-grid">
            ${this.state.savedLooks.map(look => `
              <div class="saved-look-card">
                <div class="look-preview">${look.preview}</div>
                <h4>${look.name}</h4>
                <p>${look.description}</p>
                <div class="look-actions">
                  <button onclick="applyLook('${look.id}')">Apply</button>
                  <button onclick="deleteLook('${look.id}')" class="delete">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <style>
        .sallie-visual-customization {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .customization-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .customization-header h2 {
          color: #8b5cf6;
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .current-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
        }

        .avatar-preview {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
        }

        .avatar-preview svg {
          width: 100%;
          height: 100%;
        }

        .customization-tabs {
          display: flex;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 30px;
        }

        .tab-button {
          padding: 12px 24px;
          border: none;
          background: none;
          color: #64748b;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          color: #8b5cf6;
          border-bottom-color: #8b5cf6;
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .preset-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .preset-card:hover {
          transform: translateY(-4px);
        }

        .preset-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 15px;
        }

        .preset-preview svg {
          width: 100%;
          height: 100%;
        }

        .apply-preset {
          width: 100%;
          padding: 10px;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 15px;
        }

        .customization-controls {
          display: grid;
          gap: 25px;
        }

        .control-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }

        .style-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .style-option {
          padding: 10px 15px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .style-option:hover {
          border-color: #8b5cf6;
        }

        .style-option.selected {
          background: #8b5cf6;
          color: white;
          border-color: #8b5cf6;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .color-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .color-swatch {
          display: flex;
          gap: 2px;
        }

        .color-swatch span {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .variations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .variation-card {
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .variation-card:hover {
          transform: translateY(-2px);
        }

        .variation-preview {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 10px;
        }

        .sallie-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sallie-button:hover {
          transform: translateY(-1px);
        }

        .save-look {
          background: #10b981;
          color: white;
        }

        .randomize {
          background: #f59e0b;
          color: white;
        }
      </style>
    `;
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

  private notifyChange(): void {
    if (this.onChangeCallback) {
      this.onChangeCallback(this.generateCurrentAvatar());
    }
    this.persistState();
  }

  private persistState(): void {
    // In a real app, this would save to localStorage or database
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sallie-visual-state', JSON.stringify(this.state));
    }
  }

  private loadState(): void {
    // In a real app, this would load from localStorage or database
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sallie-visual-state');
      if (saved) {
        try {
          this.state = { ...this.state, ...JSON.parse(saved) };
        } catch (e) {
          console.warn('Failed to load visual state:', e);
        }
      }
    }
  }
}

export default VisualCustomizationManager;
/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Enhanced accessibility system for WCAG 2.1 AA compliance
 * Got it, love.
 */

import { Dimensions, AccessibilityInfo } from 'react-native';

interface AccessibilityReport {
  score: number; // 0-100
  compliance: 'WCAG_AA' | 'WCAG_A' | 'BASIC' | 'NONE';
  issues: AccessibilityIssue[];
  recommendations: string[];
  summary: {
    critical: number;
    important: number;
    minor: number;
  };
}

interface AccessibilityIssue {
  type: 'color_contrast' | 'touch_target' | 'text_size' | 'screen_reader' | 'keyboard_nav' | 'motion_reduction';
  severity: 'critical' | 'important' | 'minor';
  element: string;
  description: string;
  recommendation: string;
  wcagCriterion?: string;
}

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  luminance: number;
}

export class AccessibilityEnhancementSystem {
  private readonly WCAG_AA_CONTRAST_NORMAL = 4.5;
  private readonly WCAG_AA_CONTRAST_LARGE = 3.0;
  private readonly MIN_TOUCH_TARGET = 44; // iOS/Android minimum
  private readonly RECOMMENDED_TOUCH_TARGET = 48; // Material Design
  private readonly MIN_TEXT_SIZE = 14; // Minimum readable size
  private readonly RECOMMENDED_TEXT_SIZE = 16; // Recommended base size

  private isReducedMotionEnabled: boolean = false;
  private isScreenReaderEnabled: boolean = false;
  private currentFontScale: number = 1.0;

  constructor() {
    this.initializeAccessibilityState();
  }

  private async initializeAccessibilityState() {
    try {
      this.isReducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      // Note: font scale would need platform-specific implementation
      this.currentFontScale = 1.0; // Default value
    } catch (error) {
      console.warn('AccessibilityInfo not available:', error);
    }
  }

  /**
   * Comprehensive accessibility audit
   */
  auditAccessibility(components: any[]): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];

    components.forEach(component => {
      // Check color contrast
      issues.push(...this.checkColorContrast(component));
      
      // Check touch target sizes
      issues.push(...this.checkTouchTargets(component));
      
      // Check text sizes
      issues.push(...this.checkTextSizes(component));
      
      // Check screen reader support
      issues.push(...this.checkScreenReaderSupport(component));
      
      // Check keyboard navigation
      issues.push(...this.checkKeyboardNavigation(component));
      
      // Check motion considerations
      issues.push(...this.checkMotionReduction(component));
    });

    const summary = this.summarizeIssues(issues);
    const score = this.calculateAccessibilityScore(issues);
    const compliance = this.determineComplianceLevel(score, issues);
    const recommendations = this.generateRecommendations(issues);

    return {
      score,
      compliance,
      issues,
      recommendations,
      summary
    };
  }

  /**
   * Check color contrast ratios
   */
  private checkColorContrast(component: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (component.style && component.style.color && component.style.backgroundColor) {
      const foreground = this.parseColor(component.style.color);
      const background = this.parseColor(component.style.backgroundColor);
      
      if (foreground && background) {
        const contrast = this.calculateContrastRatio(foreground, background);
        const isLargeText = this.isLargeText(component);
        const requiredContrast = isLargeText ? this.WCAG_AA_CONTRAST_LARGE : this.WCAG_AA_CONTRAST_NORMAL;

        if (contrast < requiredContrast) {
          issues.push({
            type: 'color_contrast',
            severity: contrast < 3.0 ? 'critical' : 'important',
            element: component.name || 'Unknown component',
            description: `Color contrast ratio is ${contrast.toFixed(2)}:1, which is below the WCAG AA requirement of ${requiredContrast}:1`,
            recommendation: `Increase contrast between foreground (${component.style.color}) and background (${component.style.backgroundColor}) colors`,
            wcagCriterion: '1.4.3 Contrast (Minimum)'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check touch target sizes
   */
  private checkTouchTargets(component: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (this.isTouchableComponent(component)) {
      const { width, height } = this.getComponentDimensions(component);
      
      if (width < this.MIN_TOUCH_TARGET || height < this.MIN_TOUCH_TARGET) {
        issues.push({
          type: 'touch_target',
          severity: 'critical',
          element: component.name || 'Touchable component',
          description: `Touch target is ${width}x${height}px, which is below the minimum ${this.MIN_TOUCH_TARGET}px requirement`,
          recommendation: `Increase touch target size to at least ${this.RECOMMENDED_TOUCH_TARGET}x${this.RECOMMENDED_TOUCH_TARGET}px`,
          wcagCriterion: '2.5.5 Target Size'
        });
      } else if (width < this.RECOMMENDED_TOUCH_TARGET || height < this.RECOMMENDED_TOUCH_TARGET) {
        issues.push({
          type: 'touch_target',
          severity: 'minor',
          element: component.name || 'Touchable component',
          description: `Touch target is ${width}x${height}px, which is below the recommended ${this.RECOMMENDED_TOUCH_TARGET}px size`,
          recommendation: `Consider increasing touch target size to ${this.RECOMMENDED_TOUCH_TARGET}x${this.RECOMMENDED_TOUCH_TARGET}px for better usability`
        });
      }
    }

    return issues;
  }

  /**
   * Check text sizes
   */
  private checkTextSizes(component: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (this.isTextComponent(component)) {
      const fontSize = this.getTextSize(component);
      const scaledSize = fontSize * this.currentFontScale;

      if (scaledSize < this.MIN_TEXT_SIZE) {
        issues.push({
          type: 'text_size',
          severity: 'important',
          element: component.name || 'Text component',
          description: `Text size is ${fontSize}px (${scaledSize}px scaled), which is below the minimum readable size of ${this.MIN_TEXT_SIZE}px`,
          recommendation: `Increase text size to at least ${this.RECOMMENDED_TEXT_SIZE}px and ensure it scales with user preferences`,
          wcagCriterion: '1.4.4 Resize text'
        });
      }
    }

    return issues;
  }

  /**
   * Check screen reader support
   */
  private checkScreenReaderSupport(component: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (this.requiresAccessibilityLabel(component)) {
      if (!component.accessibilityLabel && !component.accessibilityHint) {
        issues.push({
          type: 'screen_reader',
          severity: 'critical',
          element: component.name || 'Interactive component',
          description: 'Component lacks accessibility label or hint for screen readers',
          recommendation: 'Add meaningful accessibilityLabel and/or accessibilityHint props',
          wcagCriterion: '4.1.2 Name, Role, Value'
        });
      }

      if (!component.accessibilityRole) {
        issues.push({
          type: 'screen_reader',
          severity: 'important',
          element: component.name || 'Interactive component',
          description: 'Component lacks accessibility role definition',
          recommendation: 'Add appropriate accessibilityRole prop (button, link, text, etc.)',
          wcagCriterion: '4.1.2 Name, Role, Value'
        });
      }
    }

    return issues;
  }

  /**
   * Check keyboard navigation support
   */
  private checkKeyboardNavigation(component: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (this.isTouchableComponent(component)) {
      if (component.accessibilityState?.disabled === true) {
        // Disabled components should not be focusable
        return issues;
      }

      // Check if component has proper focus handling
      if (!component.onFocus && !component.onBlur) {
        issues.push({
          type: 'keyboard_nav',
          severity: 'minor',
          element: component.name || 'Interactive component',
          description: 'Component lacks focus event handlers for keyboard navigation feedback',
          recommendation: 'Add onFocus and onBlur handlers to provide visual feedback for keyboard users'
        });
      }
    }

    return issues;
  }

  /**
   * Check motion and animation considerations
   */
  private checkMotionReduction(component: any): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (this.hasAnimations(component) && this.isReducedMotionEnabled) {
      issues.push({
        type: 'motion_reduction',
        severity: 'important',
        element: component.name || 'Animated component',
        description: 'Component uses animations while user has reduced motion preference enabled',
        recommendation: 'Respect user\'s reduced motion preference by disabling or reducing animations',
        wcagCriterion: '2.3.3 Animation from Interactions'
      });
    }

    return issues;
  }

  /**
   * Helper methods
   */
  private parseColor(color: string): ColorInfo | null {
    // Simplified color parsing - in real implementation, would handle all CSS color formats
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = this.calculateLuminance(r, g, b);
      
      return { hex: color, rgb: { r, g, b }, luminance };
    }
    
    return null;
  }

  private calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private calculateContrastRatio(foreground: ColorInfo, background: ColorInfo): number {
    const l1 = Math.max(foreground.luminance, background.luminance);
    const l2 = Math.min(foreground.luminance, background.luminance);
    return (l1 + 0.05) / (l2 + 0.05);
  }

  private isLargeText(component: any): boolean {
    const fontSize = this.getTextSize(component);
    const fontWeight = component.style?.fontWeight;
    
    // WCAG considers text "large" if it's 18pt+ (24px+) or 14pt+ (18.5px+) and bold
    return fontSize >= 24 || (fontSize >= 18.5 && (fontWeight === 'bold' || fontWeight >= 700));
  }

  private isTouchableComponent(component: any): boolean {
    const touchableTypes = ['TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'Pressable', 'Button'];
    return touchableTypes.includes(component.type) || component.onPress || component.onTouch;
  }

  private isTextComponent(component: any): boolean {
    return component.type === 'Text' || component.children?.some?.((child: any) => typeof child === 'string');
  }

  private requiresAccessibilityLabel(component: any): boolean {
    return this.isTouchableComponent(component) || component.type === 'Image' || component.accessibilityRole;
  }

  private hasAnimations(component: any): boolean {
    return component.animated || component.style?.transform || component.useNativeDriver;
  }

  private getComponentDimensions(component: any): { width: number; height: number } {
    const style = component.style || {};
    return {
      width: style.width || 44, // Default touch target size
      height: style.height || 44
    };
  }

  private getTextSize(component: any): number {
    return component.style?.fontSize || this.RECOMMENDED_TEXT_SIZE;
  }

  private summarizeIssues(issues: AccessibilityIssue[]): { critical: number; important: number; minor: number } {
    return {
      critical: issues.filter(i => i.severity === 'critical').length,
      important: issues.filter(i => i.severity === 'important').length,
      minor: issues.filter(i => i.severity === 'minor').length
    };
  }

  private calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    const weights = { critical: 20, important: 10, minor: 2 };
    const totalDeductions = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
    return Math.max(0, 100 - totalDeductions);
  }

  private determineComplianceLevel(score: number, issues: AccessibilityIssue[]): 'WCAG_AA' | 'WCAG_A' | 'BASIC' | 'NONE' {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const importantIssues = issues.filter(i => i.severity === 'important').length;

    if (criticalIssues === 0 && importantIssues === 0 && score >= 95) return 'WCAG_AA';
    if (criticalIssues === 0 && importantIssues <= 2 && score >= 85) return 'WCAG_A';
    if (criticalIssues <= 1 && score >= 70) return 'BASIC';
    return 'NONE';
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations = new Set<string>();

    // Add specific recommendations based on issue patterns
    if (issues.some(i => i.type === 'color_contrast')) {
      recommendations.add('Review and improve color contrast ratios across the app');
      recommendations.add('Use tools like WebAIM Contrast Checker to validate color combinations');
    }

    if (issues.some(i => i.type === 'touch_target')) {
      recommendations.add('Ensure all interactive elements meet minimum touch target sizes (44x44px)');
      recommendations.add('Add adequate spacing between touch targets to prevent accidental activation');
    }

    if (issues.some(i => i.type === 'screen_reader')) {
      recommendations.add('Add meaningful accessibility labels and hints for all interactive elements');
      recommendations.add('Test app with screen reader enabled (VoiceOver/TalkBack)');
    }

    if (issues.some(i => i.type === 'text_size')) {
      recommendations.add('Ensure text scales properly with system font size settings');
      recommendations.add('Use relative units and test with large text accessibility settings');
    }

    // General recommendations
    if (issues.length > 0) {
      recommendations.add('Conduct regular accessibility testing with real users');
      recommendations.add('Integrate accessibility testing into your development workflow');
    }

    return Array.from(recommendations);
  }

  /**
   * Quick accessibility fixes
   */
  generateAccessibilityEnhancements(component: any): any {
    const enhancements: any = {};

    // Auto-generate accessibility labels for common components
    if (this.isTouchableComponent(component) && !component.accessibilityLabel) {
      if (component.children && typeof component.children === 'string') {
        enhancements.accessibilityLabel = component.children;
      } else if (component.title) {
        enhancements.accessibilityLabel = component.title;
      }
    }

    // Set appropriate accessibility roles
    if (!component.accessibilityRole) {
      if (component.onPress) {
        enhancements.accessibilityRole = 'button';
      } else if (component.type === 'Text') {
        enhancements.accessibilityRole = 'text';
      }
    }

    // Improve touch target size
    if (this.isTouchableComponent(component)) {
      const { width, height } = this.getComponentDimensions(component);
      if (width < this.RECOMMENDED_TOUCH_TARGET || height < this.RECOMMENDED_TOUCH_TARGET) {
        enhancements.style = {
          ...component.style,
          minWidth: this.RECOMMENDED_TOUCH_TARGET,
          minHeight: this.RECOMMENDED_TOUCH_TARGET
        };
      }
    }

    return enhancements;
  }

  /**
   * Real-time accessibility monitoring
   */
  enableRealTimeMonitoring(callback: (report: AccessibilityReport) => void) {
    // In a real implementation, this would set up observers for accessibility state changes
    AccessibilityInfo.addEventListener('reduceMotionChanged', (isReduceMotionEnabled) => {
      this.isReducedMotionEnabled = isReduceMotionEnabled;
      // Trigger re-audit if needed
    });

    AccessibilityInfo.addEventListener('screenReaderChanged', (isScreenReaderEnabled) => {
      this.isScreenReaderEnabled = isScreenReaderEnabled;
      // Trigger re-audit if needed
    });
  }
}
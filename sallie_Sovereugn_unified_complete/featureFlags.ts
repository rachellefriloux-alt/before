/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Feature flags system for experimental capabilities and A/B testing.
 * Got it, love.
 */

interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  experimental: boolean;
  requirements?: string[];
  rolloutPercentage?: number;
}

class FeatureFlagsManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private blockedFlags: Set<string> = new Set();
  private userSeed: number = 0;

  constructor() {
    this.userSeed = this.generateUserSeed();
    this.initializeDefaultFlags();
  }

  private generateUserSeed(): number {
    // Generate a consistent seed for this user/session
    let seed = 0;
    const identifier = localStorage.getItem('sallie-user-id') || 'anonymous';
    for (let i = 0; i < identifier.length; i++) {
      seed = ((seed << 5) - seed) + identifier.charCodeAt(i);
      seed = seed & seed; // Convert to 32-bit integer
    }
    return Math.abs(seed);
  }

  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'exp_new_waveform',
        enabled: true,
        description: 'Enhanced voice waveform visualization',
        experimental: true,
        rolloutPercentage: 50
      },
      {
        key: 'advanced_ai_routing',
        enabled: false,
        description: 'Advanced AI model routing and selection',
        experimental: true,
        requirements: ['premium_subscription']
      },
      {
        key: 'realtime_voice_processing',
        enabled: false,
        description: 'Real-time voice processing and response',
        experimental: true
      },
      {
        key: 'enhanced_theming',
        enabled: true,
        description: 'Advanced theming and visual customization',
        experimental: false
      },
      {
        key: 'smart_notifications',
        enabled: true,
        description: 'Intelligent notification system',
        experimental: false
      },
      {
        key: 'predictive_suggestions',
        enabled: false,
        description: 'Predictive AI suggestions and recommendations',
        experimental: true,
        rolloutPercentage: 25
      }
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.key, flag);
    });
  }

  isEnabled(key: string): boolean {
    if (this.blockedFlags.has(key)) {
      return false;
    }

    const flag = this.flags.get(key);
    if (!flag) {
      return false;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      const userHash = this.userSeed % 100;
      if (userHash >= flag.rolloutPercentage) {
        return false;
      }
    }

    return flag.enabled;
  }

  setFlag(key: string, enabled: boolean): void {
    const flag = this.flags.get(key);
    if (flag) {
      this.flags.set(key, { ...flag, enabled });
      this.saveFlags();
    }
  }

  blockFlag(key: string, reason: string = 'Manually blocked'): void {
    this.blockedFlags.add(key);
    console.log(`Feature flag '${key}' blocked: ${reason}`);
  }

  unblockFlag(key: string): void {
    this.blockedFlags.delete(key);
  }

  getFlag(key: string): FeatureFlag | null {
    return this.flags.get(key) || null;
  }

  getAllFlags(): Map<string, FeatureFlag> {
    return new Map(this.flags);
  }

  getExperimentalFlags(): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(flag => flag.experimental);
  }

  private saveFlags(): void {
    try {
      const flagData: any = {};
      this.flags.forEach((flag, key) => {
        flagData[key] = flag;
      });
      localStorage.setItem('sallie-feature-flags', JSON.stringify(flagData));
    } catch (error) {
      console.warn('Failed to save feature flags:', error);
    }
  }

  loadFlags(): void {
    try {
      const stored = localStorage.getItem('sallie-feature-flags');
      if (stored) {
        const flagData = JSON.parse(stored);
        Object.entries(flagData).forEach(([key, flag]: [string, any]) => {
          if (this.flags.has(key)) {
            this.flags.set(key, flag);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
    }
  }
}

const featureFlagsManager = new FeatureFlagsManager();

export function isEnabled(key: string): boolean {
  return featureFlagsManager.isEnabled(key);
}

export function setFlag(key: string, enabled: boolean): void {
  featureFlagsManager.setFlag(key, enabled);
}

export function experimentalBlocked(key: string, reason?: string): void {
  featureFlagsManager.blockFlag(key, reason);
}

export function getFlag(key: string): FeatureFlag | null {
  return featureFlagsManager.getFlag(key);
}

export function getAllFlags(): Map<string, FeatureFlag> {
  return featureFlagsManager.getAllFlags();
}

export function getExperimentalFlags(): FeatureFlag[] {
  return featureFlagsManager.getExperimentalFlags();
}

export function loadFlags(): void {
  featureFlagsManager.loadFlags();
}

// Auto-load flags on import
loadFlags();
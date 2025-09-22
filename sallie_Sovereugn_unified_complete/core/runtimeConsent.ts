/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Runtime consent management system.
 * Got it, love.
 */

interface ConsentData {
  timestamp: Date;
  type: string;
  granted: boolean;
  reasons: string[];
}

class ConsentManager {
  private consents: Map<string, ConsentData> = new Map();
  private callbacks: Map<string, Function[]> = new Map();

  initConsent(): void {
    // Initialize consent system
    const storedConsent = localStorage.getItem('sallie-consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          this.consents.set(key, {
            ...value,
            timestamp: new Date(value.timestamp)
          });
        });
      } catch (error) {
        console.warn('Failed to parse stored consent:', error);
      }
    }
  }

  recordConsent(type: string, granted: boolean, reasons: string[] = []): void {
    const consentData: ConsentData = {
      timestamp: new Date(),
      type,
      granted,
      reasons
    };
    
    this.consents.set(type, consentData);
    this.saveConsents();
    this.notifyCallbacks(type, consentData);
  }

  hasConsent(type: string): boolean {
    const consent = this.consents.get(type);
    return consent ? consent.granted : false;
  }

  getConsent(type: string): ConsentData | null {
    return this.consents.get(type) || null;
  }

  revokeConsent(type: string): void {
    this.recordConsent(type, false, ['User revoked consent']);
  }

  onConsentChange(type: string, callback: Function): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, []);
    }
    this.callbacks.get(type)!.push(callback);
  }

  private saveConsents(): void {
    const consentData: any = {};
    this.consents.forEach((value, key) => {
      consentData[key] = value;
    });
    
    try {
      localStorage.setItem('sallie-consent', JSON.stringify(consentData));
    } catch (error) {
      console.warn('Failed to save consent data:', error);
    }
  }

  private notifyCallbacks(type: string, data: ConsentData): void {
    const callbacks = this.callbacks.get(type) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Consent callback error:', error);
      }
    });
  }

  getAllConsents(): Map<string, ConsentData> {
    return new Map(this.consents);
  }
}

const consentManager = new ConsentManager();

export function initConsent(): void {
  consentManager.initConsent();
}

export function recordConsent(type: string, granted: boolean, reasons: string[] = []): void {
  consentManager.recordConsent(type, granted, reasons);
}

export function hasConsent(type: string): boolean {
  return consentManager.hasConsent(type);
}

export function getConsent(type: string): ConsentData | null {
  return consentManager.getConsent(type);
}

export function revokeConsent(type: string): void {
  consentManager.revokeConsent(type);
}

export function onConsentChange(type: string, callback: Function): void {
  consentManager.onConsentChange(type, callback);
}

export function getAllConsents(): Map<string, ConsentData> {
  return consentManager.getAllConsents();
}
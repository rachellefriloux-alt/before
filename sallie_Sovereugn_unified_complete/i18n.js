/*
 * Persona: Tough love meets soul care.
 * Module: i18n
 * Intent: Handle functionality for i18n
 * Provenance-ID: 00100a4d-83c1-4ebc-b6b7-d8a07d2db364
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

export const messages = {
  en: {
    welcome: "Welcome to Sallie!",
    onboarding: "Let's get started with your personalized experience.",
    device: "Device Control",
    voice: "Voice Input",
    persona: "Persona Dashboard"
  },
  fr: {
    welcome: "Bienvenue chez Sallie!",
    onboarding: "Commençons votre expérience personnalisée.",
    device: "Contrôle de l'appareil",
    voice: "Entrée vocale",
    persona: "Tableau de bord de la persona"
  },
  es: {
    welcome: "¡Bienvenido a Sallie!",
    onboarding: "Comencemos con tu experiencia personalizada.",
    device: "Control de dispositivo",
    voice: "Entrada de voz",
    persona: "Panel de persona"
  }
};

export function t(key, locale = 'en') {
  return messages[locale][key] || messages['en'][key] || key;
}

export function setLocale(locale) {
  if (messages[locale]) {
    window.currentLocale = locale;
  }
}

export function getLocale() {
  return window.currentLocale || 'en';
}

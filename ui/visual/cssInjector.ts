/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: CSS injection utility for dynamic theming and visual effects.
 * Got it, love.
 */

import { injectAnimationCSS } from './animationUtils';

export function injectVisualCSS(primaryColor: string = '#8b5cf6'): void {
  const visualCSS = `
    :root {
      --sallie-primary: ${primaryColor};
      --sallie-primary-rgb: ${hexToRgb(primaryColor)};
      --sallie-shadow: ${primaryColor}20;
      --sallie-glow: ${primaryColor}40;
      --sallie-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Global Sallie visual enhancements */
    .persona-avatar {
      filter: drop-shadow(0 4px 8px var(--sallie-shadow));
      transition: var(--sallie-transition);
    }

    .persona-avatar:hover {
      filter: drop-shadow(0 6px 12px var(--sallie-glow));
      transform: scale(1.05);
    }

    .emotion-meter {
      filter: drop-shadow(0 2px 4px var(--sallie-shadow));
    }

    .voice-waveform {
      filter: drop-shadow(0 1px 3px var(--sallie-shadow));
    }

    .visual-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0.6;
    }

    /* Enhanced UI components */
    .sallie-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: var(--sallie-transition);
    }

    .sallie-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .sallie-button-primary {
      background: linear-gradient(135deg, var(--sallie-primary) 0%, ${adjustColorBrightness(primaryColor, 20)} 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--sallie-transition);
      position: relative;
      overflow: hidden;
    }

    .sallie-button-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .sallie-button-primary:hover::before {
      left: 100%;
    }

    .sallie-button-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px var(--sallie-shadow);
    }

    .sallie-input {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid rgba(var(--sallie-primary-rgb), 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      transition: var(--sallie-transition);
      font-size: 14px;
    }

    .sallie-input:focus {
      outline: none;
      border-color: var(--sallie-primary);
      box-shadow: 0 0 0 3px var(--sallie-shadow);
    }

    /* Glass morphism effects */
    .sallie-glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .sallie-glass-dark {
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Gradient text */
    .sallie-gradient-text {
      background: linear-gradient(135deg, var(--sallie-primary) 0%, ${adjustColorBrightness(primaryColor, 30)} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }

    /* Progress indicators */
    .sallie-progress {
      background: rgba(var(--sallie-primary-rgb), 0.1);
      border-radius: 10px;
      overflow: hidden;
      height: 8px;
    }

    .sallie-progress-bar {
      background: linear-gradient(90deg, var(--sallie-primary) 0%, ${adjustColorBrightness(primaryColor, 20)} 100%);
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    /* Notification styles */
    .sallie-notification {
      background: var(--sallie-glass);
      backdrop-filter: blur(20px);
      border-left: 4px solid var(--sallie-primary);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      animation: sallie-slide-in-right 0.5s ease;
    }

    .sallie-notification.success {
      border-left-color: #10b981;
    }

    .sallie-notification.warning {
      border-left-color: #f59e0b;
    }

    .sallie-notification.error {
      border-left-color: #ef4444;
    }

    /* Loading shimmer effect */
    .sallie-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: sallie-shimmer 1.5s infinite;
    }

    /* Responsive design helpers */
    @media (max-width: 768px) {
      .sallie-card {
        margin: 8px;
        border-radius: 8px;
      }
      
      .sallie-button-primary {
        padding: 10px 20px;
        font-size: 14px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .sallie-card {
        background: rgba(30, 41, 59, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .sallie-input {
        background: rgba(30, 41, 59, 0.9);
        color: white;
      }

      .visual-bg {
        opacity: 0.3;
      }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    .sallie-focus-visible:focus-visible {
      outline: 2px solid var(--sallie-primary);
      outline-offset: 2px;
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .sallie-card {
        border: 2px solid var(--sallie-primary);
      }
      
      .sallie-button-primary {
        border: 2px solid white;
      }
    }
  `;

  // Inject the CSS
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-sallie-visual', 'true');
  styleElement.textContent = visualCSS;
  
  // Remove any existing Sallie visual styles
  const existingStyle = document.querySelector('[data-sallie-visual]');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(styleElement);
  
  // Also inject animations
  injectAnimationCSS(primaryColor);
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '139, 92, 246'; // fallback
}

function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
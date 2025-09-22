/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced CSS animation generation and injection utilities.
 * Got it, love.
 */

export interface AnimationConfig {
  name: string;
  duration: string;
  timingFunction: string;
  delay?: string;
  iterationCount?: string;
  direction?: string;
  fillMode?: string;
}

export function generateKeyframes(name: string, keyframes: Record<string, Record<string, string>>): string {
  const keyframeRules = Object.entries(keyframes)
    .map(([percentage, styles]) => {
      const styleRules = Object.entries(styles)
        .map(([property, value]) => `${property}: ${value};`)
        .join(' ');
      return `  ${percentage} { ${styleRules} }`;
    })
    .join('\n');

  return `@keyframes ${name} {\n${keyframeRules}\n}`;
}

export function generateFadeInAnimation(_duration: string = '0.6s', _delay: string = '0s'): string {
  return generateKeyframes('sallie-fade-in', {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' }
  });
}

export function generateSlideInAnimation(direction: 'left' | 'right' | 'up' | 'down' = 'left'): string {
  const transforms = {
    left: 'translateX(-20px)',
    right: 'translateX(20px)',
    up: 'translateY(-20px)',
    down: 'translateY(20px)'
  };

  return generateKeyframes('sallie-slide-in', {
    '0%': { opacity: '0', transform: transforms[direction] },
    '100%': { opacity: '1', transform: 'translateX(0) translateY(0)' }
  });
}

export function generatePulseAnimation(): string {
  return generateKeyframes('sallie-pulse', {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.05)', opacity: '0.8' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  });
}

export function generateFloatAnimation(): string {
  return generateKeyframes('sallie-float', {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-6px)' },
    '100%': { transform: 'translateY(0px)' }
  });
}

export function generateSpinAnimation(): string {
  return generateKeyframes('sallie-spin', {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  });
}

export function generateShimmerAnimation(color: string = '#ffffff'): string {
  return generateKeyframes('sallie-shimmer', {
    '0%': { 
      backgroundPosition: '-200px 0',
      background: `linear-gradient(90deg, transparent, ${color}20, transparent)`
    },
    '100%': { 
      backgroundPosition: 'calc(200px + 100%) 0',
      background: `linear-gradient(90deg, transparent, ${color}20, transparent)`
    }
  });
}

export function generateTypingAnimation(): string {
  return generateKeyframes('sallie-typing', {
    '0%': { width: '0' },
    '100%': { width: '100%' }
  });
}

export function injectAnimationCSS(color: string = '#8b5cf6'): void {
  const animationsCSS = `
    ${generateFadeInAnimation()}
    ${generateSlideInAnimation('left')}
    ${generateSlideInAnimation('right')}
    ${generateSlideInAnimation('up')}
    ${generateSlideInAnimation('down')}
    ${generatePulseAnimation()}
    ${generateFloatAnimation()}
    ${generateSpinAnimation()}
    ${generateShimmerAnimation(color)}
    ${generateTypingAnimation()}

    /* Animation utility classes */
    .sallie-animate-fade-in {
      animation: sallie-fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    .sallie-animate-slide-in-left {
      animation: sallie-slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    .sallie-animate-pulse {
      animation: sallie-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .sallie-animate-float {
      animation: sallie-float 3s ease-in-out infinite;
    }
    
    .sallie-animate-spin {
      animation: sallie-spin 1s linear infinite;
    }
    
    .sallie-animate-shimmer {
      animation: sallie-shimmer 2s ease-in-out infinite;
      background-size: 200px 100%;
    }

    /* Hover effects */
    .sallie-hover-lift {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    
    .sallie-hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .sallie-hover-glow {
      transition: box-shadow 0.3s ease-in-out;
    }
    
    .sallie-hover-glow:hover {
      box-shadow: 0 0 20px ${color}40;
    }

    /* Micro-interactions */
    .sallie-button {
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sallie-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .sallie-button:hover::before {
      left: 100%;
    }

    /* Loading states */
    .sallie-loading {
      position: relative;
    }
    
    .sallie-loading::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin: -8px 0 0 -8px;
      border: 2px solid transparent;
      border-top-color: ${color};
      border-radius: 50%;
      animation: sallie-spin 1s linear infinite;
    }
  `;

  // Inject CSS into document head
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-sallie-animations', 'true');
  styleElement.textContent = animationsCSS;
  
  // Remove any existing Sallie animations
  const existingStyle = document.querySelector('[data-sallie-animations]');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(styleElement);
}

export function createAnimationConfig(options: Partial<AnimationConfig>): AnimationConfig {
  return {
    name: options.name || 'sallie-fade-in',
    duration: options.duration || '0.6s',
    timingFunction: options.timingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: options.delay || '0s',
    iterationCount: options.iterationCount || '1',
    direction: options.direction || 'normal',
    fillMode: options.fillMode || 'forwards'
  };
}

export function applyAnimation(element: HTMLElement, config: AnimationConfig): void {
  const animationString = `${config.name} ${config.duration} ${config.timingFunction} ${config.delay} ${config.iterationCount} ${config.direction} ${config.fillMode}`;
  element.style.animation = animationString;
}
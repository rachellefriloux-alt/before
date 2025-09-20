
/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie's Complete Visual Library                                           │
 * │   "Every mood deserves its perfect visual expression, love"                  │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { Colors } from './Colors';

// Mood-based color palettes
export const MoodPalettes = {
  calm: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#d8b4fe',
    background: '#f8fafc',
    motifs: ['🌊', '💙', '🕊️', '🤍', '✨'],
  },
  focused: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#67e8f9',
    background: '#f0f9ff',
    motifs: ['🎯', '⚡', '🔹', '💎', '🌟'],
  },
  energetic: {
    primary: '#f59e0b',
    secondary: '#f97316',
    accent: '#fbbf24',
    background: '#fffbeb',
    motifs: ['🔥', '☀️', '⚡', '💫', '🌈'],
  },
  creative: {
    primary: '#8b5cf6',
    secondary: '#a855f7',
    accent: '#c084fc',
    background: '#faf5ff',
    motifs: ['🎨', '✨', '🌟', '💫', '🦋'],
  },
  supportive: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#6ee7b7',
    background: '#f0fdf4',
    motifs: ['💚', '🌿', '🤗', '💝', '🌸'],
  },
  protective: {
    primary: '#dc2626',
    secondary: '#b91c1c',
    accent: '#fca5a5',
    background: '#fef2f2',
    motifs: ['🛡️', '💪', '❤️', '🔥', '⚔️'],
  },
  playful: {
    primary: '#ec4899',
    secondary: '#be185d',
    accent: '#f9a8d4',
    background: '#fdf2f8',
    motifs: ['🎉', '🌈', '🦄', '💖', '✨'],
  },
  wise: {
    primary: '#7c3aed',
    secondary: '#5b21b6',
    accent: '#a78bfa',
    background: '#f5f3ff',
    motifs: ['🔮', '📚', '🌙', '✨', '🦉'],
  },
  mystical: {
    primary: '#14b8a6',
    secondary: '#0f766e',
    accent: '#5eead4',
    background: '#f0fdfa',
    motifs: ['🔮', '✨', '🌟', '💎', '🌊'],
  },
  determined: {
    primary: '#dc2626',
    secondary: '#991b1b',
    accent: '#f87171',
    background: '#fef2f2',
    motifs: ['💪', '🎯', '🔥', '⚡', '🏆'],
  },
};

// SVG Icon Library by Mood
export const MoodIcons = {
  calm: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#6366f1" opacity="0.1"/>
      <circle cx="50" cy="45" r="30" fill="url(#calmGradient)"/>
      <circle cx="42" cy="40" r="3" fill="#1e293b"/>
      <circle cx="58" cy="40" r="3" fill="#1e293b"/>
      <path d="M40 55 Q50 65 60 55" stroke="#1e293b" stroke-width="2" fill="none"/>
      <defs>
        <radialGradient id="calmGradient">
          <stop offset="0%" stop-color="#e0e7ff"/>
          <stop offset="100%" stop-color="#c7d2fe"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#6366f1" stroke-width="2" fill="#e0e7ff"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#6366f1" stroke-width="2"/>
      <circle cx="9" cy="9" r="1" fill="#6366f1"/>
      <circle cx="15" cy="9" r="1" fill="#6366f1"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,50 Q50,20 100,50 T200,50" stroke="#6366f1" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="50" cy="30" r="2" fill="#8b5cf6" opacity="0.8"/>
      <circle cx="150" cy="70" r="3" fill="#6366f1" opacity="0.6"/>
    </svg>`,
  },

  focused: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#0ea5e9" opacity="0.1"/>
      <circle cx="50" cy="45" r="30" fill="url(#focusedGradient)"/>
      <rect x="38" y="37" width="6" height="6" fill="#1e293b"/>
      <rect x="56" y="37" width="6" height="6" fill="#1e293b"/>
      <path d="M42 55 L58 55" stroke="#1e293b" stroke-width="2"/>
      <defs>
        <linearGradient id="focusedGradient">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="#0ea5e9" stroke-width="2"/>
      <path d="M12 1v6m0 8v6m11-7h-6m-8 0H1" stroke="#0ea5e9" stroke-width="2"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,20 120,40 100,60 80,40" fill="#0ea5e9" opacity="0.3"/>
      <circle cx="50" cy="50" r="8" fill="none" stroke="#06b6d4" stroke-width="2"/>
      <circle cx="150" cy="50" r="6" fill="none" stroke="#0ea5e9" stroke-width="2"/>
    </svg>`,
  },

  energetic: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#f59e0b" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#energeticGradient)"/>
      <circle cx="42" cy="38" r="4" fill="#1e293b"/>
      <circle cx="58" cy="38" r="4" fill="#1e293b"/>
      <path d="M38 58 Q50 68 62 58" stroke="#1e293b" stroke-width="3"/>
      <path d="M30,30 L40,25 L35,35 Z" fill="#f59e0b"/>
      <path d="M70,25 L80,30 L75,20 Z" fill="#f97316"/>
      <defs>
        <radialGradient id="energeticGradient">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="#f59e0b"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,80 L30,60 L40,80 L50,50 L60,80" stroke="#f59e0b" stroke-width="3" fill="none"/>
      <circle cx="100" cy="30" r="5" fill="#f97316">
        <animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite"/>
      </circle>
      <polygon points="160,70 170,60 180,70 170,80" fill="#fbbf24"/>
    </svg>`,
  },

  creative: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#8b5cf6" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#creativeGradient)"/>
      <path d="M38,38 Q42,33 46,38" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M54,38 Q58,33 62,38" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M42 58 Q50 65 58 58" stroke="#1e293b" stroke-width="2" fill="none"/>
      <circle cx="25" cy="25" r="3" fill="#a855f7" opacity="0.8"/>
      <circle cx="75" cy="30" r="2" fill="#c084fc" opacity="0.9"/>
      <circle cx="30" cy="70" r="2.5" fill="#8b5cf6" opacity="0.7"/>
      <defs>
        <radialGradient id="creativeGradient">
          <stop offset="0%" stop-color="#f3e8ff"/>
          <stop offset="100%" stop-color="#e9d5ff"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#8b5cf6"/>
      <circle cx="8" cy="8" r="2" fill="#a855f7" opacity="0.7"/>
      <circle cx="16" cy="16" r="1.5" fill="#c084fc" opacity="0.8"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,50 Q50,20 100,50 Q150,80 200,50" stroke="url(#rainbow)" stroke-width="3" fill="none"/>
      <circle cx="40" cy="30" r="3" fill="#8b5cf6" opacity="0.8"/>
      <circle cx="160" cy="70" r="4" fill="#a855f7" opacity="0.6"/>
      <defs>
        <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="50%" stop-color="#a855f7"/>
          <stop offset="100%" stop-color="#c084fc"/>
        </linearGradient>
      </defs>
    </svg>`,
  },

  supportive: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#10b981" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#supportiveGradient)"/>
      <circle cx="42" cy="40" r="3" fill="#1e293b"/>
      <circle cx="58" cy="40" r="3" fill="#1e293b"/>
      <path d="M40 55 Q50 62 60 55" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M35,25 Q40,20 45,25 Q40,30 35,25" fill="#10b981" opacity="0.7"/>
      <path d="M65,28 Q70,23 75,28 Q70,33 65,28" fill="#059669" opacity="0.8"/>
      <defs>
        <radialGradient id="supportiveGradient">
          <stop offset="0%" stop-color="#ecfdf5"/>
          <stop offset="100%" stop-color="#d1fae5"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#10b981"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,70 Q60,60 70,70 Q60,80 50,70" fill="#10b981" opacity="0.6"/>
      <path d="M130,40 Q140,30 150,40 Q140,50 130,40" fill="#059669" opacity="0.7"/>
      <circle cx="100" cy="50" r="3" fill="#6ee7b7">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>`,
  },

  protective: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#dc2626" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#protectiveGradient)"/>
      <rect x="38" y="37" width="6" height="8" fill="#1e293b"/>
      <rect x="56" y="37" width="6" height="8" fill="#1e293b"/>
      <path d="M42 58 L58 58" stroke="#1e293b" stroke-width="3"/>
      <path d="M30,20 L40,30 L50,20 L60,30 L70,20" stroke="#dc2626" stroke-width="2" fill="none"/>
      <defs>
        <radialGradient id="protectiveGradient">
          <stop offset="0%" stop-color="#fef2f2"/>
          <stop offset="100%" stop-color="#fecaca"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#dc2626" stroke="#dc2626" stroke-width="2"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,20 120,30 120,50 100,60 80,50 80,30" fill="#dc2626" opacity="0.3"/>
      <circle cx="50" cy="50" r="5" fill="none" stroke="#b91c1c" stroke-width="3"/>
      <circle cx="150" cy="70" r="4" fill="#fca5a5"/>
    </svg>`,
  },

  playful: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#ec4899" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#playfulGradient)"/>
      <circle cx="42" cy="38" r="4" fill="#1e293b"/>
      <circle cx="58" cy="38" r="4" fill="#1e293b"/>
      <path d="M38 58 Q50 70 62 58" stroke="#1e293b" stroke-width="3" fill="none"/>
      <polygon points="25,25 35,20 30,30" fill="#ec4899"/>
      <polygon points="75,22 85,27 80,32" fill="#be185d"/>
      <circle cx="70" cy="70" r="3" fill="#f9a8d4"/>
      <defs>
        <radialGradient id="playfulGradient">
          <stop offset="0%" stop-color="#fdf2f8"/>
          <stop offset="100%" stop-color="#fce7f3"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#ec4899" opacity="0.2"/>
      <path d="M8 14s1.5 3 4 3 4-3 4-3" stroke="#ec4899" stroke-width="2"/>
      <circle cx="9" cy="9" r="2" fill="#ec4899"/>
      <circle cx="15" cy="9" r="2" fill="#ec4899"/>
      <path d="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#f9a8d4"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,50 C50,20 100,80 150,40 Q175,30 200,50" stroke="#ec4899" stroke-width="3" fill="none"/>
      <circle cx="60" cy="30" r="4" fill="#f9a8d4">
        <animate attributeName="cy" values="30;20;30" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <polygon points="140,60 150,55 155,65 145,70" fill="#be185d"/>
    </svg>`,
  },

  wise: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#7c3aed" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#wiseGradient)"/>
      <circle cx="42" cy="40" r="3" fill="#1e293b"/>
      <circle cx="58" cy="40" r="3" fill="#1e293b"/>
      <path d="M44 56 Q50 60 56 56" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M35,30 Q40,25 45,30" stroke="#7c3aed" stroke-width="2" fill="none"/>
      <path d="M55,30 Q60,25 65,30" stroke="#7c3aed" stroke-width="2" fill="none"/>
      <circle cx="25" cy="25" r="2" fill="#a78bfa"/>
      <circle cx="75" cy="75" r="3" fill="#7c3aed" opacity="0.7"/>
      <defs>
        <radialGradient id="wiseGradient">
          <stop offset="0%" stop-color="#f5f3ff"/>
          <stop offset="100%" stop-color="#ede9fe"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#7c3aed"/>
      <circle cx="12" cy="12" r="3" fill="#a78bfa"/>
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#7c3aed" stroke-width="1"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="20" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.5"/>
      <circle cx="150" cy="40" r="15" fill="none" stroke="#a78bfa" stroke-width="1" opacity="0.7"/>
      <path d="M100,20 L105,30 L100,40" stroke="#7c3aed" stroke-width="2" fill="none"/>
    </svg>`,
  },

  mystical: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#14b8a6" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#mysticalGradient)"/>
      <path d="M38,38 Q42,35 46,38" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M54,38 Q58,35 62,38" stroke="#1e293b" stroke-width="2" fill="none"/>
      <path d="M42 58 Q50 63 58 58" stroke="#1e293b" stroke-width="2" fill="none"/>
      <circle cx="25" cy="25" r="2" fill="#5eead4">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="75" cy="30" r="1.5" fill="#14b8a6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="30" cy="75" r="2.5" fill="#0f766e">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <defs>
        <radialGradient id="mysticalGradient">
          <stop offset="0%" stop-color="#f0fdfa"/>
          <stop offset="100%" stop-color="#ccfbf1"/>
        </radialGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" fill="#14b8a6"/>
      <circle cx="12" cy="12" r="8" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.5"/>
      <circle cx="12" cy="12" r="12" fill="none" stroke="#5eead4" stroke-width="1" opacity="0.3"/>
      <circle cx="6" cy="6" r="1" fill="#14b8a6"/>
      <circle cx="18" cy="18" r="1" fill="#0f766e"/>
      <circle cx="18" cy="6" r="1" fill="#5eead4"/>
      <circle cx="6" cy="18" r="1" fill="#14b8a6"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,30 Q100,50 150,30" stroke="#14b8a6" stroke-width="2" fill="none" opacity="0.7"/>
      <circle cx="100" cy="50" r="5" fill="none" stroke="#5eead4" stroke-width="2">
        <animate attributeName="r" values="5;8;5" dur="3s" repeatCount="indefinite"/>
      </circle>
      <polygon points="30,70 40,60 50,70 40,80" fill="#14b8a6" opacity="0.6"/>
      <polygon points="150,40 160,30 170,40 160,50" fill="#0f766e" opacity="0.5"/>
    </svg>`,
  },

  determined: {
    avatar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#dc2626" opacity="0.2"/>
      <circle cx="50" cy="45" r="30" fill="url(#determinedGradient)"/>
      <rect x="38" y="35" width="8" height="10" fill="#1e293b"/>
      <rect x="54" y="35" width="8" height="10" fill="#1e293b"/>
      <path d="M40 58 L60 58" stroke="#1e293b" stroke-width="4"/>
      <polygon points="25,20 35,25 30,35 20,30" fill="#dc2626"/>
      <polygon points="70,20 80,30 75,35 65,25" fill="#991b1b"/>
      <defs>
        <linearGradient id="determinedGradient">
          <stop offset="0%" stop-color="#fef2f2"/>
          <stop offset="100%" stop-color="#fecaca"/>
        </linearGradient>
      </defs>
    </svg>`,
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#dc2626"/>
      <circle cx="12" cy="12" r="3" fill="#991b1b"/>
      <path d="M8 8l8 8m0-8l-8 8" stroke="#dc2626" stroke-width="2"/>
    </svg>`,
    decoration: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,10 110,20 120,10 130,20 120,30 110,20" fill="#dc2626" opacity="0.4"/>
      <rect x="45" y="45" width="10" height="10" fill="#991b1b" opacity="0.6"/>
      <rect x="145" y="65" width="8" height="8" fill="#f87171" opacity="0.7"/>
      <path d="M20,80 L40,60 L60,80" stroke="#dc2626" stroke-width="3" fill="none"/>
    </svg>`,
  },
};

// Complete mood-based theme configurations
export const MoodThemes = {
  calm: {
    name: 'Serene Wisdom',
    colors: MoodPalettes.calm,
    avatar: MoodIcons.calm.avatar,
    icon: MoodIcons.calm.icon,
    decoration: MoodIcons.calm.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.calm.primary} 0%, ${MoodPalettes.calm.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.calm.background} 0%, #f1f5f9 100%)`,
      card: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)`,
    },
    animations: {
      float: 'gentle floating motion',
      pulse: 'slow, steady pulse',
      transition: 'smooth fade transitions',
    },
  },

  focused: {
    name: 'Laser Focus',
    colors: MoodPalettes.focused,
    avatar: MoodIcons.focused.avatar,
    icon: MoodIcons.focused.icon,
    decoration: MoodIcons.focused.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.focused.primary} 0%, ${MoodPalettes.focused.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.focused.background} 0%, #e0f2fe 100%)`,
      card: `linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)`,
    },
    animations: {
      float: 'precise, controlled movement',
      pulse: 'sharp, focused pulse',
      transition: 'crisp, instant transitions',
    },
  },

  energetic: {
    name: 'Vibrant Energy',
    colors: MoodPalettes.energetic,
    avatar: MoodIcons.energetic.avatar,
    icon: MoodIcons.energetic.icon,
    decoration: MoodIcons.energetic.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.energetic.primary} 0%, ${MoodPalettes.energetic.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.energetic.background} 0%, #fef3c7 100%)`,
      card: `linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)`,
    },
    animations: {
      float: 'bouncy, energetic movement',
      pulse: 'fast, vibrant pulse',
      transition: 'quick, dynamic transitions',
    },
  },

  creative: {
    name: 'Creative Spark',
    colors: MoodPalettes.creative,
    avatar: MoodIcons.creative.avatar,
    icon: MoodIcons.creative.icon,
    decoration: MoodIcons.creative.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.creative.primary} 0%, ${MoodPalettes.creative.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.creative.background} 0%, #f3e8ff 100%)`,
      card: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)`,
    },
    animations: {
      float: 'artistic, flowing movement',
      pulse: 'creative, rhythmic pulse',
      transition: 'magical, smooth transitions',
    },
  },

  supportive: {
    name: 'Nurturing Care',
    colors: MoodPalettes.supportive,
    avatar: MoodIcons.supportive.avatar,
    icon: MoodIcons.supportive.icon,
    decoration: MoodIcons.supportive.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.supportive.primary} 0%, ${MoodPalettes.supportive.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.supportive.background} 0%, #ecfdf5 100%)`,
      card: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)`,
    },
    animations: {
      float: 'gentle, caring movement',
      pulse: 'warm, comforting pulse',
      transition: 'soft, nurturing transitions',
    },
  },

  protective: {
    name: 'Guardian Shield',
    colors: MoodPalettes.protective,
    avatar: MoodIcons.protective.avatar,
    icon: MoodIcons.protective.icon,
    decoration: MoodIcons.protective.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.protective.primary} 0%, ${MoodPalettes.protective.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.protective.background} 0%, #fef2f2 100%)`,
      card: `linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)`,
    },
    animations: {
      float: 'strong, protective movement',
      pulse: 'powerful, guardian pulse',
      transition: 'firm, protective transitions',
    },
  },

  playful: {
    name: 'Joyful Spirit',
    colors: MoodPalettes.playful,
    avatar: MoodIcons.playful.avatar,
    icon: MoodIcons.playful.icon,
    decoration: MoodIcons.playful.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.playful.primary} 0%, ${MoodPalettes.playful.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.playful.background} 0%, #fdf2f8 100%)`,
      card: `linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(190, 24, 93, 0.05) 100%)`,
    },
    animations: {
      float: 'playful, bouncy movement',
      pulse: 'joyful, fun pulse',
      transition: 'whimsical, delightful transitions',
    },
  },

  wise: {
    name: 'Ancient Wisdom',
    colors: MoodPalettes.wise,
    avatar: MoodIcons.wise.avatar,
    icon: MoodIcons.wise.icon,
    decoration: MoodIcons.wise.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.wise.primary} 0%, ${MoodPalettes.wise.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.wise.background} 0%, #f5f3ff 100%)`,
      card: `linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 33, 182, 0.05) 100%)`,
    },
    animations: {
      float: 'wise, contemplative movement',
      pulse: 'deep, thoughtful pulse',
      transition: 'profound, meaningful transitions',
    },
  },

  mystical: {
    name: 'Mystical Essence',
    colors: MoodPalettes.mystical,
    avatar: MoodIcons.mystical.avatar,
    icon: MoodIcons.mystical.icon,
    decoration: MoodIcons.mystical.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.mystical.primary} 0%, ${MoodPalettes.mystical.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.mystical.background} 0%, #f0fdfa 100%)`,
      card: `linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(15, 118, 110, 0.05) 100%)`,
    },
    animations: {
      float: 'mystical, ethereal movement',
      pulse: 'magical, cosmic pulse',
      transition: 'enchanting, mystical transitions',
    },
  },

  determined: {
    name: 'Fierce Determination',
    colors: MoodPalettes.determined,
    avatar: MoodIcons.determined.avatar,
    icon: MoodIcons.determined.icon,
    decoration: MoodIcons.determined.decoration,
    gradients: {
      primary: `linear-gradient(135deg, ${MoodPalettes.determined.primary} 0%, ${MoodPalettes.determined.secondary} 100%)`,
      background: `linear-gradient(135deg, ${MoodPalettes.determined.background} 0%, #fef2f2 100%)`,
      card: `linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(153, 27, 27, 0.05) 100%)`,
    },
    animations: {
      float: 'determined, purposeful movement',
      pulse: 'strong, resolute pulse',
      transition: 'decisive, powerful transitions',
    },
  },
};

// Helper functions
export const getMoodTheme = (mood: string) => {
  return MoodThemes[mood as keyof typeof MoodThemes] || MoodThemes.mystical;
};

export const getMoodIcon = (mood: string, type: 'avatar' | 'icon' | 'decoration' = 'icon') => {
  const moodData = MoodIcons[mood as keyof typeof MoodIcons] || MoodIcons.mystical;
  return moodData[type];
};

export const getMoodColors = (mood: string) => {
  return MoodPalettes[mood as keyof typeof MoodPalettes] || MoodPalettes.mystical;
};

export const getAllMoodNames = () => {
  return Object.keys(MoodThemes);
};

export const getRandomMoodMotif = (mood: string) => {
  const palette = getMoodColors(mood);
  const motifs = palette.motifs;
  return motifs[Math.floor(Math.random() * motifs.length)];
};

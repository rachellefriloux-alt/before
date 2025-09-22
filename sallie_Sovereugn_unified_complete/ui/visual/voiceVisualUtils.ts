/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Voice visualization utilities for waveforms and audio spectrum display.
 * Got it, love.
 */

import { sanitizeSvg } from './sanitize';

export function generateWaveformSVG(
  audioData: number[],
  color: string = '#8b5cf6',
  width: number = 300,
  height: number = 100
): string {
  if (!audioData.length) return '';
  
  const maxValue = Math.max(...audioData);
  const centerY = height / 2;
  const barWidth = width / audioData.length;
  
  let bars = '';
  
  audioData.forEach((value, index) => {
    const normalizedValue = (value / maxValue) * (height / 2);
    const x = index * barWidth;
    const barHeight = Math.max(2, normalizedValue);
    
    bars += `
      <rect x="${x}" y="${centerY - barHeight / 2}" 
            width="${Math.max(2, barWidth - 1)}" height="${barHeight}" 
            fill="${color}" opacity="0.8" rx="1">
        <animate attributeName="height" 
                 values="${barHeight};${barHeight * 1.2};${barHeight}" 
                 dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" 
                 values="${centerY - barHeight / 2};${centerY - (barHeight * 1.2) / 2};${centerY - barHeight / 2}" 
                 dur="1s" repeatCount="indefinite" />
      </rect>
    `;
  });
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.8" />
        <stop offset="50%" stop-color="${color}" stop-opacity="1" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.8" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Center line -->
    <line x1="0" y1="${centerY}" x2="${width}" y2="${centerY}" 
          stroke="${color}" stroke-width="1" opacity="0.3" />
    
    <!-- Waveform bars -->
    <g filter="url(#glow)">
      ${bars}
    </g>
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateSpectrumSVG(
  frequencies: number[],
  color: string = '#8b5cf6',
  width: number = 300,
  height: number = 150
): string {
  if (!frequencies.length) return '';
  
  const maxFreq = Math.max(...frequencies);
  const barWidth = width / frequencies.length;
  
  let bars = '';
  let gradientStops = '';
  
  frequencies.forEach((freq, index) => {
    const normalizedFreq = (freq / maxFreq) * height;
    const x = index * barWidth;
    const hue = (index / frequencies.length) * 60 + 240; // Purple to blue spectrum
    const barColor = `hsl(${hue}, 70%, 60%)`;
    
    gradientStops += `<stop offset="${(index / frequencies.length) * 100}%" stop-color="${barColor}" />`;
    
    bars += `
      <rect x="${x}" y="${height - normalizedFreq}" 
            width="${Math.max(1, barWidth - 0.5)}" height="${normalizedFreq}" 
            fill="${barColor}" opacity="0.9">
        <animate attributeName="height" 
                 values="0;${normalizedFreq};0" 
                 dur="${2 + Math.random()}s" repeatCount="indefinite" />
        <animate attributeName="y" 
                 values="${height};${height - normalizedFreq};${height}" 
                 dur="${2 + Math.random()}s" repeatCount="indefinite" />
      </rect>
    `;
  });
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        ${gradientStops}
      </linearGradient>
      <filter id="spectrumGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="rgba(0,0,0,0.1)" rx="4" />
    
    <!-- Spectrum bars -->
    <g filter="url(#spectrumGlow)">
      ${bars}
    </g>
    
    <!-- Frequency labels -->
    <text x="10" y="15" fill="${color}" font-size="10" opacity="0.7">Low</text>
    <text x="${width - 30}" y="15" fill="${color}" font-size="10" opacity="0.7">High</text>
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateVoiceActivitySVG(
  isActive: boolean,
  intensity: number = 50,
  color: string = '#10b981',
  size: number = 80
): string {
  const pulseRadius = isActive ? size / 3 : size / 4;
  const pulseOpacity = isActive ? 0.8 : 0.3;
  const coreRadius = size / 6;
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="voiceGrad" cx="50%" cy="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="1" />
        <stop offset="70%" stop-color="${color}" stop-opacity="0.4" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </radialGradient>
      <filter id="voiceGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Outer pulse rings -->
    ${isActive ? generatePulseRings(size / 2, size / 2, pulseRadius, color, 3) : ''}
    
    <!-- Main voice indicator -->
    <circle cx="${size / 2}" cy="${size / 2}" r="${pulseRadius}" 
            fill="url(#voiceGrad)" opacity="${pulseOpacity}">
      ${isActive ? `<animate attributeName="r" values="${pulseRadius};${pulseRadius * 1.2};${pulseRadius}" dur="2s" repeatCount="indefinite" />` : ''}
    </circle>
    
    <!-- Core indicator -->
    <circle cx="${size / 2}" cy="${size / 2}" r="${coreRadius}" 
            fill="${color}" filter="url(#voiceGlow)">
      ${isActive ? `<animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite" />` : ''}
    </circle>
    
    <!-- Intensity bars around core -->
    ${isActive ? generateIntensityBars(size / 2, size / 2, coreRadius + 5, intensity, color, 8) : ''}
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateSoundWaveSVG(
  amplitude: number = 50,
  frequency: number = 2,
  color: string = '#8b5cf6',
  width: number = 200,
  height: number = 60
): string {
  const centerY = height / 2;
  const wavelength = width / frequency;
  
  let path = `M 0 ${centerY}`;
  
  for (let x = 0; x <= width; x += 2) {
    const y = centerY + Math.sin((x / wavelength) * 2 * Math.PI) * (amplitude / 100) * (height / 3);
    path += ` L ${x} ${y}`;
  }
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.2" />
        <stop offset="50%" stop-color="${color}" stop-opacity="1" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.2" />
      </linearGradient>
    </defs>
    
    <!-- Animated wave path -->
    <path d="${path}" stroke="url(#waveGradient)" stroke-width="2" fill="none">
      <animateTransform attributeName="transform" type="translate" 
                        values="0,0;-20,0;0,0" dur="2s" repeatCount="indefinite" />
    </path>
    
    <!-- Secondary wave (phase shifted) -->
    <path d="${path}" stroke="${color}" stroke-width="1" fill="none" opacity="0.5" 
          transform="translate(10, 0)">
      <animateTransform attributeName="transform" type="translate" 
                        values="10,0;-10,0;10,0" dur="2s" repeatCount="indefinite" />
    </path>
  </svg>`;
  
  return sanitizeSvg(svg);
}

// Helper functions
function generatePulseRings(cx: number, cy: number, baseRadius: number, color: string, count: number): string {
  let rings = '';
  
  for (let i = 1; i <= count; i++) {
    const radius = baseRadius + (i * 8);
    const opacity = 0.3 / i;
    const delay = i * 0.3;
    
    rings += `
      <circle cx="${cx}" cy="${cy}" r="${radius}" 
              stroke="${color}" stroke-width="2" fill="none" opacity="${opacity}">
        <animate attributeName="r" values="${radius};${radius + 10};${radius}" 
                 dur="2s" repeatCount="indefinite" begin="${delay}s" />
        <animate attributeName="opacity" values="${opacity};0;${opacity}" 
                 dur="2s" repeatCount="indefinite" begin="${delay}s" />
      </circle>
    `;
  }
  
  return rings;
}

function generateIntensityBars(cx: number, cy: number, radius: number, intensity: number, color: string, count: number): string {
  let bars = '';
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const radians = (angle - 90) * (Math.PI / 180);
    const barLength = 3 + (intensity / 100) * 8;
    
    const x1 = cx + radius * Math.cos(radians);
    const y1 = cy + radius * Math.sin(radians);
    const x2 = cx + (radius + barLength) * Math.cos(radians);
    const y2 = cy + (radius + barLength) * Math.sin(radians);
    
    bars += `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.8">
        <animate attributeName="opacity" 
                 values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" 
                 begin="${i * 0.1}s" />
      </line>
    `;
  }
  
  return bars;
}
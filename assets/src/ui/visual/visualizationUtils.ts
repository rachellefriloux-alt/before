/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced data visualization utilities for emotions, metrics, and insights.
 * Got it, love.
 */

import { sanitizeSvg } from './sanitize';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export function generateEmotionMeterSVG(
  emotionLevel: number, 
  primaryColor: string = '#8b5cf6',
  size: number = 120
): string {
  const clampedLevel = Math.max(0, Math.min(100, emotionLevel));
  const angle = (clampedLevel / 100) * 180;
  const radians = (angle - 90) * (Math.PI / 180);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  
  // Calculate needle position
  const needleX = centerX + radius * Math.cos(radians);
  const needleY = centerY + radius * Math.sin(radians);
  
  // Generate gradient colors based on level
  const getColorForLevel = (level: number): string => {
    if (level < 30) return '#10b981'; // green - calm
    if (level < 60) return '#f59e0b'; // yellow - moderate
    if (level < 80) return '#f97316'; // orange - elevated
    return '#ef4444'; // red - high
  };
  
  const levelColor = getColorForLevel(clampedLevel);
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="meterBg" cx="50%" cy="50%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </radialGradient>
      <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="33%" stop-color="#f59e0b" />
        <stop offset="66%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background circle -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius + 10}" fill="url(#meterBg)" />
    
    <!-- Meter arc background -->
    <path d="M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}" 
          stroke="#e5e7eb" stroke-width="8" fill="none" />
    
    <!-- Active meter arc -->
    <path d="M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}" 
          stroke="url(#arcGrad)" stroke-width="6" fill="none" 
          stroke-dasharray="${Math.PI * radius}" 
          stroke-dashoffset="${Math.PI * radius * (1 - clampedLevel / 100)}" 
          style="transition: stroke-dashoffset 0.8s ease-in-out;" />
    
    <!-- Center dot -->
    <circle cx="${centerX}" cy="${centerY}" r="4" fill="${primaryColor}" />
    
    <!-- Needle -->
    <line x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" 
          stroke="${levelColor}" stroke-width="3" stroke-linecap="round" filter="url(#glow)">
      <animateTransform attributeName="transform" type="rotate" 
                        values="0 ${centerX} ${centerY};${angle} ${centerX} ${centerY}" 
                        dur="1s" fill="freeze" />
    </line>
    
    <!-- Value text -->
    <text x="${centerX}" y="${centerY + radius + 20}" text-anchor="middle" 
          fill="${primaryColor}" font-size="14" font-weight="600">
      ${Math.round(clampedLevel)}%
    </text>
    
    <!-- Tick marks -->
    ${generateTickMarks(centerX, centerY, radius, 5)}
    
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateProgressRingSVG(
  progress: number,
  size: number = 100,
  strokeWidth: number = 8,
  color: string = '#8b5cf6'
): string {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="${adjustColorBrightness(color, 30)}" />
      </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="${center}" cy="${center}" r="${radius}" 
            stroke="#e5e7eb" stroke-width="${strokeWidth}" fill="transparent" />
    
    <!-- Progress circle -->
    <circle cx="${center}" cy="${center}" r="${radius}" 
            stroke="url(#progressGrad)" stroke-width="${strokeWidth}" fill="transparent"
            stroke-linecap="round" stroke-dasharray="${strokeDasharray}" 
            stroke-dashoffset="${strokeDashoffset}"
            transform="rotate(-90 ${center} ${center})"
            style="transition: stroke-dashoffset 0.5s ease-in-out;" />
    
    <!-- Center text -->
    <text x="${center}" y="${center + 4}" text-anchor="middle" 
          fill="${color}" font-size="${size / 6}" font-weight="600">
      ${Math.round(progress)}%
    </text>
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateBarChartSVG(
  data: ChartData[],
  width: number = 300,
  height: number = 200
): string {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 40) / data.length - 10;
  const chartHeight = height - 60;
  
  let bars = '';
  let labels = '';
  
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const x = 20 + index * (barWidth + 10);
    const y = height - 40 - barHeight;
    const color = item.color || '#8b5cf6';
    
    bars += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
            fill="${color}" opacity="0.8" rx="2">
        <animate attributeName="height" from="0" to="${barHeight}" dur="0.8s" fill="freeze" />
        <animate attributeName="y" from="${height - 40}" to="${y}" dur="0.8s" fill="freeze" />
      </rect>
    `;
    
    labels += `
      <text x="${x + barWidth / 2}" y="${height - 20}" text-anchor="middle" 
            fill="#64748b" font-size="12">
        ${item.label}
      </text>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" 
            fill="#1e293b" font-size="11" font-weight="600">
        ${item.value}
      </text>
    `;
  });
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.1)" />
      </filter>
    </defs>
    
    <!-- Chart background -->
    <rect width="${width}" height="${height}" fill="#f8fafc" rx="8" />
    
    <!-- Grid lines -->
    ${generateGridLines(width, height, 5)}
    
    <!-- Bars -->
    ${bars}
    
    <!-- Labels -->
    ${labels}
    
    <!-- Chart border -->
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" 
          stroke="#e2e8f0" stroke-width="1" fill="none" rx="8" />
  </svg>`;
  
  return sanitizeSvg(svg);
}

export function generateSparklineSVG(
  values: number[],
  width: number = 200,
  height: number = 60,
  color: string = '#8b5cf6'
): string {
  if (values.length < 2) return '';
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.2" />
      </linearGradient>
    </defs>
    
    <!-- Filled area -->
    <path d="M 0,${height} ${points} L ${width},${height} Z" 
          fill="url(#sparklineGrad)" />
    
    <!-- Line -->
    <polyline points="${points}" stroke="${color}" stroke-width="2" fill="none" />
    
    <!-- End point -->
    <circle cx="${width}" cy="${height - ((values[values.length - 1] - minValue) / range) * height}" 
            r="3" fill="${color}" />
  </svg>`;
  
  return sanitizeSvg(svg);
}

// Helper functions
function generateTickMarks(centerX: number, centerY: number, radius: number, count: number): string {
  let marks = '';
  for (let i = 0; i <= count; i++) {
    const angle = 180 + (i / count) * 180;
    const radians = (angle - 90) * (Math.PI / 180);
    const x1 = centerX + (radius - 5) * Math.cos(radians);
    const y1 = centerY + (radius - 5) * Math.sin(radians);
    const x2 = centerX + radius * Math.cos(radians);
    const y2 = centerY + radius * Math.sin(radians);
    
    marks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9ca3af" stroke-width="2" />`;
  }
  return marks;
}

function generateGridLines(width: number, height: number, count: number): string {
  let lines = '';
  for (let i = 1; i < count; i++) {
    const y = (height - 60) / count * i + 20;
    lines += `<line x1="20" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
  }
  return lines;
}

function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
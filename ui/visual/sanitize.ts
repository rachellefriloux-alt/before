/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: SVG content sanitization for security and safety.
 * Got it, love.
 */

// Allowlist of safe SVG elements and attributes
const ALLOWED_ELEMENTS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'rect', 'polygon', 'polyline',
  'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'pattern',
  'clipPath', 'mask', 'filter', 'feGaussianBlur', 'feOffset', 'feFlood', 
  'feColorMatrix', 'feMerge', 'feMergeNode', 'feDropShadow', 'animate', 
  'animateTransform', 'animateMotion'
]);

const ALLOWED_ATTRIBUTES = new Set([
  'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height',
  'd', 'points', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'fill-opacity', 'stroke-opacity',
  'transform', 'viewBox', 'xmlns', 'id', 'class', 'style', 'offset', 'stop-color',
  'stop-opacity', 'patternUnits', 'gradientUnits', 'spreadMethod', 'fx', 'fy',
  'text-anchor', 'font-size', 'font-family', 'font-weight', 'filter', 'clip-path',
  'mask', 'attributeName', 'values', 'dur', 'repeatCount', 'begin', 'end', 'type',
  'from', 'to', 'by', 'result', 'in', 'in2', 'stdDeviation', 'dx', 'dy', 'flood-color',
  'flood-opacity', 'patternContentUnits', 'patternTransform'
]);

const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick, onmouseover, etc.
  /<script/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi
];

export function sanitizeSvg(svgString: string): string {
  if (!svgString || typeof svgString !== 'string') {
    return '';
  }

  // Check for DOMPurify global instance
  if (typeof globalThis !== 'undefined' && (globalThis as any).DOMPurify) {
    const DOMPurify = (globalThis as any).DOMPurify;
    return DOMPurify.sanitize(svgString, { 
      USE_PROFILES: { svg: true, svgFilters: true },
      ALLOWED_TAGS: Array.from(ALLOWED_ELEMENTS),
      ALLOWED_ATTR: Array.from(ALLOWED_ATTRIBUTES)
    });
  }

  // Fallback regex-based sanitization
  let sanitized = svgString;

  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Basic element and attribute filtering using regex
  sanitized = sanitized.replace(/<(\/?)([\w-]+)([^>]*)>/g, (match, closingSlash, tagName, attributes) => {
    // Check if element is allowed
    if (!ALLOWED_ELEMENTS.has(tagName.toLowerCase())) {
      return '';
    }

    // If it's a closing tag, allow it
    if (closingSlash === '/') {
      return match;
    }

    // Filter attributes
    let filteredAttributes = '';
    if (attributes) {
      const attrMatches = attributes.match(/[\w-]+\s*=\s*["'][^"']*["']/g);
      if (attrMatches) {
        filteredAttributes = attrMatches
          .filter((attr: any) => {
            const attrName = attr.split('=')[0].trim().toLowerCase();
            return ALLOWED_ATTRIBUTES.has(attrName);
          })
          .join(' ');
        
        if (filteredAttributes) {
          filteredAttributes = ' ' + filteredAttributes;
        }
      }
    }

    return `<${tagName}${filteredAttributes}>`;
  });

  // Additional cleanup: remove any remaining dangerous content
  sanitized = sanitized.replace(/expression\s*\(/gi, '');
  sanitized = sanitized.replace(/url\s*\(\s*["']?javascript:/gi, '');

  return sanitized;
}

export function validateSvgSafety(svgString: string): { safe: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!svgString || typeof svgString !== 'string') {
    issues.push('Invalid or empty SVG string');
    return { safe: false, issues };
  }

  // Check for dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    if (pattern.test(svgString)) {
      issues.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  });

  // Check for disallowed elements
  const elementMatches = svgString.match(/<(\w+)/g);
  if (elementMatches) {
    elementMatches.forEach(match => {
      const element = match.slice(1).toLowerCase();
      if (!ALLOWED_ELEMENTS.has(element)) {
        issues.push(`Disallowed element: ${element}`);
      }
    });
  }

  return {
    safe: issues.length === 0,
    issues
  };
}

// Utility function to create safe inline styles for SVG
export function createSafeInlineStyle(styles: Record<string, string>): string {
  const safeStyles: string[] = [];
  
  const allowedStyleProperties = new Set([
    'fill', 'stroke', 'stroke-width', 'opacity', 'transform', 'font-size',
    'font-family', 'font-weight', 'text-anchor', 'dominant-baseline',
    'alignment-baseline', 'filter', 'clip-path', 'mask'
  ]);

  Object.entries(styles).forEach(([property, value]) => {
    const safeProp = property.toLowerCase().trim();
    const safeValue = value.replace(/[<>'"]/g, '').trim();
    
    if (allowedStyleProperties.has(safeProp) && safeValue) {
      // Additional validation for values
      if (!safeValue.includes('javascript:') && !safeValue.includes('expression(')) {
        safeStyles.push(`${safeProp}:${safeValue}`);
      }
    }
  });

  return safeStyles.join(';');
}
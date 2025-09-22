<!--
  Sallie 1.0 Module
  Persona: Tough love meets soul care.
  Function: Safe SVG rendering component with sanitization.
  Got it, love.
-->

<template>
  <div 
    :class="componentClass" 
    v-html="sanitizedSvg"
    role="img"
    :aria-label="ariaLabel || 'Sallie visual element'"
  />
</template>

<script>
import { sanitizeSvg } from '../visual/sanitize';

export default {
  name: 'SafeSvg',
  props: {
    svg: {
      type: String,
      required: true
    },
    componentClass: {
      type: String,
      default: ''
    },
    ariaLabel: {
      type: String,
      default: null
    }
  },
  computed: {
    sanitizedSvg() {
      return sanitizeSvg(this.svg);
    }
  },
  mounted() {
    // Add any additional safety checks after mount
    this.ensureSafety();
  },
  updated() {
    this.ensureSafety();
  },
  methods: {
    ensureSafety() {
      // Double-check that no dangerous content exists
      const element = this.$el;
      if (element) {
        // Remove any script tags that might have slipped through
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove any dangerous event handlers
        const allElements = element.querySelectorAll('*');
        allElements.forEach(el => {
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
              el.removeAttribute(attr.name);
            }
          });
        });
      }
    }
  }
};
</script>

<style scoped>
/* Ensure the SVG container is properly styled */
div {
  display: inline-block;
  line-height: 0;
}

/* Responsive SVG scaling */
div :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* Accessibility improvements */
div[role="img"] {
  display: inline-block;
}
</style>
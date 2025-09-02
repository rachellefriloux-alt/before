/*
 * Persona: Tough love meets soul care.
 * Module: EmotionOverlay
 * Intent: Handle functionality for EmotionOverlay
 * Provenance-ID: 3ac34e7b-f2df-4e73-a4d8-1366c8843929
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="emotion-overlay" :class="[emotion, intensity]" :style="{ background: overlayColor }">
    <div class="emotion-particles">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="particle"
        :class="particle.type"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          animationDelay: particle.delay + 's',
          animationDuration: particle.duration + 's',
          '--particle-color': particle.color
        }"
      ></div>
    </div>

    <div class="emotion-vibrations">
      <div
        v-for="(vibration, index) in vibrations"
        :key="'vib-' + index"
        class="vibration-wave"
        :style="{
          left: vibration.x + '%',
          top: vibration.y + '%',
          animationDelay: vibration.delay + 's',
          animationDuration: vibration.duration + 's'
        }"
      ></div>
    </div>

    <div class="emotion-echoes">
      <div
        v-for="(echo, index) in echoes"
        :key="'echo-' + index"
        class="echo-ring"
        :style="{
          left: echo.x + '%',
          top: echo.y + '%',
          animationDelay: echo.delay + 's',
          animationDuration: echo.duration + 's',
          width: echo.size + 'px',
          height: echo.size + 'px'
        }"
      ></div>
    </div>

    <div class="emotion-textures">
      <canvas
        ref="textureCanvas"
        class="texture-canvas"
        :width="canvasSize"
        :height="canvasSize"
      ></canvas>
    </div>

    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'EmotionOverlay',
  props: {
    overlayColor: {
      type: String,
      default: 'rgba(99,102,241,0.2)'
    },
    theme: {
      type: String,
      default: 'dark'
    },
    emotion: {
      type: String,
      default: 'neutral'
    },
    intensity: {
      type: String,
      default: 'medium'
    }
  },
  data() {
    return {
      analytics: [],
      error: '',
      particles: [],
      vibrations: [],
      echoes: [],
      canvasSize: 400,
      particleInterval: null,
      vibrationInterval: null,
      echoInterval: null,
      animationFrame: null
    };
  },
  mounted() {
    this.startSensoryEffects();
    this.initializeTextureCanvas();
  },
  beforeUnmount() {
    this.stopSensoryEffects();
  },
  methods: {
    startSensoryEffects() {
      this.particleInterval = setInterval(() => {
        this.generateParticle();
      }, 800);

      this.vibrationInterval = setInterval(() => {
        this.generateVibration();
      }, 1500);

      this.echoInterval = setInterval(() => {
        this.generateEcho();
      }, 2500);
    },
    stopSensoryEffects() {
      if (this.particleInterval) clearInterval(this.particleInterval);
      if (this.vibrationInterval) clearInterval(this.vibrationInterval);
      if (this.echoInterval) clearInterval(this.echoInterval);
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    },
    generateParticle() {
      const particleTypes = ['spark', 'dust', 'energy', 'ripple'];
      const emotionColors = {
        happy: '#fbbf24',
        sad: '#60a5fa',
        angry: '#ef4444',
        calm: '#34d399',
        anxious: '#f472b6',
        excited: '#a3e635',
        neutral: '#6366f1'
      };

      const newParticle = {
        type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 3,
        color: emotionColors[this.emotion] || emotionColors.neutral
      };

      this.particles.push(newParticle);

      setTimeout(() => {
        this.particles.shift();
      }, newParticle.duration * 1000);
    },
    generateVibration() {
      const newVibration = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1,
        duration: 1 + Math.random() * 2
      };

      this.vibrations.push(newVibration);

      setTimeout(() => {
        this.vibrations.shift();
      }, newVibration.duration * 1000);
    },
    generateEcho() {
      const newEcho = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 4,
        size: 20 + Math.random() * 60
      };

      this.echoes.push(newEcho);

      setTimeout(() => {
        this.echoes.shift();
      }, newEcho.duration * 1000);
    },
    initializeTextureCanvas() {
      const canvas = this.$refs.textureCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      this.animateTexture(ctx);
    },
    animateTexture(ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

      // Create emotion-based texture patterns
      this.drawEmotionTexture(ctx);

      this.animationFrame = requestAnimationFrame(() => {
        this.animateTexture(ctx);
      });
    },
    drawEmotionTexture(ctx) {
      const time = Date.now() * 0.001;
      const intensity = this.getIntensityMultiplier();

      // Different patterns based on emotion
      switch (this.emotion) {
        case 'happy':
          this.drawSparklePattern(ctx, time, intensity);
          break;
        case 'sad':
          this.drawRipplePattern(ctx, time, intensity);
          break;
        case 'angry':
          this.drawStormPattern(ctx, time, intensity);
          break;
        case 'calm':
          this.drawWavePattern(ctx, time, intensity);
          break;
        case 'anxious':
          this.drawJitterPattern(ctx, time, intensity);
          break;
        case 'excited':
          this.drawBurstPattern(ctx, time, intensity);
          break;
        default:
          this.drawNeutralPattern(ctx, time, intensity);
      }
    },
    drawSparklePattern(ctx, time, intensity) {
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * this.canvasSize;
        const y = (Math.cos(time * 0.7 + i) * 0.5 + 0.5) * this.canvasSize;
        const size = (Math.sin(time * 2 + i) * 0.5 + 0.5) * 3 * intensity;

        ctx.fillStyle = `rgba(251, 191, 36, ${0.3 * intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    drawRipplePattern(ctx, time, intensity) {
      for (let i = 0; i < 5; i++) {
        const centerX = this.canvasSize * 0.5;
        const centerY = this.canvasSize * 0.5;
        const radius = (time * 20 + i * 50) % (this.canvasSize * 0.8);
        const alpha = Math.max(0, (50 - radius) / 50) * 0.2 * intensity;

        ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    drawStormPattern(ctx, time, intensity) {
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 * intensity})`;
      ctx.lineWidth = 2;

      for (let i = 0; i < 8; i++) {
        const x = (Math.sin(time * 0.3 + i) * 0.4 + 0.5) * this.canvasSize;
        const y = (Math.cos(time * 0.4 + i) * 0.4 + 0.5) * this.canvasSize;

        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x + 20, y);
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x, y + 20);
        ctx.stroke();
      }
    },
    drawWavePattern(ctx, time, intensity) {
      ctx.strokeStyle = `rgba(52, 211, 153, ${0.3 * intensity})`;
      ctx.lineWidth = 3;

      ctx.beginPath();
      for (let x = 0; x < this.canvasSize; x += 5) {
        const y = this.canvasSize * 0.5 + Math.sin(x * 0.02 + time) * 30 * intensity;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
    drawJitterPattern(ctx, time, intensity) {
      for (let i = 0; i < 15; i++) {
        const x = (Math.sin(time * 3 + i) * 0.3 + 0.5) * this.canvasSize;
        const y = (Math.cos(time * 2.5 + i) * 0.3 + 0.5) * this.canvasSize;
        const size = 2 + Math.random() * 4 * intensity;

        ctx.fillStyle = `rgba(244, 114, 182, ${0.5 * intensity})`;
        ctx.fillRect(x - size/2, y - size/2, size, size);
      }
    },
    drawBurstPattern(ctx, time, intensity) {
      const centerX = this.canvasSize * 0.5;
      const centerY = this.canvasSize * 0.5;

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const length = 20 + Math.sin(time * 4 + i) * 15 * intensity;
        const x = centerX + Math.cos(angle) * length;
        const y = centerY + Math.sin(angle) * length;

        ctx.strokeStyle = `rgba(163, 230, 53, ${0.6 * intensity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    },
    drawNeutralPattern(ctx, time, intensity) {
      const gradient = ctx.createRadialGradient(
        this.canvasSize * 0.5, this.canvasSize * 0.5, 0,
        this.canvasSize * 0.5, this.canvasSize * 0.5, this.canvasSize * 0.5
      );
      gradient.addColorStop(0, `rgba(99, 102, 241, ${0.1 * intensity})`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
    },
    getIntensityMultiplier() {
      const multipliers = {
        low: 0.3,
        medium: 0.7,
        high: 1.0
      };
      return multipliers[this.intensity] || 0.7;
    },
    logAnalytics(event, data) {
      this.analytics.push({ event, data, timestamp: Date.now() });
      this.$emit('analytics', { event, data });
    }
  }
};
</script>
<style scoped>
.emotion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  border-radius: var(--border-radius-lg, 12px);
  overflow: hidden;
  transition: all 0.5s ease-in-out;
}

.emotion-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  opacity: 0.3;
  animation: overlayPulse 4s ease-in-out infinite;
}

/* Particle Effects */
.emotion-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  opacity: 0;
  animation: particleFloat 1s ease-out forwards;
}

.particle.spark {
  width: 4px;
  height: 4px;
  background: var(--particle-color);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--particle-color);
  animation: sparkTwinkle 1.5s ease-in-out infinite;
}

.particle.dust {
  width: 2px;
  height: 2px;
  background: var(--particle-color);
  border-radius: 50%;
  opacity: 0.6;
  animation: dustDrift 3s linear infinite;
}

.particle.energy {
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, var(--particle-color), transparent);
  border-radius: 50%;
  animation: energyPulse 2s ease-in-out infinite;
}

.particle.ripple {
  width: 20px;
  height: 20px;
  border: 2px solid var(--particle-color);
  border-radius: 50%;
  animation: rippleExpand 2s ease-out forwards;
}

/* Vibration Effects */
.emotion-vibrations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.vibration-wave {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  opacity: 0;
  animation: vibrationWave 1s ease-out forwards;
}

/* Echo Effects */
.emotion-echoes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.echo-ring {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  opacity: 0;
  animation: echoRing 3s ease-out forwards;
  transform: translate(-50%, -50%);
}

/* Texture Canvas */
.emotion-textures {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.4;
}

.texture-canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Emotion-specific overlays */
.emotion-overlay.happy {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
}

.emotion-overlay.sad {
  background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
}

.emotion-overlay.angry {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
}

.emotion-overlay.calm {
  background: radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%);
}

.emotion-overlay.anxious {
  background: radial-gradient(circle, rgba(244, 114, 182, 0.1) 0%, transparent 70%);
}

.emotion-overlay.excited {
  background: radial-gradient(circle, rgba(163, 230, 53, 0.1) 0%, transparent 70%);
}

.emotion-overlay.neutral {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
}

/* Intensity variations */
.emotion-overlay.low {
  opacity: 0.3;
}

.emotion-overlay.medium {
  opacity: 0.6;
}

.emotion-overlay.high {
  opacity: 0.9;
}

/* Animations */
@keyframes overlayPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0);
  }
}

@keyframes sparkTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

@keyframes dustDrift {
  0% { transform: translateX(-10px) translateY(-10px); }
  100% { transform: translateX(10px) translateY(10px); }
}

@keyframes energyPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
}

@keyframes rippleExpand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

@keyframes vibrationWave {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 0.4;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

@keyframes echoRing {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Performance optimizations */
.emotion-overlay {
  will-change: opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.particle,
.vibration-wave,
.echo-ring {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .emotion-overlay::before {
    animation: none;
  }

  .particle,
  .vibration-wave,
  .echo-ring {
    animation: none;
  }

  .texture-canvas {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .emotion-overlay {
    opacity: 0.8;
  }

  .particle,
  .vibration-wave,
  .echo-ring {
    border-width: 3px;
  }
}
</style>

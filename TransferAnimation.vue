<!--
  Transfer Animation Component
  
  This component visualizes the data transfer process between devices with
  animated particles and progress indication.
  
  Created with love. 💛
-->

<template>
  <div class="transfer-animation-container">
    <div class="devices-container">
      <!-- Source device -->
      <div class="device source-device">
        <div class="device-screen">
          <div class="device-avatar">
            <img src="../assets/sallie-avatar.png" alt="Sallie" />
          </div>
        </div>
        <div class="device-base"></div>
      </div>
      
      <!-- Connection path with animated particles -->
      <div class="connection-path">
        <div class="path-line"></div>
        <div 
          v-for="i in particleCount" 
          :key="i" 
          class="particle"
          :class="{ 'active': isTransferring }"
          :style="getParticleStyle(i)"
        ></div>
      </div>
      
      <!-- Target device -->
      <div class="device target-device">
        <div class="device-screen">
          <div class="device-avatar target">
            <img 
              src="../assets/sallie-avatar.png" 
              alt="Sallie" 
              :style="targetOpacityStyle"
            />
          </div>
        </div>
        <div class="device-base"></div>
      </div>
    </div>
    
    <!-- Status indicator -->
    <div class="status-indicator" :class="statusClass">
      <div v-if="isCompleted" class="completion-icon">
        <div v-if="isSuccess" class="success-checkmark">✓</div>
        <div v-else class="failure-x">✕</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'TransferAnimation',
  
  props: {
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'PREPARING'
    }
  },
  
  setup(props) {
    const particleCount = 8;
    let animationFrame = null;
    
    // Animation state
    const particleOffsets = ref(Array(particleCount).fill(0).map(() => Math.random()));
    const particleSpeeds = ref(Array(particleCount).fill(0).map(() => 0.5 + Math.random() * 0.5));
    
    // Computed properties
    const isTransferring = computed(() => {
      return props.status === 'IN_PROGRESS';
    });
    
    const isCompleted = computed(() => {
      return ['COMPLETED', 'FAILED', 'VERIFICATION_FAILED', 'CANCELLED'].includes(props.status);
    });
    
    const isSuccess = computed(() => {
      return props.status === 'COMPLETED';
    });
    
    const statusClass = computed(() => {
      return {
        'preparing': props.status === 'PREPARING',
        'ready': props.status === 'READY',
        'transferring': props.status === 'IN_PROGRESS',
        'completed': props.status === 'COMPLETED',
        'failed': props.status === 'FAILED' || props.status === 'VERIFICATION_FAILED',
        'cancelled': props.status === 'CANCELLED'
      };
    });
    
    const targetOpacityStyle = computed(() => {
      return {
        opacity: props.progress
      };
    });
    
    // Methods
    const getParticleStyle = (index) => {
      const i = index - 1;
      const baseSize = 8 + Math.floor(Math.random() * 4);
      
      return {
        '--offset': `${particleOffsets.value[i] * 100}%`,
        '--size': `${baseSize}px`,
        '--delay': `${i * 0.2}s`,
        '--color': getParticleColor(i)
      };
    };
    
    const getParticleColor = (index) => {
      // Different colors for particles
      const colors = [
        'var(--sallie-primary)',
        'var(--sallie-secondary)',
        'var(--sallie-tertiary)',
        'var(--sallie-accent)'
      ];
      return colors[index % colors.length];
    };
    
    const animateParticles = () => {
      if (!isTransferring.value) return;
      
      // Update particle positions
      for (let i = 0; i < particleCount; i++) {
        particleOffsets.value[i] += particleSpeeds.value[i] * 0.01;
        if (particleOffsets.value[i] > 1) {
          particleOffsets.value[i] = 0;
        }
      }
      
      animationFrame = requestAnimationFrame(animateParticles);
    };
    
    // Watch for changes in transfer status
    watch(() => props.status, (newStatus, oldStatus) => {
      if (newStatus === 'IN_PROGRESS' && oldStatus !== 'IN_PROGRESS') {
        // Start animation when transfer begins
        animationFrame = requestAnimationFrame(animateParticles);
      } else if (newStatus !== 'IN_PROGRESS' && oldStatus === 'IN_PROGRESS') {
        // Stop animation when transfer ends
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      }
    });
    
    // Lifecycle hooks
    onMounted(() => {
      if (isTransferring.value) {
        animationFrame = requestAnimationFrame(animateParticles);
      }
    });
    
    onBeforeUnmount(() => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    });
    
    return {
      particleCount,
      isTransferring,
      isCompleted,
      isSuccess,
      statusClass,
      targetOpacityStyle,
      getParticleStyle
    };
  }
}
</script>

<style scoped>
.transfer-animation-container {
  width: 100%;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.devices-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  margin-bottom: 1.5rem;
}

/* Device styling */
.device {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-screen {
  width: 80px;
  height: 140px;
  background-color: var(--sallie-bg-secondary);
  border-radius: 15px;
  border: 6px solid var(--sallie-neutral-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.device-base {
  width: 50px;
  height: 10px;
  background-color: var(--sallie-neutral-dark);
  border-radius: 0 0 10px 10px;
  margin-top: -3px;
}

.device-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.device-avatar.target img {
  transition: opacity 0.5s ease;
}

/* Connection path and particles */
.connection-path {
  flex: 1;
  height: 80px;
  position: relative;
  margin: 0 20px;
}

.path-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--sallie-border);
  transform: translateY(-50%);
}

.particle {
  position: absolute;
  top: 50%;
  left: var(--offset);
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  border-radius: 50%;
  transform: translateY(-50%) scale(0);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.particle.active {
  transform: translateY(-50%) scale(1);
  opacity: 0.8;
  animation: moveParticle 3s infinite linear;
  animation-delay: var(--delay);
}

@keyframes moveParticle {
  0% {
    left: 0%;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

/* Status indicator */
.status-indicator {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--sallie-neutral-light);
  transition: all 0.3s ease;
}

.status-indicator.preparing {
  animation: pulse 1.5s infinite;
  background-color: var(--sallie-neutral);
}

.status-indicator.ready {
  background-color: var(--sallie-info);
}

.status-indicator.transferring {
  animation: spin 2s linear infinite;
  border: 3px solid var(--sallie-primary);
  border-top-color: transparent;
  background-color: transparent;
}

.status-indicator.completed {
  background-color: var(--sallie-success);
}

.status-indicator.failed {
  background-color: var(--sallie-error);
}

.status-indicator.cancelled {
  background-color: var(--sallie-neutral-dark);
}

.completion-icon {
  font-size: 28px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.3s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes scaleIn {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .device-screen {
    width: 60px;
    height: 105px;
    border-width: 4px;
  }
  
  .device-avatar {
    width: 45px;
    height: 45px;
  }
  
  .device-base {
    width: 40px;
    height: 8px;
  }
  
  .connection-path {
    margin: 0 10px;
  }
}
</style>

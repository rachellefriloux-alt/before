<!--
  Sallie's Device Transfer Interface
  
  This component provides a user interface for transferring Sallie's personality,
  memory, and user understanding between devices.
  
  Features:
  - Device scanning and selection
  - Transfer configuration options
  - Progress tracking and visualization
  - Transfer history view
  
  Created with love. 💛
-->

<template>
  <div class="device-transfer-container">
    <div class="header" :class="{ 'transfer-active': isTransferActive }">
      <h2>{{ $t('deviceTransfer.title') }}</h2>
      <p>{{ $t('deviceTransfer.subtitle') }}</p>
    </div>
    
    <TransferAnimation 
      v-if="isTransferActive" 
      :progress="transferProgress" 
      :status="transferStatus"
    />
    
    <div v-if="!isTransferActive && !showHistory" class="main-content">
      <!-- Device scanning section -->
      <section class="section device-scan-section">
        <h3>{{ $t('deviceTransfer.scanForDevices') }}</h3>
        
        <div class="device-scan-controls">
          <button @click="scanForDevices" :disabled="isScanning" class="scan-button">
            <i class="icon-scan" v-if="!isScanning"></i>
            <i class="icon-loading spin" v-else></i>
            {{ isScanning ? $t('deviceTransfer.scanning') : $t('deviceTransfer.scanNow') }}
          </button>
          
          <span v-if="lastScanTime" class="last-scan-info">
            {{ $t('deviceTransfer.lastScan') }}: {{ formatTime(lastScanTime) }}
          </span>
        </div>
        
        <div v-if="availableDevices.length > 0" class="devices-list">
          <div 
            v-for="device in availableDevices" 
            :key="device.deviceId" 
            @click="selectDevice(device)" 
            class="device-card"
            :class="{ 'selected': selectedDevice?.deviceId === device.deviceId }"
          >
            <div class="device-icon" :class="getDeviceIconClass(device)"></div>
            <div class="device-info">
              <h4>{{ device.deviceName }}</h4>
              <p>{{ getDeviceDescription(device) }}</p>
            </div>
            <div class="device-select-indicator">
              <i class="icon-check" v-if="selectedDevice?.deviceId === device.deviceId"></i>
              <i class="icon-chevron-right" v-else></i>
            </div>
          </div>
        </div>
        
        <p v-else-if="!isScanning" class="no-devices-message">
          {{ $t('deviceTransfer.noDevicesFound') }}
        </p>
      </section>
      
      <!-- Transfer configuration section -->
      <section v-if="selectedDevice" class="section transfer-config-section">
        <h3>{{ $t('deviceTransfer.transferOptions') }}</h3>
        
        <div class="transfer-options">
          <div class="option-group">
            <label class="option-toggle">
              <input type="checkbox" v-model="transferConfig.includeMemory">
              <span class="toggle-label">{{ $t('deviceTransfer.includeMemory') }}</span>
            </label>
            
            <div v-if="transferConfig.includeMemory" class="sub-options">
              <label class="option-toggle">
                <input type="checkbox" v-model="transferConfig.memoryConfig.includeEpisodicMemory">
                <span class="toggle-label">{{ $t('deviceTransfer.includeEpisodicMemory') }}</span>
              </label>
              
              <label class="option-toggle">
                <input type="checkbox" v-model="transferConfig.memoryConfig.includeSemanticMemory">
                <span class="toggle-label">{{ $t('deviceTransfer.includeSemanticMemory') }}</span>
              </label>
              
              <label class="option-toggle">
                <input type="checkbox" v-model="transferConfig.memoryConfig.includeEmotionalMemory">
                <span class="toggle-label">{{ $t('deviceTransfer.includeEmotionalMemory') }}</span>
              </label>
              
              <label class="option-toggle">
                <input type="checkbox" v-model="transferConfig.memoryConfig.includeProcedureMemory">
                <span class="toggle-label">{{ $t('deviceTransfer.includeProcedureMemory') }}</span>
              </label>
            </div>
          </div>
          
          <div class="option-group">
            <label class="option-toggle">
              <input type="checkbox" v-model="transferConfig.includePersonality">
              <span class="toggle-label">{{ $t('deviceTransfer.includePersonality') }}</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="option-toggle">
              <input type="checkbox" v-model="transferConfig.includeUserPreferences">
              <span class="toggle-label">{{ $t('deviceTransfer.includeUserPreferences') }}</span>
            </label>
          </div>
          
          <div class="option-group">
            <label class="option-toggle">
              <input type="checkbox" v-model="transferConfig.includeValues">
              <span class="toggle-label">{{ $t('deviceTransfer.includeValues') }}</span>
            </label>
          </div>
        </div>
      </section>
      
      <!-- Action buttons -->
      <div class="action-buttons">
        <button @click="showHistory = true" class="secondary-button">
          <i class="icon-history"></i>
          {{ $t('deviceTransfer.viewHistory') }}
        </button>
        
        <button 
          @click="initiateTransfer" 
          :disabled="!selectedDevice || isTransferButtonDisabled" 
          class="primary-button"
        >
          <i class="icon-transfer"></i>
          {{ $t('deviceTransfer.startTransfer') }}
        </button>
      </div>
    </div>
    
    <!-- Transfer history view -->
    <div v-if="!isTransferActive && showHistory" class="history-view">
      <div class="history-header">
        <h3>{{ $t('deviceTransfer.transferHistory') }}</h3>
        <button @click="showHistory = false" class="back-button">
          <i class="icon-arrow-left"></i>
          {{ $t('deviceTransfer.back') }}
        </button>
      </div>
      
      <div class="history-list">
        <div v-if="transferHistory.length > 0" class="history-entries">
          <div 
            v-for="(entry, index) in transferHistory" 
            :key="index" 
            class="history-entry"
            :class="{ 'success': entry.success, 'failure': !entry.success }"
          >
            <div class="entry-icon">
              <i :class="getHistoryIconClass(entry)"></i>
            </div>
            <div class="entry-content">
              <h4>{{ getHistoryTitle(entry) }}</h4>
              <p class="entry-message">{{ entry.message }}</p>
              <p class="entry-timestamp">{{ formatTime(entry.timestamp) }}</p>
            </div>
          </div>
        </div>
        
        <p v-else class="no-history-message">
          {{ $t('deviceTransfer.noTransferHistory') }}
        </p>
      </div>
    </div>
    
    <!-- Transfer in progress view -->
    <div v-if="isTransferActive" class="transfer-progress-view">
      <h3>{{ getTransferStatusTitle() }}</h3>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${transferProgress * 100}%` }"></div>
        </div>
        <div class="progress-percentage">{{ Math.round(transferProgress * 100) }}%</div>
      </div>
      
      <p class="transfer-status-message">{{ transferStatusMessage }}</p>
      
      <div class="transfer-details" v-if="currentPackage">
        <div class="package-info">
          <span class="package-label">{{ $t('deviceTransfer.currentPackage') }}:</span>
          <span class="package-type">{{ getPackageTypeLabel(currentPackage.type) }}</span>
        </div>
      </div>
      
      <button 
        v-if="canCancelTransfer" 
        @click="cancelTransfer" 
        class="cancel-button"
      >
        {{ $t('deviceTransfer.cancel') }}
      </button>
      
      <button 
        v-if="isTransferComplete" 
        @click="closeTransfer" 
        class="complete-button"
      >
        {{ $t('deviceTransfer.done') }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import TransferAnimation from './TransferAnimation.vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'DeviceTransfer',
  
  components: {
    TransferAnimation
  },
  
  props: {
    deviceTransferSystem: {
      type: Object,
      required: true
    }
  },
  
  setup(props) {
    const { t } = useI18n();
    
    // State variables
    const isScanning = ref(false);
    const lastScanTime = ref(null);
    const availableDevices = ref([]);
    const selectedDevice = ref(null);
    const showHistory = ref(false);
    const isTransferActive = ref(false);
    const transferProgress = ref(0);
    const transferStatus = ref('');
    const transferStatusMessage = ref('');
    const currentPackage = ref(null);
    const transferHistory = ref([]);
    const transferSession = ref(null);
    
    // Default transfer configuration
    const transferConfig = ref({
      includeMemory: true,
      includePersonality: true,
      includeUserPreferences: true,
      includeValues: true,
      memoryConfig: {
        includeEpisodicMemory: true,
        includeSemanticMemory: true,
        includeEmotionalMemory: true,
        includeProcedureMemory: true,
        memoryAgeLimit: null
      }
    });
    
    // Polling interval for scanning
    let scanningInterval = null;
    
    // Computed properties
    const isTransferButtonDisabled = computed(() => {
      // At least one option must be selected
      return !(
        transferConfig.value.includeMemory ||
        transferConfig.value.includePersonality ||
        transferConfig.value.includeUserPreferences ||
        transferConfig.value.includeValues
      );
    });
    
    const isTransferComplete = computed(() => {
      return transferStatus.value === 'COMPLETED' || 
             transferStatus.value === 'FAILED' ||
             transferStatus.value === 'VERIFICATION_FAILED' ||
             transferStatus.value === 'CANCELLED';
    });
    
    const canCancelTransfer = computed(() => {
      return isTransferActive.value && !isTransferComplete.value;
    });
    
    // Methods
    const scanForDevices = async () => {
      isScanning.value = true;
      
      try {
        const devices = await props.deviceTransferSystem.scanForDevices();
        availableDevices.value = devices;
        lastScanTime.value = Date.now();
      } catch (error) {
        console.error('Error scanning for devices:', error);
      } finally {
        isScanning.value = false;
      }
    };
    
    const startPeriodicScanning = () => {
      // Scan immediately
      scanForDevices();
      
      // Then scan every 30 seconds
      scanningInterval = setInterval(() => {
        if (!isTransferActive.value) {
          scanForDevices();
        }
      }, 30000);
    };
    
    const stopPeriodicScanning = () => {
      if (scanningInterval) {
        clearInterval(scanningInterval);
        scanningInterval = null;
      }
    };
    
    const selectDevice = (device) => {
      selectedDevice.value = device;
    };
    
    const initiateTransfer = async () => {
      if (!selectedDevice.value) return;
      
      isTransferActive.value = true;
      transferProgress.value = 0;
      transferStatus.value = 'PREPARING';
      transferStatusMessage.value = t('deviceTransfer.preparingTransfer');
      
      try {
        // Initiate transfer session
        transferSession.value = await props.deviceTransferSystem.initiateTransfer(
          selectedDevice.value,
          transferConfig.value
        );
        
        // Execute transfer and track progress
        const progressUpdates = props.deviceTransferSystem.executeTransfer(transferSession.value);
        
        for await (const progress of progressUpdates) {
          transferProgress.value = progress.progress;
          transferStatus.value = progress.status;
          transferStatusMessage.value = progress.message;
          currentPackage.value = progress.currentPackage;
        }
        
        // When transfer is complete, update the history
        loadTransferHistory();
        
      } catch (error) {
        console.error('Error during transfer:', error);
        transferStatus.value = 'FAILED';
        transferStatusMessage.value = t('deviceTransfer.transferError', { error: error.message });
      }
    };
    
    const cancelTransfer = () => {
      // In a real implementation, this would call a method to cancel the transfer
      transferStatus.value = 'CANCELLED';
      transferStatusMessage.value = t('deviceTransfer.transferCancelled');
    };
    
    const closeTransfer = () => {
      isTransferActive.value = false;
      transferSession.value = null;
      currentPackage.value = null;
    };
    
    const loadTransferHistory = () => {
      transferHistory.value = props.deviceTransferSystem.getTransferHistory(10);
    };
    
    // Utility methods
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };
    
    const getDeviceIconClass = (device) => {
      switch (device.deviceType) {
        case 'PHONE': return 'device-icon-phone';
        case 'TABLET': return 'device-icon-tablet';
        case 'LAPTOP': return 'device-icon-laptop';
        case 'DESKTOP': return 'device-icon-desktop';
        default: return 'device-icon-other';
      }
    };
    
    const getDeviceDescription = (device) => {
      let osName;
      switch (device.osType) {
        case 'ANDROID': osName = 'Android'; break;
        case 'IOS': osName = 'iOS'; break;
        case 'WINDOWS': osName = 'Windows'; break;
        case 'MACOS': osName = 'macOS'; break;
        case 'LINUX': osName = 'Linux'; break;
        default: osName = device.osType;
      }
      
      return `${osName} ${device.osVersion}`;
    };
    
    const getHistoryIconClass = (entry) => {
      switch (entry.type) {
        case 'TRANSFER_START': return 'icon-start';
        case 'TRANSFER_COMPLETE': return 'icon-complete';
        case 'TRANSFER_FAILED': return 'icon-failed';
        case 'VERIFICATION_FAILED': return 'icon-verification';
        case 'IMPORT_COMPLETE': return 'icon-import';
        default: return 'icon-history';
      }
    };
    
    const getHistoryTitle = (entry) => {
      switch (entry.type) {
        case 'TRANSFER_START': return t('deviceTransfer.historyTransferStart');
        case 'TRANSFER_COMPLETE': return t('deviceTransfer.historyTransferComplete');
        case 'TRANSFER_FAILED': return t('deviceTransfer.historyTransferFailed');
        case 'VERIFICATION_FAILED': return t('deviceTransfer.historyVerificationFailed');
        case 'IMPORT_COMPLETE': return t('deviceTransfer.historyImportComplete');
        default: return t('deviceTransfer.historyUnknown');
      }
    };
    
    const getTransferStatusTitle = () => {
      switch (transferStatus.value) {
        case 'PREPARING': return t('deviceTransfer.statusPreparing');
        case 'READY': return t('deviceTransfer.statusReady');
        case 'IN_PROGRESS': return t('deviceTransfer.statusInProgress');
        case 'COMPLETED': return t('deviceTransfer.statusCompleted');
        case 'FAILED': return t('deviceTransfer.statusFailed');
        case 'VERIFICATION_FAILED': return t('deviceTransfer.statusVerificationFailed');
        case 'CANCELLED': return t('deviceTransfer.statusCancelled');
        default: return t('deviceTransfer.statusUnknown');
      }
    };
    
    const getPackageTypeLabel = (packageType) => {
      switch (packageType) {
        case 'CORE_SYSTEM': return t('deviceTransfer.packageCoreSystem');
        case 'EPISODIC_MEMORY': return t('deviceTransfer.packageEpisodicMemory');
        case 'SEMANTIC_MEMORY': return t('deviceTransfer.packageSemanticMemory');
        case 'EMOTIONAL_MEMORY': return t('deviceTransfer.packageEmotionalMemory');
        case 'PROCEDURAL_MEMORY': return t('deviceTransfer.packageProceduralMemory');
        case 'PERSONALITY': return t('deviceTransfer.packagePersonality');
        case 'USER_PREFERENCES': return t('deviceTransfer.packageUserPreferences');
        case 'VALUES': return t('deviceTransfer.packageValues');
        default: return packageType;
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      loadTransferHistory();
      startPeriodicScanning();
    });
    
    onBeforeUnmount(() => {
      stopPeriodicScanning();
    });
    
    return {
      isScanning,
      lastScanTime,
      availableDevices,
      selectedDevice,
      transferConfig,
      showHistory,
      isTransferActive,
      transferProgress,
      transferStatus,
      transferStatusMessage,
      currentPackage,
      transferHistory,
      isTransferButtonDisabled,
      isTransferComplete,
      canCancelTransfer,
      scanForDevices,
      selectDevice,
      initiateTransfer,
      cancelTransfer,
      closeTransfer,
      formatTime,
      getDeviceIconClass,
      getDeviceDescription,
      getHistoryIconClass,
      getHistoryTitle,
      getTransferStatusTitle,
      getPackageTypeLabel
    };
  }
}
</script>

<style scoped>
.device-transfer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: var(--sallie-bg-primary);
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: var(--sallie-text-primary);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.header.transfer-active {
  margin-bottom: 0.5rem;
}

.header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--sallie-primary);
}

.header p {
  font-size: 1rem;
  opacity: 0.8;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--sallie-bg-secondary);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--sallie-primary);
}

/* Device scanning section */
.device-scan-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.scan-button {
  display: flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background-color: var(--sallie-primary);
  color: white;
  border: none;
  border-radius: 2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.scan-button:hover {
  background-color: var(--sallie-primary-dark);
}

.scan-button:disabled {
  background-color: var(--sallie-disabled);
  cursor: not-allowed;
}

.scan-button i {
  margin-right: 0.5rem;
}

.last-scan-info {
  font-size: 0.85rem;
  opacity: 0.7;
}

.devices-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.device-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--sallie-bg-card);
  border-radius: 0.5rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.device-card:hover {
  border-color: var(--sallie-primary-light);
  transform: translateY(-2px);
}

.device-card.selected {
  border-color: var(--sallie-primary);
  background-color: var(--sallie-bg-selected);
}

.device-icon {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--sallie-secondary-light);
  border-radius: 50%;
  color: var(--sallie-secondary);
}

.device-info {
  flex: 1;
}

.device-info h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.device-info p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

.device-select-indicator {
  margin-left: 0.5rem;
  color: var(--sallie-primary);
}

.no-devices-message {
  text-align: center;
  padding: 1.5rem;
  color: var(--sallie-text-secondary);
}

/* Transfer configuration section */
.transfer-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-group {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--sallie-border);
}

.option-group:last-child {
  border-bottom: none;
}

.option-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.option-toggle input[type="checkbox"] {
  margin-right: 0.75rem;
  width: 18px;
  height: 18px;
}

.toggle-label {
  font-size: 1rem;
}

.sub-options {
  margin-left: 2rem;
  margin-top: 0.75rem;
  padding-left: 1rem;
  border-left: 2px solid var(--sallie-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Action buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.primary-button, .secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.primary-button {
  background-color: var(--sallie-primary);
  color: white;
}

.primary-button:hover {
  background-color: var(--sallie-primary-dark);
}

.primary-button:disabled {
  background-color: var(--sallie-disabled);
  cursor: not-allowed;
}

.secondary-button {
  background-color: var(--sallie-secondary-light);
  color: var(--sallie-secondary);
}

.secondary-button:hover {
  background-color: var(--sallie-secondary-lighter);
}

.primary-button i, .secondary-button i {
  margin-right: 0.5rem;
}

/* History view */
.history-view {
  width: 100%;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--sallie-primary);
  cursor: pointer;
  font-size: 0.9rem;
}

.back-button i {
  margin-right: 0.5rem;
}

.history-entries {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-entry {
  display: flex;
  padding: 1rem;
  background-color: var(--sallie-bg-card);
  border-radius: 0.5rem;
  border-left: 4px solid var(--sallie-neutral);
}

.history-entry.success {
  border-left-color: var(--sallie-success);
}

.history-entry.failure {
  border-left-color: var(--sallie-error);
}

.entry-icon {
  margin-right: 1rem;
  color: var(--sallie-text-secondary);
}

.entry-content {
  flex: 1;
}

.entry-content h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.entry-message {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.entry-timestamp {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  opacity: 0.6;
}

.no-history-message {
  text-align: center;
  padding: 2rem;
  color: var(--sallie-text-secondary);
}

/* Transfer progress view */
.transfer-progress-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
}

.transfer-progress-view h3 {
  font-size: 1.4rem;
  margin-bottom: 2rem;
  color: var(--sallie-primary);
}

.progress-container {
  width: 100%;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--sallie-bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
}

.progress-fill {
  height: 100%;
  background-color: var(--sallie-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-weight: bold;
  min-width: 48px;
  text-align: right;
  color: var(--sallie-primary);
}

.transfer-status-message {
  margin: 0.5rem 0 1.5rem;
  color: var(--sallie-text-secondary);
}

.transfer-details {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--sallie-bg-secondary);
  border-radius: 0.5rem;
  max-width: 400px;
  width: 100%;
}

.package-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.package-label {
  color: var(--sallie-text-secondary);
}

.package-type {
  font-weight: 500;
}

.cancel-button, .complete-button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  border-radius: 2rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.cancel-button {
  background-color: var(--sallie-bg-secondary);
  color: var(--sallie-text-primary);
}

.complete-button {
  background-color: var(--sallie-primary);
  color: white;
}

.cancel-button:hover {
  background-color: var(--sallie-error-light);
  color: var(--sallie-error);
}

.complete-button:hover {
  background-color: var(--sallie-primary-dark);
}

/* Animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .device-transfer-container {
    padding: 1rem;
  }
  
  .devices-list {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .secondary-button {
    order: 2;
  }
  
  .primary-button {
    order: 1;
  }
}
</style>

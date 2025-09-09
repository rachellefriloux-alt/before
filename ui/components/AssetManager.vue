/*
 * Persona: Tough love meets soul care.
 * Module: AssetManager
 * Intent: Handle functionality for AssetManager
 * Provenance-ID: b146dd27-d83e-4c01-af3c-1d78215a516b
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

<template>
  <div class="asset-manager" :class="theme">
    <div class="manager-header">
      <h3 class="manager-title">
        <span class="title-icon">📊</span>
        Asset Integrity Manager
      </h3>
      <div class="scan-status" :class="scanStatus">
        <div class="status-indicator"></div>
        <span class="status-text">{{ scanStatusText }}</span>
      </div>
    </div>

    <div class="scan-controls">
      <div class="control-group">
        <button
          class="scan-btn"
          @click="startFullScan"
          :disabled="isScanning"
        >
          <span class="btn-icon">🔍</span>
          {{ isScanning ? 'Scanning...' : 'Full Asset Scan' }}
        </button>

        <button
          class="quick-scan-btn"
          @click="startQuickScan"
          :disabled="isScanning"
        >
          <span class="btn-icon">⚡</span>
          Quick Scan
        </button>

        <button
          class="integrity-check-btn"
          @click="runIntegrityCheck"
          :disabled="isScanning"
        >
          <span class="btn-icon">✅</span>
          Integrity Check
        </button>
      </div>

      <div class="scan-options">
        <label class="option-label">
          <input
            type="checkbox"
            v-model="scanOptions.deepScan"
            :disabled="isScanning"
          />
          Deep Analysis
        </label>

        <label class="option-label">
          <input
            type="checkbox"
            v-model="scanOptions.verifyHashes"
            :disabled="isScanning"
          />
          Verify Hashes
        </label>

        <label class="option-label">
          <input
            type="checkbox"
            v-model="scanOptions.checkDependencies"
            :disabled="isScanning"
          />
          Check Dependencies
        </label>
      </div>
    </div>

    <div class="scan-progress" v-if="isScanning">
      <div class="progress-header">
        <div class="progress-title">{{ currentScanPhase }}</div>
        <div class="progress-percentage">{{ Math.round(scanProgress) }}%</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: scanProgress + '%' }"></div>
      </div>
      <div class="progress-details">
        <div class="detail-item">
          <span class="detail-label">Files Scanned:</span>
          <span class="detail-value">{{ scannedFiles }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Issues Found:</span>
          <span class="detail-value" :class="{ 'has-issues': scanIssues > 0 }">{{ scanIssues }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Time Elapsed:</span>
          <span class="detail-value">{{ formatTime(elapsedTime) }}</span>
        </div>
      </div>
    </div>

    <div class="asset-categories">
      <div
        v-for="(category, index) in assetCategories"
        :key="index"
        class="category-card"
        :class="{ expanded: expandedCategories.includes(category.name) }"
      >
        <div class="category-header" @click="toggleCategory(category.name)">
          <div class="category-info">
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-details">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-stats">
                <span class="stat-item">{{ category.totalFiles }} files</span>
                <span class="stat-item">{{ formatBytes(category.totalSize) }}</span>
                <span
                  class="stat-item"
                  :class="{
                    'status-healthy': category.status === 'healthy',
                    'status-warning': category.status === 'warning',
                    'status-error': category.status === 'error'
                  }"
                >
                  {{ category.status }}
                </span>
              </div>
            </div>
          </div>
          <div class="category-toggle">
            <span class="toggle-icon" :class="{ rotated: expandedCategories.includes(category.name) }">
              ▼
            </span>
          </div>
        </div>

        <div class="category-content" v-if="expandedCategories.includes(category.name)">
          <div class="asset-list">
            <div
              v-for="(asset, assetIndex) in category.assets"
              :key="assetIndex"
              class="asset-item"
              :class="{
                'has-issues': asset.issues && asset.issues.length > 0,
                'provenance-tagged': asset.provenanceTagged,
                'missing': asset.missing
              }"
            >
              <div class="asset-info">
                <div class="asset-name">{{ asset.name }}</div>
                <div class="asset-path">{{ asset.path }}</div>
                <div class="asset-meta">
                  <span class="meta-item">{{ formatBytes(asset.size) }}</span>
                  <span class="meta-item">{{ formatDate(asset.modified) }}</span>
                  <span
                    v-if="asset.provenanceTagged"
                    class="meta-item provenance-badge"
                  >
                    Provenance ✓
                  </span>
                </div>
              </div>

              <div class="asset-status">
                <div
                  v-if="asset.issues && asset.issues.length > 0"
                  class="issues-indicator"
                  @click="showAssetIssues(asset)"
                >
                  <span class="issues-count">{{ asset.issues.length }}</span>
                  <span class="issues-label">issues</span>
                </div>

                <div
                  v-if="asset.missing"
                  class="missing-indicator"
                >
                  Missing
                </div>

                <div
                  v-if="!asset.missing && (!asset.issues || asset.issues.length === 0)"
                  class="healthy-indicator"
                >
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="scan-results" v-if="scanResults && scanResults.length > 0">
      <h4 class="results-title">Scan Results</h4>
      <div class="results-summary">
        <div class="summary-stat">
          <div class="stat-number">{{ scanResults.filter(r => r.status === 'healthy').length }}</div>
          <div class="stat-label">Healthy</div>
        </div>
        <div class="summary-stat">
          <div class="stat-number">{{ scanResults.filter(r => r.status === 'warning').length }}</div>
          <div class="stat-label">Warnings</div>
        </div>
        <div class="summary-stat">
          <div class="stat-number">{{ scanResults.filter(r => r.status === 'error').length }}</div>
          <div class="stat-label">Errors</div>
        </div>
        <div class="summary-stat">
          <div class="stat-number">{{ scanResults.filter(r => r.provenanceTagged).length }}</div>
          <div class="stat-label">Provenance Tagged</div>
        </div>
      </div>

      <div class="results-actions">
        <button
          class="export-results-btn"
          @click="exportResults"
        >
          Export Report
        </button>

        <button
          class="fix-issues-btn"
          @click="attemptAutoFix"
          :disabled="scanResults.filter(r => r.status !== 'healthy').length === 0"
        >
          Auto Fix Issues
        </button>
      </div>
    </div>

    <div class="integrity-metrics">
      <h4 class="metrics-title">Integrity Metrics</h4>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">{{ overallHealth }}%</div>
          <div class="metric-label">Overall Health</div>
          <div class="metric-bar">
            <div class="metric-fill" :style="{ width: overallHealth + '%' }"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-value">{{ provenanceCoverage }}%</div>
          <div class="metric-label">Provenance Coverage</div>
          <div class="metric-bar">
            <div class="metric-fill" :style="{ width: provenanceCoverage + '%' }"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-value">{{ dependencyIntegrity }}%</div>
          <div class="metric-label">Dependency Integrity</div>
          <div class="metric-bar">
            <div class="metric-fill" :style="{ width: dependencyIntegrity + '%' }"></div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-value">{{ formatUptime(systemUptime) }}</div>
          <div class="metric-label">System Uptime</div>
          <div class="metric-bar">
            <div class="metric-fill uptime-fill" :style="{ width: (systemUptime / 86400) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssetManager',
  props: {
    theme: {
      type: String,
      default: 'dark'
    }
  },
  data() {
    return {
      isScanning: false,
      scanStatus: 'idle',
      scanProgress: 0,
      scannedFiles: 0,
      scanIssues: 0,
      elapsedTime: 0,
      currentScanPhase: '',
      scanOptions: {
        deepScan: true,
        verifyHashes: true,
        checkDependencies: true
      },
      expandedCategories: ['Core Modules', 'UI Components'],
      assetCategories: [
        {
          name: 'Core Modules',
          icon: '🧠',
          totalFiles: 8,
          totalSize: 125000,
          status: 'healthy',
          assets: [
            {
              name: 'NarrativeContinuityEngine.js',
              path: 'ai/NarrativeContinuityEngine.js',
              size: 25000,
              modified: '2024-01-15T10:30:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'AdaptivePersonaEngine.js',
              path: 'core/AdaptivePersonaEngine.js',
              size: 18000,
              modified: '2024-01-15T09:45:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'EmotionalIntelligence.js',
              path: 'ai/EmotionalIntelligence.js',
              size: 22000,
              modified: '2024-01-15T11:15:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'MemorySystem.js',
              path: 'core/MemorySystem.js',
              size: 15000,
              modified: '2024-01-15T08:20:00Z',
              provenanceTagged: true,
              issues: []
            }
          ]
        },
        {
          name: 'UI Components',
          icon: '🖥️',
          totalFiles: 6,
          totalSize: 95000,
          status: 'healthy',
          assets: [
            {
              name: 'PersonaVisualization.vue',
              path: 'ui/components/PersonaVisualization.vue',
              size: 35000,
              modified: '2024-01-15T14:10:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'EmotionOverlay.vue',
              path: 'ui/components/EmotionOverlay.vue',
              size: 28000,
              modified: '2024-01-15T13:25:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'StoryCohesionPanel.vue',
              path: 'ui/components/StoryCohesionPanel.vue',
              size: 22000,
              modified: '2024-01-15T12:40:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'AmbientAwarenessSystem.vue',
              path: 'ui/components/AmbientAwarenessSystem.vue',
              size: 32000,
              modified: '2024-01-15T15:55:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'FirstContactSequence.vue',
              path: 'ui/components/FirstContactSequence.vue',
              size: 45000,
              modified: '2024-01-15T16:30:00Z',
              provenanceTagged: true,
              issues: []
            }
          ]
        },
        {
          name: 'Configuration Files',
          icon: '⚙️',
          totalFiles: 12,
          totalSize: 45000,
          status: 'warning',
          assets: [
            {
              name: 'package.json',
              path: 'package.json',
              size: 2500,
              modified: '2024-01-15T07:00:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'tsconfig.json',
              path: 'tsconfig.json',
              size: 1200,
              modified: '2024-01-14T16:45:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'vite.config.js',
              path: 'vite.config.js',
              size: 1800,
              modified: '2024-01-14T15:30:00Z',
              provenanceTagged: true,
              issues: []
            }
          ]
        },
        {
          name: 'Assets & Media',
          icon: '🎨',
          totalFiles: 25,
          totalSize: 5000000,
          status: 'healthy',
          assets: [
            {
              name: 'persona-avatar.png',
              path: 'assets/persona-avatar.png',
              size: 125000,
              modified: '2024-01-10T09:15:00Z',
              provenanceTagged: true,
              issues: []
            },
            {
              name: 'emotion-icons.svg',
              path: 'assets/emotion-icons.svg',
              size: 85000,
              modified: '2024-01-12T11:20:00Z',
              provenanceTagged: true,
              issues: []
            }
          ]
        }
      ],
      scanResults: [],
      overallHealth: 98,
      provenanceCoverage: 100,
      dependencyIntegrity: 95,
      systemUptime: 345600 // 4 days in seconds
    };
  },
  computed: {
    scanStatusText() {
      const statusMap = {
        idle: 'Ready',
        scanning: 'Scanning',
        complete: 'Complete',
        error: 'Error'
      };
      return statusMap[this.scanStatus] || 'Unknown';
    }
  },
  mounted() {
    this.initializeAssetManager();
  },
  methods: {
    initializeAssetManager() {
      // Initialize asset manager state
      this.updateAssetCategories();
    },
    startFullScan() {
      this.isScanning = true;
      this.scanStatus = 'scanning';
      this.scanProgress = 0;
      this.scannedFiles = 0;
      this.scanIssues = 0;
      this.elapsedTime = 0;
      this.currentScanPhase = 'Initializing scan...';

      this.simulateScan('full');
    },
    startQuickScan() {
      this.isScanning = true;
      this.scanStatus = 'scanning';
      this.scanProgress = 0;
      this.scannedFiles = 0;
      this.scanIssues = 0;
      this.elapsedTime = 0;
      this.currentScanPhase = 'Quick scan initializing...';

      this.simulateScan('quick');
    },
    runIntegrityCheck() {
      this.isScanning = true;
      this.scanStatus = 'scanning';
      this.scanProgress = 0;
      this.scannedFiles = 0;
      this.scanIssues = 0;
      this.elapsedTime = 0;
      this.currentScanPhase = 'Integrity check starting...';

      this.simulateScan('integrity');
    },
    simulateScan(type) {
      const phases = {
        full: [
          'Initializing scan...',
          'Scanning core modules...',
          'Analyzing UI components...',
          'Checking configuration files...',
          'Verifying assets and media...',
          'Validating dependencies...',
          'Generating report...'
        ],
        quick: [
          'Quick scan initializing...',
          'Checking critical files...',
          'Validating core systems...',
          'Finalizing results...'
        ],
        integrity: [
          'Integrity check starting...',
          'Verifying file integrity...',
          'Checking provenance tags...',
          'Validating dependencies...',
          'Completing integrity check...'
        ]
      };

      const scanPhases = phases[type];
      let phaseIndex = 0;
      let fileCount = 0;
      const totalFiles = type === 'full' ? 50 : type === 'quick' ? 20 : 30;

      const scanInterval = setInterval(() => {
        this.elapsedTime += 100;

        if (phaseIndex < scanPhases.length) {
          this.currentScanPhase = scanPhases[phaseIndex];
          phaseIndex++;
        }

        // Simulate file scanning
        if (fileCount < totalFiles) {
          fileCount += Math.floor(Math.random() * 3) + 1;
          this.scannedFiles = Math.min(fileCount, totalFiles);

          // Occasionally find an issue
          if (Math.random() > 0.85) {
            this.scanIssues++;
          }
        }

        // Update progress
        this.scanProgress = (this.scannedFiles / totalFiles) * 100;

        // Complete scan
        if (this.scanProgress >= 100) {
          clearInterval(scanInterval);
          this.completeScan();
        }
      }, 200);
    },
    completeScan() {
      this.isScanning = false;
      this.scanStatus = 'complete';
      this.currentScanPhase = 'Scan complete';
      this.generateScanResults();

      this.$emit('scanComplete', {
        results: this.scanResults,
        issues: this.scanIssues,
        scannedFiles: this.scannedFiles
      });
    },
    generateScanResults() {
      this.scanResults = [];

      this.assetCategories.forEach(category => {
        category.assets.forEach(asset => {
          const result = {
            name: asset.name,
            path: asset.path,
            status: asset.issues && asset.issues.length > 0 ? 'warning' : 'healthy',
            provenanceTagged: asset.provenanceTagged,
            size: asset.size,
            issues: asset.issues || []
          };

          this.scanResults.push(result);
        });
      });
    },
    updateAssetCategories() {
      // Update category statistics based on current assets
      this.assetCategories.forEach(category => {
        const totalSize = category.assets.reduce((sum, asset) => sum + asset.size, 0);
        const hasIssues = category.assets.some(asset => asset.issues && asset.issues.length > 0);

        category.totalSize = totalSize;
        category.status = hasIssues ? 'warning' : 'healthy';
      });
    },
    toggleCategory(categoryName) {
      const index = this.expandedCategories.indexOf(categoryName);
      if (index > -1) {
        this.expandedCategories.splice(index, 1);
      } else {
        this.expandedCategories.push(categoryName);
      }
    },
    showAssetIssues(asset) {
      this.$emit('showIssues', asset);
    },
    exportResults() {
      const report = {
        timestamp: new Date().toISOString(),
        scanResults: this.scanResults,
        summary: {
          totalFiles: this.scanResults.length,
          healthy: this.scanResults.filter(r => r.status === 'healthy').length,
          warnings: this.scanResults.filter(r => r.status === 'warning').length,
          errors: this.scanResults.filter(r => r.status === 'error').length,
          provenanceTagged: this.scanResults.filter(r => r.provenanceTagged).length
        }
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset-scan-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.$emit('reportExported', report);
    },
    attemptAutoFix() {
      // Simulate auto-fixing issues
      this.$emit('autoFixAttempted');
    },
    formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    formatTime(milliseconds) {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    formatUptime(seconds) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
  }
};
</script>

<style scoped>
.asset-manager {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  max-height: 800px;
  overflow-y: auto;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.manager-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin: 0;
}

.title-icon {
  font-size: 1.5rem;
  animation: titleGlow 3s ease-in-out infinite;
}

.scan-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.scan-status.idle { background: rgba(107, 114, 128, 0.2); color: #6b7280; }
.scan-status.scanning { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.scan-status.complete { background: rgba(52, 211, 153, 0.2); color: #34d399; }
.scan-status.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: statusPulse 2s ease-in-out infinite;
}

.scan-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.scan-btn,
.quick-scan-btn,
.integrity-check-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.scan-btn {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
}

.scan-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.quick-scan-btn {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
}

.quick-scan-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.integrity-check-btn {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.integrity-check-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.scan-btn:disabled,
.quick-scan-btn:disabled,
.integrity-check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.scan-options {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.8);
  cursor: pointer;
}

.option-label input[type="checkbox"] {
  margin: 0;
}

.scan-progress {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  font-size: 0.875rem;
  color: rgba(248, 250, 252, 0.9);
  font-weight: 500;
}

.progress-percentage {
  font-size: 0.875rem;
  color: rgba(99, 102, 241, 0.8);
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
}

.detail-value {
  font-size: 0.875rem;
  color: rgba(248, 250, 252, 0.9);
  font-weight: 600;
}

.detail-value.has-issues {
  color: #fbbf24;
}

.asset-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.category-header {
  padding: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-icon {
  font-size: 1.5rem;
}

.category-details {
  flex: 1;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.category-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
}

.stat-item.status-healthy { color: #34d399; }
.stat-item.status-warning { color: #fbbf24; }
.stat-item.status-error { color: #ef4444; }

.category-toggle {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.category-content {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.asset-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.asset-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.asset-item.has-issues {
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.05);
}

.asset-item.provenance-tagged {
  border-color: rgba(52, 211, 153, 0.3);
}

.asset-item.missing {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
  opacity: 0.7;
}

.asset-info {
  flex: 1;
}

.asset-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.25rem;
}

.asset-path {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.6);
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.asset-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
}

.provenance-badge {
  color: #34d399 !important;
  font-weight: 600;
}

.asset-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.issues-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.issues-indicator:hover {
  background: rgba(251, 191, 36, 0.3);
}

.issues-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #fbbf24;
}

.issues-label {
  font-size: 0.75rem;
  color: rgba(251, 191, 36, 0.8);
}

.missing-indicator {
  padding: 0.25rem 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
}

.healthy-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 50%;
  color: #34d399;
  font-weight: 600;
}

.scan-results {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.results-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 1rem;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-stat {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(203, 213, 225, 0.7);
}

.results-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-results-btn,
.fix-issues-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-results-btn {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
}

.export-results-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.fix-issues-btn {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
}

.fix-issues-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.fix-issues-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.integrity-metrics {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metrics-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(248, 250, 252, 0.9);
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.875rem;
  color: rgba(203, 213, 225, 0.8);
  margin-bottom: 0.75rem;
}

.metric-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 3px;
  transition: width 1s ease;
}

.uptime-fill {
  background: linear-gradient(90deg, #34d399, #10b981);
}

/* Animations */
@keyframes titleGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2) hue-rotate(15deg); }
}

@keyframes statusPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Responsive design */
@media (max-width: 768px) {
  .asset-manager {
    padding: 1rem;
  }

  .control-group {
    flex-direction: column;
  }

  .scan-options {
    flex-direction: column;
    gap: 0.75rem;
  }

  .progress-details {
    flex-direction: column;
    gap: 0.75rem;
  }

  .category-stats {
    flex-direction: column;
    gap: 0.25rem;
  }

  .asset-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .results-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .title-icon,
  .status-indicator,
  .scan-btn:hover,
  .quick-scan-btn:hover,
  .integrity-check-btn:hover,
  .export-results-btn:hover,
  .fix-issues-btn:hover,
  .progress-fill,
  .metric-fill {
    animation: none;
    transition: none;
  }
}
</style>

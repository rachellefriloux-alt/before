<template>
  <div class="orchestration-dashboard">
    <div class="dashboard-header">
      <h2>System Orchestration Dashboard</h2>
      <div class="system-status" :class="systemStatusClass">
        {{ systemStatus }}
      </div>
      <div class="controls">
        <button 
          @click="refreshData" 
          class="refresh-button"
          :disabled="isRefreshing">
          <span v-if="isRefreshing">
            <i class="fa fa-spin fa-circle-notch"></i>
          </span>
          <span v-else>
            <i class="fa fa-sync"></i>
          </span>
          Refresh
        </button>
        <button 
          @click="optimizeSystem" 
          class="optimize-button"
          :disabled="isOptimizing">
          <span v-if="isOptimizing">
            <i class="fa fa-spin fa-circle-notch"></i>
          </span>
          <span v-else>
            <i class="fa fa-magic"></i>
          </span>
          Optimize System
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-section resource-section">
        <h3>Resource Utilization</h3>
        <div class="resource-gauges">
          <div class="gauge-container">
            <div class="gauge">
              <svg viewBox="0 0 100 55" class="gauge-svg">
                <path class="gauge-background" d="M5,50 A45,45 0 1,1 95,50"></path>
                <path 
                  class="gauge-value" 
                  :style="{strokeDasharray: `${cpuUtilizationPercentage * 1.4}, 141.3`}"
                  d="M5,50 A45,45 0 1,1 95,50">
                </path>
              </svg>
              <div class="gauge-percentage">{{ cpuUtilizationPercentage }}%</div>
              <div class="gauge-label">CPU</div>
            </div>
          </div>
          <div class="gauge-container">
            <div class="gauge">
              <svg viewBox="0 0 100 55" class="gauge-svg">
                <path class="gauge-background" d="M5,50 A45,45 0 1,1 95,50"></path>
                <path 
                  class="gauge-value" 
                  :style="{strokeDasharray: `${memoryUtilizationPercentage * 1.4}, 141.3`}"
                  d="M5,50 A45,45 0 1,1 95,50">
                </path>
              </svg>
              <div class="gauge-percentage">{{ memoryUtilizationPercentage }}%</div>
              <div class="gauge-label">Memory</div>
            </div>
          </div>
          <div class="active-tasks-info">
            <div class="active-tasks-count">{{ activeTasksCount }}</div>
            <div class="active-tasks-label">Active Tasks</div>
          </div>
        </div>
      </div>

      <div class="dashboard-section component-section">
        <h3>Component Status</h3>
        <div class="component-search">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="Search components..." 
            class="search-input" />
        </div>
        <div class="component-list">
          <table class="component-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Error Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="component in filteredComponents" :key="component.id" :class="getComponentRowClass(component.status)">
                <td>{{ component.id }}</td>
                <td>
                  <div class="component-status" :class="getComponentStatusClass(component.status)">
                    {{ component.status }}
                  </div>
                </td>
                <td>{{ component.priority }}</td>
                <td>{{ component.errorCount }}</td>
                <td class="component-actions">
                  <button 
                    @click="showComponentDetails(component.id)" 
                    class="action-button info-button">
                    <i class="fa fa-info-circle"></i>
                  </button>
                  <button 
                    v-if="component.status === 'ERROR'"
                    @click="repairComponent(component.id)" 
                    class="action-button repair-button">
                    <i class="fa fa-wrench"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="dashboard-section performance-section">
          <h3>Performance Analytics</h3>
          <div class="performance-stats">
            <div class="stat-card">
              <div class="stat-value">{{ successRatePercentage }}%</div>
              <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ formatTime(averageExecutionTimeMs) }}</div>
              <div class="stat-label">Avg. Execution Time</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalTasks }}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
          </div>
          <div class="task-history">
            <h4>Recent Tasks</h4>
            <table class="task-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Component</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in recentTasks" :key="task.taskId" :class="{ 'task-failed': !task.successful }">
                  <td>{{ task.taskName }}</td>
                  <td>{{ task.componentId }}</td>
                  <td>
                    <span v-if="task.successful === null">
                      <i class="fa fa-spinner fa-spin"></i> Running
                    </span>
                    <span v-else-if="task.successful">
                      <i class="fa fa-check-circle success-icon"></i> Success
                    </span>
                    <span v-else>
                      <i class="fa fa-exclamation-circle error-icon"></i> Failed
                    </span>
                  </td>
                  <td>{{ task.executionTimeMs ? formatTime(task.executionTimeMs) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-section health-section">
          <h3>System Health</h3>
          <div class="health-summary">
            <div class="health-indicator" :class="healthStatusClass">
              <i :class="healthStatusIcon"></i>
              {{ healthStatus }}
            </div>
          </div>
          <div class="error-list" v-if="recentErrors.length > 0">
            <h4>Recent Errors</h4>
            <div class="error-item" v-for="error in recentErrors" :key="error.timestamp">
              <div class="error-time">{{ formatTimestamp(error.timestamp) }}</div>
              <div class="error-message">{{ error.message }}</div>
            </div>
          </div>
          <div class="no-errors" v-else>
            <i class="fa fa-check-circle"></i>
            No recent errors detected
          </div>
        </div>
      </div>
    </div>

    <!-- Component Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Component Details: {{ selectedComponent.id }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingComponentDetails">
            <div class="loading-spinner">
              <i class="fa fa-spinner fa-spin"></i>
              Loading component details...
            </div>
          </div>
          <div v-else-if="componentDetails">
            <div class="detail-section">
              <h4>Status Information</h4>
              <table class="detail-table">
                <tr>
                  <td>Status:</td>
                  <td>
                    <span class="component-status" :class="getComponentStatusClass(componentDetails.status)">
                      {{ componentDetails.status }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Error Count:</td>
                  <td>{{ componentDetails.errorCount }}</td>
                </tr>
                <tr>
                  <td>Last Checked:</td>
                  <td>{{ formatTimestamp(componentDetails.lastChecked) }}</td>
                </tr>
                <tr v-if="componentDetails.lastErrorMessage">
                  <td>Last Error:</td>
                  <td>{{ componentDetails.lastErrorMessage }}</td>
                </tr>
              </table>
            </div>
            
            <div class="detail-section" v-if="componentPerformance">
              <h4>Performance Metrics</h4>
              <table class="detail-table">
                <tr>
                  <td>Total Tasks:</td>
                  <td>{{ componentPerformance.totalTasks }}</td>
                </tr>
                <tr>
                  <td>Success Rate:</td>
                  <td>{{ componentPerformance.successRatePercent.toFixed(1) }}%</td>
                </tr>
                <tr>
                  <td>Avg Execution Time:</td>
                  <td>{{ formatTime(componentPerformance.averageExecutionTimeMs) }}</td>
                </tr>
                <tr>
                  <td>Last Activity:</td>
                  <td>{{ componentPerformance.lastExecutionTimestamp ? formatTimestamp(componentPerformance.lastExecutionTimestamp) : 'Never' }}</td>
                </tr>
              </table>
            </div>
            
            <div class="detail-section" v-if="componentDetails.recentErrors && componentDetails.recentErrors.length">
              <h4>Recent Errors</h4>
              <div class="component-error-list">
                <div class="error-item" v-for="error in componentDetails.recentErrors" :key="error.timestamp">
                  <div class="error-time">{{ formatTimestamp(error.timestamp) }}</div>
                  <div class="error-message">{{ error.message }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="error-message">
              Failed to load component details.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button" @click="closeModal">Close</button>
          <button 
            v-if="selectedComponent.status === 'ERROR'"
            class="repair-button" 
            @click="repairComponent(selectedComponent.id)">
            <i class="fa fa-wrench"></i> Repair Component
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrchestrationDashboard",
  
  data() {
    return {
      // System Status
      systemStatus: "INITIALIZING",
      
      // Resource Utilization
      cpuUtilizationPercentage: 0,
      memoryUtilizationPercentage: 0,
      activeTasksCount: 0,
      
      // Component Status
      components: [],
      searchTerm: "",
      
      // Performance Analytics
      successRatePercentage: 0,
      averageExecutionTimeMs: 0,
      totalTasks: 0,
      recentTasks: [],
      
      // Health
      healthStatus: "UNKNOWN",
      recentErrors: [],
      
      // UI State
      isRefreshing: false,
      isOptimizing: false,
      showModal: false,
      selectedComponent: {},
      componentDetails: null,
      componentPerformance: null,
      isLoadingComponentDetails: false,
      
      // Refresh interval
      refreshInterval: null
    };
  },
  
  computed: {
    systemStatusClass() {
      switch (this.systemStatus) {
        case "RUNNING":
          return "status-healthy";
        case "INITIALIZING":
          return "status-warning";
        case "SHUTTING_DOWN":
          return "status-warning";
        case "ERROR":
          return "status-error";
        default:
          return "status-unknown";
      }
    },
    
    healthStatusClass() {
      switch (this.healthStatus) {
        case "HEALTHY":
          return "status-healthy";
        case "DEGRADED":
          return "status-warning";
        case "WARNING":
          return "status-warning";
        case "ERROR":
          return "status-error";
        default:
          return "status-unknown";
      }
    },
    
    healthStatusIcon() {
      switch (this.healthStatus) {
        case "HEALTHY":
          return "fa fa-check-circle";
        case "DEGRADED":
        case "WARNING":
          return "fa fa-exclamation-triangle";
        case "ERROR":
          return "fa fa-times-circle";
        default:
          return "fa fa-question-circle";
      }
    },
    
    filteredComponents() {
      if (!this.searchTerm) {
        return this.components;
      }
      
      const search = this.searchTerm.toLowerCase();
      return this.components.filter(component => 
        component.id.toLowerCase().includes(search)
      );
    }
  },
  
  created() {
    this.refreshData();
    
    // Setup auto-refresh every 10 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshData(true);
    }, 10000);
  },
  
  beforeDestroy() {
    clearInterval(this.refreshInterval);
  },
  
  methods: {
    async refreshData(silent = false) {
      if (this.isRefreshing) return;
      
      if (!silent) {
        this.isRefreshing = true;
      }
      
      try {
        // Fetch system state from orchestration controller
        await this.fetchSystemState();
        
        // Fetch resource utilization
        await this.fetchResourceUtilization();
        
        // Fetch component statuses
        await this.fetchComponentStatuses();
        
        // Fetch performance analytics
        await this.fetchPerformanceAnalytics();
        
        // Fetch system health
        await this.fetchSystemHealth();
      } catch (error) {
        console.error("Error refreshing dashboard data:", error);
      } finally {
        if (!silent) {
          this.isRefreshing = false;
        }
      }
    },
    
    async fetchSystemState() {
      // This would call the orchestration controller API
      // For demo, we'll simulate with random data
      const states = ["INITIALIZING", "RUNNING", "ERROR"];
      const weights = [0.05, 0.9, 0.05];
      
      this.systemStatus = this.getWeightedRandomItem(states, weights);
    },
    
    async fetchResourceUtilization() {
      // This would call the orchestration controller API
      // For demo, we'll simulate with random data
      this.cpuUtilizationPercentage = Math.floor(Math.random() * 80) + 10;
      this.memoryUtilizationPercentage = Math.floor(Math.random() * 70) + 20;
      this.activeTasksCount = Math.floor(Math.random() * 15) + 1;
    },
    
    async fetchComponentStatuses() {
      // This would call the orchestration controller API
      // For demo, we'll generate some sample components
      const componentCount = 8;
      const statuses = ["RUNNING", "WARNING", "ERROR", "INACTIVE"];
      const statusWeights = [0.7, 0.15, 0.1, 0.05];
      
      const components = [];
      
      for (let i = 0; i < componentCount; i++) {
        const componentId = this.getComponentName(i);
        const status = this.getWeightedRandomItem(statuses, statusWeights);
        const errorCount = status === "ERROR" ? Math.floor(Math.random() * 8) + 3 :
                          status === "WARNING" ? Math.floor(Math.random() * 3) + 1 : 0;
        
        components.push({
          id: componentId,
          status: status,
          priority: Math.floor(Math.random() * 3) + 1,
          errorCount: errorCount
        });
      }
      
      this.components = components;
    },
    
    async fetchPerformanceAnalytics() {
      // This would call the orchestration controller API
      // For demo, we'll simulate with random data
      this.successRatePercentage = Math.floor(Math.random() * 15) + 85;
      this.averageExecutionTimeMs = Math.floor(Math.random() * 200) + 50;
      this.totalTasks = Math.floor(Math.random() * 1000) + 500;
      
      const taskCount = 6;
      const tasks = [];
      
      for (let i = 0; i < taskCount; i++) {
        const successful = Math.random() > 0.2;
        const executionTime = successful ? Math.floor(Math.random() * 300) + 50 : Math.floor(Math.random() * 800) + 200;
        
        tasks.push({
          taskId: `task-${i}`,
          taskName: this.getTaskName(i),
          componentId: this.getComponentName(Math.floor(Math.random() * 8)),
          successful: i === 0 ? null : successful,
          executionTimeMs: i === 0 ? null : executionTime
        });
      }
      
      this.recentTasks = tasks;
    },
    
    async fetchSystemHealth() {
      // This would call the orchestration controller API
      // For demo, we'll simulate with random data
      const statuses = ["HEALTHY", "DEGRADED", "WARNING", "ERROR"];
      const statusWeights = [0.7, 0.15, 0.1, 0.05];
      
      this.healthStatus = this.getWeightedRandomItem(statuses, statusWeights);
      
      const errorCount = this.healthStatus === "ERROR" ? Math.floor(Math.random() * 3) + 2 :
                        this.healthStatus === "WARNING" ? Math.floor(Math.random() * 2) + 1 :
                        this.healthStatus === "DEGRADED" ? Math.floor(Math.random() * 1) + 1 : 0;
                        
      const errors = [];
      for (let i = 0; i < errorCount; i++) {
        errors.push({
          timestamp: Date.now() - (Math.random() * 3600000),
          message: this.getErrorMessage(i)
        });
      }
      
      this.recentErrors = errors;
    },
    
    async optimizeSystem() {
      if (this.isOptimizing) return;
      
      this.isOptimizing = true;
      
      try {
        // This would call the orchestration controller's optimizeSystem method
        // For demo, we'll simulate optimization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate improved metrics after optimization
        this.cpuUtilizationPercentage = Math.max(5, this.cpuUtilizationPercentage - 15);
        this.memoryUtilizationPercentage = Math.max(10, this.memoryUtilizationPercentage - 20);
        this.successRatePercentage = Math.min(99.9, this.successRatePercentage + 5);
        this.averageExecutionTimeMs = Math.max(30, this.averageExecutionTimeMs - 40);
        
        // Simulate fixing some components
        this.components = this.components.map(component => {
          if (component.status === "ERROR" && Math.random() > 0.3) {
            return { ...component, status: "RUNNING", errorCount: 0 };
          }
          if (component.status === "WARNING" && Math.random() > 0.5) {
            return { ...component, status: "RUNNING", errorCount: 0 };
          }
          return component;
        });
        
        // Update health status
        if (this.healthStatus !== "HEALTHY") {
          this.healthStatus = "HEALTHY";
          this.recentErrors = [];
        }
        
        // Show success message
        this.$toast.success("System optimized successfully!");
      } catch (error) {
        console.error("Error optimizing system:", error);
        this.$toast.error("Failed to optimize system");
      } finally {
        this.isOptimizing = false;
      }
    },
    
    async repairComponent(componentId) {
      try {
        // This would call the orchestration controller's repairComponent method
        // For demo, we'll simulate repair
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update component status
        this.components = this.components.map(component => {
          if (component.id === componentId) {
            return { ...component, status: "RUNNING", errorCount: 0 };
          }
          return component;
        });
        
        if (this.selectedComponent.id === componentId) {
          this.selectedComponent = { 
            ...this.selectedComponent, 
            status: "RUNNING", 
            errorCount: 0 
          };
          
          if (this.componentDetails) {
            this.componentDetails = { 
              ...this.componentDetails, 
              status: "RUNNING", 
              errorCount: 0,
              lastErrorMessage: null,
              recentErrors: []
            };
          }
        }
        
        // Show success message
        this.$toast.success(`Component ${componentId} repaired successfully`);
        
        // Refresh system health
        await this.fetchSystemHealth();
      } catch (error) {
        console.error(`Error repairing component ${componentId}:`, error);
        this.$toast.error(`Failed to repair component ${componentId}`);
      }
    },
    
    async showComponentDetails(componentId) {
      this.selectedComponent = this.components.find(c => c.id === componentId) || { id: componentId };
      this.showModal = true;
      this.componentDetails = null;
      this.componentPerformance = null;
      this.isLoadingComponentDetails = true;
      
      try {
        // This would call the orchestration controller's getComponentHealth and getComponentPerformanceReport methods
        // For demo, we'll simulate the data
        await this.fetchComponentDetails(componentId);
      } catch (error) {
        console.error(`Error fetching details for component ${componentId}:`, error);
      } finally {
        this.isLoadingComponentDetails = false;
      }
    },
    
    async fetchComponentDetails(componentId) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const component = this.components.find(c => c.id === componentId);
      
      if (!component) {
        return;
      }
      
      // Generate health details
      this.componentDetails = {
        componentId: componentId,
        status: component.status,
        errorCount: component.errorCount,
        lastChecked: Date.now() - (Math.random() * 120000),
        lastErrorMessage: component.status === "ERROR" || component.status === "WARNING" 
                        ? this.getErrorMessage(Math.floor(Math.random() * 5))
                        : null,
        recentErrors: []
      };
      
      // Add recent errors if the component has errors
      if (component.errorCount > 0) {
        for (let i = 0; i < component.errorCount && i < 5; i++) {
          this.componentDetails.recentErrors.push({
            timestamp: Date.now() - (Math.random() * 3600000),
            message: this.getErrorMessage(i)
          });
        }
      }
      
      // Generate performance metrics
      const successRate = component.status === "ERROR" ? Math.floor(Math.random() * 40) + 50 :
                         component.status === "WARNING" ? Math.floor(Math.random() * 20) + 70 :
                         Math.floor(Math.random() * 10) + 90;
                         
      const avgTime = component.status === "ERROR" ? Math.floor(Math.random() * 300) + 200 :
                     component.status === "WARNING" ? Math.floor(Math.random() * 200) + 100 :
                     Math.floor(Math.random() * 100) + 50;
      
      this.componentPerformance = {
        componentId: componentId,
        totalTasks: Math.floor(Math.random() * 500) + 100,
        successfulTasks: Math.floor((Math.random() * 500 + 100) * (successRate / 100)),
        failedTasks: Math.floor((Math.random() * 500 + 100) * ((100 - successRate) / 100)),
        successRatePercent: successRate,
        averageExecutionTimeMs: avgTime,
        lastExecutionTimestamp: Date.now() - (Math.random() * 600000),
        recentTasks: []
      };
    },
    
    closeModal() {
      this.showModal = false;
    },
    
    getComponentStatusClass(status) {
      switch (status) {
        case "RUNNING":
          return "status-healthy";
        case "WARNING":
          return "status-warning";
        case "ERROR":
          return "status-error";
        case "INACTIVE":
          return "status-inactive";
        default:
          return "status-unknown";
      }
    },
    
    getComponentRowClass(status) {
      switch (status) {
        case "ERROR":
          return "row-error";
        case "WARNING":
          return "row-warning";
        default:
          return "";
      }
    },
    
    formatTime(milliseconds) {
      if (milliseconds < 1000) {
        return `${milliseconds}ms`;
      }
      return `${(milliseconds / 1000).toFixed(2)}s`;
    },
    
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
    
    getWeightedRandomItem(items, weights) {
      const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < items.length; i++) {
        if (random < weights[i]) {
          return items[i];
        }
        random -= weights[i];
      }
      
      return items[0];
    },
    
    getComponentName(index) {
      const components = [
        "memory-manager",
        "learning-engine",
        "value-system",
        "visual-customizer",
        "research-service",
        "creative-expression",
        "expert-knowledge",
        "device-transfer"
      ];
      
      return index < components.length ? components[index] : `component-${index}`;
    },
    
    getTaskName(index) {
      const tasks = [
        "Process User Input",
        "Generate Response",
        "Learn From Interaction",
        "Update Values System",
        "Research Information",
        "Optimize Memory",
        "Generate Creative Content",
        "Transfer User Data",
        "Apply Visual Theme",
        "Run Ethical Analysis"
      ];
      
      return index < tasks.length ? tasks[index] : `Task ${index}`;
    },
    
    getErrorMessage(index) {
      const errors = [
        "Failed to allocate sufficient memory for operation",
        "Component timeout while processing request",
        "Network error during data transfer",
        "Invalid input parameter detected",
        "Resource conflict detected",
        "Security constraint violation",
        "Operation aborted due to system state change",
        "Maximum retry attempts exceeded"
      ];
      
      return index < errors.length ? errors[index] : `Error #${index}`;
    }
  }
};
</script>

<style scoped>
.orchestration-dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.system-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.controls button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.refresh-button {
  background-color: #f0f0f0;
  color: #333;
}

.refresh-button:hover {
  background-color: #e0e0e0;
}

.optimize-button {
  background-color: #4c6ef5;
  color: white;
}

.optimize-button:hover {
  background-color: #3b5bdb;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dashboard-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.dashboard-row {
  display: flex;
  gap: 1.5rem;
}

.dashboard-row > div {
  flex: 1;
}

.resource-gauges {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 1rem;
}

.gauge-container {
  text-align: center;
  width: 33%;
}

.gauge {
  position: relative;
  margin: 0 auto;
  width: 120px;
  height: 80px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.gauge-background {
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 10;
}

.gauge-value {
  fill: none;
  stroke-width: 10;
  stroke-dasharray: 0, 141.3;
  transition: stroke-dasharray 1s ease;
}

.gauge-percentage {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.gauge-label {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.active-tasks-info {
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.active-tasks-count {
  font-size: 2rem;
  font-weight: 600;
  color: #4c6ef5;
}

.active-tasks-label {
  font-size: 0.9rem;
  color: #666;
}

/* CPU utilization color */
.gauge-svg:nth-child(1) .gauge-value {
  stroke: #4c6ef5;
}

/* Memory utilization color */
.gauge-svg:nth-child(2) .gauge-value {
  stroke: #5f3dc4;
}

.component-search {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.component-table {
  width: 100%;
  border-collapse: collapse;
}

.component-table th,
.component-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.component-table th {
  font-weight: 500;
  color: #666;
  white-space: nowrap;
}

.component-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.component-actions {
  white-space: nowrap;
}

.action-button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.25rem;
  background-color: transparent;
}

.info-button {
  color: #4c6ef5;
}

.info-button:hover {
  background-color: rgba(76, 110, 245, 0.1);
}

.repair-button {
  color: #f03e3e;
}

.repair-button:hover {
  background-color: rgba(240, 62, 62, 0.1);
}

.row-error {
  background-color: rgba(240, 62, 62, 0.05);
}

.row-warning {
  background-color: rgba(255, 187, 0, 0.05);
}

.performance-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  width: 30%;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.task-table th,
.task-table td {
  padding: 0.6rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.task-table th {
  font-weight: 500;
  color: #666;
}

.task-failed {
  background-color: rgba(240, 62, 62, 0.05);
}

.success-icon {
  color: #40c057;
}

.error-icon {
  color: #f03e3e;
}

.health-summary {
  text-align: center;
  margin-bottom: 1.5rem;
}

.health-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
}

.error-list {
  max-height: 220px;
  overflow-y: auto;
}

.error-item {
  padding: 0.75rem;
  border-left: 3px solid #f03e3e;
  background-color: rgba(240, 62, 62, 0.05);
  margin-bottom: 0.75rem;
  border-radius: 0 4px 4px 0;
}

.error-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.error-message {
  font-size: 0.9rem;
}

.no-errors {
  text-align: center;
  padding: 2rem 0;
  color: #40c057;
  font-weight: 500;
}

.no-errors i {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Status colors */
.status-healthy {
  background-color: rgba(64, 192, 87, 0.1);
  color: #2b8a3e;
}

.status-warning {
  background-color: rgba(255, 187, 0, 0.1);
  color: #e67700;
}

.status-error {
  background-color: rgba(240, 62, 62, 0.1);
  color: #c92a2a;
}

.status-inactive {
  background-color: rgba(134, 142, 150, 0.1);
  color: #495057;
}

.status-unknown {
  background-color: rgba(134, 142, 150, 0.1);
  color: #495057;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-footer button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.detail-table td:first-child {
  font-weight: 500;
  width: 40%;
}

.loading-spinner {
  text-align: center;
  padding: 2rem 0;
  color: #666;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #4c6ef5;
}

.component-error-list {
  max-height: 150px;
  overflow-y: auto;
}

/* Media queries */
@media (max-width: 1200px) {
  .dashboard-row {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .resource-gauges {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .gauge-container {
    width: 100%;
  }
  
  .performance-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-card {
    width: 100%;
  }
}
</style>

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * AutomationManager - Manages complex automation workflows across applications
 * Handles creation, execution, and management of cross-app workflows
 */

package com.sallie.device.phone.managers

import com.sallie.device.phone.models.*
import com.sallie.core.utils.Logger
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import java.util.concurrent.ConcurrentHashMap

/**
 * Manager for app automation
 */
class AutomationManager {
    private val logger = Logger.getLogger("AutomationManager")
    
    private val _automationEvents = MutableSharedFlow<AutomationEvent>()
    val automationEvents: SharedFlow<AutomationEvent> = _automationEvents.asSharedFlow()
    
    private val workflows = ConcurrentHashMap<String, CrossAppWorkflow>()
    private val runningWorkflows = ConcurrentHashMap<String, Boolean>()
    
    /**
     * Initialize the manager
     */
    suspend fun initialize() {
        logger.info("Initializing AutomationManager")
        // Load any saved workflows
        loadSavedWorkflows()
    }
    
    /**
     * Shutdown the manager
     */
    suspend fun shutdown() {
        logger.info("Shutting down AutomationManager")
        
        // Stop all running workflows
        stopAllWorkflows()
        
        // Save workflows
        saveWorkflows()
    }
    
    /**
     * Load saved workflows
     */
    private fun loadSavedWorkflows() {
        // In a real implementation, this would load saved workflows from storage
        logger.debug("Loading saved workflows")
    }
    
    /**
     * Save workflows
     */
    private fun saveWorkflows() {
        // In a real implementation, this would save workflows to storage
        logger.debug("Saving workflows")
    }
    
    /**
     * Create a new workflow
     */
    fun createWorkflow(name: String, description: String? = null, steps: List<WorkflowStep>): CrossAppWorkflow {
        val workflow = CrossAppWorkflow(
            name = name,
            description = description,
            steps = steps
        )
        
        workflows[workflow.id] = workflow
        logger.info("Created new workflow: $name (${workflow.id})")
        return workflow
    }
    
    /**
     * Get a workflow by ID
     */
    fun getWorkflow(id: String): CrossAppWorkflow? {
        return workflows[id]
    }
    
    /**
     * Get all workflows
     */
    fun getAllWorkflows(): List<CrossAppWorkflow> {
        return workflows.values.toList()
    }
    
    /**
     * Update a workflow
     */
    fun updateWorkflow(id: String, name: String? = null, description: String? = null, steps: List<WorkflowStep>? = null): CrossAppWorkflow? {
        val workflow = workflows[id] ?: return null
        
        val updatedWorkflow = workflow.copy(
            name = name ?: workflow.name,
            description = description ?: workflow.description,
            steps = steps ?: workflow.steps
        )
        
        workflows[id] = updatedWorkflow
        logger.info("Updated workflow: ${updatedWorkflow.name} ($id)")
        return updatedWorkflow
    }
    
    /**
     * Delete a workflow
     */
    fun deleteWorkflow(id: String): Boolean {
        if (runningWorkflows.containsKey(id)) {
            logger.warn("Cannot delete workflow $id as it is currently running")
            return false
        }
        
        val removed = workflows.remove(id)
        if (removed != null) {
            logger.info("Deleted workflow: ${removed.name} ($id)")
            return true
        }
        
        return false
    }
    
    /**
     * Execute a workflow
     */
    suspend fun executeWorkflow(
        workflow: CrossAppWorkflow, 
        phoneControlSystem: com.sallie.device.phone.PhoneControlSystem
    ): Boolean {
        return withContext(Dispatchers.IO) {
            if (runningWorkflows.containsKey(workflow.id)) {
                logger.warn("Workflow ${workflow.name} (${workflow.id}) is already running")
                return@withContext false
            }
            
            runningWorkflows[workflow.id] = true
            logger.info("Executing workflow: ${workflow.name} (${workflow.id})")
            
            try {
                // Emit workflow started event
                _automationEvents.emit(
                    AutomationEvent.WorkflowStarted(
                        workflowId = workflow.id,
                        workflowName = workflow.name
                    )
                )
                
                var success = true
                var stepCount = 0
                
                // Execute each step in the workflow
                for (step in workflow.steps) {
                    stepCount++
                    
                    // Emit step started event
                    _automationEvents.emit(
                        AutomationEvent.WorkflowStepStarted(
                            workflowId = workflow.id,
                            workflowName = workflow.name,
                            stepNumber = stepCount,
                            totalSteps = workflow.steps.size
                        )
                    )
                    
                    val stepSuccess = executeWorkflowStep(step, phoneControlSystem)
                    
                    // Emit step completed event
                    _automationEvents.emit(
                        AutomationEvent.WorkflowStepCompleted(
                            workflowId = workflow.id,
                            workflowName = workflow.name,
                            stepNumber = stepCount,
                            totalSteps = workflow.steps.size,
                            success = stepSuccess
                        )
                    )
                    
                    if (!stepSuccess) {
                        logger.warn("Step $stepCount failed in workflow ${workflow.name}")
                        success = false
                        
                        if (!workflow.autoRetry) {
                            break
                        } else {
                            logger.info("Auto-retrying step $stepCount")
                            
                            // Add retry logic here if needed
                            val retrySuccess = executeWorkflowStep(step, phoneControlSystem)
                            
                            if (!retrySuccess) {
                                success = false
                                break
                            } else {
                                success = true
                            }
                        }
                    }
                    
                    // Small delay between steps
                    delay(200)
                }
                
                // Emit workflow completed event
                _automationEvents.emit(
                    AutomationEvent.WorkflowCompleted(
                        workflowId = workflow.id,
                        workflowName = workflow.name,
                        success = success
                    )
                )
                
                runningWorkflows.remove(workflow.id)
                logger.info("Workflow ${workflow.name} completed with ${if (success) "success" else "failure"}")
                
                return@withContext success
            } catch (e: Exception) {
                logger.error("Error executing workflow ${workflow.name}: ${e.message}", e)
                
                // Emit workflow error event
                _automationEvents.emit(
                    AutomationEvent.WorkflowError(
                        workflowId = workflow.id,
                        workflowName = workflow.name,
                        error = e
                    )
                )
                
                runningWorkflows.remove(workflow.id)
                return@withContext false
            }
        }
    }
    
    /**
     * Execute a single workflow step
     */
    private suspend fun executeWorkflowStep(
        step: WorkflowStep, 
        phoneControlSystem: com.sallie.device.phone.PhoneControlSystem
    ): Boolean {
        return when (step) {
            is WorkflowStep.LaunchAppStep -> {
                logger.debug("Executing LaunchAppStep for ${step.packageName}")
                phoneControlSystem.launchApp(step.packageName, step.launchParams)
            }
            is WorkflowStep.AppActionStep -> {
                logger.debug("Executing AppActionStep for ${step.packageName}")
                phoneControlSystem.sendAppAction(step.packageName, step.action)
            }
            is WorkflowStep.AccessibilityStep -> {
                logger.debug("Executing AccessibilityStep")
                phoneControlSystem.performAccessibilityAction(step.action)
            }
            is WorkflowStep.WaitStep -> {
                logger.debug("Executing WaitStep for ${step.durationMs}ms")
                delay(step.durationMs)
                true
            }
            is WorkflowStep.NotificationStep -> {
                logger.debug("Executing NotificationStep for notification ${step.notificationId}")
                if (step.notificationId != null) {
                    phoneControlSystem.interactWithNotification(step.notificationId, step.action)
                } else {
                    false
                }
            }
        }
    }
    
    /**
     * Stop a running workflow
     */
    suspend fun stopWorkflow(id: String): Boolean {
        if (!runningWorkflows.containsKey(id)) {
            logger.warn("Workflow $id is not running")
            return false
        }
        
        runningWorkflows.remove(id)
        
        // Emit workflow stopped event
        val workflow = workflows[id]
        if (workflow != null) {
            _automationEvents.emit(
                AutomationEvent.WorkflowStopped(
                    workflowId = id,
                    workflowName = workflow.name
                )
            )
            
            logger.info("Stopped workflow: ${workflow.name} ($id)")
        } else {
            logger.info("Stopped workflow with ID: $id")
        }
        
        return true
    }
    
    /**
     * Stop all running workflows
     */
    private suspend fun stopAllWorkflows() {
        val runningIds = runningWorkflows.keys().toList()
        
        for (id in runningIds) {
            stopWorkflow(id)
        }
    }
    
    /**
     * Check if a workflow is running
     */
    fun isWorkflowRunning(id: String): Boolean {
        return runningWorkflows.containsKey(id)
    }
    
    /**
     * Get all running workflows
     */
    fun getRunningWorkflows(): List<CrossAppWorkflow> {
        return runningWorkflows.keys().toList().mapNotNull { id -> workflows[id] }
    }
}

/**
 * Events emitted by the AutomationManager
 */
sealed class AutomationEvent {
    
    data class WorkflowStarted(
        val workflowId: String,
        val workflowName: String
    ) : AutomationEvent()
    
    data class WorkflowStepStarted(
        val workflowId: String,
        val workflowName: String,
        val stepNumber: Int,
        val totalSteps: Int
    ) : AutomationEvent()
    
    data class WorkflowStepCompleted(
        val workflowId: String,
        val workflowName: String,
        val stepNumber: Int,
        val totalSteps: Int,
        val success: Boolean
    ) : AutomationEvent()
    
    data class WorkflowCompleted(
        val workflowId: String,
        val workflowName: String,
        val success: Boolean
    ) : AutomationEvent()
    
    data class WorkflowStopped(
        val workflowId: String,
        val workflowName: String
    ) : AutomationEvent()
    
    data class WorkflowError(
        val workflowId: String,
        val workflowName: String,
        val error: Exception
    ) : AutomationEvent()
}

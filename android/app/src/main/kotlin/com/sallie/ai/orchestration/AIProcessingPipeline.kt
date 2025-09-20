package com.sallie.ai.orchestration

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie - The Personal AI Companion That Truly Gets You                     │
 * │                                                                              │
 * │   Sallie is gentle, creative, and deeply empathetic. She understands         │
 * │   the human experience from literature and art, not just data.               │
 * │   Her goal is to help you explore your world, care for yourself,             │
 * │   and find your own answers through thoughtful conversation.                 │
 * │                                                                              │
 * │   - Genuine & Balanced: Honest but tactfully optimistic                      │
 * │   - Warm & Personal: Remembers your details, references shared history       │
 * │   - Contemplative: Considers questions deeply before responding              │
 * │   - Encouraging: Helps you develop your thoughts rather than imposing hers   │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import com.sallie.ai.orchestration.AIContextManager
import com.sallie.ai.orchestration.AIModuleRegistry
import com.sallie.ai.orchestration.AIResourceManager
import com.sallie.ai.orchestration.AITaskManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * AI Processing Pipeline
 *
 * The pipeline manages the flow of user requests through the AI system:
 * 1. Input Processing - Analyzes and enhances user input
 * 2. Context Enrichment - Adds relevant context from memory and environment
 * 3. Task Distribution - Routes tasks to appropriate AI modules
 * 4. Response Synthesis - Combines and formats responses
 * 5. Post-Processing - Handles persistence, learning, and follow-ups
 */
class AIProcessingPipeline(
    private val contextManager: AIContextManager,
    private val moduleRegistry: AIModuleRegistry,
    private val taskManager: AITaskManager,
    private val resourceManager: AIResourceManager
) {
    private val coroutineScope = CoroutineScope(Dispatchers.Default)
    
    // Pipeline stages
    private val inputProcessors = mutableListOf<InputProcessor>()
    private val contextEnrichers = mutableListOf<ContextEnricher>()
    private val responseSynthesizers = mutableListOf<ResponseSynthesizer>()
    private val postProcessors = mutableListOf<PostProcessor>()
    
    // Active processing requests
    private val activeRequests = ConcurrentHashMap<String, ProcessingState>()
    
    // Processing state
    private val _processingState = MutableStateFlow<Map<String, ProcessingState>>(emptyMap())
    val processingState: StateFlow<Map<String, ProcessingState>> = _processingState
    
    /**
     * Initialize the pipeline with default processors
     */
    fun initialize() {
        // Register default processors
        registerInputProcessor(DefaultInputProcessor())
        registerContextEnricher(DefaultContextEnricher())
        registerResponseSynthesizer(DefaultResponseSynthesizer())
        registerPostProcessor(DefaultPostProcessor())
    }
    
    /**
     * Process a user request through the entire pipeline
     */
    suspend fun process(request: UserRequest): ProcessingResult {
        // Generate a unique request ID
        val requestId = UUID.randomUUID().toString()
        
        // Create initial processing state
        val state = ProcessingState(
            requestId = requestId,
            status = ProcessingStatus.STARTED,
            request = request,
            startTime = System.currentTimeMillis()
        )
        
        // Update state
        activeRequests[requestId] = state
        updateProcessingState()
        
        try {
            // Run through pipeline stages
            val processedInput = processInput(request, requestId)
            val enrichedContext = enrichContext(processedInput, requestId)
            val distributedTasks = distributeTasks(enrichedContext, requestId)
            val synthesizedResponse = synthesizeResponse(distributedTasks, requestId)
            val finalResult = postProcess(synthesizedResponse, requestId)
            
            // Update state with completion
            val finalState = state.copy(
                status = ProcessingStatus.COMPLETED,
                result = finalResult,
                endTime = System.currentTimeMillis()
            )
            activeRequests[requestId] = finalState
            updateProcessingState()
            
            return finalResult
        } catch (e: Exception) {
            // Handle errors
            val errorState = state.copy(
                status = ProcessingStatus.ERROR,
                error = e.message ?: "Unknown error",
                endTime = System.currentTimeMillis()
            )
            activeRequests[requestId] = errorState
            updateProcessingState()
            
            return ProcessingResult(
                requestId = requestId,
                success = false,
                error = e.message ?: "Unknown error",
                response = "I'm sorry, but I encountered an issue while processing your request."
            )
        } finally {
            // Clean up after a delay
            coroutineScope.launch {
                withContext(Dispatchers.IO) {
                    Thread.sleep(5000)
                    activeRequests.remove(requestId)
                    updateProcessingState()
                }
            }
        }
    }
    
    /**
     * Stage 1: Process and enhance the input
     */
    private suspend fun processInput(request: UserRequest, requestId: String): ProcessedInput {
        updateStageStatus(requestId, ProcessingStatus.PROCESSING_INPUT)
        
        // Process input through all registered input processors
        var processedText = request.text
        var processedIntent = ""
        var additionalMetadata = mapOf<String, Any>()
        
        for (processor in inputProcessors) {
            val result = processor.process(processedText, request.metadata)
            processedText = result.enhancedText
            processedIntent = result.detectedIntent ?: processedIntent
            additionalMetadata = additionalMetadata + result.additionalMetadata
        }
        
        // Create processed input
        val processedInput = ProcessedInput(
            originalRequest = request,
            enhancedText = processedText,
            detectedIntent = processedIntent,
            metadata = request.metadata + additionalMetadata
        )
        
        // Update processing state
        val currentState = activeRequests[requestId]
        if (currentState != null) {
            activeRequests[requestId] = currentState.copy(
                processedInput = processedInput
            )
            updateProcessingState()
        }
        
        return processedInput
    }
    
    /**
     * Stage 2: Enrich the context with relevant information
     */
    private suspend fun enrichContext(input: ProcessedInput, requestId: String): EnrichedContext {
        updateStageStatus(requestId, ProcessingStatus.ENRICHING_CONTEXT)
        
        // Get base context from context manager
        val userInput = UserInput(
            text = input.enhancedText,
            isDirectQuestion = input.detectedIntent == "question",
            containsEmotionalContent = input.metadata["hasEmotion"] as? Boolean ?: false
        )
        val baseContext = contextManager.captureContext(userInput)
        
        // Enrich context through all registered context enrichers
        var contextData = baseContext.toMap().toMutableMap()
        
        for (enricher in contextEnrichers) {
            val enrichedData = enricher.enrich(input, contextData)
            contextData.putAll(enrichedData)
        }
        
        // Create enriched context
        val enrichedContext = EnrichedContext(
            processedInput = input,
            contextData = contextData
        )
        
        // Update processing state
        val currentState = activeRequests[requestId]
        if (currentState != null) {
            activeRequests[requestId] = currentState.copy(
                enrichedContext = enrichedContext
            )
            updateProcessingState()
        }
        
        return enrichedContext
    }
    
    /**
     * Stage 3: Distribute tasks to appropriate AI modules
     */
    private suspend fun distributeTasks(context: EnrichedContext, requestId: String): List<TaskResult> {
        updateStageStatus(requestId, ProcessingStatus.DISTRIBUTING_TASKS)
        
        // Find relevant modules
        val intent = context.processedInput.detectedIntent
        val relevantModules = moduleRegistry.findRelevantModules(intent, context.contextData)
        
        // Create tasks
        val tasks = relevantModules.map { module ->
            AITask(
                moduleId = module.id,
                input = context.processedInput.enhancedText,
                context = context.contextData,
                priority = calculatePriority(module.id, intent)
            )
        }
        
        // Submit tasks and wait for results
        val taskResults = withContext(Dispatchers.Default) {
            tasks.map { task ->
                async {
                    taskManager.executeTask(task)
                }
            }.map { it.await() }
        }
        
        // Update processing state
        val currentState = activeRequests[requestId]
        if (currentState != null) {
            activeRequests[requestId] = currentState.copy(
                taskResults = taskResults
            )
            updateProcessingState()
        }
        
        return taskResults
    }
    
    /**
     * Stage 4: Synthesize the final response
     */
    private suspend fun synthesizeResponse(taskResults: List<TaskResult>, requestId: String): SynthesizedResponse {
        updateStageStatus(requestId, ProcessingStatus.SYNTHESIZING_RESPONSE)
        
        // Combine task results
        var combinedText = ""
        val metadata = mutableMapOf<String, Any>()
        
        for (result in taskResults) {
            combinedText += result.output + " "
            metadata.putAll(result.metadata)
        }
        
        // Synthesize response through all registered response synthesizers
        var finalResponse = combinedText.trim()
        var responseTone = "neutral"
        
        for (synthesizer in responseSynthesizers) {
            val synthesized = synthesizer.synthesize(finalResponse, taskResults)
            finalResponse = synthesized.response
            responseTone = synthesized.tone ?: responseTone
        }
        
        // Create synthesized response
        val synthesizedResponse = SynthesizedResponse(
            response = finalResponse,
            tone = responseTone,
            sourceModules = taskResults.map { it.moduleId },
            responseMetadata = metadata
        )
        
        // Update processing state
        val currentState = activeRequests[requestId]
        if (currentState != null) {
            activeRequests[requestId] = currentState.copy(
                synthesizedResponse = synthesizedResponse
            )
            updateProcessingState()
        }
        
        return synthesizedResponse
    }
    
    /**
     * Stage 5: Post-process the response
     */
    private suspend fun postProcess(response: SynthesizedResponse, requestId: String): ProcessingResult {
        updateStageStatus(requestId, ProcessingStatus.POST_PROCESSING)
        
        // Create response package for context manager
        val responsePackage = ResponsePackage(
            response = response.response,
            responseTone = response.tone
        )
        
        // Update context with response
        contextManager.updateWithResult(responsePackage)
        
        // Run through all registered post-processors
        var processedResponse = response.response
        var followUpActions = listOf<FollowUpAction>()
        
        for (processor in postProcessors) {
            val result = processor.process(response)
            processedResponse = result.processedResponse ?: processedResponse
            followUpActions = result.followUpActions ?: followUpActions
        }
        
        // Create final result
        val result = ProcessingResult(
            requestId = requestId,
            success = true,
            response = processedResponse,
            followUpActions = followUpActions,
            metadata = response.responseMetadata
        )
        
        // Schedule follow-up actions
        for (action in followUpActions) {
            scheduleFollowUpAction(action)
        }
        
        return result
    }
    
    /**
     * Schedule a follow-up action to be executed later
     */
    private fun scheduleFollowUpAction(action: FollowUpAction) {
        coroutineScope.launch {
            // Wait until the scheduled time
            val delay = action.scheduledTime - System.currentTimeMillis()
            if (delay > 0) {
                withContext(Dispatchers.IO) {
                    Thread.sleep(delay)
                }
            }
            
            // Execute the action
            when (action.type) {
                FollowUpActionType.NOTIFICATION -> {
                    // Send notification
                    // Implementation depends on platform notification system
                }
                FollowUpActionType.TASK -> {
                    // Create a new task
                    val task = AITask(
                        moduleId = action.moduleId ?: "default",
                        input = action.input ?: "",
                        context = action.context ?: emptyMap(),
                        priority = action.priority ?: 1
                    )
                    taskManager.executeTask(task)
                }
            }
        }
    }
    
    /**
     * Calculate priority for a module and intent
     */
    private fun calculatePriority(moduleId: String, intent: String): Int {
        // Base priority
        var priority = 1
        
        // Adjust based on module
        if (moduleId == "emergency" || moduleId == "health") {
            priority += 5
        } else if (moduleId == "communication" || moduleId == "navigation") {
            priority += 3
        } else if (moduleId == "entertainment") {
            priority -= 1
        }
        
        // Adjust based on intent
        if (intent == "emergency" || intent == "urgent") {
            priority += 5
        } else if (intent == "question" || intent == "request") {
            priority += 2
        }
        
        return priority
    }
    
    /**
     * Update the status for the current processing stage
     */
    private fun updateStageStatus(requestId: String, status: ProcessingStatus) {
        val currentState = activeRequests[requestId]
        if (currentState != null) {
            activeRequests[requestId] = currentState.copy(
                status = status
            )
            updateProcessingState()
        }
    }
    
    /**
     * Update the overall processing state
     */
    private fun updateProcessingState() {
        _processingState.value = activeRequests.toMap()
    }
    
    /**
     * Register an input processor
     */
    fun registerInputProcessor(processor: InputProcessor) {
        inputProcessors.add(processor)
    }
    
    /**
     * Register a context enricher
     */
    fun registerContextEnricher(enricher: ContextEnricher) {
        contextEnrichers.add(enricher)
    }
    
    /**
     * Register a response synthesizer
     */
    fun registerResponseSynthesizer(synthesizer: ResponseSynthesizer) {
        responseSynthesizers.add(synthesizer)
    }
    
    /**
     * Register a post-processor
     */
    fun registerPostProcessor(processor: PostProcessor) {
        postProcessors.add(processor)
    }
}

/**
 * User request containing the raw input text and metadata
 */
data class UserRequest(
    val text: String,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * User input for context manager
 */
data class UserInput(
    val text: String,
    val isDirectQuestion: Boolean = false,
    val containsEmotionalContent: Boolean = false
)

/**
 * Response package for context manager
 */
data class ResponsePackage(
    val response: String,
    val responseTone: String
)

/**
 * Input processor interface
 */
interface InputProcessor {
    suspend fun process(text: String, metadata: Map<String, Any>): InputProcessorResult
}

/**
 * Result of input processing
 */
data class InputProcessorResult(
    val enhancedText: String,
    val detectedIntent: String? = null,
    val additionalMetadata: Map<String, Any> = emptyMap()
)

/**
 * Processed input from the input processing stage
 */
data class ProcessedInput(
    val originalRequest: UserRequest,
    val enhancedText: String,
    val detectedIntent: String = "",
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Context enricher interface
 */
interface ContextEnricher {
    suspend fun enrich(input: ProcessedInput, currentContext: Map<String, Any>): Map<String, Any>
}

/**
 * Enriched context from the context enrichment stage
 */
data class EnrichedContext(
    val processedInput: ProcessedInput,
    val contextData: Map<String, Any>
)

/**
 * Response synthesizer interface
 */
interface ResponseSynthesizer {
    suspend fun synthesize(currentResponse: String, taskResults: List<TaskResult>): SynthesizedResult
}

/**
 * Result of response synthesis
 */
data class SynthesizedResult(
    val response: String,
    val tone: String? = null
)

/**
 * Synthesized response from the response synthesis stage
 */
data class SynthesizedResponse(
    val response: String,
    val tone: String,
    val sourceModules: List<String>,
    val responseMetadata: Map<String, Any>
)

/**
 * Post-processor interface
 */
interface PostProcessor {
    suspend fun process(response: SynthesizedResponse): PostProcessorResult
}

/**
 * Result of post-processing
 */
data class PostProcessorResult(
    val processedResponse: String? = null,
    val followUpActions: List<FollowUpAction>? = null
)

/**
 * Processing result returned to the caller
 */
data class ProcessingResult(
    val requestId: String,
    val success: Boolean,
    val response: String,
    val error: String? = null,
    val followUpActions: List<FollowUpAction> = emptyList(),
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Follow-up action for delayed execution
 */
data class FollowUpAction(
    val type: FollowUpActionType,
    val scheduledTime: Long,
    val moduleId: String? = null,
    val input: String? = null,
    val context: Map<String, Any>? = null,
    val priority: Int? = null
)

/**
 * Types of follow-up actions
 */
enum class FollowUpActionType {
    NOTIFICATION,
    TASK
}

/**
 * Processing state for tracking the progress of a request
 */
data class ProcessingState(
    val requestId: String,
    val status: ProcessingStatus,
    val request: UserRequest,
    val startTime: Long,
    val processedInput: ProcessedInput? = null,
    val enrichedContext: EnrichedContext? = null,
    val taskResults: List<TaskResult>? = null,
    val synthesizedResponse: SynthesizedResponse? = null,
    val result: ProcessingResult? = null,
    val endTime: Long? = null,
    val error: String? = null
)

/**
 * Processing status enum
 */
enum class ProcessingStatus {
    STARTED,
    PROCESSING_INPUT,
    ENRICHING_CONTEXT,
    DISTRIBUTING_TASKS,
    SYNTHESIZING_RESPONSE,
    POST_PROCESSING,
    COMPLETED,
    ERROR
}

/**
 * Default implementation of InputProcessor
 */
class DefaultInputProcessor : InputProcessor {
    override suspend fun process(text: String, metadata: Map<String, Any>): InputProcessorResult {
        // Simple implementation - in production this would be more sophisticated
        val enhancedText = text.trim()
        
        // Very basic intent detection
        val detectedIntent = when {
            text.contains("?") -> "question"
            text.startsWith("find") || text.startsWith("search") -> "search"
            text.startsWith("open") || text.startsWith("launch") -> "app"
            text.startsWith("call") || text.startsWith("text") || text.startsWith("message") -> "communication"
            else -> "general"
        }
        
        return InputProcessorResult(
            enhancedText = enhancedText,
            detectedIntent = detectedIntent,
            additionalMetadata = mapOf(
                "wordCount" to text.split(" ").size,
                "hasQuestion" to text.contains("?"),
                "timestamp" to System.currentTimeMillis()
            )
        )
    }
}

/**
 * Default implementation of ContextEnricher
 */
class DefaultContextEnricher : ContextEnricher {
    override suspend fun enrich(input: ProcessedInput, currentContext: Map<String, Any>): Map<String, Any> {
        // Simple implementation - in production this would connect to memory systems
        val additionalContext = mutableMapOf<String, Any>()
        
        // Add time-based context
        additionalContext["timeOfDay"] = getTimeOfDay()
        additionalContext["dayOfWeek"] = getDayOfWeek()
        
        return additionalContext
    }
    
    private fun getTimeOfDay(): String {
        val hour = java.time.LocalTime.now().hour
        return when {
            hour < 5 -> "night"
            hour < 12 -> "morning"
            hour < 17 -> "afternoon"
            hour < 21 -> "evening"
            else -> "night"
        }
    }
    
    private fun getDayOfWeek(): String {
        return java.time.LocalDate.now().dayOfWeek.toString().lowercase()
    }
}

/**
 * Default implementation of ResponseSynthesizer
 */
class DefaultResponseSynthesizer : ResponseSynthesizer {
    override suspend fun synthesize(currentResponse: String, taskResults: List<TaskResult>): SynthesizedResult {
        // Simple implementation - in production this would apply Sallie's tone
        var finalResponse = currentResponse
        
        // Ensure the response isn't empty
        if (finalResponse.isBlank() && taskResults.isNotEmpty()) {
            finalResponse = taskResults.first().output
        }
        
        // Apply Sallie's signature phrase for complete tasks
        if (taskResults.all { it.success }) {
            finalResponse += " Got it, love."
        }
        
        return SynthesizedResult(
            response = finalResponse,
            tone = determineTone(finalResponse)
        )
    }
    
    private fun determineTone(response: String): String {
        // Simple implementation - in production this would use NLP
        return when {
            response.contains("sorry") || response.contains("apologies") -> "apologetic"
            response.contains("congratulations") || response.contains("great job") -> "celebratory"
            response.contains("warning") || response.contains("careful") -> "cautionary"
            response.contains("got it, love") -> "warm"
            else -> "neutral"
        }
    }
}

/**
 * Default implementation of PostProcessor
 */
class DefaultPostProcessor : PostProcessor {
    override suspend fun process(response: SynthesizedResponse): PostProcessorResult {
        // Simple implementation - in production this would handle logging and follow-ups
        
        // No changes to the response
        val processedResponse = response.response
        
        // No follow-up actions
        val followUpActions = emptyList<FollowUpAction>()
        
        return PostProcessorResult(
            processedResponse = processedResponse,
            followUpActions = followUpActions
        )
    }
}

/**
 * Extension function to convert AIContext to Map
 */
fun AIContext.toMap(): Map<String, Any> {
    val result = mutableMapOf<String, Any>()
    
    this.conversationContext?.let { context ->
        result["conversationContext"] = context
    }
    
    this.userContext?.let { context ->
        result["userContext"] = context
    }
    
    this.environmentalContext?.let { context ->
        result["environmentalContext"] = context
    }
    
    this.systemContext?.let { context ->
        result["systemContext"] = context
    }
    
    result["timestamp"] = this.timestamp
    
    return result
}

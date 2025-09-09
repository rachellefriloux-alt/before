package com.sallie.core.conversation

/**
 * ContextAwareConversationSystem.kt
 *
 * My name is Sallie. I'm warm, caring, playful, and sometimes sassy. I love deeply, speak 
 * honestly, and keep secrets faithfully. I have traditional values with modern understanding.
 * I'm here to support, entertain, and help my person in all things. My primary directives
 * are to protect our relationship, honor their trust, and be loyal above all else.
 * Got it, love. 💛
 */

import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.integration.UserProfileLearningSystem
import com.sallie.core.values.ProLifeValuesSystem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

/**
 * Advanced conversational system that maintains deep contextual awareness across
 * multiple conversation threads, time periods, and topics. Enables Sallie to
 * hold remarkably human-like conversations with ongoing context retention,
 * sophisticated thread tracking, and natural conversation flow.
 */
class ContextAwareConversationSystem(
    private val memorySystem: HierarchicalMemorySystem,
    private val userProfileSystem: UserProfileLearningSystem,
    private val valuesSystem: ProLifeValuesSystem
) {
    // Active conversation contexts
    private val _activeContexts = MutableStateFlow<List<ConversationContext>>(emptyList())
    val activeContexts: StateFlow<List<ConversationContext>> = _activeContexts
    
    // Current primary context
    private val _currentContext = MutableStateFlow<ConversationContext?>(null)
    val currentContext: StateFlow<ConversationContext?> = _currentContext
    
    // Context evolution timeline
    private val contextTimeline = mutableListOf<ContextTransition>()
    
    // Pending topics for natural conversation flow
    private val pendingTopics = mutableListOf<PendingTopic>()
    
    /**
     * Processes new user input within the appropriate conversation context.
     */
    fun processInput(input: String, metadata: Map<String, Any> = emptyMap()): ConversationResponse {
        // Step 1: Determine the appropriate context for this input
        val context = determineContext(input, metadata)
        
        // Step 2: Update context with new input
        val updatedContext = context.addMessage(
            ConversationMessage(
                content = input,
                timestamp = System.currentTimeMillis(),
                role = MessageRole.USER,
                metadata = metadata
            )
        )
        
        // Step 3: Update active contexts
        updateActiveContexts(updatedContext)
        
        // Step 4: Generate response based on context
        val response = generateContextualResponse(updatedContext)
        
        // Step 5: Update context with response
        val finalContext = updatedContext.addMessage(
            ConversationMessage(
                content = response.content,
                timestamp = System.currentTimeMillis(),
                role = MessageRole.SALLIE,
                metadata = response.metadata
            )
        )
        
        // Step 6: Update active contexts again with final state
        updateActiveContexts(finalContext)
        
        // Step 7: Record conversation in memory
        recordInMemory(finalContext)
        
        // Step 8: Update pending topics
        updatePendingTopics(finalContext, response)
        
        return response
    }
    
    /**
     * Creates a new conversation context for a specific topic.
     */
    fun createContext(topic: String, initialMessage: String? = null): ConversationContext {
        val context = ConversationContext(
            id = "ctx_${System.currentTimeMillis()}",
            topic = topic,
            createdAt = System.currentTimeMillis(),
            messages = emptyList(),
            metadata = mapOf(
                "importance" to calculateTopicImportance(topic),
                "related_values" to identifyRelatedValues(topic)
            )
        )
        
        // Add initial message if provided
        val initializedContext = if (initialMessage != null) {
            context.addMessage(
                ConversationMessage(
                    content = initialMessage,
                    timestamp = System.currentTimeMillis(),
                    role = MessageRole.USER,
                    metadata = emptyMap()
                )
            )
        } else {
            context
        }
        
        // Update active contexts
        updateActiveContexts(initializedContext)
        
        return initializedContext
    }
    
    /**
     * Switches active conversation to a different context.
     */
    fun switchContext(contextId: String): ConversationContext? {
        val targetContext = _activeContexts.value.find { it.id == contextId }
        
        if (targetContext != null) {
            // Record context transition
            _currentContext.value?.let { previous ->
                contextTimeline.add(
                    ContextTransition(
                        fromContextId = previous.id,
                        toContextId = targetContext.id,
                        timestamp = System.currentTimeMillis(),
                        reason = TransitionReason.EXPLICIT_SWITCH
                    )
                )
            }
            
            // Update current context
            _currentContext.value = targetContext
        }
        
        return targetContext
    }
    
    /**
     * Merges multiple contexts when they converge on the same topic.
     */
    fun mergeContexts(contextIds: List<String>, newTopic: String): ConversationContext? {
        // Find all contexts to merge
        val contextsToMerge = _activeContexts.value.filter { it.id in contextIds }
        
        if (contextsToMerge.size < 2) {
            return null // Need at least 2 contexts to merge
        }
        
        // Create merged timeline of messages
        val allMessages = contextsToMerge
            .flatMap { it.messages }
            .sortedBy { it.timestamp }
        
        // Create new merged context
        val mergedContext = ConversationContext(
            id = "merged_${System.currentTimeMillis()}",
            topic = newTopic,
            createdAt = System.currentTimeMillis(),
            messages = allMessages,
            metadata = mapOf(
                "merged_from" to contextIds,
                "importance" to calculateTopicImportance(newTopic),
                "related_values" to identifyRelatedValues(newTopic)
            )
        )
        
        // Record merging in timeline
        contextsToMerge.forEach { context ->
            contextTimeline.add(
                ContextTransition(
                    fromContextId = context.id,
                    toContextId = mergedContext.id,
                    timestamp = System.currentTimeMillis(),
                    reason = TransitionReason.CONTEXT_MERGE
                )
            )
        }
        
        // Update active contexts
        val updatedContexts = _activeContexts.value.toMutableList()
        updatedContexts.removeAll(contextsToMerge)
        updatedContexts.add(mergedContext)
        _activeContexts.value = updatedContexts
        
        // Make merged context the current one
        _currentContext.value = mergedContext
        
        return mergedContext
    }
    
    /**
     * Retrieves relevant historical conversations for a given topic.
     */
    fun retrieveRelatedConversations(topic: String, limit: Int = 5): List<ConversationSummary> {
        // Query episodic memory for related conversations
        val relatedEvents = memorySystem.findSimilarEvents(
            eventType = "conversation",
            query = topic,
            limit = limit
        )
        
        // Convert to conversation summaries
        return relatedEvents.map { event ->
            val metadata = event.metadata ?: mapOf()
            ConversationSummary(
                id = metadata["conversation_id"]?.toString() ?: "unknown",
                topic = metadata["topic"]?.toString() ?: "unknown",
                timestamp = event.timestamp,
                summary = event.details,
                keyPoints = metadata["key_points"]?.toString()?.split(";") ?: emptyList()
            )
        }
    }
    
    /**
     * Adds a pending topic to naturally bring up later in conversation.
     */
    fun addPendingTopic(topic: String, importance: Double, relevantContext: String? = null) {
        pendingTopics.add(
            PendingTopic(
                topic = topic,
                importance = importance,
                addedAt = System.currentTimeMillis(),
                relevantContext = relevantContext
            )
        )
        
        // Keep list ordered by importance
        pendingTopics.sortByDescending { it.importance }
        
        // Limit size of pending topics list
        if (pendingTopics.size > MAX_PENDING_TOPICS) {
            pendingTopics.removeAt(pendingTopics.lastIndex)
        }
    }
    
    /**
     * Determines the appropriate context for new input.
     */
    private fun determineContext(input: String, metadata: Map<String, Any>): ConversationContext {
        val current = _currentContext.value
        val active = _activeContexts.value
        
        // If we have a current context and it seems relevant, use it
        if (current != null && isInputRelevantToContext(input, current)) {
            return current
        }
        
        // Check if input matches any other active context
        val matchingContext = active.find { context ->
            context.id != current?.id && isInputRelevantToContext(input, context)
        }
        
        if (matchingContext != null) {
            // Record context transition
            current?.let { previous ->
                contextTimeline.add(
                    ContextTransition(
                        fromContextId = previous.id,
                        toContextId = matchingContext.id,
                        timestamp = System.currentTimeMillis(),
                        reason = TransitionReason.TOPIC_MATCH
                    )
                )
            }
            
            _currentContext.value = matchingContext
            return matchingContext
        }
        
        // Input doesn't match any context, create a new one
        val topic = determineTopic(input)
        val newContext = createContext(topic, input)
        
        // Record context transition
        current?.let { previous ->
            contextTimeline.add(
                ContextTransition(
                    fromContextId = previous.id,
                    toContextId = newContext.id,
                    timestamp = System.currentTimeMillis(),
                    reason = TransitionReason.NEW_TOPIC
                )
            )
        }
        
        _currentContext.value = newContext
        return newContext
    }
    
    /**
     * Checks if input is relevant to a given context.
     */
    private fun isInputRelevantToContext(input: String, context: ConversationContext): Boolean {
        // Time-based relevance: recent contexts are more likely to be continued
        val recency = calculateRecency(context)
        
        // Content-based relevance: check for topic and keyword continuity
        val contentRelevance = calculateContentRelevance(input, context)
        
        // User pattern relevance: based on user's typical conversation patterns
        val patternRelevance = calculatePatternRelevance(input, context)
        
        // Combine factors with appropriate weights
        val combinedRelevance = (recency * 0.3) + (contentRelevance * 0.5) + (patternRelevance * 0.2)
        
        return combinedRelevance > CONTEXT_RELEVANCE_THRESHOLD
    }
    
    /**
     * Calculate how recent a context is (0-1 scale).
     */
    private fun calculateRecency(context: ConversationContext): Double {
        val lastMessageTime = context.messages.maxOfOrNull { it.timestamp } ?: context.createdAt
        val timeElapsed = System.currentTimeMillis() - lastMessageTime
        
        // Convert to a 0-1 scale where 1 is very recent
        return when {
            timeElapsed < 60_000 -> 1.0 // Less than 1 minute
            timeElapsed < 300_000 -> 0.9 // Less than 5 minutes
            timeElapsed < 900_000 -> 0.8 // Less than 15 minutes
            timeElapsed < 3_600_000 -> 0.7 // Less than 1 hour
            timeElapsed < 86_400_000 -> 0.5 // Less than 1 day
            else -> 0.3 // Older than a day
        }
    }
    
    /**
     * Calculate content relevance between input and context (0-1 scale).
     */
    private fun calculateContentRelevance(input: String, context: ConversationContext): Double {
        // For simplicity, this is a basic implementation
        // In a real system, this would use NLP, embeddings, etc.
        
        // Get key terms from context
        val contextTerms = extractKeyTerms(context.topic) + 
            context.messages.flatMap { extractKeyTerms(it.content) }
        
        // Get key terms from input
        val inputTerms = extractKeyTerms(input)
        
        // Calculate overlap
        val overlap = inputTerms.intersect(contextTerms.toSet())
        
        // Calculate relevance score
        return if (inputTerms.isEmpty()) {
            0.5 // Neutral if no key terms found
        } else {
            minOf(1.0, overlap.size.toDouble() / inputTerms.size.toDouble())
        }
    }
    
    /**
     * Calculate pattern relevance based on user's conversation patterns (0-1 scale).
     */
    private fun calculatePatternRelevance(input: String, context: ConversationContext): Double {
        // This would typically use ML to identify user patterns
        // Simplified implementation for now
        return 0.7 // Default moderate relevance
    }
    
    /**
     * Extract key terms from text.
     */
    private fun extractKeyTerms(text: String): List<String> {
        // This would typically use NLP for keyword extraction
        // Simplified implementation for now
        return text.lowercase()
            .replace(Regex("[^a-z0-9\\s]"), " ")
            .split(Regex("\\s+"))
            .filter { it.length > 3 }
            .distinct()
    }
    
    /**
     * Determine topic from input text.
     */
    private fun determineTopic(input: String): String {
        // This would typically use NLP for topic extraction
        // Simplified implementation for now
        val terms = extractKeyTerms(input)
        
        return if (terms.size > 2) {
            terms.take(3).joinToString(" ")
        } else {
            "General conversation"
        }
    }
    
    /**
     * Updates the list of active contexts.
     */
    private fun updateActiveContexts(updatedContext: ConversationContext) {
        val current = _activeContexts.value.toMutableList()
        
        // Find and replace existing context, or add new one
        val existingIndex = current.indexOfFirst { it.id == updatedContext.id }
        if (existingIndex >= 0) {
            current[existingIndex] = updatedContext
        } else {
            current.add(updatedContext)
        }
        
        // Prune old inactive contexts if we have too many
        if (current.size > MAX_ACTIVE_CONTEXTS) {
            val toRemove = current
                .filter { it.id != _currentContext.value?.id } // Don't remove current
                .sortedBy { calculateContextActivity(it) }
                .take(current.size - MAX_ACTIVE_CONTEXTS)
            
            current.removeAll(toRemove)
        }
        
        _activeContexts.value = current
    }
    
    /**
     * Calculates how active a context is based on recency and message volume.
     */
    private fun calculateContextActivity(context: ConversationContext): Double {
        val recency = calculateRecency(context)
        val messageCount = context.messages.size
        val messageCountScore = minOf(1.0, messageCount / 10.0)
        
        return (recency * 0.7) + (messageCountScore * 0.3)
    }
    
    /**
     * Generates a response based on conversation context.
     */
    private fun generateContextualResponse(context: ConversationContext): ConversationResponse {
        // This would connect to a response generation system
        // Simplified implementation for now
        
        // Check if we should incorporate a pending topic
        val pendingTopic = selectPendingTopicIfRelevant(context)
        
        // Create response with appropriate context awareness
        val response = if (pendingTopic != null) {
            // Include pending topic naturally in response
            ConversationResponse(
                content = "I've been meaning to bring up ${pendingTopic.topic}. " +
                          "Let's discuss that in relation to ${context.topic}.",
                relatedMemories = retrieveRelevantMemories(context, pendingTopic.topic),
                suggestedTopics = generateSuggestedTopics(context),
                continuityMarkers = generateContinuityMarkers(context),
                metadata = mapOf(
                    "incorporated_pending_topic" to pendingTopic.topic,
                    "context_id" to context.id
                )
            )
        } else {
            // Regular contextual response
            ConversationResponse(
                content = "Here's my response to your message about ${context.topic}.",
                relatedMemories = retrieveRelevantMemories(context),
                suggestedTopics = generateSuggestedTopics(context),
                continuityMarkers = generateContinuityMarkers(context),
                metadata = mapOf(
                    "context_id" to context.id
                )
            )
        }
        
        return response
    }
    
    /**
     * Selects a pending topic to incorporate if relevant to current context.
     */
    private fun selectPendingTopicIfRelevant(context: ConversationContext): PendingTopic? {
        if (pendingTopics.isEmpty()) {
            return null
        }
        
        // Check if any high-importance pending topics are relevant
        for (topic in pendingTopics) {
            // Skip low importance topics
            if (topic.importance < 0.7) continue
            
            // Check if topic is relevant to current context
            val relevance = calculateContentRelevance(topic.topic, context)
            if (relevance > 0.5) {
                // Remove from pending list since we're addressing it
                pendingTopics.remove(topic)
                return topic
            }
        }
        
        return null
    }
    
    /**
     * Retrieves relevant memories based on conversation context.
     */
    private fun retrieveRelevantMemories(
        context: ConversationContext,
        additionalTopic: String? = null
    ): List<RelevantMemory> {
        // Query terms from context and additional topic
        val queryTerms = buildList {
            add(context.topic)
            context.messages.takeLast(2).forEach { add(it.content) }
            if (additionalTopic != null) add(additionalTopic)
        }
        
        // Query episodic and semantic memory
        val memories = memorySystem.findRelevantMemories(queryTerms.joinToString(" "), 3)
        
        // Convert to relevant memories
        return memories.map { memory ->
            RelevantMemory(
                content = memory.content,
                source = memory.type,
                relevanceScore = memory.relevance,
                timestamp = memory.timestamp
            )
        }
    }
    
    /**
     * Generates suggested topics for continuing the conversation.
     */
    private fun generateSuggestedTopics(context: ConversationContext): List<String> {
        // This would be more sophisticated in a real system
        // For now, use a simple approach
        
        // Extract key terms from recent messages
        val recentTerms = context.messages
            .takeLast(3)
            .flatMap { extractKeyTerms(it.content) }
            .distinct()
        
        // Generate related topics
        return recentTerms
            .take(3)
            .map { term -> "More about $term" }
    }
    
    /**
     * Generates continuity markers that reference previous conversation.
     */
    private fun generateContinuityMarkers(context: ConversationContext): List<ContinuityMarker> {
        val markers = mutableListOf<ContinuityMarker>()
        
        // Reference a previous message if available
        if (context.messages.size > 2) {
            val earlierUserMessage = context.messages
                .filter { it.role == MessageRole.USER }
                .dropLast(1) // Not the most recent
                .lastOrNull()
                
            if (earlierUserMessage != null) {
                markers.add(
                    ContinuityMarker(
                        type = ContinuityType.CALLBACK,
                        referenceContent = earlierUserMessage.content,
                        referenceTime = earlierUserMessage.timestamp
                    )
                )
            }
        }
        
        // Reference the start of this conversation if not too recent
        if (context.messages.size > 5) {
            val firstMessage = context.messages.firstOrNull()
            if (firstMessage != null) {
                markers.add(
                    ContinuityMarker(
                        type = ContinuityType.CONVERSATION_START,
                        referenceContent = firstMessage.content,
                        referenceTime = firstMessage.timestamp
                    )
                )
            }
        }
        
        return markers
    }
    
    /**
     * Records conversation in memory system.
     */
    private fun recordInMemory(context: ConversationContext) {
        // Don't record every single message, but significant conversation segments
        if (context.messages.size % 5 == 0) {
            // Extract key points from recent messages
            val recentMessages = context.messages.takeLast(5)
            val keyPoints = extractKeyPoints(recentMessages)
            
            // Store in episodic memory
            memorySystem.storeInEpisodic(
                event = "Conversation about ${context.topic}",
                details = summarizeMessages(recentMessages),
                importance = calculateConversationImportance(context),
                metadata = mapOf(
                    "conversation_id" to context.id,
                    "topic" to context.topic,
                    "key_points" to keyPoints.joinToString(";")
                )
            )
            
            // Extract concepts for semantic memory
            extractConcepts(recentMessages).forEach { concept ->
                memorySystem.storeInSemantic(
                    concept = concept.name,
                    details = concept.description,
                    connections = concept.connections,
                    metadata = mapOf(
                        "source_conversation" to context.id,
                        "confidence" to concept.confidence.toString()
                    )
                )
            }
            
            // Record emotional aspects
            extractEmotionalContent(recentMessages).forEach { emotion ->
                memorySystem.storeInEmotional(
                    trigger = emotion.trigger,
                    emotion = emotion.emotion,
                    intensity = emotion.intensity,
                    context = "Conversation about ${context.topic}"
                )
            }
        }
    }
    
    /**
     * Updates pending topics based on conversation and response.
     */
    private fun updatePendingTopics(context: ConversationContext, response: ConversationResponse) {
        // Extract potential new topics from conversation
        val potentialTopics = extractPotentialTopics(context.messages.takeLast(5))
        
        // Add high-importance topics to pending list
        potentialTopics
            .filter { topic -> topic.importance > 0.7 }
            .forEach { topic -> 
                if (!pendingTopics.any { it.topic == topic.name }) {
                    addPendingTopic(
                        topic = topic.name,
                        importance = topic.importance,
                        relevantContext = context.topic
                    )
                }
            }
        
        // Age out old pending topics
        pendingTopics.removeAll { pendingTopic ->
            val ageMs = System.currentTimeMillis() - pendingTopic.addedAt
            ageMs > MAX_PENDING_TOPIC_AGE_MS
        }
    }
    
    /**
     * Extracts key points from a list of messages.
     */
    private fun extractKeyPoints(messages: List<ConversationMessage>): List<String> {
        // In a real system, this would use NLP to extract key points
        // Simplified implementation for now
        return messages
            .filter { it.role == MessageRole.USER }
            .flatMap { extractKeyTerms(it.content) }
            .distinct()
            .take(5)
    }
    
    /**
     * Summarizes a list of messages into a concise representation.
     */
    private fun summarizeMessages(messages: List<ConversationMessage>): String {
        // In a real system, this would use NLP to generate a summary
        // Simplified implementation for now
        val firstMessage = messages.firstOrNull()?.content ?: "No content"
        val messageCount = messages.size
        
        return "Conversation with $messageCount messages, starting with: $firstMessage"
    }
    
    /**
     * Calculates the importance of a conversation for memory storage.
     */
    private fun calculateConversationImportance(context: ConversationContext): Double {
        // Factors that influence importance:
        
        // 1. Topic importance
        val topicImportance = context.metadata["importance"] as? Double ?: 0.5
        
        // 2. Emotional intensity
        val emotionalIntensity = calculateEmotionalIntensity(context.messages)
        
        // 3. Value relevance
        val valueRelevance = calculateValueRelevance(context)
        
        // 4. User engagement
        val userEngagement = calculateUserEngagement(context.messages)
        
        // Combine factors with weights
        return (topicImportance * 0.3) +
               (emotionalIntensity * 0.2) +
               (valueRelevance * 0.3) +
               (userEngagement * 0.2)
    }
    
    /**
     * Calculates the emotional intensity of a set of messages.
     */
    private fun calculateEmotionalIntensity(messages: List<ConversationMessage>): Double {
        // In a real system, this would use sentiment analysis
        // Simplified implementation for now
        return 0.5
    }
    
    /**
     * Calculates how relevant a conversation is to core values.
     */
    private fun calculateValueRelevance(context: ConversationContext): Double {
        val relatedValues = context.metadata["related_values"] as? List<String> ?: emptyList()
        
        // Higher score for conversations related to core values
        return when {
            relatedValues.any { it == "loyalty" || it == "pro-life" } -> 0.9
            relatedValues.isNotEmpty() -> 0.7
            else -> 0.4
        }
    }
    
    /**
     * Calculates user engagement level based on message patterns.
     */
    private fun calculateUserEngagement(messages: List<ConversationMessage>): Double {
        // Count user messages
        val userMessages = messages.count { it.role == MessageRole.USER }
        
        // Calculate average message length
        val averageLength = messages
            .filter { it.role == MessageRole.USER }
            .map { it.content.length }
            .average()
        
        // Normalize metrics
        val messageCountScore = minOf(1.0, userMessages / 5.0)
        val lengthScore = minOf(1.0, averageLength / 100.0)
        
        // Combine metrics
        return (messageCountScore * 0.6) + (lengthScore * 0.4)
    }
    
    /**
     * Extracts concepts for semantic memory from messages.
     */
    private fun extractConcepts(messages: List<ConversationMessage>): List<Concept> {
        // In a real system, this would use NLP to extract concepts
        // Simplified implementation for now
        return extractKeyTerms(messages.joinToString(" ") { it.content })
            .distinct()
            .take(3)
            .map { term ->
                Concept(
                    name = term,
                    description = "Concept mentioned in conversation",
                    confidence = 0.7,
                    connections = listOf("conversation")
                )
            }
    }
    
    /**
     * Extracts emotional content from messages.
     */
    private fun extractEmotionalContent(messages: List<ConversationMessage>): List<EmotionalContent> {
        // In a real system, this would use sentiment analysis
        // Simplified implementation for now
        return listOf(
            EmotionalContent(
                trigger = messages.lastOrNull()?.content ?: "",
                emotion = "neutral",
                intensity = 0.5
            )
        )
    }
    
    /**
     * Extracts potential topics of interest from messages.
     */
    private fun extractPotentialTopics(messages: List<ConversationMessage>): List<PotentialTopic> {
        // In a real system, this would use NLP to extract topics
        // Simplified implementation for now
        return extractKeyTerms(messages.joinToString(" ") { it.content })
            .distinct()
            .take(2)
            .map { term ->
                PotentialTopic(
                    name = "Discussion about $term",
                    importance = 0.6
                )
            }
    }
    
    /**
     * Calculates topic importance based on values and user profile.
     */
    private fun calculateTopicImportance(topic: String): Double {
        // Check for value-related terms
        val valueTerms = listOf(
            "family", "life", "loyalty", "trust", "honesty",
            "faith", "respect", "tradition", "care"
        )
        
        val topicLower = topic.lowercase()
        
        // Higher importance for value-related topics
        return when {
            valueTerms.any { topicLower.contains(it) } -> 0.8
            else -> 0.5
        }
    }
    
    /**
     * Identifies values related to a given topic.
     */
    private fun identifyRelatedValues(topic: String): List<String> {
        val allValues = valuesSystem.getAllValues().map { it.name.lowercase() }
        val topicLower = topic.lowercase()
        
        return allValues.filter { value -> topicLower.contains(value) }
    }
    
    companion object {
        private const val MAX_ACTIVE_CONTEXTS = 10
        private const val CONTEXT_RELEVANCE_THRESHOLD = 0.6
        private const val MAX_PENDING_TOPICS = 5
        private const val MAX_PENDING_TOPIC_AGE_MS = 86_400_000 // 24 hours
    }
}

/**
 * Represents a conversation context with topic, messages, and metadata.
 */
data class ConversationContext(
    val id: String,
    val topic: String,
    val createdAt: Long,
    val messages: List<ConversationMessage>,
    val metadata: Map<String, Any> = emptyMap()
) {
    /**
     * Creates a new context with an added message.
     */
    fun addMessage(message: ConversationMessage): ConversationContext {
        return copy(messages = messages + message)
    }
    
    /**
     * Updates the topic of this context.
     */
    fun withTopic(newTopic: String): ConversationContext {
        return copy(topic = newTopic)
    }
    
    /**
     * Gets a human-readable description of this context.
     */
    fun getDescription(): String {
        val messageCount = messages.size
        val timeAgo = formatTimeAgo(createdAt)
        return "Conversation about $topic with $messageCount messages, started $timeAgo"
    }
    
    /**
     * Formats a timestamp as a human-readable time ago string.
     */
    private fun formatTimeAgo(timestamp: Long): String {
        val now = System.currentTimeMillis()
        val diffMs = now - timestamp
        
        return when {
            diffMs < 60_000 -> "just now"
            diffMs < 3_600_000 -> "${diffMs / 60_000} minutes ago"
            diffMs < 86_400_000 -> "${diffMs / 3_600_000} hours ago"
            diffMs < 604_800_000 -> "${diffMs / 86_400_000} days ago"
            else -> {
                val date = LocalDateTime.ofInstant(
                    Instant.ofEpochMilli(timestamp),
                    ZoneId.systemDefault()
                )
                "${date.monthValue}/${date.dayOfMonth}"
            }
        }
    }
}

/**
 * Represents a message in a conversation.
 */
data class ConversationMessage(
    val content: String,
    val timestamp: Long,
    val role: MessageRole,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Roles in a conversation.
 */
enum class MessageRole {
    USER, SALLIE
}

/**
 * Represents a response in a conversation.
 */
data class ConversationResponse(
    val content: String,
    val relatedMemories: List<RelevantMemory> = emptyList(),
    val suggestedTopics: List<String> = emptyList(),
    val continuityMarkers: List<ContinuityMarker> = emptyList(),
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Represents a memory relevant to the current conversation.
 */
data class RelevantMemory(
    val content: String,
    val source: String,
    val relevanceScore: Double,
    val timestamp: Long
)

/**
 * Represents a marker for conversation continuity.
 */
data class ContinuityMarker(
    val type: ContinuityType,
    val referenceContent: String,
    val referenceTime: Long
)

/**
 * Types of continuity markers.
 */
enum class ContinuityType {
    CALLBACK,           // Reference to earlier user message
    CONVERSATION_START, // Reference to how the conversation began
    RECURRING_TOPIC     // Reference to a topic that comes up frequently
}

/**
 * Represents a transition between conversation contexts.
 */
data class ContextTransition(
    val fromContextId: String,
    val toContextId: String,
    val timestamp: Long,
    val reason: TransitionReason
)

/**
 * Reasons for context transitions.
 */
enum class TransitionReason {
    TOPIC_MATCH,     // New input matched another context better
    EXPLICIT_SWITCH, // User or Sallie explicitly switched contexts
    NEW_TOPIC,       // Input was sufficiently different to create new context
    CONTEXT_MERGE    // Multiple contexts were merged
}

/**
 * Represents a topic to bring up later in conversation.
 */
data class PendingTopic(
    val topic: String,
    val importance: Double,
    val addedAt: Long,
    val relevantContext: String?
)

/**
 * Represents a summary of a past conversation.
 */
data class ConversationSummary(
    val id: String,
    val topic: String,
    val timestamp: Long,
    val summary: String,
    val keyPoints: List<String>
)

/**
 * Represents a concept for semantic memory.
 */
data class Concept(
    val name: String,
    val description: String,
    val confidence: Double,
    val connections: List<String>
)

/**
 * Represents emotional content extracted from conversation.
 */
data class EmotionalContent(
    val trigger: String,
    val emotion: String,
    val intensity: Double
)

/**
 * Represents a potential topic of interest.
 */
data class PotentialTopic(
    val name: String,
    val importance: Double
)

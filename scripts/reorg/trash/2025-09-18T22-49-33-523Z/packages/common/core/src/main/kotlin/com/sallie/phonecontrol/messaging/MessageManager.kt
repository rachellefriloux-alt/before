/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * MessageManager - Interface for messaging operations
 */

package com.sallie.phonecontrol.messaging

import kotlinx.coroutines.flow.Flow

/**
 * Interface for managing SMS and messaging
 * 
 * Provides functionality for:
 * - Sending SMS messages
 * - Reading SMS messages
 * - Monitoring for new messages
 * - Suggesting smart replies
 */
interface MessageManager {
    
    /**
     * Represents a message
     */
    data class Message(
        val id: Long,
        val address: String,
        val contactName: String?,
        val body: String,
        val timestamp: Long,
        val isIncoming: Boolean,
        val isRead: Boolean,
        val threadId: Long
    )
    
    /**
     * Represents a conversation thread
     */
    data class ConversationThread(
        val id: Long,
        val address: String,
        val contactName: String?,
        val snippet: String?,
        val messageCount: Int,
        val timestamp: Long,
        val unreadCount: Int
    )
    
    /**
     * Flow of new incoming messages
     */
    val incomingMessages: Flow<Message>
    
    /**
     * Send an SMS message
     * 
     * @param phoneNumber The recipient phone number
     * @param message The message content
     * @return Result with success or failure
     */
    suspend fun sendSms(phoneNumber: String, message: String): Result<Unit>
    
    /**
     * Send an SMS message to multiple recipients
     * 
     * @param phoneNumbers The list of recipient phone numbers
     * @param message The message content
     * @return Result with success or failure (includes partial successes)
     */
    suspend fun sendSmsToMultipleRecipients(phoneNumbers: List<String>, message: String): Result<Map<String, Boolean>>
    
    /**
     * Get messages from a specific conversation thread
     * 
     * @param threadId The thread ID
     * @param limit Maximum number of messages to retrieve
     * @return List of messages in the thread
     */
    suspend fun getMessagesFromThread(threadId: Long, limit: Int = 50): Result<List<Message>>
    
    /**
     * Get all conversation threads
     * 
     * @param limit Maximum number of threads to retrieve
     * @return List of conversation threads
     */
    suspend fun getConversationThreads(limit: Int = 20): Result<List<ConversationThread>>
    
    /**
     * Mark a message as read
     * 
     * @param messageId The ID of the message to mark as read
     * @return Result with success or failure
     */
    suspend fun markMessageAsRead(messageId: Long): Result<Unit>
    
    /**
     * Generate smart replies for a message
     * 
     * @param message The message to generate replies for
     * @param count Number of reply suggestions to generate
     * @return List of suggested replies
     */
    suspend fun generateSmartReplies(message: String, count: Int = 3): Result<List<String>>
    
    /**
     * Check if messaging functionality is available
     * 
     * @return True if messaging functionality is available, false otherwise
     */
    suspend fun isMessagingFunctionalityAvailable(): Boolean
}

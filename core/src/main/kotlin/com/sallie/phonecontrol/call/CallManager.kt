/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * CallManager - Interface for call operations
 */

package com.sallie.phonecontrol.call

import kotlinx.coroutines.flow.Flow

/**
 * Interface for managing phone calls
 * 
 * Provides functionality for:
 * - Making outgoing calls
 * - Handling incoming calls
 * - Accessing call history
 * - Managing ongoing calls
 */
interface CallManager {
    /**
     * Available actions for handling incoming calls
     */
    enum class IncomingCallAction {
        ANSWER,
        REJECT,
        SEND_TO_VOICEMAIL,
        IGNORE
    }
    
    /**
     * Call state representation
     */
    sealed class CallState {
        /**
         * No active calls
         */
        object Idle : CallState()
        
        /**
         * Incoming call
         * 
         * @param phoneNumber The caller's phone number
         * @param contactName The caller's name (if available)
         */
        data class Ringing(
            val phoneNumber: String,
            val contactName: String?
        ) : CallState()
        
        /**
         * Dialing an outgoing call
         * 
         * @param phoneNumber The phone number being called
         * @param contactName The contact name (if available)
         */
        data class Dialing(
            val phoneNumber: String,
            val contactName: String?
        ) : CallState()
        
        /**
         * Call is active and connected
         * 
         * @param phoneNumber The connected phone number
         * @param contactName The contact name (if available)
         * @param startTime When the call started
         * @param isOnHold Whether the call is on hold
         * @param isMuted Whether the call is muted
         */
        data class Active(
            val phoneNumber: String,
            val contactName: String?,
            val startTime: Long,
            val isOnHold: Boolean = false,
            val isMuted: Boolean = false
        ) : CallState()
        
        /**
         * Call has ended
         * 
         * @param phoneNumber The phone number
         * @param contactName The contact name (if available)
         * @param startTime When the call started
         * @param endTime When the call ended
         * @param endReason Why the call ended
         */
        data class Ended(
            val phoneNumber: String,
            val contactName: String?,
            val startTime: Long,
            val endTime: Long,
            val endReason: String
        ) : CallState()
    }
    
    /**
     * A record of a phone call
     */
    data class CallRecord(
        val phoneNumber: String,
        val contactName: String?,
        val startTime: Long,
        val endTime: Long?,
        val duration: Long?,
        val isIncoming: Boolean,
        val wasAnswered: Boolean
    )
    
    /**
     * Flow of call state changes
     */
    val callState: Flow<CallState>
    
    /**
     * Make a phone call
     * 
     * @param phoneNumber The phone number to call
     * @param displayName Optional display name for the call
     * @return Result indicating success or failure
     */
    suspend fun makeCall(phoneNumber: String, displayName: String? = null): Result<Unit>
    
    /**
     * End the current call
     * 
     * @return Result indicating success or failure
     */
    suspend fun endCall(): Result<Unit>
    
    /**
     * Handle an incoming call
     * 
     * @param action The action to take
     * @return Result indicating success or failure
     */
    suspend fun handleIncomingCall(action: IncomingCallAction): Result<Unit>
    
    /**
     * Get recent call history
     * 
     * @param limit Maximum number of records to return
     * @return List of call records, sorted by start time (newest first)
     */
    suspend fun getCallHistory(limit: Int = 20): Result<List<CallRecord>>
    
    /**
     * Put the current call on hold
     * 
     * @param onHold Whether to put the call on hold or take it off hold
     * @return Result indicating success or failure
     */
    suspend fun setCallOnHold(onHold: Boolean): Result<Unit>
    
    /**
     * Mute or unmute the current call
     * 
     * @param muted Whether to mute or unmute the call
     * @return Result indicating success or failure
     */
    suspend fun setCallMuted(muted: Boolean): Result<Unit>
    
    /**
     * Check if call functionality is available
     * 
     * @return True if call functionality is available, false otherwise
     */
    suspend fun isCallFunctionalityAvailable(): Boolean
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * CallManagerImpl - Implementation for call operations
 */

package com.sallie.phonecontrol.call

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.CallLog
import android.telecom.TelecomManager
import android.telephony.TelephonyManager
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.PhoneControlEvent
import com.sallie.phonecontrol.PhoneControlManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Date

/**
 * Implementation of CallManager for managing phone calls
 * 
 * Provides functionality for:
 * - Making outgoing calls
 * - Handling incoming calls
 * - Accessing call history
 * - Managing ongoing calls
 */
class CallManagerImpl(
    private val context: Context,
    private val permissionManager: PermissionManager,
    private val phoneControlManager: PhoneControlManager
) : CallManager {
    
    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    private val telecomManager by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
        } else {
            null
        }
    }
    
    private val _callState = MutableStateFlow<CallManager.CallState>(CallManager.CallState.Idle)
    override val callState: Flow<CallManager.CallState> = _callState.asStateFlow()
    
    companion object {
        private const val CALL_CONSENT_ACTION = "make_phone_call"
        private const val INCOMING_CALL_CONSENT_ACTION = "handle_incoming_call"
    }
    
    init {
        // Register call state listener
        registerCallStateListener()
    }
    
    /**
     * Register a listener for call state changes
     */
    private fun registerCallStateListener() {
        // In a real implementation, this would use PhoneStateListener or CallScreeningService
        // This is a simplified placeholder
    }
    
    override suspend fun makeCall(phoneNumber: String, displayName: String?): Result<Unit> {
        // Check permissions
        if (!hasCallPermissions()) {
            return Result.failure(SecurityException("Missing call permissions"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent for making calls"))
        }
        
        return try {
            val formattedNumber = formatPhoneNumber(phoneNumber)
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:$formattedNumber")
            }
            context.startActivity(intent)
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.CallInitiated(
                    contactName = displayName ?: formattedNumber,
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun endCall(): Result<Unit> {
        // Check permissions
        if (!hasCallPermissions()) {
            return Result.failure(SecurityException("Missing call permissions"))
        }
        
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                telecomManager?.endCall()
                Result.success(Unit)
            } else {
                // For older versions, use TelephonyManager via reflection
                // This is not recommended but provided as a fallback
                Result.failure(UnsupportedOperationException("Ending calls not supported on this Android version"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun handleIncomingCall(action: CallManager.IncomingCallAction): Result<Unit> {
        // Check permissions
        if (!hasCallPermissions()) {
            return Result.failure(SecurityException("Missing call permissions"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(INCOMING_CALL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent for handling incoming calls"))
        }
        
        // Get current call state
        val currentState = _callState.value
        if (currentState !is CallManager.CallState.Ringing) {
            return Result.failure(IllegalStateException("No incoming call to handle"))
        }
        
        return try {
            when (action) {
                CallManager.IncomingCallAction.ANSWER -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        telecomManager?.acceptRingingCall()
                    } else {
                        Result.failure(UnsupportedOperationException("Answering calls not supported on this Android version"))
                    }
                }
                
                CallManager.IncomingCallAction.REJECT -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        telecomManager?.endCall()
                    } else {
                        Result.failure(UnsupportedOperationException("Rejecting calls not supported on this Android version"))
                    }
                }
                
                CallManager.IncomingCallAction.SEND_TO_VOICEMAIL -> {
                    // Not directly supported in public APIs
                    Result.failure(UnsupportedOperationException("Sending to voicemail not directly supported"))
                }
                
                CallManager.IncomingCallAction.IGNORE -> {
                    // Just don't answer, call will continue ringing
                    Result.success(Unit)
                }
            }
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.CallHandled(
                    contactName = currentState.contactName ?: currentState.phoneNumber,
                    action = action.name
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun getCallHistory(limit: Int): Result<List<CallManager.CallRecord>> {
        // Check permissions
        if (!permissionManager.checkPermission(Manifest.permission.READ_CALL_LOG)) {
            return Result.failure(SecurityException("Missing READ_CALL_LOG permission"))
        }
        
        return try {
            val calls = mutableListOf<CallManager.CallRecord>()
            
            val projection = arrayOf(
                CallLog.Calls.NUMBER,
                CallLog.Calls.CACHED_NAME,
                CallLog.Calls.DATE,
                CallLog.Calls.DURATION,
                CallLog.Calls.TYPE
            )
            
            val sortOrder = "${CallLog.Calls.DATE} DESC LIMIT $limit"
            
            context.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                projection,
                null,
                null,
                sortOrder
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val call = createCallRecordFromCursor(cursor)
                    calls.add(call)
                }
            }
            
            Result.success(calls)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    private fun createCallRecordFromCursor(cursor: Cursor): CallManager.CallRecord {
        val numberColumn = cursor.getColumnIndex(CallLog.Calls.NUMBER)
        val nameColumn = cursor.getColumnIndex(CallLog.Calls.CACHED_NAME)
        val dateColumn = cursor.getColumnIndex(CallLog.Calls.DATE)
        val durationColumn = cursor.getColumnIndex(CallLog.Calls.DURATION)
        val typeColumn = cursor.getColumnIndex(CallLog.Calls.TYPE)
        
        val number = cursor.getString(numberColumn)
        val name = cursor.getString(nameColumn)
        val date = cursor.getLong(dateColumn)
        val duration = cursor.getLong(durationColumn)
        val type = cursor.getInt(typeColumn)
        
        val isIncoming = type == CallLog.Calls.INCOMING_TYPE
        val wasAnswered = type != CallLog.Calls.MISSED_TYPE
        
        return CallManager.CallRecord(
            phoneNumber = number,
            contactName = name,
            startTime = date,
            endTime = if (duration > 0) date + (duration * 1000) else null,
            duration = if (duration > 0) duration else null,
            isIncoming = isIncoming,
            wasAnswered = wasAnswered
        )
    }
    
    override suspend fun setCallOnHold(onHold: Boolean): Result<Unit> {
        // Not directly supported in public Android APIs
        // Would require custom telephony implementation or accessibility services
        return Result.failure(UnsupportedOperationException("Setting call on hold not supported via public APIs"))
    }
    
    override suspend fun setCallMuted(muted: Boolean): Result<Unit> {
        // Not directly supported in public Android APIs
        // Would require custom telephony implementation or accessibility services
        return Result.failure(UnsupportedOperationException("Muting calls not supported via public APIs"))
    }
    
    override suspend fun isCallFunctionalityAvailable(): Boolean {
        return hasCallPermissions()
    }
    
    /**
     * Check if we have all necessary permissions for call functionality
     */
    private fun hasCallPermissions(): Boolean {
        // For basic call functionality, we need at minimum:
        return permissionManager.checkPermission(Manifest.permission.CALL_PHONE)
    }
    
    /**
     * Format a phone number to ensure it's dialable
     */
    private fun formatPhoneNumber(phoneNumber: String): String {
        // Strip non-numeric characters except + for international
        return phoneNumber.replace(Regex("[^+0-9]"), "")
    }
}

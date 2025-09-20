/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * MessageManagerImpl - Implementation for messaging operations
 */

package com.sallie.phonecontrol.messaging

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.database.Cursor
import android.net.Uri
import android.provider.ContactsContract
import android.provider.Telephony
import android.telephony.SmsManager
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.PhoneControlEvent
import com.sallie.phonecontrol.PhoneControlManager
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import java.util.Date

/**
 * Implementation of MessageManager for handling SMS and messaging
 * 
 * Provides functionality for:
 * - Sending SMS messages
 * - Reading SMS messages
 * - Monitoring for new messages
 * - Suggesting smart replies
 */
class MessageManagerImpl(
    private val context: Context,
    private val permissionManager: PermissionManager,
    private val phoneControlManager: PhoneControlManager
) : MessageManager {
    
    private val smsManager = SmsManager.getDefault()
    private val _incomingMessages = MutableSharedFlow<MessageManager.Message>(extraBufferCapacity = 10)
    
    companion object {
        private const val SEND_SMS_CONSENT_ACTION = "send_sms"
        private const val READ_SMS_CONSENT_ACTION = "read_sms"
        private const val ACTION_SMS_SENT = "com.sallie.ACTION_SMS_SENT"
        private const val ACTION_SMS_DELIVERED = "com.sallie.ACTION_SMS_DELIVERED"
    }
    
    override val incomingMessages: Flow<MessageManager.Message> = callbackFlow {
        // Need to register a broadcast receiver for incoming SMS
        // This requires proper permissions
        
        if (permissionManager.checkPermission(Manifest.permission.RECEIVE_SMS)) {
            val smsReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
                        // Process incoming SMS
                        for (smsMessage in Telephony.Sms.Intents.getMessagesFromIntent(intent)) {
                            val message = MessageManager.Message(
                                id = System.currentTimeMillis(), // Not actual ID, just unique for this instance
                                address = smsMessage.displayOriginatingAddress,
                                contactName = getContactNameFromPhone(smsMessage.displayOriginatingAddress),
                                body = smsMessage.messageBody,
                                timestamp = System.currentTimeMillis(),
                                isIncoming = true,
                                isRead = false,
                                threadId = -1 // Not easily available from the broadcast
                            )
                            
                            trySend(message)
                            _incomingMessages.tryEmit(message)
                        }
                    }
                }
            }
            
            val intentFilter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
            context.registerReceiver(smsReceiver, intentFilter)
            
            awaitClose {
                context.unregisterReceiver(smsReceiver)
            }
        } else {
            awaitClose { }
        }
    }
    
    override suspend fun sendSms(phoneNumber: String, message: String): Result<Unit> {
        // Check permissions
        if (!hasSendSmsPermission()) {
            return Result.failure(SecurityException("Missing SEND_SMS permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(SEND_SMS_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to send SMS"))
        }
        
        return try {
            val formattedNumber = formatPhoneNumber(phoneNumber)
            
            // Create pending intents for tracking SMS status
            val sentPI = PendingIntent.getBroadcast(
                context, 
                0,
                Intent(ACTION_SMS_SENT),
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_IMMUTABLE 
                } else {
                    0
                }
            )
            
            val deliveredPI = PendingIntent.getBroadcast(
                context,
                0,
                Intent(ACTION_SMS_DELIVERED),
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_IMMUTABLE 
                } else {
                    0
                }
            )
            
            // Register receivers to track status
            val sentReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    when (resultCode) {
                        Activity.RESULT_OK -> {
                            // SMS sent successfully
                        }
                        SmsManager.RESULT_ERROR_GENERIC_FAILURE -> {
                            // Generic failure
                        }
                        SmsManager.RESULT_ERROR_RADIO_OFF -> {
                            // Radio off
                        }
                        SmsManager.RESULT_ERROR_NULL_PDU -> {
                            // PDU error
                        }
                    }
                    
                    context.unregisterReceiver(this)
                }
            }
            
            val deliveredReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context, intent: Intent) {
                    when (resultCode) {
                        Activity.RESULT_OK -> {
                            // SMS delivered
                        }
                        Activity.RESULT_CANCELED -> {
                            // SMS not delivered
                        }
                    }
                    
                    context.unregisterReceiver(this)
                }
            }
            
            context.registerReceiver(sentReceiver, IntentFilter(ACTION_SMS_SENT))
            context.registerReceiver(deliveredReceiver, IntentFilter(ACTION_SMS_DELIVERED))
            
            // If message is too long, divide it into parts
            val parts = smsManager.divideMessage(message)
            
            val sentIntents = ArrayList<PendingIntent>()
            val deliveredIntents = ArrayList<PendingIntent>()
            
            repeat(parts.size) {
                sentIntents.add(sentPI)
                deliveredIntents.add(deliveredPI)
            }
            
            smsManager.sendMultipartTextMessage(
                formattedNumber,
                null,
                parts,
                sentIntents,
                deliveredIntents
            )
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.MessageSent(
                    contactName = getContactNameFromPhone(formattedNumber) ?: formattedNumber,
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun sendSmsToMultipleRecipients(
        phoneNumbers: List<String>, 
        message: String
    ): Result<Map<String, Boolean>> {
        // Check permissions
        if (!hasSendSmsPermission()) {
            return Result.failure(SecurityException("Missing SEND_SMS permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(SEND_SMS_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to send SMS"))
        }
        
        val results = mutableMapOf<String, Boolean>()
        
        try {
            for (phoneNumber in phoneNumbers) {
                val result = sendSms(phoneNumber, message)
                results[phoneNumber] = result.isSuccess
            }
            
            return Result.success(results)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun getMessagesFromThread(threadId: Long, limit: Int): Result<List<MessageManager.Message>> {
        // Check permissions
        if (!hasReadSmsPermission()) {
            return Result.failure(SecurityException("Missing READ_SMS permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(READ_SMS_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to read SMS"))
        }
        
        return try {
            val messages = mutableListOf<MessageManager.Message>()
            
            val uri = Uri.parse("content://sms/")
            val projection = arrayOf(
                Telephony.Sms._ID,
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.DATE,
                Telephony.Sms.TYPE,
                Telephony.Sms.READ,
                Telephony.Sms.THREAD_ID
            )
            val selection = "${Telephony.Sms.THREAD_ID} = ?"
            val selectionArgs = arrayOf(threadId.toString())
            val sortOrder = "${Telephony.Sms.DATE} DESC LIMIT $limit"
            
            context.contentResolver.query(
                uri,
                projection,
                selection,
                selectionArgs,
                sortOrder
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val message = createMessageFromCursor(cursor)
                    messages.add(message)
                }
            }
            
            Result.success(messages)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun getConversationThreads(limit: Int): Result<List<MessageManager.ConversationThread>> {
        // Check permissions
        if (!hasReadSmsPermission()) {
            return Result.failure(SecurityException("Missing READ_SMS permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(READ_SMS_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to read SMS"))
        }
        
        return try {
            val threads = mutableListOf<MessageManager.ConversationThread>()
            
            val uri = Uri.parse("content://sms/conversations")
            val projection = arrayOf(
                Telephony.Sms.Conversations.THREAD_ID,
                Telephony.Sms.Conversations.MESSAGE_COUNT,
                Telephony.Sms.Conversations.SNIPPET
            )
            val sortOrder = "${Telephony.Sms.DATE} DESC LIMIT $limit"
            
            context.contentResolver.query(
                uri,
                projection,
                null,
                null,
                sortOrder
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val threadId = cursor.getLong(cursor.getColumnIndexOrThrow(Telephony.Sms.Conversations.THREAD_ID))
                    val messageCount = cursor.getInt(cursor.getColumnIndexOrThrow(Telephony.Sms.Conversations.MESSAGE_COUNT))
                    val snippet = cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.Conversations.SNIPPET))
                    
                    // Get more thread info from the most recent message
                    val threadInfo = getThreadInfo(threadId)
                    
                    val thread = MessageManager.ConversationThread(
                        id = threadId,
                        address = threadInfo.first,
                        contactName = getContactNameFromPhone(threadInfo.first),
                        snippet = snippet,
                        messageCount = messageCount,
                        timestamp = threadInfo.second,
                        unreadCount = getUnreadCountForThread(threadId)
                    )
                    
                    threads.add(thread)
                }
            }
            
            Result.success(threads)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun markMessageAsRead(messageId: Long): Result<Unit> {
        // Check permissions
        if (!permissionManager.checkPermission(Manifest.permission.WRITE_SMS)) {
            return Result.failure(SecurityException("Missing WRITE_SMS permission"))
        }
        
        return try {
            val values = android.content.ContentValues().apply {
                put(Telephony.Sms.READ, true)
            }
            
            val uri = Uri.parse("content://sms/$messageId")
            val updatedRows = context.contentResolver.update(uri, values, null, null)
            
            if (updatedRows > 0) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to mark message as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun generateSmartReplies(message: String, count: Int): Result<List<String>> {
        // This would normally use ML models for smart reply generation
        // Here we provide a simplified implementation
        
        val lowercaseMessage = message.lowercase()
        
        val replies = when {
            lowercaseMessage.contains("hello") || lowercaseMessage.contains("hi") -> {
                listOf("Hello there!", "Hi, how are you?", "Hello! How can I help?")
            }
            lowercaseMessage.contains("how are you") -> {
                listOf("I'm well, thank you!", "Doing great, how about you?", "I'm fine, thanks for asking")
            }
            lowercaseMessage.contains("thank") -> {
                listOf("You're welcome!", "Happy to help!", "Anytime!")
            }
            lowercaseMessage.contains("when") && (lowercaseMessage.contains("meet") || lowercaseMessage.contains("see")) -> {
                listOf("How about tomorrow?", "I'm free this weekend", "Let me check my schedule")
            }
            lowercaseMessage.contains("help") -> {
                listOf("I'd be happy to help", "What do you need?", "Let me know how I can assist")
            }
            else -> {
                listOf("Got it", "Thanks for letting me know", "I understand")
            }
        }
        
        return Result.success(replies.take(count))
    }
    
    override suspend fun isMessagingFunctionalityAvailable(): Boolean {
        return hasSendSmsPermission() || hasReadSmsPermission()
    }
    
    /**
     * Check if we have permission to send SMS
     */
    private fun hasSendSmsPermission(): Boolean {
        return permissionManager.checkPermission(Manifest.permission.SEND_SMS)
    }
    
    /**
     * Check if we have permission to read SMS
     */
    private fun hasReadSmsPermission(): Boolean {
        return permissionManager.checkPermission(Manifest.permission.READ_SMS)
    }
    
    /**
     * Format a phone number to ensure it's usable for SMS
     */
    private fun formatPhoneNumber(phoneNumber: String): String {
        // Strip non-numeric characters except + for international
        return phoneNumber.replace(Regex("[^+0-9]"), "")
    }
    
    /**
     * Get contact name from phone number
     */
    @SuppressLint("MissingPermission")
    private fun getContactNameFromPhone(phoneNumber: String): String? {
        if (!permissionManager.checkPermission(Manifest.permission.READ_CONTACTS)) {
            return null
        }
        
        try {
            val uri = Uri.withAppendedPath(
                ContactsContract.PhoneLookup.CONTENT_FILTER_URI,
                Uri.encode(phoneNumber)
            )
            
            val projection = arrayOf(ContactsContract.PhoneLookup.DISPLAY_NAME)
            
            context.contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME)
                    if (nameIndex != -1) {
                        return cursor.getString(nameIndex)
                    }
                }
            }
        } catch (e: Exception) {
            // Handle exception
        }
        
        return null
    }
    
    /**
     * Create a Message object from cursor
     */
    private fun createMessageFromCursor(cursor: Cursor): MessageManager.Message {
        val idIndex = cursor.getColumnIndexOrThrow(Telephony.Sms._ID)
        val addressIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
        val bodyIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.BODY)
        val dateIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.DATE)
        val typeIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.TYPE)
        val readIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.READ)
        val threadIdIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.THREAD_ID)
        
        val id = cursor.getLong(idIndex)
        val address = cursor.getString(addressIndex)
        val body = cursor.getString(bodyIndex)
        val date = cursor.getLong(dateIndex)
        val type = cursor.getInt(typeIndex)
        val read = cursor.getInt(readIndex) != 0
        val threadId = cursor.getLong(threadIdIndex)
        
        val isIncoming = type == Telephony.Sms.MESSAGE_TYPE_INBOX
        
        return MessageManager.Message(
            id = id,
            address = address,
            contactName = getContactNameFromPhone(address),
            body = body,
            timestamp = date,
            isIncoming = isIncoming,
            isRead = read,
            threadId = threadId
        )
    }
    
    /**
     * Get thread info (address and timestamp) from the most recent message
     */
    @SuppressLint("MissingPermission")
    private fun getThreadInfo(threadId: Long): Pair<String, Long> {
        var address = ""
        var timestamp = 0L
        
        val uri = Uri.parse("content://sms/")
        val projection = arrayOf(
            Telephony.Sms.ADDRESS,
            Telephony.Sms.DATE
        )
        val selection = "${Telephony.Sms.THREAD_ID} = ?"
        val selectionArgs = arrayOf(threadId.toString())
        val sortOrder = "${Telephony.Sms.DATE} DESC LIMIT 1"
        
        context.contentResolver.query(
            uri,
            projection,
            selection,
            selectionArgs,
            sortOrder
        )?.use { cursor ->
            if (cursor.moveToFirst()) {
                val addressIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
                val dateIndex = cursor.getColumnIndexOrThrow(Telephony.Sms.DATE)
                
                address = cursor.getString(addressIndex) ?: ""
                timestamp = cursor.getLong(dateIndex)
            }
        }
        
        return Pair(address, timestamp)
    }
    
    /**
     * Get count of unread messages in a thread
     */
    @SuppressLint("MissingPermission")
    private fun getUnreadCountForThread(threadId: Long): Int {
        var count = 0
        
        val uri = Uri.parse("content://sms/")
        val selection = "${Telephony.Sms.THREAD_ID} = ? AND ${Telephony.Sms.READ} = 0 AND ${Telephony.Sms.TYPE} = ${Telephony.Sms.MESSAGE_TYPE_INBOX}"
        val selectionArgs = arrayOf(threadId.toString())
        
        context.contentResolver.query(
            uri,
            null,
            selection,
            selectionArgs,
            null
        )?.use { cursor ->
            count = cursor.count
        }
        
        return count
    }
}

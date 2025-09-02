/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * CalendarManagerImpl - Implementation for calendar control operations
 */

package com.sallie.phonecontrol.calendar

import android.Manifest
import android.content.ContentResolver
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.CalendarContract
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.PhoneControlEvent
import com.sallie.phonecontrol.PhoneControlManager
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import java.time.Instant
import java.util.*

/**
 * Implementation of CalendarManager for managing calendar events and operations
 */
class CalendarManagerImpl(
    private val context: Context,
    private val permissionManager: PermissionManager,
    private val phoneControlManager: PhoneControlManager
) : CalendarManager {

    private val contentResolver: ContentResolver = context.contentResolver
    private val _calendarEvents = MutableSharedFlow<CalendarManager.CalendarEvent>(extraBufferCapacity = 10)
    
    companion object {
        private const val CALENDAR_CONSENT_ACTION = "calendar_access"
    }
    
    // Set up calendar event observation
    override val calendarEvents: Flow<CalendarManager.CalendarEvent> = callbackFlow {
        if (!hasCalendarPermissions()) {
            awaitClose { }
            return@callbackFlow
        }
        
        val contentObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean, uri: Uri?) {
                super.onChange(selfChange, uri)
                
                // Extract the event ID from the URI if possible
                val eventId = uri?.lastPathSegment?.toLongOrNull()
                
                // If we have an event ID, fetch the event details and emit it
                eventId?.let { id ->
                    val event = getEventById(id).getOrNull()
                    event?.let {
                        trySend(it)
                        _calendarEvents.tryEmit(it)
                    }
                }
            }
        }
        
        // Register observer for calendar events changes
        contentResolver.registerContentObserver(
            CalendarContract.Events.CONTENT_URI,
            true,
            contentObserver
        )
        
        awaitClose {
            contentResolver.unregisterContentObserver(contentObserver)
        }
    }
    
    override suspend fun getCalendars(): Result<List<CalendarManager.CalendarAccount>> {
        if (!hasCalendarPermissions()) {
            return Result.failure(SecurityException("Missing READ_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access calendars"))
        }
        
        return try {
            val calendars = mutableListOf<CalendarManager.CalendarAccount>()
            
            val uri = CalendarContract.Calendars.CONTENT_URI
            val projection = arrayOf(
                CalendarContract.Calendars._ID,
                CalendarContract.Calendars.ACCOUNT_NAME,
                CalendarContract.Calendars.CALENDAR_DISPLAY_NAME,
                CalendarContract.Calendars.OWNER_ACCOUNT,
                CalendarContract.Calendars.CALENDAR_COLOR,
                CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL
            )
            
            contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                val idIndex = cursor.getColumnIndex(CalendarContract.Calendars._ID)
                val accountNameIndex = cursor.getColumnIndex(CalendarContract.Calendars.ACCOUNT_NAME)
                val displayNameIndex = cursor.getColumnIndex(CalendarContract.Calendars.CALENDAR_DISPLAY_NAME)
                val ownerAccountIndex = cursor.getColumnIndex(CalendarContract.Calendars.OWNER_ACCOUNT)
                val colorIndex = cursor.getColumnIndex(CalendarContract.Calendars.CALENDAR_COLOR)
                val accessLevelIndex = cursor.getColumnIndex(CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL)
                
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idIndex)
                    val accountName = cursor.getString(accountNameIndex)
                    val displayName = cursor.getString(displayNameIndex)
                    val ownerAccount = cursor.getString(ownerAccountIndex)
                    val color = cursor.getInt(colorIndex)
                    val accessLevel = getAccessLevel(cursor.getInt(accessLevelIndex))
                    
                    val calendar = CalendarManager.CalendarAccount(
                        id = id,
                        accountName = accountName,
                        displayName = displayName,
                        ownerAccount = ownerAccount,
                        color = color,
                        accessLevel = accessLevel
                    )
                    
                    calendars.add(calendar)
                }
            }
            
            Result.success(calendars)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getEvents(
        calendarIds: List<Long>,
        startTime: Long,
        endTime: Long
    ): Result<List<CalendarManager.CalendarEvent>> {
        if (!hasCalendarPermissions()) {
            return Result.failure(SecurityException("Missing READ_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access calendar events"))
        }
        
        return try {
            val events = mutableListOf<CalendarManager.CalendarEvent>()
            
            val builder = StringBuilder()
            if (calendarIds.isNotEmpty()) {
                builder.append("(")
                for (i in calendarIds.indices) {
                    if (i > 0) builder.append(" OR ")
                    builder.append("${CalendarContract.Events.CALENDAR_ID} = ?")
                }
                builder.append(")")
                builder.append(" AND ")
            }
            
            builder.append("(${CalendarContract.Events.DTSTART} >= ? AND ${CalendarContract.Events.DTSTART} <= ?)")
            builder.append(" OR ")
            builder.append("(${CalendarContract.Events.DTEND} >= ? AND ${CalendarContract.Events.DTEND} <= ?)")
            builder.append(" OR ")
            builder.append("(${CalendarContract.Events.DTSTART} <= ? AND ${CalendarContract.Events.DTEND} >= ?)")
            
            val selectionArgs = mutableListOf<String>()
            if (calendarIds.isNotEmpty()) {
                selectionArgs.addAll(calendarIds.map { it.toString() })
            }
            
            // Add time parameters (3 pairs of start and end times)
            selectionArgs.add(startTime.toString())
            selectionArgs.add(endTime.toString())
            selectionArgs.add(startTime.toString())
            selectionArgs.add(endTime.toString())
            selectionArgs.add(startTime.toString())
            selectionArgs.add(endTime.toString())
            
            val uri = CalendarContract.Events.CONTENT_URI
            val projection = arrayOf(
                CalendarContract.Events._ID,
                CalendarContract.Events.CALENDAR_ID,
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION,
                CalendarContract.Events.EVENT_LOCATION,
                CalendarContract.Events.DTSTART,
                CalendarContract.Events.DTEND,
                CalendarContract.Events.ALL_DAY,
                CalendarContract.Events.RRULE,
                CalendarContract.Events.EVENT_COLOR,
                CalendarContract.Events.AVAILABILITY,
                CalendarContract.Events.ORGANIZER
            )
            
            val calendarNameMap = getCalendarDisplayNames()
            
            contentResolver.query(
                uri,
                projection,
                builder.toString(),
                selectionArgs.toTypedArray(),
                "${CalendarContract.Events.DTSTART} ASC"
            )?.use { cursor ->
                val idIndex = cursor.getColumnIndex(CalendarContract.Events._ID)
                val calendarIdIndex = cursor.getColumnIndex(CalendarContract.Events.CALENDAR_ID)
                val titleIndex = cursor.getColumnIndex(CalendarContract.Events.TITLE)
                val descriptionIndex = cursor.getColumnIndex(CalendarContract.Events.DESCRIPTION)
                val locationIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_LOCATION)
                val startIndex = cursor.getColumnIndex(CalendarContract.Events.DTSTART)
                val endIndex = cursor.getColumnIndex(CalendarContract.Events.DTEND)
                val allDayIndex = cursor.getColumnIndex(CalendarContract.Events.ALL_DAY)
                val rruleIndex = cursor.getColumnIndex(CalendarContract.Events.RRULE)
                val colorIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_COLOR)
                val availabilityIndex = cursor.getColumnIndex(CalendarContract.Events.AVAILABILITY)
                val organizerIndex = cursor.getColumnIndex(CalendarContract.Events.ORGANIZER)
                
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idIndex)
                    val calendarId = cursor.getLong(calendarIdIndex)
                    val title = cursor.getString(titleIndex)
                    val description = cursor.getString(descriptionIndex)
                    val location = cursor.getString(locationIndex)
                    val startTime = cursor.getLong(startIndex)
                    val endTime = cursor.getLong(endIndex)
                    val allDay = cursor.getInt(allDayIndex) == 1
                    val rrule = cursor.getString(rruleIndex)
                    val color = cursor.getInt(colorIndex)
                    val availability = getAvailability(cursor.getInt(availabilityIndex))
                    val organizer = cursor.getString(organizerIndex)
                    
                    val attendees = getEventAttendees(id)
                    val reminders = getEventReminders(id)
                    
                    val event = CalendarManager.CalendarEvent(
                        id = id,
                        calendarId = calendarId,
                        calendarDisplayName = calendarNameMap[calendarId] ?: "Unknown Calendar",
                        title = title,
                        description = description,
                        location = location,
                        startTime = startTime,
                        endTime = endTime,
                        allDay = allDay,
                        recurring = rrule != null,
                        attendees = attendees,
                        reminders = reminders,
                        color = color,
                        availability = availability,
                        organizer = organizer
                    )
                    
                    events.add(event)
                }
            }
            
            Result.success(events)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getEventById(eventId: Long): Result<CalendarManager.CalendarEvent> {
        if (!hasCalendarPermissions()) {
            return Result.failure(SecurityException("Missing READ_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access calendar events"))
        }
        
        return try {
            val uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventId)
            val projection = arrayOf(
                CalendarContract.Events._ID,
                CalendarContract.Events.CALENDAR_ID,
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION,
                CalendarContract.Events.EVENT_LOCATION,
                CalendarContract.Events.DTSTART,
                CalendarContract.Events.DTEND,
                CalendarContract.Events.ALL_DAY,
                CalendarContract.Events.RRULE,
                CalendarContract.Events.EVENT_COLOR,
                CalendarContract.Events.AVAILABILITY,
                CalendarContract.Events.ORGANIZER
            )
            
            var event: CalendarManager.CalendarEvent? = null
            val calendarNameMap = getCalendarDisplayNames()
            
            contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val idIndex = cursor.getColumnIndex(CalendarContract.Events._ID)
                    val calendarIdIndex = cursor.getColumnIndex(CalendarContract.Events.CALENDAR_ID)
                    val titleIndex = cursor.getColumnIndex(CalendarContract.Events.TITLE)
                    val descriptionIndex = cursor.getColumnIndex(CalendarContract.Events.DESCRIPTION)
                    val locationIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_LOCATION)
                    val startIndex = cursor.getColumnIndex(CalendarContract.Events.DTSTART)
                    val endIndex = cursor.getColumnIndex(CalendarContract.Events.DTEND)
                    val allDayIndex = cursor.getColumnIndex(CalendarContract.Events.ALL_DAY)
                    val rruleIndex = cursor.getColumnIndex(CalendarContract.Events.RRULE)
                    val colorIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_COLOR)
                    val availabilityIndex = cursor.getColumnIndex(CalendarContract.Events.AVAILABILITY)
                    val organizerIndex = cursor.getColumnIndex(CalendarContract.Events.ORGANIZER)
                    
                    val id = cursor.getLong(idIndex)
                    val calendarId = cursor.getLong(calendarIdIndex)
                    val title = cursor.getString(titleIndex)
                    val description = cursor.getString(descriptionIndex)
                    val location = cursor.getString(locationIndex)
                    val startTime = cursor.getLong(startIndex)
                    val endTime = cursor.getLong(endIndex)
                    val allDay = cursor.getInt(allDayIndex) == 1
                    val rrule = cursor.getString(rruleIndex)
                    val color = cursor.getInt(colorIndex)
                    val availability = getAvailability(cursor.getInt(availabilityIndex))
                    val organizer = cursor.getString(organizerIndex)
                    
                    val attendees = getEventAttendees(id)
                    val reminders = getEventReminders(id)
                    
                    event = CalendarManager.CalendarEvent(
                        id = id,
                        calendarId = calendarId,
                        calendarDisplayName = calendarNameMap[calendarId] ?: "Unknown Calendar",
                        title = title,
                        description = description,
                        location = location,
                        startTime = startTime,
                        endTime = endTime,
                        allDay = allDay,
                        recurring = rrule != null,
                        attendees = attendees,
                        reminders = reminders,
                        color = color,
                        availability = availability,
                        organizer = organizer
                    )
                }
            }
            
            if (event != null) {
                Result.success(event)
            } else {
                Result.failure(NoSuchElementException("Event with ID $eventId not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun createEvent(event: CalendarManager.EventCreationRequest): Result<Long> {
        if (!hasCalendarWritePermissions()) {
            return Result.failure(SecurityException("Missing WRITE_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to modify calendars"))
        }
        
        return try {
            val values = ContentValues().apply {
                put(CalendarContract.Events.CALENDAR_ID, event.calendarId)
                put(CalendarContract.Events.TITLE, event.title)
                put(CalendarContract.Events.DESCRIPTION, event.description)
                put(CalendarContract.Events.EVENT_LOCATION, event.location)
                put(CalendarContract.Events.DTSTART, event.startTime)
                put(CalendarContract.Events.DTEND, event.endTime)
                put(CalendarContract.Events.ALL_DAY, if (event.allDay) 1 else 0)
                put(CalendarContract.Events.AVAILABILITY, getAvailabilityValue(event.availability))
                
                // Ensure the event is in the correct time zone
                put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
                
                // Set has_attendee_data to 1 if there are attendees
                if (event.attendees.isNotEmpty()) {
                    put(CalendarContract.Events.HAS_ATTENDEE_DATA, 1)
                }
            }
            
            val eventUri = contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
                ?: return Result.failure(Exception("Failed to create event"))
            
            val eventId = ContentUris.parseId(eventUri)
            
            // Add attendees if any
            if (event.attendees.isNotEmpty()) {
                for (attendeeEmail in event.attendees) {
                    val attendeeValues = ContentValues().apply {
                        put(CalendarContract.Attendees.EVENT_ID, eventId)
                        put(CalendarContract.Attendees.ATTENDEE_EMAIL, attendeeEmail)
                        put(CalendarContract.Attendees.ATTENDEE_TYPE, CalendarContract.Attendees.TYPE_NONE)
                        put(CalendarContract.Attendees.ATTENDEE_RELATIONSHIP, CalendarContract.Attendees.RELATIONSHIP_ATTENDEE)
                        put(CalendarContract.Attendees.ATTENDEE_STATUS, CalendarContract.Attendees.ATTENDEE_STATUS_INVITED)
                    }
                    contentResolver.insert(CalendarContract.Attendees.CONTENT_URI, attendeeValues)
                }
            }
            
            // Add reminders if any
            if (event.reminderMinutesBefore.isNotEmpty()) {
                for (minutes in event.reminderMinutesBefore) {
                    val reminderValues = ContentValues().apply {
                        put(CalendarContract.Reminders.EVENT_ID, eventId)
                        put(CalendarContract.Reminders.MINUTES, minutes)
                        put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT)
                    }
                    contentResolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues)
                }
            }
            
            // Log the event
            val eventObj = getEventById(eventId).getOrNull()
            phoneControlManager.logEvent(
                PhoneControlEvent.CalendarEventCreated(
                    eventTitle = event.title,
                    calendarName = eventObj?.calendarDisplayName ?: "Unknown",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(eventId)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun updateEvent(eventId: Long, updates: CalendarManager.EventCreationRequest): Result<Unit> {
        if (!hasCalendarWritePermissions()) {
            return Result.failure(SecurityException("Missing WRITE_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to modify calendars"))
        }
        
        return try {
            val uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventId)
            
            val values = ContentValues().apply {
                put(CalendarContract.Events.CALENDAR_ID, updates.calendarId)
                put(CalendarContract.Events.TITLE, updates.title)
                put(CalendarContract.Events.DESCRIPTION, updates.description)
                put(CalendarContract.Events.EVENT_LOCATION, updates.location)
                put(CalendarContract.Events.DTSTART, updates.startTime)
                put(CalendarContract.Events.DTEND, updates.endTime)
                put(CalendarContract.Events.ALL_DAY, if (updates.allDay) 1 else 0)
                put(CalendarContract.Events.AVAILABILITY, getAvailabilityValue(updates.availability))
                
                // Ensure the event is in the correct time zone
                put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().id)
            }
            
            val updatedRows = contentResolver.update(uri, values, null, null)
            if (updatedRows <= 0) {
                return Result.failure(Exception("Failed to update event"))
            }
            
            // Delete existing attendees and reminders
            contentResolver.delete(
                CalendarContract.Attendees.CONTENT_URI,
                "${CalendarContract.Attendees.EVENT_ID} = ?",
                arrayOf(eventId.toString())
            )
            
            contentResolver.delete(
                CalendarContract.Reminders.CONTENT_URI,
                "${CalendarContract.Reminders.EVENT_ID} = ?",
                arrayOf(eventId.toString())
            )
            
            // Add attendees if any
            if (updates.attendees.isNotEmpty()) {
                for (attendeeEmail in updates.attendees) {
                    val attendeeValues = ContentValues().apply {
                        put(CalendarContract.Attendees.EVENT_ID, eventId)
                        put(CalendarContract.Attendees.ATTENDEE_EMAIL, attendeeEmail)
                        put(CalendarContract.Attendees.ATTENDEE_TYPE, CalendarContract.Attendees.TYPE_NONE)
                        put(CalendarContract.Attendees.ATTENDEE_RELATIONSHIP, CalendarContract.Attendees.RELATIONSHIP_ATTENDEE)
                        put(CalendarContract.Attendees.ATTENDEE_STATUS, CalendarContract.Attendees.ATTENDEE_STATUS_INVITED)
                    }
                    contentResolver.insert(CalendarContract.Attendees.CONTENT_URI, attendeeValues)
                }
            }
            
            // Add reminders if any
            if (updates.reminderMinutesBefore.isNotEmpty()) {
                for (minutes in updates.reminderMinutesBefore) {
                    val reminderValues = ContentValues().apply {
                        put(CalendarContract.Reminders.EVENT_ID, eventId)
                        put(CalendarContract.Reminders.MINUTES, minutes)
                        put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT)
                    }
                    contentResolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues)
                }
            }
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.CalendarEventUpdated(
                    eventTitle = updates.title,
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun deleteEvent(eventId: Long, notifyAttendees: Boolean): Result<Unit> {
        if (!hasCalendarWritePermissions()) {
            return Result.failure(SecurityException("Missing WRITE_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to modify calendars"))
        }
        
        return try {
            // Get the event title before deleting for logging
            val event = getEventById(eventId).getOrNull()
            
            val uri = ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventId)
            
            val deletedRows = contentResolver.delete(uri, null, null)
            if (deletedRows <= 0) {
                return Result.failure(Exception("Failed to delete event"))
            }
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.CalendarEventDeleted(
                    eventTitle = event?.title ?: "Unknown Event",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getUpcomingEvents(windowDays: Int, limit: Int): Result<List<CalendarManager.CalendarEvent>> {
        if (!hasCalendarPermissions()) {
            return Result.failure(SecurityException("Missing READ_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access calendar events"))
        }
        
        val now = System.currentTimeMillis()
        val endTime = now + (windowDays * 24 * 60 * 60 * 1000L) // Add days in milliseconds
        
        return try {
            val events = mutableListOf<CalendarManager.CalendarEvent>()
            
            val uri = CalendarContract.Events.CONTENT_URI
            val projection = arrayOf(
                CalendarContract.Events._ID,
                CalendarContract.Events.CALENDAR_ID,
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION,
                CalendarContract.Events.EVENT_LOCATION,
                CalendarContract.Events.DTSTART,
                CalendarContract.Events.DTEND,
                CalendarContract.Events.ALL_DAY,
                CalendarContract.Events.RRULE,
                CalendarContract.Events.EVENT_COLOR,
                CalendarContract.Events.AVAILABILITY,
                CalendarContract.Events.ORGANIZER
            )
            
            val selection = "${CalendarContract.Events.DTSTART} >= ? AND ${CalendarContract.Events.DTSTART} <= ?"
            val selectionArgs = arrayOf(now.toString(), endTime.toString())
            
            val calendarNameMap = getCalendarDisplayNames()
            
            contentResolver.query(
                uri,
                projection,
                selection,
                selectionArgs,
                "${CalendarContract.Events.DTSTART} ASC LIMIT $limit"
            )?.use { cursor ->
                val idIndex = cursor.getColumnIndex(CalendarContract.Events._ID)
                val calendarIdIndex = cursor.getColumnIndex(CalendarContract.Events.CALENDAR_ID)
                val titleIndex = cursor.getColumnIndex(CalendarContract.Events.TITLE)
                val descriptionIndex = cursor.getColumnIndex(CalendarContract.Events.DESCRIPTION)
                val locationIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_LOCATION)
                val startIndex = cursor.getColumnIndex(CalendarContract.Events.DTSTART)
                val endIndex = cursor.getColumnIndex(CalendarContract.Events.DTEND)
                val allDayIndex = cursor.getColumnIndex(CalendarContract.Events.ALL_DAY)
                val rruleIndex = cursor.getColumnIndex(CalendarContract.Events.RRULE)
                val colorIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_COLOR)
                val availabilityIndex = cursor.getColumnIndex(CalendarContract.Events.AVAILABILITY)
                val organizerIndex = cursor.getColumnIndex(CalendarContract.Events.ORGANIZER)
                
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idIndex)
                    val calendarId = cursor.getLong(calendarIdIndex)
                    val title = cursor.getString(titleIndex)
                    val description = cursor.getString(descriptionIndex)
                    val location = cursor.getString(locationIndex)
                    val startTime = cursor.getLong(startIndex)
                    val endTime = cursor.getLong(endIndex)
                    val allDay = cursor.getInt(allDayIndex) == 1
                    val rrule = cursor.getString(rruleIndex)
                    val color = cursor.getInt(colorIndex)
                    val availability = getAvailability(cursor.getInt(availabilityIndex))
                    val organizer = cursor.getString(organizerIndex)
                    
                    val attendees = getEventAttendees(id)
                    val reminders = getEventReminders(id)
                    
                    val event = CalendarManager.CalendarEvent(
                        id = id,
                        calendarId = calendarId,
                        calendarDisplayName = calendarNameMap[calendarId] ?: "Unknown Calendar",
                        title = title,
                        description = description,
                        location = location,
                        startTime = startTime,
                        endTime = endTime,
                        allDay = allDay,
                        recurring = rrule != null,
                        attendees = attendees,
                        reminders = reminders,
                        color = color,
                        availability = availability,
                        organizer = organizer
                    )
                    
                    events.add(event)
                }
            }
            
            Result.success(events)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getCurrentEvents(): Result<List<CalendarManager.CalendarEvent>> {
        if (!hasCalendarPermissions()) {
            return Result.failure(SecurityException("Missing READ_CALENDAR permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(CALENDAR_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access calendar events"))
        }
        
        val now = System.currentTimeMillis()
        
        return try {
            val events = mutableListOf<CalendarManager.CalendarEvent>()
            
            val uri = CalendarContract.Events.CONTENT_URI
            val projection = arrayOf(
                CalendarContract.Events._ID,
                CalendarContract.Events.CALENDAR_ID,
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION,
                CalendarContract.Events.EVENT_LOCATION,
                CalendarContract.Events.DTSTART,
                CalendarContract.Events.DTEND,
                CalendarContract.Events.ALL_DAY,
                CalendarContract.Events.RRULE,
                CalendarContract.Events.EVENT_COLOR,
                CalendarContract.Events.AVAILABILITY,
                CalendarContract.Events.ORGANIZER
            )
            
            val selection = "${CalendarContract.Events.DTSTART} <= ? AND ${CalendarContract.Events.DTEND} >= ?"
            val selectionArgs = arrayOf(now.toString(), now.toString())
            
            val calendarNameMap = getCalendarDisplayNames()
            
            contentResolver.query(
                uri,
                projection,
                selection,
                selectionArgs,
                "${CalendarContract.Events.DTSTART} ASC"
            )?.use { cursor ->
                val idIndex = cursor.getColumnIndex(CalendarContract.Events._ID)
                val calendarIdIndex = cursor.getColumnIndex(CalendarContract.Events.CALENDAR_ID)
                val titleIndex = cursor.getColumnIndex(CalendarContract.Events.TITLE)
                val descriptionIndex = cursor.getColumnIndex(CalendarContract.Events.DESCRIPTION)
                val locationIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_LOCATION)
                val startIndex = cursor.getColumnIndex(CalendarContract.Events.DTSTART)
                val endIndex = cursor.getColumnIndex(CalendarContract.Events.DTEND)
                val allDayIndex = cursor.getColumnIndex(CalendarContract.Events.ALL_DAY)
                val rruleIndex = cursor.getColumnIndex(CalendarContract.Events.RRULE)
                val colorIndex = cursor.getColumnIndex(CalendarContract.Events.EVENT_COLOR)
                val availabilityIndex = cursor.getColumnIndex(CalendarContract.Events.AVAILABILITY)
                val organizerIndex = cursor.getColumnIndex(CalendarContract.Events.ORGANIZER)
                
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idIndex)
                    val calendarId = cursor.getLong(calendarIdIndex)
                    val title = cursor.getString(titleIndex)
                    val description = cursor.getString(descriptionIndex)
                    val location = cursor.getString(locationIndex)
                    val startTime = cursor.getLong(startIndex)
                    val endTime = cursor.getLong(endIndex)
                    val allDay = cursor.getInt(allDayIndex) == 1
                    val rrule = cursor.getString(rruleIndex)
                    val color = cursor.getInt(colorIndex)
                    val availability = getAvailability(cursor.getInt(availabilityIndex))
                    val organizer = cursor.getString(organizerIndex)
                    
                    val attendees = getEventAttendees(id)
                    val reminders = getEventReminders(id)
                    
                    val event = CalendarManager.CalendarEvent(
                        id = id,
                        calendarId = calendarId,
                        calendarDisplayName = calendarNameMap[calendarId] ?: "Unknown Calendar",
                        title = title,
                        description = description,
                        location = location,
                        startTime = startTime,
                        endTime = endTime,
                        allDay = allDay,
                        recurring = rrule != null,
                        attendees = attendees,
                        reminders = reminders,
                        color = color,
                        availability = availability,
                        organizer = organizer
                    )
                    
                    events.add(event)
                }
            }
            
            Result.success(events)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getConflictsForTimeSlot(
        startTime: Long,
        endTime: Long,
        calendarIds: List<Long>
    ): Result<List<CalendarManager.CalendarEvent>> {
        // This is essentially the same as getEvents for this time slot
        return getEvents(calendarIds, startTime, endTime)
    }
    
    override suspend fun isCalendarFunctionalityAvailable(): Boolean {
        return hasCalendarPermissions()
    }
    
    /**
     * Check if we have calendar read permissions
     */
    private fun hasCalendarPermissions(): Boolean {
        return permissionManager.checkPermission(Manifest.permission.READ_CALENDAR)
    }
    
    /**
     * Check if we have calendar write permissions
     */
    private fun hasCalendarWritePermissions(): Boolean {
        return permissionManager.checkPermission(Manifest.permission.WRITE_CALENDAR) &&
               permissionManager.checkPermission(Manifest.permission.READ_CALENDAR)
    }
    
    /**
     * Get event attendees
     */
    private fun getEventAttendees(eventId: Long): List<CalendarManager.Attendee> {
        val attendees = mutableListOf<CalendarManager.Attendee>()
        
        val uri = CalendarContract.Attendees.CONTENT_URI
        val projection = arrayOf(
            CalendarContract.Attendees.ATTENDEE_NAME,
            CalendarContract.Attendees.ATTENDEE_EMAIL,
            CalendarContract.Attendees.ATTENDEE_RELATIONSHIP,
            CalendarContract.Attendees.ATTENDEE_STATUS
        )
        
        val selection = "${CalendarContract.Attendees.EVENT_ID} = ?"
        val selectionArgs = arrayOf(eventId.toString())
        
        contentResolver.query(uri, projection, selection, selectionArgs, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(CalendarContract.Attendees.ATTENDEE_NAME)
            val emailIndex = cursor.getColumnIndex(CalendarContract.Attendees.ATTENDEE_EMAIL)
            val relationshipIndex = cursor.getColumnIndex(CalendarContract.Attendees.ATTENDEE_RELATIONSHIP)
            val statusIndex = cursor.getColumnIndex(CalendarContract.Attendees.ATTENDEE_STATUS)
            
            while (cursor.moveToNext()) {
                val name = cursor.getString(nameIndex)
                val email = cursor.getString(emailIndex)
                val relationship = getAttendeeRelationship(cursor.getInt(relationshipIndex))
                val status = getAttendeeStatus(cursor.getInt(statusIndex))
                
                val attendee = CalendarManager.Attendee(
                    name = name,
                    email = email,
                    relationship = relationship,
                    status = status
                )
                
                attendees.add(attendee)
            }
        }
        
        return attendees
    }
    
    /**
     * Get event reminders
     */
    private fun getEventReminders(eventId: Long): List<CalendarManager.Reminder> {
        val reminders = mutableListOf<CalendarManager.Reminder>()
        
        val uri = CalendarContract.Reminders.CONTENT_URI
        val projection = arrayOf(
            CalendarContract.Reminders._ID,
            CalendarContract.Reminders.EVENT_ID,
            CalendarContract.Reminders.METHOD,
            CalendarContract.Reminders.MINUTES
        )
        
        val selection = "${CalendarContract.Reminders.EVENT_ID} = ?"
        val selectionArgs = arrayOf(eventId.toString())
        
        contentResolver.query(uri, projection, selection, selectionArgs, null)?.use { cursor ->
            val idIndex = cursor.getColumnIndex(CalendarContract.Reminders._ID)
            val eventIdIndex = cursor.getColumnIndex(CalendarContract.Reminders.EVENT_ID)
            val methodIndex = cursor.getColumnIndex(CalendarContract.Reminders.METHOD)
            val minutesIndex = cursor.getColumnIndex(CalendarContract.Reminders.MINUTES)
            
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idIndex)
                val eventIdFromCursor = cursor.getLong(eventIdIndex)
                val method = getReminderMethod(cursor.getInt(methodIndex))
                val minutes = cursor.getInt(minutesIndex)
                
                val reminder = CalendarManager.Reminder(
                    id = id,
                    eventId = eventIdFromCursor,
                    method = method,
                    minutesBefore = minutes
                )
                
                reminders.add(reminder)
            }
        }
        
        return reminders
    }
    
    /**
     * Get calendar display names map (calendarId -> displayName)
     */
    private fun getCalendarDisplayNames(): Map<Long, String> {
        val nameMap = mutableMapOf<Long, String>()
        
        val uri = CalendarContract.Calendars.CONTENT_URI
        val projection = arrayOf(
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.CALENDAR_DISPLAY_NAME
        )
        
        contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
            val idIndex = cursor.getColumnIndex(CalendarContract.Calendars._ID)
            val nameIndex = cursor.getColumnIndex(CalendarContract.Calendars.CALENDAR_DISPLAY_NAME)
            
            while (cursor.moveToNext()) {
                val id = cursor.getLong(idIndex)
                val name = cursor.getString(nameIndex)
                nameMap[id] = name
            }
        }
        
        return nameMap
    }
    
    /**
     * Convert Android calendar access level to our enum
     */
    private fun getAccessLevel(accessLevel: Int): CalendarManager.AccessLevel {
        return when (accessLevel) {
            CalendarContract.Calendars.CAL_ACCESS_NONE -> CalendarManager.AccessLevel.NO_ACCESS
            CalendarContract.Calendars.CAL_ACCESS_READ -> CalendarManager.AccessLevel.READ_ONLY
            CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR -> CalendarManager.AccessLevel.CONTRIBUTOR
            CalendarContract.Calendars.CAL_ACCESS_EDITOR -> CalendarManager.AccessLevel.EDITOR
            CalendarContract.Calendars.CAL_ACCESS_OWNER -> CalendarManager.AccessLevel.OWNER
            else -> CalendarManager.AccessLevel.NO_ACCESS
        }
    }
    
    /**
     * Convert Android calendar availability to our enum
     */
    private fun getAvailability(availability: Int): CalendarManager.Availability {
        return when (availability) {
            CalendarContract.Events.AVAILABILITY_BUSY -> CalendarManager.Availability.BUSY
            CalendarContract.Events.AVAILABILITY_FREE -> CalendarManager.Availability.FREE
            CalendarContract.Events.AVAILABILITY_TENTATIVE -> CalendarManager.Availability.TENTATIVE
            else -> CalendarManager.Availability.BUSY
        }
    }
    
    /**
     * Convert our availability enum to Android calendar availability value
     */
    private fun getAvailabilityValue(availability: CalendarManager.Availability): Int {
        return when (availability) {
            CalendarManager.Availability.BUSY -> CalendarContract.Events.AVAILABILITY_BUSY
            CalendarManager.Availability.FREE -> CalendarContract.Events.AVAILABILITY_FREE
            CalendarManager.Availability.TENTATIVE -> CalendarContract.Events.AVAILABILITY_TENTATIVE
        }
    }
    
    /**
     * Convert Android attendee relationship to our enum
     */
    private fun getAttendeeRelationship(relationship: Int): CalendarManager.AttendeeRelationship {
        return when (relationship) {
            CalendarContract.Attendees.RELATIONSHIP_NONE -> CalendarManager.AttendeeRelationship.NONE
            CalendarContract.Attendees.RELATIONSHIP_ATTENDEE -> CalendarManager.AttendeeRelationship.ATTENDEE
            CalendarContract.Attendees.RELATIONSHIP_ORGANIZER -> CalendarManager.AttendeeRelationship.ORGANIZER
            CalendarContract.Attendees.RELATIONSHIP_PERFORMER -> CalendarManager.AttendeeRelationship.PERFORMER
            CalendarContract.Attendees.RELATIONSHIP_SPEAKER -> CalendarManager.AttendeeRelationship.SPEAKER
            else -> CalendarManager.AttendeeRelationship.NONE
        }
    }
    
    /**
     * Convert Android attendee status to our enum
     */
    private fun getAttendeeStatus(status: Int): CalendarManager.AttendeeStatus {
        return when (status) {
            CalendarContract.Attendees.ATTENDEE_STATUS_NONE -> CalendarManager.AttendeeStatus.NONE
            CalendarContract.Attendees.ATTENDEE_STATUS_ACCEPTED -> CalendarManager.AttendeeStatus.ACCEPTED
            CalendarContract.Attendees.ATTENDEE_STATUS_DECLINED -> CalendarManager.AttendeeStatus.DECLINED
            CalendarContract.Attendees.ATTENDEE_STATUS_INVITED -> CalendarManager.AttendeeStatus.INVITED
            CalendarContract.Attendees.ATTENDEE_STATUS_TENTATIVE -> CalendarManager.AttendeeStatus.TENTATIVE
            else -> CalendarManager.AttendeeStatus.NONE
        }
    }
    
    /**
     * Convert Android reminder method to our enum
     */
    private fun getReminderMethod(method: Int): CalendarManager.ReminderMethod {
        return when (method) {
            CalendarContract.Reminders.METHOD_ALERT -> CalendarManager.ReminderMethod.ALERT
            CalendarContract.Reminders.METHOD_EMAIL -> CalendarManager.ReminderMethod.EMAIL
            CalendarContract.Reminders.METHOD_SMS -> CalendarManager.ReminderMethod.SMS
            else -> CalendarManager.ReminderMethod.ALERT
        }
    }
}

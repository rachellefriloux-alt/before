/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * CalendarManager - Interface for calendar control operations
 */

package com.sallie.phonecontrol.calendar

import android.graphics.Color
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime

/**
 * Interface for managing calendar events and operations
 */
interface CalendarManager {

    /**
     * Data class representing a calendar account
     */
    data class CalendarAccount(
        val id: Long,
        val accountName: String,
        val displayName: String,
        val ownerAccount: String,
        val color: Int,
        val accessLevel: AccessLevel
    )
    
    /**
     * Data class representing a calendar event
     */
    data class CalendarEvent(
        val id: Long,
        val calendarId: Long,
        val calendarDisplayName: String,
        val title: String,
        val description: String?,
        val location: String?,
        val startTime: Long,
        val endTime: Long,
        val allDay: Boolean,
        val recurring: Boolean,
        val attendees: List<Attendee>,
        val reminders: List<Reminder>,
        val color: Int,
        val availability: Availability,
        val organizer: String?
    )
    
    /**
     * Data class representing an attendee of an event
     */
    data class Attendee(
        val name: String?,
        val email: String,
        val relationship: AttendeeRelationship,
        val status: AttendeeStatus
    )
    
    /**
     * Data class representing a reminder for an event
     */
    data class Reminder(
        val id: Long,
        val eventId: Long,
        val method: ReminderMethod,
        val minutesBefore: Int
    )
    
    /**
     * Data class for creating a new calendar event
     */
    data class EventCreationRequest(
        val calendarId: Long,
        val title: String,
        val description: String? = null,
        val location: String? = null,
        val startTime: Long,
        val endTime: Long,
        val allDay: Boolean = false,
        val attendees: List<String> = emptyList(),
        val reminderMinutesBefore: List<Int> = listOf(15), // Default 15 minutes before
        val availability: Availability = Availability.BUSY
    )
    
    /**
     * Calendar events flow for observing changes
     */
    val calendarEvents: Flow<CalendarEvent>
    
    /**
     * Calendar access levels
     */
    enum class AccessLevel {
        NO_ACCESS,
        READ_ONLY,
        CONTRIBUTOR,
        EDITOR,
        OWNER
    }
    
    /**
     * Attendee relationships to the event
     */
    enum class AttendeeRelationship {
        NONE,
        ATTENDEE,
        ORGANIZER,
        PERFORMER,
        SPEAKER
    }
    
    /**
     * Attendee response status
     */
    enum class AttendeeStatus {
        NONE,
        ACCEPTED,
        DECLINED,
        INVITED,
        TENTATIVE
    }
    
    /**
     * Reminder methods
     */
    enum class ReminderMethod {
        ALERT,
        EMAIL,
        SMS
    }
    
    /**
     * Event availability status
     */
    enum class Availability {
        BUSY,
        FREE,
        TENTATIVE
    }
    
    /**
     * Get list of available calendars
     * 
     * @return Result containing list of CalendarAccount or an error
     */
    suspend fun getCalendars(): Result<List<CalendarAccount>>
    
    /**
     * Get events between the specified time range
     * 
     * @param calendarIds IDs of calendars to query, empty for all accessible calendars
     * @param startTime Start time in milliseconds since epoch
     * @param endTime End time in milliseconds since epoch
     * @return Result containing list of CalendarEvent or an error
     */
    suspend fun getEvents(
        calendarIds: List<Long> = emptyList(),
        startTime: Long,
        endTime: Long
    ): Result<List<CalendarEvent>>
    
    /**
     * Get details of a specific event
     * 
     * @param eventId ID of the event to retrieve
     * @return Result containing CalendarEvent or an error
     */
    suspend fun getEventById(eventId: Long): Result<CalendarEvent>
    
    /**
     * Create a new calendar event
     * 
     * @param event Event creation request
     * @return Result containing ID of the created event, or an error
     */
    suspend fun createEvent(event: EventCreationRequest): Result<Long>
    
    /**
     * Update an existing calendar event
     * 
     * @param eventId ID of the event to update
     * @param updates Event creation request with updated fields
     * @return Result indicating success or failure
     */
    suspend fun updateEvent(eventId: Long, updates: EventCreationRequest): Result<Unit>
    
    /**
     * Delete a calendar event
     * 
     * @param eventId ID of the event to delete
     * @param notifyAttendees Whether to notify attendees of the deletion
     * @return Result indicating success or failure
     */
    suspend fun deleteEvent(eventId: Long, notifyAttendees: Boolean = true): Result<Unit>
    
    /**
     * Get upcoming events within the specified time window
     * 
     * @param windowDays Number of days to look ahead
     * @param limit Maximum number of events to return
     * @return Result containing list of CalendarEvent sorted by start time, or an error
     */
    suspend fun getUpcomingEvents(windowDays: Int = 7, limit: Int = 10): Result<List<CalendarEvent>>
    
    /**
     * Get ongoing events at the current time
     * 
     * @return Result containing list of currently ongoing CalendarEvent objects, or an error
     */
    suspend fun getCurrentEvents(): Result<List<CalendarEvent>>
    
    /**
     * Get conflicts for a proposed time slot
     * 
     * @param startTime Start time in milliseconds
     * @param endTime End time in milliseconds
     * @param calendarIds IDs of calendars to check, empty for all accessible calendars
     * @return Result containing list of conflicting CalendarEvent objects, or an error
     */
    suspend fun getConflictsForTimeSlot(
        startTime: Long,
        endTime: Long,
        calendarIds: List<Long> = emptyList()
    ): Result<List<CalendarEvent>>
    
    /**
     * Check if calendar functionality is available on this device
     * 
     * @return true if available, false otherwise
     */
    suspend fun isCalendarFunctionalityAvailable(): Boolean
}

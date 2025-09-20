/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * App Interaction Models - Models for interacting with and controlling device applications
 * Provides structures for app information, sessions, actions, responses, and notifications
 */

package com.sallie.device.phone.models

import android.graphics.drawable.Drawable
import kotlinx.serialization.Serializable
import java.util.UUID

/**
 * Represents an installed application
 */
@Serializable
data class AppInfo(
    val packageName: String,
    val name: String,
    val versionName: String,
    val versionCode: Int,
    val installTime: Long,
    val updateTime: Long,
    val size: Long,
    val category: String? = null,
    val isSystemApp: Boolean = false,
    val permissions: List<String> = emptyList(),
    val features: List<String> = emptyList()
) {
    // Non-serializable properties
    var icon: Drawable? = null
}

/**
 * Represents a session with an opened application
 */
data class AppSession(
    val id: String = UUID.randomUUID().toString(),
    val app: AppInfo,
    val startTime: Long = System.currentTimeMillis(),
    val context: Map<String, Any> = emptyMap()
)

/**
 * Types of app actions
 */
enum class AppActionType {
    CLICK,
    LONG_CLICK,
    SCROLL,
    SWIPE,
    TEXT_INPUT,
    NAVIGATE,
    MEDIA_CONTROL,
    CUSTOM
}

/**
 * Base class for app actions
 */
sealed class AppAction {
    abstract val type: AppActionType
    abstract val targetId: String?
    
    data class Click(
        override val targetId: String? = null, 
        val x: Float? = null, 
        val y: Float? = null,
        val targetDescription: String? = null
    ) : AppAction() {
        override val type: AppActionType = AppActionType.CLICK
    }
    
    data class LongClick(
        override val targetId: String? = null, 
        val x: Float? = null, 
        val y: Float? = null,
        val durationMs: Long = 500,
        val targetDescription: String? = null
    ) : AppAction() {
        override val type: AppActionType = AppActionType.LONG_CLICK
    }
    
    data class Scroll(
        override val targetId: String? = null,
        val direction: ScrollDirection,
        val distance: Int = 100
    ) : AppAction() {
        override val type: AppActionType = AppActionType.SCROLL
        
        enum class ScrollDirection {
            UP, DOWN, LEFT, RIGHT
        }
    }
    
    data class Swipe(
        override val targetId: String? = null,
        val startX: Float,
        val startY: Float,
        val endX: Float,
        val endY: Float,
        val durationMs: Long = 300
    ) : AppAction() {
        override val type: AppActionType = AppActionType.SWIPE
    }
    
    data class TextInput(
        override val targetId: String? = null,
        val text: String,
        val replaceExisting: Boolean = true
    ) : AppAction() {
        override val type: AppActionType = AppActionType.TEXT_INPUT
    }
    
    data class Navigate(
        val route: String,
        val params: Map<String, Any> = emptyMap(),
        override val targetId: String? = null
    ) : AppAction() {
        override val type: AppActionType = AppActionType.NAVIGATE
    }
    
    data class MediaControl(
        val mediaAction: MediaAction,
        override val targetId: String? = null
    ) : AppAction() {
        override val type: AppActionType = AppActionType.MEDIA_CONTROL
        
        enum class MediaAction {
            PLAY, PAUSE, STOP, NEXT, PREVIOUS,
            REWIND, FAST_FORWARD, MUTE, UNMUTE,
            VOLUME_UP, VOLUME_DOWN
        }
    }
    
    data class Custom(
        override val targetId: String?,
        val actionName: String,
        val params: Map<String, Any> = emptyMap()
    ) : AppAction() {
        override val type: AppActionType = AppActionType.CUSTOM
    }
}

/**
 * Result of an app action
 */
data class AppActionResult(
    val success: Boolean,
    val response: Map<String, Any> = emptyMap(),
    val error: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Types of app content
 */
enum class AppContentType {
    TEXT,
    MEDIA,
    DATA,
    UI_STRUCTURE,
    CONTACTS,
    MESSAGES,
    CUSTOM
}

/**
 * Base class for app content
 */
sealed class AppContent {
    abstract val type: AppContentType
    abstract val timestamp: Long
    
    data class TextContent(
        val text: String,
        val source: String? = null,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.TEXT
    }
    
    data class MediaContent(
        val mediaItems: List<MediaItem>,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.MEDIA
        
        data class MediaItem(
            val id: String,
            val name: String,
            val type: String,
            val url: String? = null,
            val metadata: Map<String, Any> = emptyMap()
        )
    }
    
    data class DataContent(
        val data: Map<String, Any>,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.DATA
    }
    
    data class UIStructureContent(
        val elements: List<UIElement>,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.UI_STRUCTURE
    }
    
    data class ContactsContent(
        val contacts: List<Contact>,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.CONTACTS
        
        data class Contact(
            val id: String,
            val name: String,
            val phoneNumbers: List<String> = emptyList(),
            val emails: List<String> = emptyList(),
            val metadata: Map<String, Any> = emptyMap()
        )
    }
    
    data class MessagesContent(
        val messages: List<Message>,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.MESSAGES
        
        data class Message(
            val id: String,
            val sender: String,
            val content: String,
            val timestamp: Long,
            val isRead: Boolean = false,
            val metadata: Map<String, Any> = emptyMap()
        )
    }
    
    data class CustomContent(
        val contentName: String,
        val content: Map<String, Any>,
        override val timestamp: Long = System.currentTimeMillis()
    ) : AppContent() {
        override val type: AppContentType = AppContentType.CUSTOM
    }
}

/**
 * Represents the content of the current screen
 */
data class ScreenContent(
    val timestamp: Long = System.currentTimeMillis(),
    val packageName: String,
    val activityName: String? = null,
    val elements: List<UIElement> = emptyList(),
    val hierarchy: String? = null,
    val screenshot: Any? = null
)

/**
 * Represents a notification
 */
data class Notification(
    val id: String,
    val packageName: String,
    val title: String,
    val content: String,
    val timestamp: Long,
    val category: String? = null,
    val priority: Int = 0,
    val actions: List<String> = emptyList(),
    val isOngoing: Boolean = false,
    val isClearable: Boolean = true,
    val extras: Map<String, Any> = emptyMap()
)

/**
 * Represents a UI element
 */
data class UIElement(
    val id: String? = null,
    val contentDescription: String? = null,
    val text: String? = null,
    val className: String? = null,
    val isClickable: Boolean = false,
    val isChecked: Boolean? = null,
    val isEnabled: Boolean = true,
    val isFocused: Boolean = false,
    val isSelected: Boolean = false,
    val bounds: Bounds,
    val children: List<UIElement> = emptyList(),
    val attributes: Map<String, Any> = emptyMap()
) {
    data class Bounds(
        val left: Int,
        val top: Int,
        val right: Int,
        val bottom: Int
    )
}

/**
 * Query for finding UI elements
 */
data class UIElementQuery(
    val id: String? = null,
    val contentDescription: String? = null,
    val text: String? = null,
    val textContains: String? = null,
    val className: String? = null,
    val isClickable: Boolean? = null,
    val isChecked: Boolean? = null,
    val isEnabled: Boolean? = null
)

/**
 * Accessibility action types
 */
enum class AccessibilityActionType {
    CLICK,
    LONG_CLICK,
    SCROLL,
    SWIPE,
    TEXT_INPUT,
    BACK,
    HOME,
    RECENTS,
    GLOBAL_ACTION
}

/**
 * Base class for accessibility actions
 */
sealed class AccessibilityAction {
    abstract val type: AccessibilityActionType
    abstract val target: String?
    
    data class Click(
        override val target: String? = null,
        val x: Float? = null,
        val y: Float? = null
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = AccessibilityActionType.CLICK
    }
    
    data class LongClick(
        override val target: String? = null,
        val x: Float? = null,
        val y: Float? = null,
        val durationMs: Long = 500
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = AccessibilityActionType.LONG_CLICK
    }
    
    data class Scroll(
        val direction: Direction,
        override val target: String? = null
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = AccessibilityActionType.SCROLL
        
        enum class Direction {
            UP, DOWN, LEFT, RIGHT
        }
    }
    
    data class Swipe(
        val startX: Float,
        val startY: Float,
        val endX: Float,
        val endY: Float,
        val durationMs: Long = 300,
        override val target: String? = null
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = AccessibilityActionType.SWIPE
    }
    
    data class TextInput(
        override val target: String,
        val text: String,
        val replaceExisting: Boolean = true
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = AccessibilityActionType.TEXT_INPUT
    }
    
    data class SystemButton(
        val button: SystemButtonType,
        override val target: String? = null
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = when (button) {
            SystemButtonType.BACK -> AccessibilityActionType.BACK
            SystemButtonType.HOME -> AccessibilityActionType.HOME
            SystemButtonType.RECENTS -> AccessibilityActionType.RECENTS
        }
        
        enum class SystemButtonType {
            BACK, HOME, RECENTS
        }
    }
    
    data class GlobalAction(
        val action: GlobalActionType,
        override val target: String? = null
    ) : AccessibilityAction() {
        override val type: AccessibilityActionType = AccessibilityActionType.GLOBAL_ACTION
        
        enum class GlobalActionType {
            NOTIFICATIONS,
            QUICK_SETTINGS,
            LOCK_SCREEN,
            SCREENSHOT,
            SPLIT_SCREEN,
            POWER_DIALOG
        }
    }
}

/**
 * Cross-app workflow for automation
 */
data class CrossAppWorkflow(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String? = null,
    val steps: List<WorkflowStep>,
    val autoRetry: Boolean = false,
    val maxRetries: Int = 3
)

/**
 * Steps for cross-app workflows
 */
sealed class WorkflowStep {
    
    data class LaunchAppStep(
        val packageName: String,
        val launchParams: Map<String, Any>? = null
    ) : WorkflowStep()
    
    data class AppActionStep(
        val packageName: String,
        val action: AppAction
    ) : WorkflowStep()
    
    data class AccessibilityStep(
        val action: AccessibilityAction
    ) : WorkflowStep()
    
    data class WaitStep(
        val durationMs: Long
    ) : WorkflowStep()
    
    data class NotificationStep(
        val notificationId: String? = null,
        val action: String
    ) : WorkflowStep()
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Phone App Control Usage Examples
 * Demonstrates how to use Sallie's phone control capabilities
 */

import com.sallie.device.phone.PhoneControlSystem
import com.sallie.device.phone.models.*
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

/**
 * Example of using PhoneControlSystem to interact with apps
 */
fun phoneControlExample(phoneControlSystem: PhoneControlSystem) = runBlocking {
    // Initialize the phone control system
    phoneControlSystem.initialize()
    
    // Listen for phone events
    val job = launch {
        phoneControlSystem.phoneEvents.collect { event ->
            println("Phone event: $event")
        }
    }
    
    try {
        // Get a list of installed apps
        val apps = phoneControlSystem.getInstalledApps()
        println("Found ${apps.size} installed apps")
        
        // Launch a messaging app
        val messagingApp = apps.find { it.packageName.contains("messaging") }
        if (messagingApp != null) {
            println("Launching ${messagingApp.name}")
            phoneControlSystem.launchApp(messagingApp.packageName)
            
            // Wait for app to launch
            kotlinx.coroutines.delay(1000)
            
            // Get current screen content
            val screenContent = phoneControlSystem.getCurrentScreenContent()
            println("Current screen: ${screenContent?.packageName}, ${screenContent?.elements?.size} elements")
            
            // Find the compose button
            val composeButton = phoneControlSystem.findUIElements(
                UIElementQuery(
                    contentDescription = "Compose",
                    isClickable = true
                )
            ).firstOrNull()
            
            // Click the compose button
            if (composeButton != null) {
                println("Found compose button, clicking it")
                phoneControlSystem.performAccessibilityAction(
                    AccessibilityAction.Click(target = composeButton.id)
                )
                
                // Wait for compose screen
                kotlinx.coroutines.delay(500)
                
                // Find recipient field
                val recipientField = phoneControlSystem.findUIElements(
                    UIElementQuery(
                        contentDescription = "To",
                        className = "android.widget.EditText"
                    )
                ).firstOrNull()
                
                // Enter recipient
                if (recipientField != null) {
                    println("Entering recipient")
                    phoneControlSystem.performAccessibilityAction(
                        AccessibilityAction.TextInput(
                            target = recipientField.id,
                            text = "John Smith"
                        )
                    )
                    
                    // Find message field
                    val messageField = phoneControlSystem.findUIElements(
                        UIElementQuery(
                            contentDescription = "Message",
                            className = "android.widget.EditText"
                        )
                    ).firstOrNull()
                    
                    // Enter message
                    if (messageField != null) {
                        println("Entering message")
                        phoneControlSystem.performAccessibilityAction(
                            AccessibilityAction.TextInput(
                                target = messageField.id,
                                text = "Hello from Sallie! This is an automated message."
                            )
                        )
                        
                        // Find send button
                        val sendButton = phoneControlSystem.findUIElements(
                            UIElementQuery(
                                contentDescription = "Send",
                                isClickable = true
                            )
                        ).firstOrNull()
                        
                        // Click send button
                        if (sendButton != null) {
                            println("Sending message")
                            phoneControlSystem.performAccessibilityAction(
                                AccessibilityAction.Click(target = sendButton.id)
                            )
                            println("Message sent!")
                        } else {
                            println("Could not find send button")
                        }
                    } else {
                        println("Could not find message field")
                    }
                } else {
                    println("Could not find recipient field")
                }
            } else {
                println("Could not find compose button")
            }
            
            // Close the app
            println("Closing ${messagingApp.name}")
            phoneControlSystem.closeApp(messagingApp.packageName)
        } else {
            println("No messaging app found")
        }
        
        // Check for notifications
        val notifications = phoneControlSystem.getActiveNotifications()
        println("Found ${notifications.size} active notifications")
        
        // Interact with a notification if available
        if (notifications.isNotEmpty()) {
            val notification = notifications.first()
            println("Interacting with notification: ${notification.title}")
            
            if (notification.actions.isNotEmpty()) {
                val action = notification.actions.first()
                phoneControlSystem.interactWithNotification(notification.id, action)
                println("Performed action '$action' on notification")
            }
        }
        
        // Create and execute a cross-app workflow
        val workflow = CrossAppWorkflow(
            name = "Check Weather and Send Message",
            steps = listOf(
                // Launch weather app
                WorkflowStep.LaunchAppStep(
                    packageName = apps.find { it.packageName.contains("weather") }?.packageName ?: ""
                ),
                
                // Wait for app to load
                WorkflowStep.WaitStep(durationMs = 1000),
                
                // Get weather content
                WorkflowStep.AppActionStep(
                    packageName = apps.find { it.packageName.contains("weather") }?.packageName ?: "",
                    action = AppAction.Click(targetId = "refresh_button")
                ),
                
                // Wait for refresh
                WorkflowStep.WaitStep(durationMs = 500),
                
                // Close weather app
                WorkflowStep.AccessibilityStep(
                    action = AccessibilityAction.SystemButton(
                        button = AccessibilityAction.SystemButton.SystemButtonType.HOME
                    )
                ),
                
                // Wait before next app
                WorkflowStep.WaitStep(durationMs = 500),
                
                // Launch messaging app
                WorkflowStep.LaunchAppStep(
                    packageName = apps.find { it.packageName.contains("messaging") }?.packageName ?: ""
                )
            )
        )
        
        if (apps.any { it.packageName.contains("weather") } && 
            apps.any { it.packageName.contains("messaging") }) {
            println("Executing workflow: ${workflow.name}")
            val result = phoneControlSystem.executeCrossAppWorkflow(workflow)
            println("Workflow execution ${if (result) "successful" else "failed"}")
        } else {
            println("Required apps not found for workflow")
        }
    } finally {
        // Always shutdown properly
        job.cancel()
        phoneControlSystem.shutdown()
    }
}

/**
 * Example of creating app automation
 */
fun createAutomationExample(phoneControlSystem: PhoneControlSystem) = runBlocking {
    // Initialize the phone control system
    phoneControlSystem.initialize()
    
    try {
        // Refresh the list of installed apps
        phoneControlSystem.refreshInstalledApps()
        val apps = phoneControlSystem.getInstalledApps()
        
        // Find social media apps
        val socialApps = apps.filter { 
            it.packageName.contains("facebook") || 
            it.packageName.contains("instagram") || 
            it.packageName.contains("twitter") ||
            it.packageName.contains("linkedin")
        }
        
        println("Found ${socialApps.size} social media apps")
        
        // Create a "Social Media Update" workflow
        if (socialApps.isNotEmpty()) {
            val steps = mutableListOf<WorkflowStep>()
            
            // For each social app, add steps to post an update
            for (app in socialApps) {
                // Add steps to launch app
                steps.add(WorkflowStep.LaunchAppStep(packageName = app.packageName))
                
                // Wait for app to launch
                steps.add(WorkflowStep.WaitStep(durationMs = 1500))
                
                // Click new post/compose button (this would need to be customized per app)
                steps.add(
                    WorkflowStep.AccessibilityStep(
                        action = AccessibilityAction.Click(
                            x = 540f,  // Center of screen horizontally
                            y = 1800f  // Near bottom of screen (where compose buttons often are)
                        )
                    )
                )
                
                // Wait for compose screen
                steps.add(WorkflowStep.WaitStep(durationMs = 1000))
                
                // Enter post text
                steps.add(
                    WorkflowStep.AccessibilityStep(
                        action = AccessibilityAction.TextInput(
                            target = "post_input",  // This ID would need to be found at runtime
                            text = "Hello from Sallie! Automating my social media updates. #automation #AI"
                        )
                    )
                )
                
                // Click post/send button
                steps.add(
                    WorkflowStep.AccessibilityStep(
                        action = AccessibilityAction.Click(
                            target = "post_button"  // This ID would need to be found at runtime
                        )
                    )
                )
                
                // Wait for post to complete
                steps.add(WorkflowStep.WaitStep(durationMs = 1500))
                
                // Go back to home
                steps.add(
                    WorkflowStep.AccessibilityStep(
                        action = AccessibilityAction.SystemButton(
                            button = AccessibilityAction.SystemButton.SystemButtonType.HOME
                        )
                    )
                )
                
                // Wait before next app
                steps.add(WorkflowStep.WaitStep(durationMs = 1000))
            }
            
            // Create the workflow
            val workflow = CrossAppWorkflow(
                name = "Social Media Update",
                description = "Post the same update to all social media accounts",
                steps = steps,
                autoRetry = true
            )
            
            println("Created workflow '${workflow.name}' with ${workflow.steps.size} steps")
            
            // Note: In a real app, we would save this workflow for later execution
            // phoneControlSystem.automationManager.saveWorkflow(workflow)
        }
    } finally {
        phoneControlSystem.shutdown()
    }
}

/**
 * Example of monitoring and responding to notifications
 */
fun notificationMonitoringExample(phoneControlSystem: PhoneControlSystem) = runBlocking {
    // Initialize the phone control system
    phoneControlSystem.initialize()
    
    // Start monitoring phone events
    val job = launch {
        phoneControlSystem.phoneEvents.collect { event ->
            when (event) {
                is PhoneEvent.NotificationEvent -> {
                    println("Notification interaction: ${event.notificationId}, action: ${event.action}")
                }
                is PhoneEvent.AppEvent -> {
                    if (event.type == PhoneEventType.NOTIFICATION_RECEIVED) {
                        println("New notification from ${event.appName}")
                    }
                }
                else -> {
                    // Ignore other events
                }
            }
        }
    }
    
    // Check current notifications
    val notifications = phoneControlSystem.getActiveNotifications()
    println("Currently active notifications:")
    
    notifications.forEach { notification ->
        println("- ${notification.appName}: ${notification.title}")
        println("  ${notification.content}")
        println("  Actions: ${notification.actions.joinToString(", ")}")
        println()
    }
    
    // Respond to a high-priority notification automatically
    val importantNotification = notifications.find { 
        it.priority > 0 && 
        (it.title.contains("urgent", ignoreCase = true) || 
         it.content.contains("urgent", ignoreCase = true))
    }
    
    if (importantNotification != null) {
        println("Found important notification: ${importantNotification.title}")
        
        // For a message, we might want to open it
        if (importantNotification.category == "msg") {
            println("Opening message notification")
            phoneControlSystem.interactWithNotification(importantNotification.id, "open")
            
            // Wait for app to open
            kotlinx.coroutines.delay(1000)
            
            // Get screen content
            val screenContent = phoneControlSystem.getCurrentScreenContent()
            
            // Find reply field
            val replyField = phoneControlSystem.findUIElements(
                UIElementQuery(
                    contentDescription = "Reply",
                    className = "android.widget.EditText"
                )
            ).firstOrNull()
            
            // Auto-reply
            if (replyField != null) {
                println("Auto-replying to urgent message")
                phoneControlSystem.performAccessibilityAction(
                    AccessibilityAction.TextInput(
                        target = replyField.id,
                        text = "I received your urgent message. I'm having Sallie respond automatically to let you know I'll get back to you ASAP."
                    )
                )
                
                // Find send button
                val sendButton = phoneControlSystem.findUIElements(
                    UIElementQuery(
                        contentDescription = "Send",
                        isClickable = true
                    )
                ).firstOrNull()
                
                // Send reply
                if (sendButton != null) {
                    phoneControlSystem.performAccessibilityAction(
                        AccessibilityAction.Click(target = sendButton.id)
                    )
                    println("Auto-reply sent!")
                }
            }
        }
    } else {
        println("No urgent notifications found")
    }
    
    // Wait for a while to observe notifications
    println("Monitoring notifications for 10 seconds...")
    kotlinx.coroutines.delay(10000)
    
    // Cleanup
    job.cancel()
    phoneControlSystem.shutdown()
}

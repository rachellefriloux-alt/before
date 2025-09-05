/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * Values authenticity, respects boundaries, and maintains unwavering devotion
 * 
 * Gesture Shortcut Module - Advanced gesture recognition for quick routines and theme changes
 */
package com.sallie.gesture

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.view.GestureDetector
import android.view.MotionEvent
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.math.*

/**
 * Advanced gesture recognition system for Sallie shortcuts and commands
 */
class GestureShortcutModule(private val context: Context) : SensorEventListener {
    
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
    
    private val gestureScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    private val _gestureEvents = MutableSharedFlow<GestureEvent>()
    val gestureEvents: SharedFlow<GestureEvent> = _gestureEvents.asSharedFlow()
    
    private val _registeredGestures = MutableStateFlow<Map<String, GestureShortcut>>(getDefaultGestures())
    val registeredGestures: StateFlow<Map<String, GestureShortcut>> = _registeredGestures.asStateFlow()
    
    // Gesture detection variables
    private var isListening = false
    private val accelerometerData = mutableListOf<FloatArray>()
    private val gyroscopeData = mutableListOf<FloatArray>()
    private var lastGestureTime = 0L
    
    // Gesture recognition parameters
    private val gestureBuffer = ArrayDeque<SensorReading>(GESTURE_BUFFER_SIZE)
    private var gestureStartTime = 0L
    private var isGestureInProgress = false
    
    /**
     * Initialize the gesture system
     */
    suspend fun initialize() {
        if (!isListening) {
            startListening()
            loadCustomGestures()
            setupDefaultShortcuts()
        }
    }
    
    /**
     * Start listening for gestures
     */
    fun startListening() {
        if (!isListening) {
            accelerometer?.let { 
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
            gyroscope?.let { 
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
            isListening = true
        }
    }
    
    /**
     * Stop listening for gestures
     */
    fun stopListening() {
        if (isListening) {
            sensorManager.unregisterListener(this)
            isListening = false
        }
    }
    
    /**
     * Register a custom gesture shortcut
     */
    suspend fun registerGesture(gesture: GestureShortcut) {
        val currentGestures = _registeredGestures.value.toMutableMap()
        currentGestures[gesture.id] = gesture
        _registeredGestures.value = currentGestures
        
        // Save to persistent storage
        saveCustomGesture(gesture)
    }
    
    /**
     * Remove a gesture shortcut
     */
    suspend fun unregisterGesture(gestureId: String) {
        val currentGestures = _registeredGestures.value.toMutableMap()
        currentGestures.remove(gestureId)
        _registeredGestures.value = currentGestures
        
        // Remove from persistent storage
        removeCustomGesture(gestureId)
    }
    
    /**
     * Process touch gestures from UI
     */
    fun processTouchGesture(event: MotionEvent): Boolean {
        return when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                handleTouchStart(event)
                true
            }
            MotionEvent.ACTION_MOVE -> {
                handleTouchMove(event)
                true
            }
            MotionEvent.ACTION_UP -> {
                handleTouchEnd(event)
                true
            }
            else -> false
        }
    }
    
    /**
     * Trigger a gesture shortcut manually
     */
    suspend fun triggerGesture(gestureId: String) {
        val gesture = _registeredGestures.value[gestureId]
        if (gesture != null) {
            executeGestureAction(gesture)
        }
    }
    
    override fun onSensorChanged(event: SensorEvent) {
        if (!isListening) return
        
        val currentTime = System.currentTimeMillis()
        
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                processAccelerometerData(event.values, currentTime)
            }
            Sensor.TYPE_GYROSCOPE -> {
                processGyroscopeData(event.values, currentTime)
            }
        }
        
        // Add to gesture buffer
        gestureBuffer.add(SensorReading(
            type = event.sensor.type,
            values = event.values.clone(),
            timestamp = currentTime
        ))
        
        // Remove old readings
        while (gestureBuffer.size > GESTURE_BUFFER_SIZE) {
            gestureBuffer.removeFirst()
        }
        
        // Analyze for gestures
        analyzeGestureBuffer()
    }
    
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Handle accuracy changes if needed
    }
    
    private fun processAccelerometerData(values: FloatArray, timestamp: Long) {
        val magnitude = sqrt(values[0] * values[0] + values[1] * values[1] + values[2] * values[2])
        
        // Detect shake gesture
        if (magnitude > SHAKE_THRESHOLD) {
            val timeSinceLastGesture = timestamp - lastGestureTime
            if (timeSinceLastGesture > GESTURE_COOLDOWN) {
                detectShakeGesture(values, timestamp)
            }
        }
        
        // Store for pattern analysis
        accelerometerData.add(values.clone())
        if (accelerometerData.size > MAX_DATA_POINTS) {
            accelerometerData.removeFirst()
        }
    }
    
    private fun processGyroscopeData(values: FloatArray, timestamp: Long) {
        // Detect rotation gestures
        val rotationMagnitude = sqrt(values[0] * values[0] + values[1] * values[1] + values[2] * values[2])
        
        if (rotationMagnitude > ROTATION_THRESHOLD) {
            detectRotationGesture(values, timestamp)
        }
        
        // Store for pattern analysis
        gyroscopeData.add(values.clone())
        if (gyroscopeData.size > MAX_DATA_POINTS) {
            gyroscopeData.removeFirst()
        }
    }
    
    private fun analyzeGestureBuffer() {
        if (gestureBuffer.size < MIN_GESTURE_READINGS) return
        
        val currentTime = System.currentTimeMillis()
        
        // Start gesture detection if we have enough recent data
        if (!isGestureInProgress && hasRecentActivity()) {
            isGestureInProgress = true
            gestureStartTime = currentTime
        }
        
        // End gesture detection if activity has stopped
        if (isGestureInProgress && (currentTime - gestureStartTime) > MAX_GESTURE_DURATION) {
            val gestureData = gestureBuffer.toList()
            gestureScope.launch {
                analyzeCompleteGesture(gestureData)
            }
            isGestureInProgress = false
        }
    }
    
    private suspend fun analyzeCompleteGesture(gestureData: List<SensorReading>) {
        // Analyze the gesture pattern against registered gestures
        _registeredGestures.value.values.forEach { registeredGesture ->
            val similarity = calculateGestureSimilarity(gestureData, registeredGesture.pattern)
            
            if (similarity >= registeredGesture.threshold) {
                // Found a matching gesture
                val event = GestureEvent(
                    gestureId = registeredGesture.id,
                    confidence = similarity,
                    timestamp = System.currentTimeMillis(),
                    type = GestureType.MOTION
                )
                
                _gestureEvents.emit(event)
                executeGestureAction(registeredGesture)
                break
            }
        }
    }
    
    private fun detectShakeGesture(values: FloatArray, timestamp: Long) {
        gestureScope.launch {
            val shakeGesture = _registeredGestures.value["shake_quick_action"]
            if (shakeGesture != null) {
                val event = GestureEvent(
                    gestureId = "shake_quick_action",
                    confidence = 0.9f,
                    timestamp = timestamp,
                    type = GestureType.SHAKE
                )
                
                _gestureEvents.emit(event)
                executeGestureAction(shakeGesture)
                lastGestureTime = timestamp
            }
        }
    }
    
    private fun detectRotationGesture(values: FloatArray, timestamp: Long) {
        // Detect specific rotation patterns
        val rotationAngle = atan2(values[1].toDouble(), values[0].toDouble()) * 180 / PI
        
        gestureScope.launch {
            val rotationGesture = when {
                rotationAngle > 45 && rotationAngle < 135 -> "rotate_clockwise"
                rotationAngle > -135 && rotationAngle < -45 -> "rotate_counterclockwise"
                else -> null
            }
            
            rotationGesture?.let { gestureId ->
                _registeredGestures.value[gestureId]?.let { gesture ->
                    val event = GestureEvent(
                        gestureId = gestureId,
                        confidence = 0.8f,
                        timestamp = timestamp,
                        type = GestureType.ROTATION
                    )
                    
                    _gestureEvents.emit(event)
                    executeGestureAction(gesture)
                }
            }
        }
    }
    
    private fun handleTouchStart(event: MotionEvent) {
        // Record touch start for gesture analysis
    }
    
    private fun handleTouchMove(event: MotionEvent) {
        // Track touch movement patterns
    }
    
    private fun handleTouchEnd(event: MotionEvent) {
        // Analyze complete touch gesture
        gestureScope.launch {
            analyzeTouchGesture(event)
        }
    }
    
    private suspend fun analyzeTouchGesture(event: MotionEvent) {
        // Simple tap detection for now
        val tapGesture = _registeredGestures.value["double_tap_theme"]
        if (tapGesture != null) {
            // Could implement double-tap detection here
        }
    }
    
    private suspend fun executeGestureAction(gesture: GestureShortcut) {
        when (gesture.action.type) {
            ActionType.THEME_CHANGE -> {
                changeTheme(gesture.action.parameter)
            }
            ActionType.ROUTINE_TRIGGER -> {
                triggerRoutine(gesture.action.parameter)
            }
            ActionType.APP_LAUNCH -> {
                launchApp(gesture.action.parameter)
            }
            ActionType.SALLIE_COMMAND -> {
                executeSallieCommand(gesture.action.parameter)
            }
            ActionType.SYSTEM_SETTING -> {
                changeSystemSetting(gesture.action.parameter)
            }
        }
    }
    
    private suspend fun changeTheme(themeName: String) {
        // Implement theme change logic
        _gestureEvents.emit(GestureEvent(
            gestureId = "theme_change",
            confidence = 1.0f,
            timestamp = System.currentTimeMillis(),
            type = GestureType.ACTION,
            data = mapOf("theme" to themeName)
        ))
    }
    
    private suspend fun triggerRoutine(routineName: String) {
        // Implement routine trigger logic
        _gestureEvents.emit(GestureEvent(
            gestureId = "routine_trigger",
            confidence = 1.0f,
            timestamp = System.currentTimeMillis(),
            type = GestureType.ACTION,
            data = mapOf("routine" to routineName)
        ))
    }
    
    private suspend fun launchApp(packageName: String) {
        // Implement app launch logic
        _gestureEvents.emit(GestureEvent(
            gestureId = "app_launch",
            confidence = 1.0f,
            timestamp = System.currentTimeMillis(),
            type = GestureType.ACTION,
            data = mapOf("package" to packageName)
        ))
    }
    
    private suspend fun executeSallieCommand(command: String) {
        // Implement Sallie command execution
        _gestureEvents.emit(GestureEvent(
            gestureId = "sallie_command",
            confidence = 1.0f,
            timestamp = System.currentTimeMillis(),
            type = GestureType.ACTION,
            data = mapOf("command" to command)
        ))
    }
    
    private suspend fun changeSystemSetting(setting: String) {
        // Implement system setting change
        _gestureEvents.emit(GestureEvent(
            gestureId = "system_setting",
            confidence = 1.0f,
            timestamp = System.currentTimeMillis(),
            type = GestureType.ACTION,
            data = mapOf("setting" to setting)
        ))
    }
    
    private fun hasRecentActivity(): Boolean {
        val currentTime = System.currentTimeMillis()
        return gestureBuffer.any { (currentTime - it.timestamp) < ACTIVITY_WINDOW }
    }
    
    private fun calculateGestureSimilarity(gestureData: List<SensorReading>, pattern: GesturePattern): Float {
        // Simplified similarity calculation
        // In a real implementation, this would use more sophisticated pattern matching
        if (gestureData.size < MIN_GESTURE_READINGS) return 0f
        
        // Calculate basic similarity based on data characteristics
        val accelerometerReadings = gestureData.filter { it.type == Sensor.TYPE_ACCELEROMETER }
        val gyroscopeReadings = gestureData.filter { it.type == Sensor.TYPE_GYROSCOPE }
        
        var similarity = 0f
        var components = 0
        
        if (accelerometerReadings.isNotEmpty() && pattern.accelerometerSignature.isNotEmpty()) {
            similarity += compareSignatures(
                extractSignature(accelerometerReadings), 
                pattern.accelerometerSignature
            )
            components++
        }
        
        if (gyroscopeReadings.isNotEmpty() && pattern.gyroscopeSignature.isNotEmpty()) {
            similarity += compareSignatures(
                extractSignature(gyroscopeReadings), 
                pattern.gyroscopeSignature
            )
            components++
        }
        
        return if (components > 0) similarity / components else 0f
    }
    
    private fun extractSignature(readings: List<SensorReading>): List<Float> {
        // Extract characteristic features from sensor readings
        return readings.map { reading ->
            sqrt(reading.values[0] * reading.values[0] + 
                 reading.values[1] * reading.values[1] + 
                 reading.values[2] * reading.values[2])
        }
    }
    
    private fun compareSignatures(signature1: List<Float>, signature2: List<Float>): Float {
        if (signature1.isEmpty() || signature2.isEmpty()) return 0f
        
        // Simple correlation-based comparison
        val minSize = min(signature1.size, signature2.size)
        var correlation = 0f
        
        for (i in 0 until minSize) {
            val diff = abs(signature1[i] - signature2[i])
            correlation += (1f - (diff / (signature1[i] + signature2[i] + 0.1f)))
        }
        
        return correlation / minSize
    }
    
    private fun getDefaultGestures(): Map<String, GestureShortcut> {
        return mapOf(
            "shake_quick_action" to GestureShortcut(
                id = "shake_quick_action",
                name = "Quick Action Shake",
                description = "Shake device to open quick actions",
                action = GestureAction(ActionType.SALLIE_COMMAND, "open_quick_actions"),
                pattern = GesturePattern(emptyList(), emptyList()),
                threshold = 0.7f,
                enabled = true
            ),
            "double_tap_theme" to GestureShortcut(
                id = "double_tap_theme",
                name = "Theme Switch",
                description = "Double tap to cycle themes",
                action = GestureAction(ActionType.THEME_CHANGE, "cycle_theme"),
                pattern = GesturePattern(emptyList(), emptyList()),
                threshold = 0.8f,
                enabled = true
            ),
            "rotate_clockwise" to GestureShortcut(
                id = "rotate_clockwise",
                name = "Volume Up",
                description = "Rotate clockwise to increase volume",
                action = GestureAction(ActionType.SYSTEM_SETTING, "volume_up"),
                pattern = GesturePattern(emptyList(), emptyList()),
                threshold = 0.6f,
                enabled = true
            )
        )
    }
    
    private suspend fun loadCustomGestures() {
        // Load custom gestures from persistent storage
        // Implementation depends on storage mechanism
    }
    
    private suspend fun saveCustomGesture(gesture: GestureShortcut) {
        // Save custom gesture to persistent storage
        // Implementation depends on storage mechanism
    }
    
    private suspend fun removeCustomGesture(gestureId: String) {
        // Remove custom gesture from persistent storage
        // Implementation depends on storage mechanism
    }
    
    private suspend fun setupDefaultShortcuts() {
        // Register default gesture shortcuts
        val defaultGestures = getDefaultGestures()
        defaultGestures.values.forEach { gesture ->
            if (gesture.enabled) {
                registerGesture(gesture)
            }
        }
    }
    
    fun shutdown() {
        stopListening()
        gestureScope.cancel()
    }
    
    companion object {
        private const val SHAKE_THRESHOLD = 12.0f
        private const val ROTATION_THRESHOLD = 2.0f
        private const val GESTURE_COOLDOWN = 1000L // 1 second
        private const val MAX_DATA_POINTS = 100
        private const val GESTURE_BUFFER_SIZE = 200
        private const val MIN_GESTURE_READINGS = 10
        private const val MAX_GESTURE_DURATION = 3000L // 3 seconds
        private const val ACTIVITY_WINDOW = 500L // 500ms
    }
}

// Data classes for gesture system
data class GestureShortcut(
    val id: String,
    val name: String,
    val description: String,
    val action: GestureAction,
    val pattern: GesturePattern,
    val threshold: Float = 0.7f,
    val enabled: Boolean = true
)

data class GestureAction(
    val type: ActionType,
    val parameter: String
)

data class GesturePattern(
    val accelerometerSignature: List<Float>,
    val gyroscopeSignature: List<Float>
)

data class GestureEvent(
    val gestureId: String,
    val confidence: Float,
    val timestamp: Long,
    val type: GestureType,
    val data: Map<String, String> = emptyMap()
)

data class SensorReading(
    val type: Int,
    val values: FloatArray,
    val timestamp: Long
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as SensorReading

        if (type != other.type) return false
        if (!values.contentEquals(other.values)) return false
        if (timestamp != other.timestamp) return false

        return true
    }

    override fun hashCode(): Int {
        var result = type
        result = 31 * result + values.contentHashCode()
        result = 31 * result + timestamp.hashCode()
        return result
    }
}

enum class ActionType {
    THEME_CHANGE,
    ROUTINE_TRIGGER,
    APP_LAUNCH,
    SALLIE_COMMAND,
    SYSTEM_SETTING
}

enum class GestureType {
    MOTION,
    SHAKE,
    ROTATION,
    TOUCH,
    ACTION
}

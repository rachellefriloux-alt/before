package com.sallie.ui.adaptation

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.BatteryManager
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import java.time.LocalDateTime
import java.time.LocalTime

/**
 * Sallie's Context Detection System
 * 
 * Monitors various device and environmental conditions to inform UI adaptations.
 * This helps the UI automatically adapt to the user's current context.
 */
class ContextDetectionSystem(private val context: Context) {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    
    private val uiAdaptationManager = UIAdaptationManager.getInstance(context)
    
    private var lightSensor: Sensor? = null
    private var accelerometer: Sensor? = null
    
    private var isMonitoring = false
    
    // Initialize contextual factors
    private var currentContextualFactors = ContextualFactors()
    
    // Sensor listeners
    private val lightSensorListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            if (event.sensor.type == Sensor.TYPE_LIGHT) {
                val lux = event.values[0]
                val ambientLight = when {
                    lux < 10 -> AmbientLight.DARK
                    lux < 100 -> AmbientLight.LOW
                    lux < 1000 -> AmbientLight.NORMAL
                    lux < 10000 -> AmbientLight.BRIGHT
                    else -> AmbientLight.DIRECT_SUNLIGHT
                }
                
                if (ambientLight != currentContextualFactors.ambientLight) {
                    currentContextualFactors = currentContextualFactors.copy(ambientLight = ambientLight)
                    updateContextualFactors()
                }
            }
        }
        
        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
            // Not needed for this implementation
        }
    }
    
    private val accelerometerListener = object : SensorEventListener {
        private var lastUpdate = System.currentTimeMillis()
        private var lastX = 0f
        private var lastY = 0f
        private var lastZ = 0f
        private val MOVEMENT_THRESHOLD = 10f
        private var movementDetections = 0
        
        override fun onSensorChanged(event: SensorEvent) {
            val currentTime = System.currentTimeMillis()
            // Only check every 100ms to avoid excessive processing
            if ((currentTime - lastUpdate) > 100) {
                val x = event.values[0]
                val y = event.values[1]
                val z = event.values[2]
                
                val deltaX = kotlin.math.abs(lastX - x)
                val deltaY = kotlin.math.abs(lastY - y)
                val deltaZ = kotlin.math.abs(lastZ - z)
                
                if (deltaX + deltaY + deltaZ > MOVEMENT_THRESHOLD) {
                    movementDetections++
                    
                    // After several detections, update the motion state
                    if (movementDetections > 5) {
                        val motionState = when {
                            deltaX + deltaY + deltaZ > 40f -> MotionState.RUNNING
                            deltaX + deltaY + deltaZ > 15f -> MotionState.WALKING
                            else -> MotionState.STATIONARY
                        }
                        
                        if (motionState != currentContextualFactors.motionState) {
                            currentContextualFactors = currentContextualFactors.copy(motionState = motionState)
                            updateContextualFactors()
                        }
                        movementDetections = 0
                    }
                } else {
                    movementDetections = 0
                    if (currentContextualFactors.motionState != MotionState.STATIONARY) {
                        currentContextualFactors = currentContextualFactors.copy(motionState = MotionState.STATIONARY)
                        updateContextualFactors()
                    }
                }
                
                lastX = x
                lastY = y
                lastZ = z
                lastUpdate = currentTime
            }
        }
        
        override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
            // Not needed for this implementation
        }
    }
    
    // Battery state receiver
    private val batteryReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
            
            val batteryPercentage = level * 100 / scale
            val batteryState = when {
                batteryPercentage <= 5 -> BatteryLevel.CRITICAL
                batteryPercentage <= 15 -> BatteryLevel.LOW
                batteryPercentage <= 50 -> BatteryLevel.NORMAL
                else -> BatteryLevel.HIGH
            }
            
            if (batteryState != currentContextualFactors.batteryLevel) {
                currentContextualFactors = currentContextualFactors.copy(batteryLevel = batteryState)
                updateContextualFactors()
            }
        }
    }
    
    /**
     * Start monitoring contextual factors
     */
    fun startMonitoring() {
        if (isMonitoring) {
            return
        }
        
        // Initialize sensors
        lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        
        // Register sensor listeners
        lightSensor?.let {
            sensorManager.registerListener(lightSensorListener, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
        
        accelerometer?.let {
            sensorManager.registerListener(accelerometerListener, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
        
        // Register battery receiver
        val batteryFilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        context.registerReceiver(batteryReceiver, batteryFilter)
        
        // Perform initial detection
        detectTimeOfDay()
        detectDeviceOrientation()
        detectDeviceType()
        
        isMonitoring = true
    }
    
    /**
     * Stop monitoring contextual factors
     */
    fun stopMonitoring() {
        if (!isMonitoring) {
            return
        }
        
        // Unregister sensor listeners
        sensorManager.unregisterListener(lightSensorListener)
        sensorManager.unregisterListener(accelerometerListener)
        
        // Unregister battery receiver
        try {
            context.unregisterReceiver(batteryReceiver)
        } catch (e: IllegalArgumentException) {
            // Receiver not registered
        }
        
        isMonitoring = false
    }
    
    /**
     * Manually refresh all contextual factors
     */
    fun refreshContextualFactors() {
        detectTimeOfDay()
        detectDeviceOrientation()
        detectDeviceType()
        
        // Battery and sensors will update automatically
        
        updateContextualFactors()
    }
    
    /**
     * Get the current contextual factors
     */
    fun getCurrentContextualFactors(): ContextualFactors {
        return currentContextualFactors
    }
    
    /**
     * Detect the current time of day
     */
    private fun detectTimeOfDay() {
        val now = LocalTime.now()
        val timeOfDay = when {
            now.isBefore(LocalTime.of(12, 0)) -> TimeOfDay.MORNING
            now.isBefore(LocalTime.of(17, 0)) -> TimeOfDay.DAY
            now.isBefore(LocalTime.of(22, 0)) -> TimeOfDay.EVENING
            else -> TimeOfDay.NIGHT
        }
        
        if (timeOfDay != currentContextualFactors.timeOfDay) {
            currentContextualFactors = currentContextualFactors.copy(timeOfDay = timeOfDay)
        }
    }
    
    /**
     * Detect the current device orientation
     */
    private fun detectDeviceOrientation() {
        val orientation = when (context.resources.configuration.orientation) {
            Configuration.ORIENTATION_LANDSCAPE -> DeviceOrientation.LANDSCAPE
            else -> DeviceOrientation.PORTRAIT
        }
        
        if (orientation != currentContextualFactors.deviceOrientation) {
            currentContextualFactors = currentContextualFactors.copy(deviceOrientation = orientation)
        }
    }
    
    /**
     * Detect the device type
     */
    private fun detectDeviceType() {
        val deviceType = when {
            // Simple detection based on screen size
            context.resources.configuration.screenWidthDp >= 600 -> DeviceType.TABLET
            else -> DeviceType.PHONE
        }
        
        if (deviceType != currentContextualFactors.deviceType) {
            currentContextualFactors = currentContextualFactors.copy(deviceType = deviceType)
        }
    }
    
    /**
     * Update the contextual factors in the UI adaptation manager
     */
    private fun updateContextualFactors() {
        uiAdaptationManager.updateContextualFactors(currentContextualFactors)
    }
}

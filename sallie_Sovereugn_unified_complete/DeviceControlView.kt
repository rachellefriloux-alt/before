package com.sallie.ui.device

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.sallie.core.device.Device
import com.sallie.core.device.DeviceControlFacade
import com.sallie.core.device.DeviceType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job

/**
 * A view that displays a list of devices and allows the user to control them
 */
class DeviceControlView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {
    
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var deviceControlFacade: DeviceControlFacade
    
    // UI elements
    private val recyclerView: RecyclerView
    private val progressIndicator: CircularProgressIndicator
    private val emptyView: TextView
    private val refreshButton: MaterialButton
    private val scanButton: MaterialButton
    
    // Adapter
    private val adapter: DevicesAdapter
    
    init {
        val view = LayoutInflater.from(context).inflate(R.layout.device_control_view, this, true)
        
        // Initialize views
        recyclerView = view.findViewById(R.id.devices_recycler_view)
        progressIndicator = view.findViewById(R.id.progress_indicator)
        emptyView = view.findViewById(R.id.empty_view)
        refreshButton = view.findViewById(R.id.refresh_button)
        scanButton = view.findViewById(R.id.scan_button)
        
        // Set up RecyclerView
        adapter = DevicesAdapter(
            onPowerToggle = this::togglePower,
            onBrightnessChange = this::setBrightness,
            onTemperatureChange = this::setTemperature,
            onLockToggle = this::toggleLock
        )
        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = adapter
        
        // Set up buttons
        refreshButton.setOnClickListener {
            loadDevices()
        }
        
        scanButton.setOnClickListener {
            scanForDevices()
        }
    }
    
    /**
     * Set the device control facade
     */
    fun setDeviceControlFacade(facade: DeviceControlFacade) {
        deviceControlFacade = facade
        loadDevices()
    }
    
    /**
     * Load the devices from the facade
     */
    fun loadDevices() {
        if (!::deviceControlFacade.isInitialized) {
            showError("Device control system not initialized")
            return
        }
        
        showLoading(true)
        
        deviceControlFacade.getDevices { result ->
            showLoading(false)
            
            if (result.success) {
                @Suppress("UNCHECKED_CAST")
                val devices = result.data as? List<Device> ?: emptyList()
                adapter.submitList(devices)
                
                if (devices.isEmpty()) {
                    emptyView.visibility = View.VISIBLE
                    recyclerView.visibility = View.GONE
                } else {
                    emptyView.visibility = View.GONE
                    recyclerView.visibility = View.VISIBLE
                }
            } else {
                showError(result.message)
            }
        }
    }
    
    /**
     * Scan for new devices
     */
    private fun scanForDevices() {
        if (!::deviceControlFacade.isInitialized) {
            showError("Device control system not initialized")
            return
        }
        
        showLoading(true)
        
        deviceControlFacade.discoverDevices { result ->
            showLoading(false)
            
            if (result.success) {
                Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
                loadDevices() // Reload the devices list
            } else {
                showError(result.message)
            }
        }
    }
    
    /**
     * Toggle the power state of a device
     */
    private fun togglePower(device: Device) {
        if (!::deviceControlFacade.isInitialized) {
            showError("Device control system not initialized")
            return
        }
        
        val isOn = device.state.powerState?.isOn ?: false
        
        if (isOn) {
            deviceControlFacade.turnOffDevice(device.id) { result ->
                handleOperationResult(result, "Turn off")
            }
        } else {
            deviceControlFacade.turnOnDevice(device.id) { result ->
                handleOperationResult(result, "Turn on")
            }
        }
    }
    
    /**
     * Set the brightness of a device
     */
    private fun setBrightness(device: Device, brightness: Int) {
        if (!::deviceControlFacade.isInitialized) {
            showError("Device control system not initialized")
            return
        }
        
        deviceControlFacade.setBrightness(device.id, brightness) { result ->
            handleOperationResult(result, "Set brightness")
        }
    }
    
    /**
     * Set the temperature of a device
     */
    private fun setTemperature(device: Device, temperature: Int) {
        if (!::deviceControlFacade.isInitialized) {
            showError("Device control system not initialized")
            return
        }
        
        deviceControlFacade.setTemperature(device.id, temperature) { result ->
            handleOperationResult(result, "Set temperature")
        }
    }
    
    /**
     * Toggle the lock state of a device
     */
    private fun toggleLock(device: Device) {
        if (!::deviceControlFacade.isInitialized) {
            showError("Device control system not initialized")
            return
        }
        
        val isLocked = device.state.lockState?.isLocked ?: false
        
        if (isLocked) {
            deviceControlFacade.unlockDevice(device.id) { result ->
                handleOperationResult(result, "Unlock")
            }
        } else {
            deviceControlFacade.lockDevice(device.id) { result ->
                handleOperationResult(result, "Lock")
            }
        }
    }
    
    /**
     * Handle the result of a device operation
     */
    private fun handleOperationResult(
        result: DeviceControlFacade.DeviceOperationResult,
        operation: String
    ) {
        if (result.success) {
            Toast.makeText(context, "$operation successful", Toast.LENGTH_SHORT).show()
            loadDevices() // Reload the devices to show updated state
        } else {
            showError("$operation failed: ${result.message}")
        }
    }
    
    /**
     * Show or hide the loading indicator
     */
    private fun showLoading(show: Boolean) {
        progressIndicator.visibility = if (show) View.VISIBLE else View.GONE
        if (show) {
            emptyView.visibility = View.GONE
        }
    }
    
    /**
     * Show an error message
     */
    private fun showError(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_LONG).show()
    }
}

/**
 * Adapter for the devices RecyclerView
 */
class DevicesAdapter(
    private val onPowerToggle: (Device) -> Unit,
    private val onBrightnessChange: (Device, Int) -> Unit,
    private val onTemperatureChange: (Device, Int) -> Unit,
    private val onLockToggle: (Device) -> Unit
) : RecyclerView.Adapter<DeviceViewHolder>() {
    
    private var devices: List<Device> = emptyList()
    
    fun submitList(newDevices: List<Device>) {
        devices = newDevices
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DeviceViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        val view = inflater.inflate(R.layout.item_device, parent, false)
        return DeviceViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: DeviceViewHolder, position: Int) {
        val device = devices[position]
        holder.bind(
            device,
            onPowerToggle,
            onBrightnessChange,
            onTemperatureChange,
            onLockToggle
        )
    }
    
    override fun getItemCount(): Int = devices.size
}

/**
 * ViewHolder for a device item
 */
class DeviceViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    private val cardView: MaterialCardView = view.findViewById(R.id.device_card)
    private val nameTextView: TextView = view.findViewById(R.id.device_name)
    private val typeTextView: TextView = view.findViewById(R.id.device_type)
    private val powerButton: MaterialButton = view.findViewById(R.id.power_button)
    private val controlsContainer: LinearLayout = view.findViewById(R.id.device_controls)
    
    // Device specific controls (visibility will be set based on device type)
    private val brightnessSlider: SeekBar = view.findViewById(R.id.brightness_slider)
    private val temperatureControl: TemperatureControlView = view.findViewById(R.id.temperature_control)
    private val lockButton: MaterialButton = view.findViewById(R.id.lock_button)
    
    fun bind(
        device: Device,
        onPowerToggle: (Device) -> Unit,
        onBrightnessChange: (Device, Int) -> Unit,
        onTemperatureChange: (Device, Int) -> Unit,
        onLockToggle: (Device) -> Unit
    ) {
        nameTextView.text = device.name
        typeTextView.text = device.type.toString()
        
        val isOn = device.state.powerState?.isOn ?: false
        powerButton.text = if (isOn) "Turn Off" else "Turn On"
        powerButton.setOnClickListener { onPowerToggle(device) }
        
        // Set visibility and configure controls based on device type
        when (device.type) {
            DeviceType.LIGHT -> {
                brightnessSlider.visibility = View.VISIBLE
                temperatureControl.visibility = View.GONE
                lockButton.visibility = View.GONE
                
                val brightness = device.state.brightnessState?.level ?: 0
                brightnessSlider.progress = brightness
                brightnessSlider.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                    override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                        if (fromUser) {
                            onBrightnessChange(device, progress)
                        }
                    }
                    
                    override fun onStartTrackingTouch(seekBar: SeekBar?) {}
                    override fun onStopTrackingTouch(seekBar: SeekBar?) {}
                })
            }
            DeviceType.THERMOSTAT -> {
                brightnessSlider.visibility = View.GONE
                temperatureControl.visibility = View.VISIBLE
                lockButton.visibility = View.GONE
                
                val temperature = device.state.temperatureState?.currentTemperature?.toInt() ?: 22
                temperatureControl.setTemperature(temperature)
                temperatureControl.setOnTemperatureChangedListener { newTemp ->
                    onTemperatureChange(device, newTemp)
                }
            }
            DeviceType.LOCK -> {
                brightnessSlider.visibility = View.GONE
                temperatureControl.visibility = View.GONE
                lockButton.visibility = View.VISIBLE
                
                val isLocked = device.state.lockState?.isLocked ?: false
                lockButton.text = if (isLocked) "Unlock" else "Lock"
                lockButton.setOnClickListener { onLockToggle(device) }
            }
            else -> {
                brightnessSlider.visibility = View.GONE
                temperatureControl.visibility = View.GONE
                lockButton.visibility = View.GONE
            }
        }
    }
}

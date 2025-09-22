package com.sallie.ui.device

import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.sallie.core.PluginRegistry
import com.sallie.core.device.DeviceControlFacade
import com.sallie.core.values.ValuesSystem
import kotlinx.coroutines.launch

/**
 * Activity for controlling smart home devices
 */
class DeviceControlActivity : AppCompatActivity() {
    
    private lateinit var deviceControlView: DeviceControlView
    private lateinit var deviceControlFacade: DeviceControlFacade
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_device_control)
        
        // Set up toolbar
        setSupportActionBar(findViewById(R.id.toolbar))
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Smart Home Control"
        
        // Initialize the device control view
        deviceControlView = findViewById(R.id.device_control_view)
        
        // Initialize the device control system
        initDeviceControl()
    }
    
    private fun initDeviceControl() {
        lifecycleScope.launch {
            try {
                val pluginRegistry = PluginRegistry.getInstance(this@DeviceControlActivity)
                val valuesSystem = ValuesSystem.getInstance(this@DeviceControlActivity)
                
                deviceControlFacade = DeviceControlFacade.getInstance(
                    pluginRegistry, 
                    valuesSystem, 
                    lifecycleScope
                )
                
                // Initialize the system
                deviceControlFacade.initialize()
                
                // Set the facade on the view
                deviceControlView.setDeviceControlFacade(deviceControlFacade)
            } catch (e: Exception) {
                Toast.makeText(
                    this@DeviceControlActivity, 
                    "Failed to initialize device control: ${e.message}", 
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_device_control, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                finish()
                true
            }
            R.id.action_scenes -> {
                showScenes()
                true
            }
            R.id.action_rules -> {
                showRules()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    /**
     * Show scenes dialog
     */
    private fun showScenes() {
        if (!::deviceControlFacade.isInitialized) {
            Toast.makeText(this, "Device control system not initialized", Toast.LENGTH_SHORT).show()
            return
        }
        
        deviceControlFacade.listScenes { result ->
            if (result.success) {
                @Suppress("UNCHECKED_CAST")
                val scenes = result.data as? List<com.sallie.core.device.Scene> ?: emptyList()
                
                if (scenes.isEmpty()) {
                    Toast.makeText(this, "No scenes available", Toast.LENGTH_SHORT).show()
                    return@listScenes
                }
                
                // Show scene selection dialog
                SceneSelectionDialog(this, scenes) { selectedScene ->
                    deviceControlFacade.executeScene(selectedScene.name) { executeResult ->
                        Toast.makeText(this, executeResult.message, Toast.LENGTH_SHORT).show()
                        
                        if (executeResult.success) {
                            // Refresh the device list to show updated states
                            deviceControlView.loadDevices()
                        }
                    }
                }.show()
            } else {
                Toast.makeText(this, result.message, Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    /**
     * Show rules dialog
     */
    private fun showRules() {
        if (!::deviceControlFacade.isInitialized) {
            Toast.makeText(this, "Device control system not initialized", Toast.LENGTH_SHORT).show()
            return
        }
        
        deviceControlFacade.listRules { result ->
            if (result.success) {
                @Suppress("UNCHECKED_CAST")
                val rules = result.data as? List<com.sallie.core.device.AutomationRule> ?: emptyList()
                
                if (rules.isEmpty()) {
                    Toast.makeText(this, "No automation rules available", Toast.LENGTH_SHORT).show()
                    return@listRules
                }
                
                // Show rule selection dialog
                RuleSelectionDialog(this, rules) { selectedRule ->
                    deviceControlFacade.triggerRule(selectedRule.name) { triggerResult ->
                        Toast.makeText(this, triggerResult.message, Toast.LENGTH_SHORT).show()
                        
                        if (triggerResult.success) {
                            // Refresh the device list to show updated states
                            deviceControlView.loadDevices()
                        }
                    }
                }.show()
            } else {
                Toast.makeText(this, result.message, Toast.LENGTH_SHORT).show()
            }
        }
    }
}

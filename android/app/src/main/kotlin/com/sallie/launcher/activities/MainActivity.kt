package com.sallie.launcher.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.sallie.launcher.R

/**
 * Sallie AI Launcher MainActivity
 * 
 * Main entry point for the Sallie AI Launcher application.
 * Provides navigation to various demo activities showcasing AI capabilities.
 */
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Set up demo activity navigation
        setupDemoButtons()
    }
    
    private fun setupDemoButtons() {
        // Emotional Intelligence Demo
        findViewById<Button>(R.id.btn_emotional_intelligence_demo).setOnClickListener {
            startActivity(Intent(this, EmotionalIntelligenceDemoActivity::class.java))
        }
        
        // Voice System Demo
        findViewById<Button>(R.id.btn_voice_system_demo).setOnClickListener {
            startActivity(Intent(this, VoiceSystemDemoActivity::class.java))
        }
        
        // Memory System Demo
        findViewById<Button>(R.id.btn_memory_system_demo).setOnClickListener {
            startActivity(Intent(this, MemorySystemDemoActivity::class.java))
        }
        
        // Communication Demo
        findViewById<Button>(R.id.btn_communication_demo).setOnClickListener {
            // Intent will be added when CommunicationDemoActivity is implemented
        }
    }
}
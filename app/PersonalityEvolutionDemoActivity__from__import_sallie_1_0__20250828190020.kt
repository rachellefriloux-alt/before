/*
 * Persona: Tough love meets soul care.
 * Module: PersonalityEvolutionDemoActivity
 * Intent: Handle functionality for PersonalityEvolutionDemoActivity
 * Provenance-ID: 3ac96329-fb87-4321-a0ec-3517f8d776a7
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */


package com.sallie.demo

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.sallie.personacore.PersonaEngineDemo

class PersonalityEvolutionDemoActivity : AppCompatActivity() {
    private lateinit var personaDemo: PersonaEngineDemo
    private lateinit var demoStatusView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        personaDemo = PersonaEngineDemo()
        personaDemo.initializeDemo()

        demoStatusView = TextView(this)
        setContentView(demoStatusView)
        updateDemoStatus()
    }

    override fun onResume() {
        super.onResume()
        personaDemo.runDemoStep("resume")
        updateDemoStatus()
    }

    override fun onPause() {
        super.onPause()
        personaDemo.runDemoStep("pause")
    }

    private fun updateDemoStatus() {
        val status = personaDemo.getDemoStatus()
        demoStatusView.text = "Demo Persona Status: $status"
    }
}

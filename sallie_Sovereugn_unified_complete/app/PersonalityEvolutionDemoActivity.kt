
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


package com.sallie.app

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.sallie.personacore.PersonaEngine

class PersonalityEvolutionActivity : AppCompatActivity() {
    private lateinit var personaEngine: PersonaEngine
    private lateinit var personaStatusView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        personaEngine = PersonaEngine()
        personaEngine.initialize()

        personaStatusView = TextView(this)
        setContentView(personaStatusView)
        updatePersonaStatus()
    }

    override fun onResume() {
        super.onResume()
        personaEngine.evolve("resume")
        updatePersonaStatus()
    }

    override fun onPause() {
        super.onPause()
        personaEngine.evolve("pause")
    }

    private fun updatePersonaStatus() {
        val status = personaEngine.getStatus()
        personaStatusView.text = "Persona Status: $status"
    }
}

// Salle Persona Module
// PersonalityEvolutionActivity.kt
// Migrated and upgraded for Sallie 2.0
// TODO: Integrate with Sallie core persona engine and UI modules

package com.sallie.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.sallie.personacore.PersonaEngine

class PersonalityEvolutionActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // TODO: Connect to PersonaEngine and update UI
    }
    // TODO: Add lifecycle hooks and persona evolution logic
}



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


package com.sallie.app

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main activity with personality evolution visualization.
 * Got it, love.
 */
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentTransaction
import androidx.lifecycle.ViewModelProvider
import com.sallie.core.personality.AdvancedPersonalitySystem
import com.sallie.core.personality.PersonalityEvolutionConnector
import com.sallie.ui.personality.PersonalityEvolutionFragment
import com.sallie.ui.personality.PersonalityViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Main activity for Sallie app with personality evolution integration
 */
class PersonalityEvolutionActivity : AppCompatActivity() {
    
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var personalityViewModel: PersonalityViewModel
    private lateinit var evolutionConnector: PersonalityEvolutionConnector
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_personality_evolution)
        
        // Initialize systems
        personalitySystem = AdvancedPersonalitySystem.getInstance(this)
        
        // Initialize view model
        personalityViewModel = ViewModelProvider(this)[PersonalityViewModel::class.java]
        
        // Get evolution connector from view model
        evolutionConnector = personalityViewModel.getEvolutionConnector(this)
        
        // Record the current state when activity is created
        coroutineScope.launch {
            evolutionConnector.recordCurrentState()
        }
        
        // Set up the fragment
        setupEvolutionFragment()
        
        // Set up toolbar
        setSupportActionBar(findViewById(R.id.toolbar))
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Personality Evolution"
    }
    
    private fun setupEvolutionFragment() {
        // Add the evolution fragment
        val fragment = PersonalityEvolutionFragment.newInstance()
        
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_FADE)
            .commit()
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_personality_evolution, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_refresh -> {
                refreshEvolutionData()
                true
            }
            R.id.action_context_work -> {
                changeContext("Work: Professional environment")
                true
            }
            R.id.action_context_emotional -> {
                changeContext("Emotional: Supporting and caring")
                true
            }
            R.id.action_context_learning -> {
                changeContext("Learning: Educational environment")
                true
            }
            R.id.action_context_casual -> {
                changeContext("Casual: Friendly conversation")
                true
            }
            android.R.id.home -> {
                onBackPressed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun refreshEvolutionData() {
        coroutineScope.launch {
            evolutionConnector.recordCurrentState()
            
            // Notify the WebView to refresh
            val webView = findViewById<WebView>(R.id.evolution_web_view)
            webView.evaluateJavascript("if(window.renderChart) window.renderChart();", null)
        }
    }
    
    private fun changeContext(contextDescription: String) {
        coroutineScope.launch {
            evolutionConnector.recordContextChange(contextDescription)
            
            // Notify the WebView to refresh
            val webView = findViewById<WebView>(R.id.evolution_web_view)
            webView.evaluateJavascript("if(window.renderChart) window.renderChart();", null)
        }
    }
}


package com.sallie.app

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main activity with personality evolution visualization.
 * Got it, love.
 */
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentTransaction
import androidx.lifecycle.ViewModelProvider
import com.sallie.core.personality.AdvancedPersonalitySystem
import com.sallie.core.personality.PersonalityEvolutionConnector
import com.sallie.ui.personality.PersonalityEvolutionFragment
import com.sallie.ui.personality.PersonalityViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Main activity for Sallie app with personality evolution integration
 */
class PersonalityEvolutionActivity : AppCompatActivity() {
    
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var personalityViewModel: PersonalityViewModel
    private lateinit var evolutionConnector: PersonalityEvolutionConnector
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_personality_evolution)
        
        // Initialize systems
        personalitySystem = AdvancedPersonalitySystem.getInstance(this)
        
        // Initialize view model
        personalityViewModel = ViewModelProvider(this)[PersonalityViewModel::class.java]
        
        // Get evolution connector from view model
        evolutionConnector = personalityViewModel.getEvolutionConnector(this)
        
        // Record the current state when activity is created
        coroutineScope.launch {
            evolutionConnector.recordCurrentState()
        }
        
        // Set up the fragment
        setupEvolutionFragment()
        
        // Set up toolbar
        setSupportActionBar(findViewById(R.id.toolbar))
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Personality Evolution"
    }
    
    private fun setupEvolutionFragment() {
        // Add the evolution fragment
        val fragment = PersonalityEvolutionFragment.newInstance()
        
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_FADE)
            .commit()
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_personality_evolution, menu)
        return true
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_refresh -> {
                refreshEvolutionData()
                true
            }
            R.id.action_context_work -> {
                changeContext("Work: Professional environment")
                true
            }
            R.id.action_context_emotional -> {
                changeContext("Emotional: Supporting and caring")
                true
            }
            R.id.action_context_learning -> {
                changeContext("Learning: Educational environment")
                true
            }
            R.id.action_context_casual -> {
                changeContext("Casual: Friendly conversation")
                true
            }
            android.R.id.home -> {
                onBackPressed()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun refreshEvolutionData() {
        coroutineScope.launch {
            evolutionConnector.recordCurrentState()
            
            // Notify the WebView to refresh
            val webView = findViewById<WebView>(R.id.evolution_web_view)
            webView.evaluateJavascript("if(window.renderChart) window.renderChart();", null)
        }
    }
    
    private fun changeContext(contextDescription: String) {
        coroutineScope.launch {
            evolutionConnector.recordContextChange(contextDescription)
            
            // Notify the WebView to refresh
            val webView = findViewById<WebView>(R.id.evolution_web_view)
            webView.evaluateJavascript("if(window.renderChart) window.renderChart();", null)
        }
    }
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\app\PersonalityEvolutionActivity.kt) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\app\PersonalityEvolutionActivity.kt) */
/* --- dest (C:\Users\chell\Desktop\newsal\app\PersonalityEvolutionActivity.kt) --- */
/* Merged master for logical file: app\PersonalityEvolutionActivity
Sources:
 - C:\Users\chell\Desktop\Sallie\merged_sallie\app\PersonalityEvolutionActivity.kt (hash:4C7BDC4D8A8B0CA825A34D72FB3B5DDB68D1FD1164412FD484AA57DCA129084B)
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app\PersonalityEvolutionActivity.kt (hash:F1D254DAB5B0ACA33B1E993A402908CB6EA7351A6F1A3978639C92883B1428BD)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\app\PersonalityEvolutionActivity.kt | ext: .kt | sha: 4C7BDC4D8A8B0CA825A34D72FB3B5DDB68D1FD1164412FD484AA57DCA129084B ---- */
[BINARY FILE - original copied to merged_sources: app\PersonalityEvolutionActivity.kt]
/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app\PersonalityEvolutionActivity.kt | ext: .kt | sha: F1D254DAB5B0ACA33B1E993A402908CB6EA7351A6F1A3978639C92883B1428BD ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\app\PersonalityEvolutionActivity.kt --- */
// Salle Persona Module
// PersonalityEvolutionActivity.kt
// Migrated and upgraded for Sallie 2.0
// TODO: Integrate with Sallie core persona engine and UI modules
package com.sallie.app
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.sallie.personacore.PersonaEngine
class PersonalityEvolutionActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // TODO: Connect to PersonaEngine and update UI
    }
    // TODO: Add lifecycle hooks and persona evolution logic
}

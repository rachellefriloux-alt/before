// Salle Persona Demo Module
// PersonalityEvolutionDemoActivity.kt
// Migrated and upgraded for Sallie 2.0
// TODO: Integrate with PersonaEngine demo features

package com.sallie.demo

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.sallie.personacore.PersonaEngineDemo

class PersonalityEvolutionDemoActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // TODO: Connect to PersonaEngineDemo and update demo UI
    }
    // TODO: Add demo logic and persona evolution showcase
}



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


package com.sallie.demo

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demonstration of the Personality Evolution Chart component.
 * Got it, love.
 */
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.personality.AdvancedPersonalitySystem
import com.sallie.core.personality.PersonalityEvolutionConnector
import com.sallie.core.learning.AdaptiveLearningEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Demo activity for showcasing the Personality Evolution Chart component
 */
class PersonalityEvolutionDemoActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var learningEngine: AdaptiveLearningEngine
    private lateinit var evolutionConnector: PersonalityEvolutionConnector
    private val gson = Gson()
    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize systems
        personalitySystem = AdvancedPersonalitySystem.getInstance(this)
        memorySystem = HierarchicalMemorySystem.getInstance(this)
        learningEngine = AdaptiveLearningEngine.getInstance(this)
        evolutionConnector = PersonalityEvolutionConnector(
            context = this, 
            personalitySystem = personalitySystem,
            memorySystem = memorySystem,
            learningEngine = learningEngine
        )
        
        // Set up WebView
        webView = WebView(this)
        setContentView(webView)
        
        setupWebView()
        loadDemoPage()
    }
    
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
        }
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                // Initialize bridge when page is loaded
                webView.evaluateJavascript(
                    "window.initPersonalityEvolutionBridge(PersonalityNativeBridge);",
                    null
                )
            }
        }
        
        // Add JavaScript interface
        webView.addJavascriptInterface(
            PersonalityNativeBridge(),
            "PersonalityNativeBridge"
        )
    }
    
    private fun loadDemoPage() {
        val htmlContent = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Personality Evolution Demo</title>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        padding: 16px;
                        background-color: #f8f9fa;
                    }
                    .container {
                        max-width: 960px;
                        margin: 0 auto;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 24px;
                    }
                    .card {
                        background: white;
                        border-radius: 8px;
                        padding: 16px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 24px;
                    }
                    .buttons {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-top: 16px;
                    }
                    button {
                        background: #4a6fa5;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 8px 16px;
                        cursor: pointer;
                    }
                    button:hover {
                        background: #3a5a8a;
                    }
                    #chart-container {
                        margin-top: 24px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Personality Evolution Demo</h1>
                    
                    <div class="card">
                        <h2>Context Simulation</h2>
                        <p>Simulate changing contexts to see how they affect personality evolution.</p>
                        <div class="buttons">
                            <button onclick="changeContext('Work: Focused on tasks')">Work Context</button>
                            <button onclick="changeContext('Emotional Support: Helping with personal issues')">Support Context</button>
                            <button onclick="changeContext('Learning: Educational discussion')">Learning Context</button>
                            <button onclick="changeContext('Casual: Friendly conversation')">Casual Context</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h2>Generate Demo Data</h2>
                        <p>Add additional data points to the evolution chart.</p>
                        <div class="buttons">
                            <button onclick="recordCurrentState()">Record Current State</button>
                            <button onclick="generateRandomChanges()">Generate Random Changes</button>
                        </div>
                    </div>
                    
                    <div id="chart-container">
                        <!-- Chart will be rendered here -->
                        <div id="evolution-chart"></div>
                    </div>
                </div>
                
                <script>
                    // Placeholder for the bridge object
                    let evolutionBridge;
                    
                    // Initialize when the page loads
                    document.addEventListener('DOMContentLoaded', () => {
                        // The bridge will be initialized by the WebView
                        setTimeout(() => {
                            if (window.getPersonalityEvolutionBridge) {
                                evolutionBridge = window.getPersonalityEvolutionBridge();
                                renderChart();
                            } else {
                                console.error('PersonalityEvolutionBridge not available');
                            }
                        }, 500);
                    });
                    
                    // Change context
                    async function changeContext(contextDescription) {
                        if (evolutionBridge) {
                            try {
                                await evolutionBridge.recordContextChange(contextDescription);
                                alert(`Context changed to: ${contextDescription}`);
                                renderChart();
                            } catch (error) {
                                console.error('Error changing context:', error);
                            }
                        }
                    }
                    
                    // Record current state
                    async function recordCurrentState() {
                        if (evolutionBridge) {
                            try {
                                await evolutionBridge.recordCurrentState();
                                alert('Current state recorded');
                                renderChart();
                            } catch (error) {
                                console.error('Error recording state:', error);
                            }
                        }
                    }
                    
                    // Generate random changes
                    async function generateRandomChanges() {
                        if (evolutionBridge) {
                            try {
                                // Record state multiple times with small delays
                                for (let i = 0; i < 3; i++) {
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    await evolutionBridge.recordCurrentState();
                                }
                                
                                alert('Generated random changes');
                                renderChart();
                            } catch (error) {
                                console.error('Error generating changes:', error);
                            }
                        }
                    }
                    
                    // Render the chart
                    async function renderChart() {
                        if (evolutionBridge) {
                            try {
                                const data = await evolutionBridge.fetchEvolutionData();
                                console.log('Evolution data:', data);
                                
                                // In a real implementation, this would update a Vue component
                                const chartContainer = document.getElementById('evolution-chart');
                                chartContainer.innerHTML = `
                                    <h3>Evolution Data Preview</h3>
                                    <p>Data points: ${data.traitData.length}</p>
                                    <p>Events: ${data.events.length}</p>
                                    <p>Note: In the real app, this would render the Vue component</p>
                                    <pre>${JSON.stringify(data, null, 2).slice(0, 500)}...</pre>
                                `;
                            } catch (error) {
                                console.error('Error rendering chart:', error);
                            }
                        }
                    }
                </script>
            </body>
            </html>
        """.trimIndent()
        
        webView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null)
    }
    
    /**
     * Native bridge for JavaScript interface
     */
    inner class PersonalityNativeBridge {
        
        @JavascriptInterface
        fun getEvolutionData(optionsJson: String): String {
            var result = ""
            
            coroutineScope.launch {
                try {
                    val data = evolutionConnector.getEvolutionData()
                    
                    // Convert to JSON and pass back to JavaScript
                    withContext(Dispatchers.Main) {
                        result = gson.toJson(data)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            return result
        }
        
        @JavascriptInterface
        fun recordContextChange(contextDescription: String): Boolean {
            var success = false
            
            coroutineScope.launch {
                try {
                    evolutionConnector.recordContextChange(contextDescription)
                    success = true
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            return success
        }
        
        @JavascriptInterface
        fun recordCurrentState(): Boolean {
            var success = false
            
            coroutineScope.launch {
                try {
                    evolutionConnector.recordCurrentState()
                    success = true
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            return success
        }
        
        @JavascriptInterface
        fun getAvailableTraits(): String {
            val traits = personalitySystem.getAvailableTraits()
            return gson.toJson(traits)
        }
    }
}


package com.sallie.demo

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Demonstration of the Personality Evolution Chart component.
 * Got it, love.
 */
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson
import com.sallie.core.memory.HierarchicalMemorySystem
import com.sallie.core.personality.AdvancedPersonalitySystem
import com.sallie.core.personality.PersonalityEvolutionConnector
import com.sallie.core.learning.AdaptiveLearningEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Demo activity for showcasing the Personality Evolution Chart component
 */
class PersonalityEvolutionDemoActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var personalitySystem: AdvancedPersonalitySystem
    private lateinit var memorySystem: HierarchicalMemorySystem
    private lateinit var learningEngine: AdaptiveLearningEngine
    private lateinit var evolutionConnector: PersonalityEvolutionConnector
    private val gson = Gson()
    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize systems
        personalitySystem = AdvancedPersonalitySystem.getInstance(this)
        memorySystem = HierarchicalMemorySystem.getInstance(this)
        learningEngine = AdaptiveLearningEngine.getInstance(this)
        evolutionConnector = PersonalityEvolutionConnector(
            context = this, 
            personalitySystem = personalitySystem,
            memorySystem = memorySystem,
            learningEngine = learningEngine
        )
        
        // Set up WebView
        webView = WebView(this)
        setContentView(webView)
        
        setupWebView()
        loadDemoPage()
    }
    
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
        }
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                // Initialize bridge when page is loaded
                webView.evaluateJavascript(
                    "window.initPersonalityEvolutionBridge(PersonalityNativeBridge);",
                    null
                )
            }
        }
        
        // Add JavaScript interface
        webView.addJavascriptInterface(
            PersonalityNativeBridge(),
            "PersonalityNativeBridge"
        )
    }
    
    private fun loadDemoPage() {
        val htmlContent = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Personality Evolution Demo</title>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        padding: 16px;
                        background-color: #f8f9fa;
                    }
                    .container {
                        max-width: 960px;
                        margin: 0 auto;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 24px;
                    }
                    .card {
                        background: white;
                        border-radius: 8px;
                        padding: 16px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 24px;
                    }
                    .buttons {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-top: 16px;
                    }
                    button {
                        background: #4a6fa5;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 8px 16px;
                        cursor: pointer;
                    }
                    button:hover {
                        background: #3a5a8a;
                    }
                    #chart-container {
                        margin-top: 24px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Personality Evolution Demo</h1>
                    
                    <div class="card">
                        <h2>Context Simulation</h2>
                        <p>Simulate changing contexts to see how they affect personality evolution.</p>
                        <div class="buttons">
                            <button onclick="changeContext('Work: Focused on tasks')">Work Context</button>
                            <button onclick="changeContext('Emotional Support: Helping with personal issues')">Support Context</button>
                            <button onclick="changeContext('Learning: Educational discussion')">Learning Context</button>
                            <button onclick="changeContext('Casual: Friendly conversation')">Casual Context</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h2>Generate Demo Data</h2>
                        <p>Add additional data points to the evolution chart.</p>
                        <div class="buttons">
                            <button onclick="recordCurrentState()">Record Current State</button>
                            <button onclick="generateRandomChanges()">Generate Random Changes</button>
                        </div>
                    </div>
                    
                    <div id="chart-container">
                        <!-- Chart will be rendered here -->
                        <div id="evolution-chart"></div>
                    </div>
                </div>
                
                <script>
                    // Placeholder for the bridge object
                    let evolutionBridge;
                    
                    // Initialize when the page loads
                    document.addEventListener('DOMContentLoaded', () => {
                        // The bridge will be initialized by the WebView
                        setTimeout(() => {
                            if (window.getPersonalityEvolutionBridge) {
                                evolutionBridge = window.getPersonalityEvolutionBridge();
                                renderChart();
                            } else {
                                console.error('PersonalityEvolutionBridge not available');
                            }
                        }, 500);
                    });
                    
                    // Change context
                    async function changeContext(contextDescription) {
                        if (evolutionBridge) {
                            try {
                                await evolutionBridge.recordContextChange(contextDescription);
                                alert(`Context changed to: ${contextDescription}`);
                                renderChart();
                            } catch (error) {
                                console.error('Error changing context:', error);
                            }
                        }
                    }
                    
                    // Record current state
                    async function recordCurrentState() {
                        if (evolutionBridge) {
                            try {
                                await evolutionBridge.recordCurrentState();
                                alert('Current state recorded');
                                renderChart();
                            } catch (error) {
                                console.error('Error recording state:', error);
                            }
                        }
                    }
                    
                    // Generate random changes
                    async function generateRandomChanges() {
                        if (evolutionBridge) {
                            try {
                                // Record state multiple times with small delays
                                for (let i = 0; i < 3; i++) {
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    await evolutionBridge.recordCurrentState();
                                }
                                
                                alert('Generated random changes');
                                renderChart();
                            } catch (error) {
                                console.error('Error generating changes:', error);
                            }
                        }
                    }
                    
                    // Render the chart
                    async function renderChart() {
                        if (evolutionBridge) {
                            try {
                                const data = await evolutionBridge.fetchEvolutionData();
                                console.log('Evolution data:', data);
                                
                                // In a real implementation, this would update a Vue component
                                const chartContainer = document.getElementById('evolution-chart');
                                chartContainer.innerHTML = `
                                    <h3>Evolution Data Preview</h3>
                                    <p>Data points: ${data.traitData.length}</p>
                                    <p>Events: ${data.events.length}</p>
                                    <p>Note: In the real app, this would render the Vue component</p>
                                    <pre>${JSON.stringify(data, null, 2).slice(0, 500)}...</pre>
                                `;
                            } catch (error) {
                                console.error('Error rendering chart:', error);
                            }
                        }
                    }
                </script>
            </body>
            </html>
        """.trimIndent()
        
        webView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null)
    }
    
    /**
     * Native bridge for JavaScript interface
     */
    inner class PersonalityNativeBridge {
        
        @JavascriptInterface
        fun getEvolutionData(optionsJson: String): String {
            var result = ""
            
            coroutineScope.launch {
                try {
                    val data = evolutionConnector.getEvolutionData()
                    
                    // Convert to JSON and pass back to JavaScript
                    withContext(Dispatchers.Main) {
                        result = gson.toJson(data)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            return result
        }
        
        @JavascriptInterface
        fun recordContextChange(contextDescription: String): Boolean {
            var success = false
            
            coroutineScope.launch {
                try {
                    evolutionConnector.recordContextChange(contextDescription)
                    success = true
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            return success
        }
        
        @JavascriptInterface
        fun recordCurrentState(): Boolean {
            var success = false
            
            coroutineScope.launch {
                try {
                    evolutionConnector.recordCurrentState()
                    success = true
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            return success
        }
        
        @JavascriptInterface
        fun getAvailableTraits(): String {
            val traits = personalitySystem.getAvailableTraits()
            return gson.toJson(traits)
        }
    }
}


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\app\PersonalityEvolutionDemoActivity.kt) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\app\PersonalityEvolutionDemoActivity.kt) */
/* --- dest (C:\Users\chell\Desktop\newsal\app\PersonalityEvolutionDemoActivity.kt) --- */
/* Merged master for logical file: app\PersonalityEvolutionDemoActivity
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app\PersonalityEvolutionDemoActivity.kt (hash:84368A695E708C5BE1DC2E97C87671F4BBAF3A94916102346139DD5976A728F3)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\app\PersonalityEvolutionDemoActivity.kt (hash:102668E96A802DC3DEE3F310309C081DBEF7E44F15D3636989937D032AD2E54E)
 */

/* ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\app\PersonalityEvolutionDemoActivity.kt | ext: .kt | sha: 84368A695E708C5BE1DC2E97C87671F4BBAF3A94916102346139DD5976A728F3 ---- */
[BINARY FILE - original copied to merged_sources: app\PersonalityEvolutionDemoActivity.kt]
/* ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\app\PersonalityEvolutionDemoActivity.kt | ext: .kt | sha: 102668E96A802DC3DEE3F310309C081DBEF7E44F15D3636989937D032AD2E54E ---- */
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\app\PersonalityEvolutionDemoActivity.kt --- */
// Salle Persona Demo Module
// PersonalityEvolutionDemoActivity.kt
// Migrated and upgraded for Sallie 2.0
// TODO: Integrate with PersonaEngine demo features
package com.sallie.demo
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.sallie.personacore.PersonaEngineDemo
class PersonalityEvolutionDemoActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // TODO: Connect to PersonaEngineDemo and update demo UI
    }
    // TODO: Add demo logic and persona evolution showcase
}

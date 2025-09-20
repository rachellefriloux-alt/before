package com.sallie.ui.personality

/**
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Fragment for personality evolution visualization.
 * Got it, love.
 */
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.google.gson.Gson
import com.sallie.core.personality.PersonalityEvolutionConnector
import com.sallie.ui.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Fragment displaying the personality evolution chart
 */
class PersonalityEvolutionFragment : Fragment() {

    companion object {
        fun newInstance() = PersonalityEvolutionFragment()
    }
    
    private lateinit var viewModel: PersonalityViewModel
    private lateinit var webView: WebView
    private lateinit var evolutionConnector: PersonalityEvolutionConnector
    private val gson = Gson()
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    
    override fun onCreateView(
        inflater: LayoutInflater, 
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_personality_evolution, container, false)
        webView = view.findViewById(R.id.evolution_web_view)
        return view
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(requireActivity())[PersonalityViewModel::class.java]
        
        // Get evolution connector
        evolutionConnector = viewModel.getEvolutionConnector(requireContext())
        
        setupWebView()
    }
    
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_NO_CACHE
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
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
        
        // Load the Vue component in WebView
        loadVueComponent()
    }
    
    private fun loadVueComponent() {
        val htmlContent = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Personality Evolution</title>
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #ffffff;
                        color: #333333;
                    }
                    .loader {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .loader::after {
                        content: '';
                        width: 50px;
                        height: 50px;
                        border: 5px solid #dddddd;
                        border-radius: 50%;
                        border-top-color: #4a6fa5;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    #app {
                        width: 100%;
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                <div id="app">
                    <div class="loader"></div>
                </div>
                
                <script>
                    // This script loads the Vue component
                    document.addEventListener('DOMContentLoaded', () => {
                        // The bridge will be initialized by the WebView
                        setTimeout(() => {
                            if (window.getPersonalityEvolutionBridge) {
                                window.renderChart = async function() {
                                    const evolutionBridge = window.getPersonalityEvolutionBridge();
                                    const data = await evolutionBridge.fetchEvolutionData();
                                    
                                    // Display data 
                                    const app = document.getElementById('app');
                                    app.innerHTML = `
                                        <div style="padding: 16px;">
                                            <h2 style="color: #4a6fa5;">Personality Evolution</h2>
                                            <p>Showing ${data.traitData.length} data points across ${new Set(data.traitData.map(p => p.trait)).size} personality traits</p>
                                            <div style="margin-top: 20px;">
                                                <h3>Recent Events</h3>
                                                <ul>
                                                    ${data.events.slice(-5).reverse().map(e => 
                                                        `<li style="margin-bottom: 8px;"><strong>${new Date(e.timestamp).toLocaleDateString()} ${new Date(e.timestamp).toLocaleTimeString()}</strong> - ${e.description}</li>`
                                                    ).join('')}
                                                </ul>
                                            </div>
                                            <div style="margin-top: 20px;">
                                                <h3>Trait Visualization</h3>
                                                <p>In the production app, this would display the complete Vue component with the interactive chart.</p>
                                                <p>This placeholder demonstrates the JavaScript bridge is working correctly.</p>
                                            </div>
                                        </div>
                                    `;
                                }
                                
                                window.renderChart();
                            } else {
                                console.error('PersonalityEvolutionBridge not available');
                                document.getElementById('app').innerHTML = `
                                    <div style="padding: 16px; color: red;">
                                        <h2>Error</h2>
                                        <p>PersonalityEvolutionBridge not available</p>
                                    </div>
                                `;
                            }
                        }, 500);
                    });
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
            var result = "{\"traitData\": [], \"events\": []}"
            
            coroutineScope.launch {
                try {
                    val data = evolutionConnector.getEvolutionData()
                    
                    // Convert to JSON and pass back to JavaScript
                    result = withContext(Dispatchers.Default) {
                        gson.toJson(data)
                    }
                    
                    // Execute JavaScript to update the chart
                    webView.post {
                        webView.evaluateJavascript(
                            "if(window.updateChartData) window.updateChartData($result);",
                            null
                        )
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
            val traits = viewModel.personalitySystem.getAvailableTraits()
            return gson.toJson(traits)
        }
    }
}

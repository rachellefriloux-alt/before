package com.sallie.core.memory

import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ListView
import android.widget.Spinner
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

/**
 * Memory System Demo Activity
 *
 * This activity demonstrates the capabilities of Sallie's memory system:
 * - Creating different types of memories
 * - Retrieving memories by various criteria
 * - Working with memory associations
 * - Reinforcing memories
 * - Observing memory decay over time
 */
class MemorySystemDemoActivity : AppCompatActivity() {
    
    // Memory system reference
    private lateinit var memorySystem: MemorySystemIntegration
    
    // UI components
    private lateinit var memoryTypeSpinner: Spinner
    private lateinit var contentEditText: EditText
    private lateinit var queryEditText: EditText
    private lateinit var resultsListView: ListView
    private lateinit var statusTextView: TextView
    
    // Adapters
    private lateinit var resultsAdapter: ArrayAdapter<String>
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_memory_system_demo)
        
        // Initialize UI components
        memoryTypeSpinner = findViewById(R.id.memoryTypeSpinner)
        contentEditText = findViewById(R.id.contentEditText)
        queryEditText = findViewById(R.id.queryEditText)
        resultsListView = findViewById(R.id.resultsListView)
        statusTextView = findViewById(R.id.statusTextView)
        
        // Set up spinner
        ArrayAdapter.createFromResource(
            this,
            R.array.memory_types,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            memoryTypeSpinner.adapter = adapter
        }
        
        // Set up results list
        resultsAdapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, ArrayList<String>())
        resultsListView.adapter = resultsAdapter
        
        // Initialize memory system
        initializeMemorySystem()
        
        // Set up button listeners
        findViewById<Button>(R.id.createMemoryButton).setOnClickListener {
            createMemory()
        }
        
        findViewById<Button>(R.id.searchMemoryButton).setOnClickListener {
            searchMemories()
        }
        
        findViewById<Button>(R.id.workingMemoryButton).setOnClickListener {
            showWorkingMemory()
        }
        
        findViewById<Button>(R.id.reinforceSelectedButton).setOnClickListener {
            reinforceSelectedMemory()
        }
        
        findViewById<Button>(R.id.showAssociationsButton).setOnClickListener {
            showAssociations()
        }
    }
    
    /**
     * Initialize the memory system
     */
    private fun initializeMemorySystem() {
        memorySystem = MemorySystemIntegration()
        
        // Initialize memory system
        memorySystem.initialize(applicationContext)
        
        // Observe ready state
        memorySystem.isReady.observe(this) { isReady ->
            if (isReady) {
                statusTextView.text = "Memory System Ready"
                
                // Create some initial memories for demo purposes
                lifecycleScope.launch {
                    createInitialMemories()
                }
            } else {
                statusTextView.text = "Memory System Initializing..."
            }
        }
    }
    
    /**
     * Create some initial memories for demonstration
     */
    private suspend fun createInitialMemories() {
        // Create some sample memories
        val episodicId1 = memorySystem.createEpisodicMemory(
            content = "Met Sarah at the coffee shop today",
            location = "Downtown Coffee",
            people = listOf("Sarah"),
            emotionalValence = EmotionalValence.POSITIVE,
            importance = 0.7f
        )
        
        val episodicId2 = memorySystem.createEpisodicMemory(
            content = "Finished the project presentation",
            location = "Office",
            people = listOf("Team"),
            emotionalValence = EmotionalValence.STRONGLY_POSITIVE,
            importance = 0.9f
        )
        
        val semanticId1 = memorySystem.createSemanticMemory(
            concept = "Coffee",
            definition = "A brewed drink prepared from roasted coffee beans",
            confidence = 0.9f
        )
        
        val emotionalId1 = memorySystem.createEmotionalMemory(
            trigger = "Receiving praise for presentation",
            response = "Felt proud and accomplished",
            emotionalValence = EmotionalValence.STRONGLY_POSITIVE,
            intensity = 0.8f
        )
        
        // Create some associations
        memorySystem.associateMemories(
            MemoryType.EPISODIC, episodicId1,
            MemoryType.SEMANTIC, semanticId1
        )
        
        memorySystem.associateMemories(
            MemoryType.EPISODIC, episodicId2,
            MemoryType.EMOTIONAL, emotionalId1
        )
        
        statusTextView.text = "Memory System Ready - Sample memories created"
    }
    
    /**
     * Create a new memory based on UI inputs
     */
    private fun createMemory() {
        val content = contentEditText.text.toString()
        if (content.isBlank()) {
            statusTextView.text = "Please enter memory content"
            return
        }
        
        val memoryTypePosition = memoryTypeSpinner.selectedItemPosition
        
        lifecycleScope.launch {
            try {
                val memoryId = when (memoryTypePosition) {
                    0 -> { // Episodic
                        memorySystem.createEpisodicMemory(
                            content = content,
                            location = "Demo Location",
                            emotionalValence = EmotionalValence.NEUTRAL
                        )
                    }
                    1 -> { // Semantic
                        memorySystem.createSemanticMemory(
                            concept = content.split(" ").firstOrNull() ?: content,
                            definition = content
                        )
                    }
                    else -> { // Emotional
                        memorySystem.createEmotionalMemory(
                            trigger = "Demo Trigger",
                            response = content,
                            emotionalValence = EmotionalValence.POSITIVE
                        )
                    }
                }
                
                statusTextView.text = "Memory created with ID: $memoryId"
                contentEditText.text.clear()
                
                // Show working memory after creating
                showWorkingMemory()
            } catch (e: Exception) {
                statusTextView.text = "Error creating memory: ${e.message}"
            }
        }
    }
    
    /**
     * Search memories based on query text
     */
    private fun searchMemories() {
        val query = queryEditText.text.toString()
        if (query.isBlank()) {
            statusTextView.text = "Please enter a search query"
            return
        }
        
        lifecycleScope.launch {
            try {
                val results = memorySystem.retrieveMemoriesByQuery(
                    query = query,
                    memoryTypes = setOf(MemoryType.EPISODIC, MemoryType.SEMANTIC, MemoryType.EMOTIONAL),
                    limit = 10
                )
                
                displayMemoryResults(results)
                statusTextView.text = "Found ${results.size} memories"
            } catch (e: Exception) {
                statusTextView.text = "Error searching: ${e.message}"
            }
        }
    }
    
    /**
     * Show current working memory contents
     */
    private fun showWorkingMemory() {
        lifecycleScope.launch {
            val workingMemory = memorySystem.getWorkingMemoryItems()
            
            resultsAdapter.clear()
            for (item in workingMemory) {
                val memory = when (item.memoryType) {
                    MemoryType.EPISODIC -> {
                        val mem = memorySystem.accessMemory(item.memoryType, item.memoryId) as? EpisodicMemory
                        "E: ${mem?.content ?: "Unknown"}"
                    }
                    MemoryType.SEMANTIC -> {
                        val mem = memorySystem.accessMemory(item.memoryType, item.memoryId) as? SemanticMemory
                        "S: ${mem?.concept ?: "Unknown"} - ${mem?.definition?.take(50) ?: "Unknown"}"
                    }
                    MemoryType.EMOTIONAL -> {
                        val mem = memorySystem.accessMemory(item.memoryType, item.memoryId) as? EmotionalMemory
                        "EM: ${mem?.response ?: "Unknown"}"
                    }
                }
                resultsAdapter.add("${memory} [ID: ${item.memoryId}]")
            }
            
            statusTextView.text = "Working memory: ${workingMemory.size} items"
        }
    }
    
    /**
     * Display memory results in the list view
     */
    private fun displayMemoryResults(results: List<MemoryResult>) {
        resultsAdapter.clear()
        
        for (result in results) {
            val displayText = when (val memory = result.memory) {
                is EpisodicMemory -> {
                    "E: ${memory.content} (${String.format("%.2f", result.relevanceScore)})"
                }
                is SemanticMemory -> {
                    "S: ${memory.concept} - ${memory.definition.take(50)}... (${String.format("%.2f", result.relevanceScore)})"
                }
                is EmotionalMemory -> {
                    "EM: ${memory.response} (${String.format("%.2f", result.relevanceScore)})"
                }
                else -> "Unknown memory type"
            }
            
            resultsAdapter.add("${displayText} [ID: ${result.memory.id}]")
        }
    }
    
    /**
     * Reinforce the selected memory
     */
    private fun reinforceSelectedMemory() {
        val position = resultsListView.checkedItemPosition
        if (position == ListView.INVALID_POSITION) {
            statusTextView.text = "No memory selected"
            return
        }
        
        val resultText = resultsAdapter.getItem(position) ?: return
        
        // Extract ID from the displayed text
        val idMatch = Regex("\\[ID: (.+?)\\]").find(resultText)
        val id = idMatch?.groupValues?.get(1) ?: return
        
        // Determine memory type from the prefix
        val type = when {
            resultText.startsWith("E:") -> MemoryType.EPISODIC
            resultText.startsWith("S:") -> MemoryType.SEMANTIC
            resultText.startsWith("EM:") -> MemoryType.EMOTIONAL
            else -> null
        } ?: return
        
        // Reinforce the memory
        memorySystem.reinforceMemory(type, id, 1.5f)
        statusTextView.text = "Memory reinforced: $id"
    }
    
    /**
     * Show associations for selected memory
     */
    private fun showAssociations() {
        val position = resultsListView.checkedItemPosition
        if (position == ListView.INVALID_POSITION) {
            statusTextView.text = "No memory selected"
            return
        }
        
        val resultText = resultsAdapter.getItem(position) ?: return
        
        // Extract ID from the displayed text
        val idMatch = Regex("\\[ID: (.+?)\\]").find(resultText)
        val id = idMatch?.groupValues?.get(1) ?: return
        
        // Determine memory type from the prefix
        val type = when {
            resultText.startsWith("E:") -> MemoryType.EPISODIC
            resultText.startsWith("S:") -> MemoryType.SEMANTIC
            resultText.startsWith("EM:") -> MemoryType.EMOTIONAL
            else -> null
        } ?: return
        
        lifecycleScope.launch {
            try {
                val associations = memorySystem.retrieveAssociatedMemories(type, id)
                displayMemoryResults(associations)
                statusTextView.text = "Found ${associations.size} associated memories"
            } catch (e: Exception) {
                statusTextView.text = "Error finding associations: ${e.message}"
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        
        // Proper cleanup
        lifecycleScope.launch {
            memorySystem.saveAllMemories()
            memorySystem.shutdown()
        }
    }
}

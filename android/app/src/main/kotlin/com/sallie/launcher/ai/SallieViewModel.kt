package com.sallie.launcher

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.sallie.feature.FeatureRegistry
import com.sallie.core.Task
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SallieViewModel(app: Application) : AndroidViewModel(app) {
    val system = SallieSystem()
    private val persistence = SalliePersistence(app.applicationContext)

    // Conversation & silence tracking additions
    private val _conversation = MutableStateFlow<List<ConversationEntry>>(emptyList())
    val conversation: StateFlow<List<ConversationEntry>> = _conversation
    private var lastSpeechTs: Long = 0L
    private val silenceTimeoutMs = 3000L
    private val _asrError = MutableStateFlow<String?>(null)
    val asrError: StateFlow<String?> = _asrError
    private var lastRmsEmitMs: Long = 0L
    private val platformASR =
        PlatformASR(
            app,
            onPartial = { text ->
                lastSpeechTs = System.currentTimeMillis()
                system.asrManager.ingestTranscript(text, isFinal = false)
                appendLog("ASR partial: $text")
            },
            onFinal = { text ->
                lastSpeechTs = System.currentTimeMillis()
                system.asrManager.ingestTranscript(text, isFinal = true)
                val entry = ConversationEntry(System.currentTimeMillis(), "user", text)
                _conversation.value = (_conversation.value + entry).takeLast(100)
                persistence.saveConversationEntries(_conversation.value)
                appendLog("ASR final: $text")
                // Auto-generate Sallie reply
                viewModelScope.launch {
                    val reply = generateSallieReply(text)
                    val resp = ConversationEntry(System.currentTimeMillis(), "sallie", reply)
                    _conversation.value = (_conversation.value + resp).takeLast(100)
                    persistence.saveConversationEntries(_conversation.value)
                    appendLog("Reply generated")
                    // Optionally speak response
                    val spoken = system.ttsManager.speak(reply)
                    platformTTS.speak(reply)
                    appendLog(spoken)
                }
            },
            onRms = { level ->
                system.asrManager.setRms(level)
                val now = System.currentTimeMillis()
                if (now - lastRmsEmitMs > 50) { // throttle to ~20Hz
                    system.asrManager.pushRms(level)
                    lastRmsEmitMs = now
                }
                checkSilence()
            },
            onState = { st ->
                appendLog("ASR:$st")
                if (st.startsWith("error:")) _asrError.value = st.removePrefix("error:")
            },
        )
    private val platformTTS = PlatformTTS(app) { st -> appendLog(st) }

    private val _mood = MutableStateFlow(system.emotionalContext.currentMood)
    val mood: StateFlow<String> = _mood

    private val _fatigue = MutableStateFlow(system.emotionalContext.fatigueLevel)
    val fatigue: StateFlow<Int> = _fatigue

    // Stubs for missing properties and functions
    val currentMood: String get() = _mood.value
    val fatigueLevel: Int get() = _fatigue.value

    // Stubs for ASRManager functions
    object asrManagerStub {
        fun ingestTranscript(text: String, isFinal: Boolean) {}
        fun setRms(level: Float) {}
        fun pushRms(level: Float) {}
        fun stopListening() {}
        fun startListening() {}
        fun getTranscript(): String = ""
        fun allFinal(): List<String> = emptyList()
        fun currentPartial(): String = ""
    }

    // Stubs for TaskOrchestrator functions
    object taskOrchestratorStub {
        fun addTask(id: String, name: String, urgency: Int, importance: Int, effortMinutes: Int) {}
        fun selectTasks(maxStress: Int, maxTotalMinutes: Int): List<Task> = emptyList()
    }

    // Stubs for ThemeManager
    object themeManagerStub {
        fun suggestTheme(mood: String): String = "Default Theme"
    }

    // Stubs for SituationAnalyzer
    object situationAnalyzerStub {
        val tags: List<String> = emptyList()
        val emotionalWeight: Float = 0f
        val recommendation: String = ""
        fun analyzeSituation(input: String): SituationAnalyzerStub = SituationAnalyzerStub()
        class SituationAnalyzerStub {
            val tags: List<String> = emptyList()
            val emotionalWeight: Float = 0f
            val recommendation: String = ""
        }
    }

    // Stubs for DignityProtocols
    object dignityProtocolsStub {
        fun enforceProtocol(action: String) {}
        fun audit(): List<String> = emptyList()
    }

    // Stubs for DeviceControlManager
    object deviceControlStub {
        fun revokePermission(permission: String) {}
        fun grantPermission(permission: String) {}
        fun makeCall(contact: String): String = "Call made"
    }

    // Stubs for TTSManager
    object ttsManagerStub {
        fun speak(text: String): String = "Spoken: $text"
        fun switchVoice(profile: String): String = "Voice switched"
        fun getVoice(): String = "default"
    }

    private val _tasks = MutableStateFlow<List<Task>>(emptyList())
    val tasks: StateFlow<List<Task>> = _tasks

    private val _situation = MutableStateFlow("")
    val situation: StateFlow<String> = _situation

    private val _dignityEvents = MutableStateFlow(0)
    val dignityEvents: StateFlow<Int> = _dignityEvents

    private val _log = MutableStateFlow<List<String>>(emptyList())
    val log: StateFlow<List<String>> = _log

    private val _theme = MutableStateFlow("Default Theme")
    val theme: StateFlow<String> = _theme

    private val _listening = MutableStateFlow(false)
    val listening: StateFlow<Boolean> = _listening

    private val _voice = MutableStateFlow("default")
    val voice: StateFlow<String> = _voice

    private val _featureMetrics = MutableStateFlow<Map<String, Any>>(emptyMap())
    val featureMetrics: StateFlow<Map<String, Any>> = _featureMetrics

    private val _persona = MutableStateFlow("creator")
    val persona: StateFlow<String> = _persona
    private val _season = MutableStateFlow("spring")
    val season: StateFlow<String> = _season
    private val _event = MutableStateFlow<String?>(null)
    val event: StateFlow<String?> = _event

    private fun appendLog(entry: String) {
        _log.value = (_log.value + "${System.currentTimeMillis() % 100000} | $entry").takeLast(60)
    }

    fun appendLogExternal(entry: String) = appendLog(entry)

    private fun generateSallieReply(userText: String): String {
        // Simple heuristic using core engines
        val mood = system.emotionalContext.currentMood
    val memorySnippet = system.memory.fetchRecentMemories(1).joinToString().ifBlank { "none" }
        val insight = system.insightSynthesizer.synthesize(userText, memorySnippet)
        return "($mood) ${insight.take(120)}"
    }

    companion object {
        var instance: SallieViewModel? = null
    }

    init {
        instance = this
        persistence.loadMood()?.let { m ->
            system.emotionalContext.updateMood(m)
            _mood.value = m
            _theme.value = system.themeManager.suggestTheme(m)
        }
        persistence.loadFatigue()?.let { f -> _fatigue.value = f }
        persistence.loadTheme()?.let { t -> _theme.value = t }
        val convo = persistence.loadConversationEntries()
        if (convo.isNotEmpty()) _conversation.value = convo.takeLast(100)
    }

    fun updateMood(newMood: String) {
        system.emotionalContext.updateMood(newMood)
        _mood.value = newMood
        _theme.value = system.themeManager.suggestTheme(newMood)
        persistence.saveMood(newMood)
        persistence.saveTheme(_theme.value)
        appendLog("Mood -> $newMood")
    }

    fun setFatigue(level: Int) {
        system.emotionalContext.updateFatigue(level)
        _fatigue.value = level
        persistence.saveFatigue(level)
        appendLog("Fatigue -> $level")
    }

    fun seedTasks() {
        val orchestrator = system.taskOrchestrator
        orchestrator.addTask("1", "Email triage", urgency = 3, importance = 2, effortMinutes = 10)
        orchestrator.addTask("2", "Deep Work Block", urgency = 2, importance = 5, effortMinutes = 50)
        orchestrator.addTask("3", "Quick Sync", urgency = 5, importance = 3, effortMinutes = 15)
        _tasks.value = orchestrator.selectTasks(maxStress = 5, maxTotalMinutes = 60)
        persistence.saveTasks(_tasks.value.map { it.id })
        appendLog("Tasks planned -> ${_tasks.value.size}")
    }

    fun analyzeSituation(input: String) {
        val res = system.situationAnalyzer.analyzeSituation(input)
        _situation.value = "tags=${res.tags} weight=${res.emotionalWeight} rec=${res.recommendation}"
        appendLog("Situation -> ${res.tags}")
    }

    fun enforceDignity(action: String) {
        system.dignityProtocols.enforceProtocol(action)
        _dignityEvents.value = system.dignityProtocols.audit().size
        appendLog("Dignity enforce -> $action")
    }

    fun simulateDeviceAction(blocked: Boolean) {
        if (blocked) system.deviceControl.revokePermission("call") else system.deviceControl.grantPermission("call")
        val result = system.deviceControl.makeCall("Demo Contact")
        appendLog(result)
    }

    fun heartbeat() {
        viewModelScope.launch { appendLog("Heartbeat") }
    }

    fun refreshMetrics() {
        _featureMetrics.value = FeatureRegistry.summary()
        appendLog("Metrics refreshed")
    }

    fun toggleListening() {
        val asr = system.asrManager
        if (_listening.value) {
            platformASR.stop()
            asr.stopListening()
            _listening.value = false
            appendLog("ASR stopped")
        } else {
            asr.startListening()
            platformASR.start()
            _listening.value = true
            lastSpeechTs = System.currentTimeMillis()
            appendLog("ASR started")
        }
    }

    fun captureTranscript() {
        val t = system.asrManager.getTranscript()
        appendLog("Transcript: $t | finals=${system.asrManager.allFinal().size}")
    }

    fun speak(text: String) {
        val res = system.ttsManager.speak(text)
        platformTTS.speak(text)
        appendLog(res)
    }

    fun switchVoice(profile: String) {
        val res = system.ttsManager.switchVoice(profile)
        _voice.value = system.ttsManager.getVoice()
        platformTTS.switchVoice(profile)
        appendLog(res)
    }

    fun clearAsrError() {
        _asrError.value = null
    }

    private fun checkSilence() {
        if (_listening.value) {
            val now = System.currentTimeMillis()
            if (now - lastSpeechTs > silenceTimeoutMs && system.asrManager.currentPartial().isBlank()) {
                platformASR.stop()
                system.asrManager.stopListening()
                _listening.value = false
                appendLog("ASR auto-stopped (silence)")
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        platformASR.destroy()
        platformTTS.shutdownEngine()
    }

    fun exportConversationCsv(): String = persistence.exportConversation(conversation.value)

    fun getConversationExport(): String = exportConversationCsv()

    fun exportConversationJson(
        speaker: String? = null,
        startTs: Long? = null,
        endTs: Long? = null,
        limit: Int? = null,
    ): String = persistence.exportConversationJson(conversation.value, speaker, startTs, endTs, limit)

    /**
     * Advanced visual state management and generation
     */
    private var _visualOptions = MutableLiveData(createDefaultVisualOptions())
    val visualOptions: LiveData<Map<String, Any>> = _visualOptions

    private var _currentAvatarSvg = MutableLiveData<String>()
    val currentAvatarSvg: LiveData<String> = _currentAvatarSvg

    private var _savedLooks = MutableLiveData<List<Map<String, Any>>>(emptyList())
    val savedLooks: LiveData<List<Map<String, Any>>> = _savedLooks

    private var _visualPreferences = MutableLiveData(createDefaultVisualPreferences())
    val visualPreferences: LiveData<Map<String, Any>> = _visualPreferences

    /**
     * Selects theme and icon set based on mood, season, and event, per Salle's constitution.
     */
    fun selectVisualState(
        mood: String,
        season: String,
        event: String? = null,
    ): Pair<String, String> {
        return when (mood.lowercase()) {
            "grace" ->
                when (season.lowercase()) {
                    "spring" -> "Grace & Grind" to if (event == "launch_day") "grace_spring_launch" else "grace_spring_base"
                    "summer" -> "Grace & Grind" to if (event == "anniversary") "grace_summer_anniv" else "grace_summer_base"
                    else -> "Grace & Grind" to "grace_default"
                }
            "hustle" ->
                when (season.lowercase()) {
                    "winter" -> "Hustle Legacy" to "hustle_winter_base"
                    "fall" -> "Hustle Legacy" to if (event == "big_win") "hustle_fall_bigwin" else "hustle_fall_base"
                    else -> "Hustle Legacy" to "hustle_default"
                }
            "soul care" ->
                when (season.lowercase()) {
                    "winter" -> "Soul Care" to if (event == "self_care_week") "soul_winter_selfcare" else "soul_winter_base"
                    "spring" -> "Soul Care" to "soul_spring_base"
                    else -> "Soul Care" to "soul_default"
                }
            "grit" ->
                when (season.lowercase()) {
                    "summer" -> "Southern Grit" to "grit_summer_base"
                    "fall" -> "Southern Grit" to if (event == "fundraiser") "grit_fall_fundraiser" else "grit_fall_base"
                    else -> "Southern Grit" to "grit_default"
                }
            "midnight" ->
                when (season.lowercase()) {
                    "winter" -> "Midnight Hustle" to "midnight_winter_base"
                    "summer" -> "Midnight Hustle" to if (event == "hackathon") "midnight_summer_hackathon" else "midnight_summer_base"
                    else -> "Midnight Hustle" to "midnight_default"
                }
            "visionary" ->
                when (season.lowercase()) {
                    "spring" -> "Visionary" to if (event == "product_launch") "visionary_spring_launch" else "visionary_spring_base"
                    "fall" -> "Visionary" to if (event == "innovation_day") "visionary_fall_innovation" else "visionary_fall_base"
                    else -> "Visionary" to "visionary_default"
                }
            "guardian" ->
                when (season.lowercase()) {
                    "winter" -> "Guardian" to if (event == "security_week") "guardian_winter_security" else "guardian_winter_base"
                    "summer" -> "Guardian" to if (event == "family_reunion") "guardian_summer_reunion" else "guardian_summer_base"
                    else -> "Guardian" to "guardian_default"
                }
            "mentor" ->
                when (season.lowercase()) {
                    "spring" -> "Mentor" to if (event == "graduation") "mentor_spring_graduation" else "mentor_spring_base"
                    "fall" -> "Mentor" to if (event == "mentorship_week") "mentor_fall_mentorship" else "mentor_fall_base"
                    else -> "Mentor" to "mentor_default"
                }
            "rebel" ->
                when (season.lowercase()) {
                    "summer" -> "Rebel" to if (event == "protest") "rebel_summer_protest" else "rebel_summer_base"
                    "winter" -> "Rebel" to if (event == "rule_break") "rebel_winter_rulebreak" else "rebel_winter_base"
                    else -> "Rebel" to "rebel_default"
                }
            "explorer" ->
                when (season.lowercase()) {
                    "spring" -> "Explorer" to if (event == "expedition") "explorer_spring_expedition" else "explorer_spring_base"
                    "fall" -> "Explorer" to if (event == "discovery_day") "explorer_fall_discovery" else "explorer_fall_base"
                    else -> "Explorer" to "explorer_default"
                }
            "healer" ->
                when (season.lowercase()) {
                    "winter" -> "Healer" to if (event == "wellness_retreat") "healer_winter_retreat" else "healer_winter_base"
                    "summer" -> "Healer" to if (event == "self_care_month") "healer_summer_selfcare" else "healer_summer_base"
                    else -> "Healer" to "healer_default"
                }
            else -> "Grace & Grind" to "grace_default"
        }
    }

    /**
     * Triggers icon generation using the Python pipeline.
     */
    private fun generateIcon(
        persona: String,
        mood: String,
        season: String,
        event: String? = null,
    ) {
        val eventArg = event ?: ""
        try {
            val cmd = arrayOf("python3", "app/icon_pipeline/icon_pipeline.py", persona, mood, season, eventArg)
            Runtime.getRuntime().exec(cmd)
            appendLog("Icon generation triggered: ${cmd.joinToString(" ")}")
        } catch (e: Exception) {
            appendLog("Icon generation failed: ${e.message}")
        }
    }

    /**
     * Applies theme and icon in sync, respecting Salle's constitution.
     */
    fun applyVisualState(
        persona: String,
        mood: String,
        season: String,
        event: String? = null,
    ) {
        val (theme, iconSet) = selectVisualState(mood, season, event)
        _theme.value = theme
        generateIcon(persona, mood, season, event)
        appendLog("Visual state applied: theme=$theme, iconSet=$iconSet")
    }

    /**
     * Schedules seasonal/event-based visual state updates using WorkManager (pseudo-code).
     */
    fun scheduleVisualStateUpdates() {
        // Use WorkManager or AlarmManager for real scheduling
        // Example: schedule applyVisualState for season changes, holidays, milestones
        // WorkManager.enqueue(VisualStateWorker(...))
        appendLog("Visual state scheduling scaffolded.")
    }

    /**
     * Example: Automatically update visual state for seasonal/event triggers.
     */
    fun autoUpdateVisualState() {
        val persona = persona.value
        val mood = mood.value
        val season = getCurrentSeason()
        val event = getCurrentEvent()
        applyVisualState(persona, mood, season, event)
    }

    private fun getCurrentSeason(): String {
        val month = java.util.Calendar.getInstance().get(java.util.Calendar.MONTH)
        return when (month) {
            in 2..4 -> "spring"
            in 5..7 -> "summer"
            in 8..10 -> "fall"
            else -> "winter"
        }
    }

    private fun getCurrentEvent(): String? {
        val today = java.time.LocalDate.now()
        return when {
            today.monthValue == 12 && today.dayOfMonth == 25 -> "family_reunion"
            today.monthValue == 6 && today.dayOfMonth == 1 -> "product_launch"
            // Add more event logic here
            else -> null
        }
    }

    // Advanced Visual System Methods

    /**
     * Create default visual options for new users
     */
    private fun createDefaultVisualOptions(): Map<String, Any> {
        return mapOf(
            "style" to "portrait",
            "primaryColor" to "#8b5cf6",
            "secondaryColor" to "#f59e0b",
            "accentColor" to "#ec4899",
            "hairStyle" to 2,
            "eyeStyle" to 1,
            "faceShape" to 0,
            "accessories" to listOf("earrings"),
            "mood" to "confident",
            "season" to getCurrentSeason(),
            "animated" to false,
            "seed" to kotlin.random.Random.nextInt(1000)
        )
    }

    /**
     * Create default visual preferences
     */
    private fun createDefaultVisualPreferences(): Map<String, Any> {
        return mapOf(
            "allowAnimations" to true,
            "autoSeasonalUpdate" to true,
            "moodBasedChanges" to true,
            "preferredStyles" to listOf("portrait"),
            "colorPreferences" to listOf("#8b5cf6", "#f59e0b"),
            "accessoryPreferences" to listOf("earrings")
        )
    }

    /**
     * Update visual options and regenerate avatar
     */
    fun updateVisualOptions(updates: Map<String, Any>) {
        val currentOptions = _visualOptions.value?.toMutableMap() ?: mutableMapOf()
        currentOptions.putAll(updates)
        _visualOptions.value = currentOptions
        generateAdvancedAvatar()
        appendLog("Visual options updated: ${updates.keys.joinToString(", ")}")
    }

    /**
     * Apply a visual preset
     */
    fun applyVisualPreset(presetId: String) {
        val presets = getVisualPresets()
        val preset = presets[presetId]
        
        if (preset != null) {
            _visualOptions.value = preset
            generateAdvancedAvatar()
            learnFromVisualChoice(preset)
            appendLog("Applied visual preset: $presetId")
        }
    }

    /**
     * Get available visual presets
     */
    fun getVisualPresets(): Map<String, Map<String, Any>> {
        return mapOf(
            "grace-and-grind" to mapOf(
                "style" to "portrait",
                "primaryColor" to "#8b5cf6",
                "secondaryColor" to "#f59e0b",
                "accentColor" to "#ec4899",
                "hairStyle" to 2,
                "eyeStyle" to 1,
                "accessories" to listOf("earrings"),
                "mood" to "confident",
                "season" to getCurrentSeason()
            ),
            "southern-grit" to mapOf(
                "style" to "artistic",
                "primaryColor" to "#d97706",
                "secondaryColor" to "#92400e",
                "accentColor" to "#f59e0b",
                "hairStyle" to 4,
                "eyeStyle" to 2,
                "mood" to "determined",
                "season" to getCurrentSeason()
            ),
            "midnight-hustle" to mapOf(
                "style" to "minimal",
                "primaryColor" to "#1f2937",
                "secondaryColor" to "#6366f1",
                "accentColor" to "#ec4899",
                "hairStyle" to 1,
                "eyeStyle" to 3,
                "accessories" to listOf("glasses"),
                "mood" to "focused",
                "season" to getCurrentSeason()
            ),
            "soul-care" to mapOf(
                "style" to "abstract",
                "primaryColor" to "#059669",
                "secondaryColor" to "#10b981",
                "accentColor" to "#f472b6",
                "hairStyle" to 6,
                "eyeStyle" to 0,
                "accessories" to listOf("necklace"),
                "mood" to "calm",
                "season" to getCurrentSeason()
            ),
            "creative-vision" to mapOf(
                "style" to "geometric",
                "primaryColor" to "#7c3aed",
                "secondaryColor" to "#fbbf24",
                "accentColor" to "#ef4444",
                "hairStyle" to 8,
                "eyeStyle" to 4,
                "accessories" to listOf("glasses", "earrings"),
                "mood" to "creative",
                "season" to getCurrentSeason(),
                "animated" to true
            )
        )
    }

    /**
     * Generate advanced procedural avatar
     */
    fun generateAdvancedAvatar() {
        try {
            val options = _visualOptions.value ?: createDefaultVisualOptions()
            val config = createPythonConfig(options)
            
            // Call advanced avatar generation
            val cmd = arrayOf(
                "python3", 
                "app/icon_pipeline/advanced_icon_generator.py",
                "--config", config,
                "--single-avatar"
            )
            
            val process = Runtime.getRuntime().exec(cmd)
            val result = process.inputStream.bufferedReader().readText()
            
            if (process.waitFor() == 0) {
                // Avatar generated successfully
                generateAvatarSvg(options)
                appendLog("Advanced avatar generated successfully")
            } else {
                appendLog("Avatar generation failed: $result")
            }
        } catch (e: Exception) {
            appendLog("Avatar generation error: ${e.message}")
            // Fallback to simple SVG generation
            generateAvatarSvg(_visualOptions.value ?: createDefaultVisualOptions())
        }
    }

    /**
     * Generate SVG avatar representation
     */
    private fun generateAvatarSvg(options: Map<String, Any>) {
        val svg = createAdvancedSvgAvatar(options)
        _currentAvatarSvg.value = svg
    }

    /**
     * Create advanced SVG avatar based on options
     */
    private fun createAdvancedSvgAvatar(options: Map<String, Any>): String {
        val style = options["style"] as? String ?: "portrait"
        val primaryColor = options["primaryColor"] as? String ?: "#8b5cf6"
        val secondaryColor = options["secondaryColor"] as? String ?: "#f59e0b"
        val hairStyle = options["hairStyle"] as? Int ?: 2
        val eyeStyle = options["eyeStyle"] as? Int ?: 1
        val mood = options["mood"] as? String ?: "confident"
        val accessories = options["accessories"] as? List<*> ?: emptyList<String>()
        val animated = options["animated"] as? Boolean ?: false

        // Generate sophisticated SVG
        return """
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="faceGradient" cx="50%" cy="40%">
                        <stop offset="0%" stop-color="$primaryColor" />
                        <stop offset="70%" stop-color="${adjustHexBrightness(primaryColor, -10)}" />
                        <stop offset="100%" stop-color="${adjustHexBrightness(primaryColor, -30)}" />
                    </radialGradient>
                    <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="$secondaryColor" />
                        <stop offset="100%" stop-color="${adjustHexBrightness(secondaryColor, -40)}" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    ${if (animated) """
                        <animate id="pulseAnimation" attributeName="opacity" 
                                 values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
                    """ else ""}
                </defs>
                
                <!-- Background -->
                ${generateBackgroundSvg(style, primaryColor, options["season"] as? String ?: "summer")}
                
                <!-- Hair -->
                ${generateHairSvg(hairStyle, secondaryColor)}
                
                <!-- Face -->
                <circle cx="100" cy="110" r="50" fill="url(#faceGradient)" filter="url(#glow)" />
                
                <!-- Eyes -->
                ${generateEyesSvg(eyeStyle, mood, primaryColor)}
                
                <!-- Mouth -->
                ${generateMouthSvg(mood, primaryColor)}
                
                <!-- Accessories -->
                ${generateAccessoriesSvg(accessories, primaryColor, secondaryColor)}
                
                ${if (animated) """
                    <animateTransform attributeName="transform" type="rotate" 
                                     values="0 100 100;1 100 100;0 100 100" 
                                     dur="8s" repeatCount="indefinite"/>
                """ else ""}
            </svg>
        """.trimIndent()
    }

    /**
     * Generate background SVG based on style and season
     */
    private fun generateBackgroundSvg(style: String, color: String, season: String): String {
        return when (style) {
            "geometric" -> """
                <polygon points="0,0 200,50 200,200 0,150" fill="${adjustHexBrightness(color, 30)}" opacity="0.1"/>
                <circle cx="150" cy="60" r="20" fill="$color" opacity="0.2"/>
            """
            "abstract" -> """
                <circle cx="100" cy="100" r="90" fill="$color" opacity="0.1"/>
                <ellipse cx="160" cy="70" rx="30" ry="15" fill="${adjustHexBrightness(color, 20)}" opacity="0.2"/>
            """
            else -> """
                <circle cx="100" cy="100" r="95" fill="$color" opacity="0.05"/>
            """
        } + generateSeasonalElements(season, color)
    }

    /**
     * Generate seasonal decorative elements
     */
    private fun generateSeasonalElements(season: String, color: String): String {
        return when (season) {
            "spring" -> """
                <circle cx="30" cy="30" r="3" fill="${adjustHexBrightness(color, 40)}" opacity="0.6"/>
                <circle cx="170" cy="40" r="2" fill="${adjustHexBrightness(color, 50)}" opacity="0.8"/>
            """
            "summer" -> """
                <path d="M 160 40 L 165 45 L 160 50 L 155 45 Z" fill="${adjustHexBrightness(color, 30)}" opacity="0.7"/>
            """
            "autumn" -> """
                <path d="M 20 180 Q 30 170 40 180 T 60 180" stroke="${adjustHexBrightness(color, 20)}" stroke-width="2" opacity="0.4" fill="none"/>
            """
            "winter" -> """
                <polygon points="50,20 55,30 45,30" fill="${adjustHexBrightness(color, -10)}" opacity="0.5"/>
                <polygon points="160,40 165,50 155,50" fill="${adjustHexBrightness(color, -10)}" opacity="0.5"/>
            """
            else -> ""
        }
    }

    /**
     * Generate hair SVG based on style
     */
    private fun generateHairSvg(hairStyle: Int, color: String): String {
        val hairStyles = arrayOf(
            // Classic
            """<path d="M 100 50 Q 55 35 50 70 Q 45 105 75 115 Q 100 120 125 115 Q 155 105 150 70 Q 145 35 100 50" fill="url(#hairGradient)" />""",
            // Pixie
            """<ellipse cx="100" cy="60" rx="60" ry="35" fill="url(#hairGradient)" />""",
            // Bob
            """<path d="M 100 45 Q 50 25 45 65 Q 40 100 70 110 Q 100 115 130 110 Q 160 100 155 65 Q 150 25 100 45" fill="url(#hairGradient)" />""",
            // Curly
            """<circle cx="70" cy="60" r="15" fill="$color"/><circle cx="100" cy="50" r="18" fill="$color"/><circle cx="130" cy="60" r="15" fill="$color"/>""",
            // Braided
            """<path d="M 100 45 Q 60 35 55 70 L 60 110 Q 100 120 140 110 L 145 70 Q 140 35 100 45" fill="url(#hairGradient)" />""",
            // Long
            """<path d="M 100 40 Q 45 30 40 70 Q 35 120 50 140 Q 80 150 100 145 Q 120 150 150 140 Q 165 120 160 70 Q 155 30 100 40" fill="url(#hairGradient)" />""",
            // Afro
            """<circle cx="100" cy="60" r="40" fill="$color"/><circle cx="80" cy="50" r="25" fill="$color"/><circle cx="120" cy="50" r="25" fill="$color"/>""",
            // Updo
            """<ellipse cx="100" cy="40" rx="30" ry="20" fill="$color"/><path d="M 85 55 Q 100 45 115 55 Q 100 60 85 55" fill="$color"/>""",
            // Modern
            """<path d="M 100 45 Q 70 25 60 55 L 65 85 Q 85 90 100 85 Q 115 90 135 85 L 140 55 Q 130 25 100 45" fill="url(#hairGradient)" />"""
        )
        return hairStyles.getOrElse(hairStyle) { hairStyles[0] }
    }

    /**
     * Generate eyes SVG based on style and mood
     */
    private fun generateEyesSvg(eyeStyle: Int, mood: String, color: String): String {
        val eyeColor = adjustHexBrightness(color, -50)
        val moodSize = when (mood) {
            "focused" -> 3
            "creative" -> 5
            else -> 4
        }
        
        val eyeStyles = arrayOf(
            // Round
            """<circle cx="85" cy="95" r="$moodSize" fill="$eyeColor" /><circle cx="115" cy="95" r="$moodSize" fill="$eyeColor" />""",
            // Almond
            """<ellipse cx="85" cy="95" rx="${moodSize + 1}" ry="$moodSize" fill="$eyeColor" /><ellipse cx="115" cy="95" rx="${moodSize + 1}" ry="$moodSize" fill="$eyeColor" />""",
            // Wide
            """<ellipse cx="85" cy="95" rx="${moodSize + 2}" ry="${moodSize - 1}" fill="$eyeColor" /><ellipse cx="115" cy="95" rx="${moodSize + 2}" ry="${moodSize - 1}" fill="$eyeColor" />""",
            // Focused
            """<polygon points="75,90 95,88 95,102 75,100" fill="$eyeColor" /><polygon points="105,88 125,90 125,100 105,102" fill="$eyeColor" />""",
            // Artistic
            """<path d="M 75 95 Q 85 85 95 95 Q 85 105 75 95" fill="$eyeColor" /><path d="M 105 95 Q 115 85 125 95 Q 115 105 105 95" fill="$eyeColor" />"""
        )
        return eyeStyles.getOrElse(eyeStyle) { eyeStyles[0] }
    }

    /**
     * Generate mouth SVG based on mood
     */
    private fun generateMouthSvg(mood: String, color: String): String {
        val mouthColor = adjustHexBrightness(color, -20)
        return when (mood) {
            "confident" -> """<path d="M 88 125 Q 100 135 112 125" stroke="$mouthColor" stroke-width="3" fill="none" stroke-linecap="round" />"""
            "calm" -> """<path d="M 90 125 Q 100 130 110 125" stroke="$mouthColor" stroke-width="2" fill="none" stroke-linecap="round" />"""
            "focused" -> """<path d="M 90 125 L 110 125" stroke="$mouthColor" stroke-width="2" stroke-linecap="round" />"""
            "creative" -> """<path d="M 88 125 Q 95 135 100 122 Q 105 135 112 125" stroke="$mouthColor" stroke-width="2" fill="none" />"""
            "determined" -> """<path d="M 88 123 Q 100 133 112 123" stroke="$mouthColor" stroke-width="3" fill="none" stroke-linecap="round" />"""
            else -> """<path d="M 90 125 Q 100 130 110 125" stroke="$mouthColor" stroke-width="2" fill="none" stroke-linecap="round" />"""
        }
    }

    /**
     * Generate accessories SVG
     */
    private fun generateAccessoriesSvg(accessories: List<*>, primaryColor: String, secondaryColor: String): String {
        var result = ""
        
        accessories.forEach { accessory ->
            when (accessory as? String) {
                "glasses" -> {
                    result += """<ellipse cx="85" cy="95" rx="15" ry="10" fill="none" stroke="$primaryColor" stroke-width="2" opacity="0.8"/>
                                <ellipse cx="115" cy="95" rx="15" ry="10" fill="none" stroke="$primaryColor" stroke-width="2" opacity="0.8"/>
                                <line x1="100" y1="95" x2="105" y2="95" stroke="$primaryColor" stroke-width="2"/>"""
                }
                "earrings" -> {
                    result += """<circle cx="65" cy="105" r="4" fill="$secondaryColor" />
                                <circle cx="135" cy="105" r="4" fill="$secondaryColor" />"""
                }
                "necklace" -> {
                    result += """<ellipse cx="100" cy="160" rx="25" ry="5" fill="none" stroke="$secondaryColor" stroke-width="2" opacity="0.7"/>
                                <circle cx="100" cy="155" r="3" fill="$secondaryColor"/>"""
                }
            }
        }
        
        return result
    }

    /**
     * Save current visual look
     */
    fun saveCurrentVisualLook(name: String, description: String) {
        val currentOptions = _visualOptions.value ?: return
        val savedLook = mapOf(
            "id" to "custom-${System.currentTimeMillis()}",
            "name" to name,
            "description" to description,
            "options" to currentOptions,
            "timestamp" to System.currentTimeMillis()
        )
        
        val currentSaved = _savedLooks.value?.toMutableList() ?: mutableListOf()
        currentSaved.add(savedLook)
        _savedLooks.value = currentSaved
        
        appendLog("Saved visual look: $name")
    }

    /**
     * Delete saved visual look
     */
    fun deleteSavedVisualLook(id: String) {
        val currentSaved = _savedLooks.value?.toMutableList() ?: return
        currentSaved.removeAll { (it["id"] as? String) == id }
        _savedLooks.value = currentSaved
        
        appendLog("Deleted visual look: $id")
    }

    /**
     * Generate personalized avatar recommendations
     */
    fun generateAvatarRecommendations(): List<Map<String, Any>> {
        val preferences = _visualPreferences.value ?: createDefaultVisualPreferences()
        val currentOptions = _visualOptions.value ?: createDefaultVisualOptions()
        
        val recommendations = mutableListOf<Map<String, Any>>()
        
        // Time-based recommendation
        val timeOfDay = getTimeOfDay()
        if (timeOfDay == "morning") {
            recommendations.add(mapOf(
                "id" to "morning-energy",
                "name" to "Morning Energy",
                "description" to "Bright and energizing for a fresh start",
                "options" to currentOptions.toMutableMap().apply {
                    put("primaryColor", "#f59e0b")
                    put("mood", "confident")
                    put("animated", true)
                }
            ))
        }
        
        // Season-based recommendation
        val currentSeason = getCurrentSeason()
        recommendations.add(mapOf(
            "id" to "seasonal-update",
            "name" to "${currentSeason.capitalize()} Vibes",
            "description" to "Updated look for $currentSeason season",
            "options" to currentOptions.toMutableMap().apply {
                put("season", currentSeason)
                put("primaryColor", getSeasonalColor(currentSeason))
            }
        ))
        
        // Mood-based recommendation
        recommendations.add(mapOf(
            "id" to "creative-flow",
            "name" to "Creative Flow",
            "description" to "Perfect for creative and artistic work",
            "options" to currentOptions.toMutableMap().apply {
                put("style", "artistic")
                put("mood", "creative")
                put("primaryColor", "#8b5cf6")
                put("animated", true)
            }
        ))
        
        return recommendations
    }

    /**
     * Learn from user's visual choices
     */
    private fun learnFromVisualChoice(options: Map<String, Any>) {
        val preferences = _visualPreferences.value?.toMutableMap() ?: mutableMapOf()
        
        // Learn style preferences
        val style = options["style"] as? String
        if (style != null) {
            val preferredStyles = preferences["preferredStyles"] as? MutableList<String> ?: mutableListOf()
            if (!preferredStyles.contains(style)) {
                preferredStyles.add(style)
                preferences["preferredStyles"] = preferredStyles
            }
        }
        
        // Learn color preferences
        val primaryColor = options["primaryColor"] as? String
        if (primaryColor != null) {
            val colorPreferences = preferences["colorPreferences"] as? MutableList<String> ?: mutableListOf()
            if (!colorPreferences.contains(primaryColor)) {
                colorPreferences.add(primaryColor)
                preferences["colorPreferences"] = colorPreferences
            }
        }
        
        _visualPreferences.value = preferences
    }

    /**
     * Create Python configuration for advanced avatar generation
     */
    private fun createPythonConfig(options: Map<String, Any>): String {
        return """
            {
                "style": "${options["style"]}",
                "primary_color": "${options["primaryColor"]}",
                "secondary_color": "${options["secondaryColor"]}",
                "mood": "${options["mood"]}",
                "season": "${options["season"]}",
                "hair_style": ${options["hairStyle"]},
                "eye_style": ${options["eyeStyle"]},
                "accessories": ${options["accessories"]},
                "seed": ${options["seed"]}
            }
        """.trimIndent()
    }

    /**
     * Get seasonal color palette
     */
    private fun getSeasonalColor(season: String): String {
        return when (season) {
            "spring" -> "#10b981"
            "summer" -> "#f59e0b"
            "autumn" -> "#d97706"
            "winter" -> "#6366f1"
            else -> "#8b5cf6"
        }
    }

    /**
     * Get time of day
     */
    private fun getTimeOfDay(): String {
        val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        return when {
            hour in 5..11 -> "morning"
            hour in 12..17 -> "afternoon"
            hour in 18..21 -> "evening"
            else -> "night"
        }
    }

    /**
     * Adjust hex color brightness
     */
    private fun adjustHexBrightness(hex: String, amount: Int): String {
        val color = hex.removePrefix("#")
        val num = color.toIntOrNull(16) ?: return hex
        
        val r = maxOf(0, minOf(255, (num shr 16) + amount))
        val g = maxOf(0, minOf(255, (num shr 8 and 0xFF) + amount))
        val b = maxOf(0, minOf(255, (num and 0xFF) + amount))
        
        return "#${((r shl 16) or (g shl 8) or b).toString(16).padStart(6, '0')}"
    }

    fun setPersona(value: String) {
        _persona.value = value
    }

    fun setSeason(value: String) {
        _season.value = value
    }

    fun setEvent(value: String?) {
        _event.value = value
    }
}

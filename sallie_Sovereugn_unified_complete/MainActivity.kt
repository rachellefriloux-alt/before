

package com.sallie.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}


package com.sallie.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Set a simple layout or content view here
        // For now, just use a blank activity
    }
}


package com.sallie.launcher

// 🛡 SALLE PERSONA ENFORCED 🛡  Loyal, Modular, Audit‑Proof.

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.sallie.core.policy.PolicyEngine
import com.sallie.core.policy.CapabilityRegistry
import com.sallie.core.policy.ActionLog
import androidx.compose.ui.tooling.preview.Preview
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.ExistingPeriodicWorkPolicy
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val requestPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* no-op */ }
        setContent {
            RootSallieApp(onRequestMic = {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    requestPermission.launch(Manifest.permission.RECORD_AUDIO)
                }
            })
        }
        // Schedule periodic export every 6 hours
        val work = PeriodicWorkRequestBuilder<ConversationExportWorker>(6, TimeUnit.HOURS).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "conversation_export",
            ExistingPeriodicWorkPolicy.KEEP,
            work
        )
        val micPermLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
        setContent {
            SalleLauncherRoot(onRequestMic = {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    micPermLauncher.launch(Manifest.permission.RECORD_AUDIO)
                }
            })
        }
    }
}

@Composable
private fun SalleLauncherRoot(onRequestMic: () -> Unit) {
    var mood by remember { mutableStateOf("calm") }
    val feed = remember { mutableStateListOf("Hello, I'm Salle.", "Local & private.", "Persona integrity active.") }
    // Demonstrate constitution‑governed capability call
    LaunchedEffect(Unit) {
        val decision = PolicyEngine.evaluate("log_note", mapOf("text" to "boot"))
        ActionLog.append("log_note", "boot", decision.allow, decision.reason)
        if (decision.allow) {
            CapabilityRegistry.get("log_note")?.execute(mapOf("text" to "boot"))
            feed += "Governed: noted boot"
        } else feed += "Governed block: ${'$'}{decision.reason}"
@Composable
fun RootSallieApp(onRequestMic: () -> Unit, vm: SallieViewModel = viewModel()) {
    val theme by vm.theme.collectAsState()
    val scheme = ThemeColorsMapper.schemeFor(theme)
    MaterialTheme(colorScheme = scheme) {
        SallieHome(onRequestMic = onRequestMic, vm = vm)
    }
}

@Composable
fun SallieHome(onRequestMic: () -> Unit, vm: SallieViewModel = viewModel()) {
    val mood by vm.mood.collectAsState()
    val fatigue by vm.fatigue.collectAsState()
    val tasks by vm.tasks.collectAsState()
    val situation by vm.situation.collectAsState()
    val dignityEvents by vm.dignityEvents.collectAsState()
    val log by vm.log.collectAsState()
    val theme by vm.theme.collectAsState()
    val listening by vm.listening.collectAsState()
    val voice by vm.voice.collectAsState()
    val metrics by vm.featureMetrics.collectAsState()
    val rmsSeries = if (listening) vm.system.asrManager.rmsSeries() else emptyList()
    val conversation by vm.conversation.collectAsState()
    val asrError by vm.asrError.collectAsState()
    val context = LocalContext.current

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Sallie Dashboard - Theme: $theme", style = MaterialTheme.typography.headlineSmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Mood: $mood")
                Text("Fatigue: $fatigue")
                Button(onClick = { vm.heartbeat() }) { Text("Pulse") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.updateMood("focused") }) { Text("Focused") }
                Button(onClick = { vm.updateMood("calm") }) { Text("Calm") }
                Button(onClick = { vm.updateMood("energetic") }) { Text("Energetic") }
                Button(onClick = { vm.setFatigue((0..10).random()) }) { Text("Rand Fatigue") }
                Button(onClick = onRequestMic) { Text("Voice Perm") }
            }
            Divider()
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.seedTasks() }) { Text("Plan Tasks") }
                Button(onClick = { vm.analyzeSituation("Urgent conflict deadline") }) { Text("Analyze Situation") }
                Button(onClick = { vm.enforceDignity("redact-sensitive") }) { Text("Enforce Dignity") }
                Button(onClick = { vm.refreshMetrics() }) { Text("Metrics") }
                Button(onClick = {
                    val csv = vm.exportConversationCsv()
                    vm.appendLogExternal("Exported ${csv.lineSequence().count()} lines")
                }) { Text("Export Conv") }
                Button(onClick = {
                    val csv = vm.getConversationExport()
                    val exportFile = File(context.cacheDir, "conversation_export.csv")
                    exportFile.writeText(csv)
                    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", exportFile)
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/csv"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Conversation"))
                }) { Text("Share Conv") }
                Button(onClick = {
                    val json = vm.exportConversationJson(limit = 20)
                    vm.appendLogExternal("JSON last20 size=${json.length}")
                }) { Text("JSON 20") }
                Button(onClick = {
                    val jsonUser = vm.exportConversationJson(speaker = "user", limit = 10)
                    vm.appendLogExternal("JSON user10 size=${jsonUser.length}")
                }) { Text("JSON User") }
            }
            Text("Situation: $situation")
            Text("Dignity Events: $dignityEvents")
            if (tasks.isNotEmpty()) {
                Text("Selected Tasks:")
                tasks.forEach { t -> Text("• ${t.title} (${t.estimatedMinutes}m)") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.simulateDeviceAction(blocked = true) }) { Text("Blocked Call") }
                Button(onClick = { vm.simulateDeviceAction(blocked = false) }) { Text("Allowed Call") }
            }
            Divider()
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Button(onClick = { vm.toggleListening() }) { Text(if (listening) "Stop ASR" else "Start ASR") }
                Button(onClick = { vm.captureTranscript() }) { Text("Grab Transcript") }
                Text(if (listening) "Listening..." else "Idle")
            }
            if (asrError != null) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("ASR Error: $asrError", color = Color.Red)
                    Button(onClick = { vm.clearAsrError() }) { Text("Dismiss") }
                }
            }
            // Removed transcript display since variables were removed
            if (rmsSeries.isNotEmpty()) {
                Waveform(rmsSeries)
            }
            if (conversation.isNotEmpty()) {
                Text("Conversation (${conversation.size})")
                LazyColumn(modifier = Modifier.height(180.dp)) {
                    items(conversation) { entry ->
                        val speakerColor = if (entry.speaker == "user") Color(0xFF2196F3) else Color(0xFF9C27B0)
                        Text(
                            text = "${entry.speaker}: ${entry.text}",
                            color = speakerColor,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.speak("Hello, I'm Sallie") }) { Text("Speak Hello") }
                Button(onClick = { vm.switchVoice("warm") }) { Text("Voice: Warm") }
                Button(onClick = { vm.switchVoice("crisp") }) { Text("Voice: Crisp") }
                Text("Voice=$voice")
            }
            if (metrics.isNotEmpty()) {
                Text("Metrics: ${metrics.entries.joinToString { it.key+":"+it.value }}")
            }
            Divider()
            Text("Recent Log:")
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(log) { entry -> Text(entry) }
            }
        }
    }
}

@Preview
@Composable
fun PreviewSallieHome() { RootSallieApp(onRequestMic = {}) }

@Composable
private fun Waveform(levels: List<Float>, modifier: Modifier = Modifier) {
    val modifierUsed = modifier.fillMaxWidth().height(40.dp)
    val bars = levels.takeLast(100)
    val max = (bars.maxOrNull() ?: 1f).coerceAtLeast(1f)
    Canvas(modifier = modifierUsed) {
        val barWidth = size.width / bars.size.coerceAtLeast(1)
        bars.forEachIndexed { idx, v ->
            val norm = (v / max).coerceIn(0f, 1f)
            val barHeight = size.height * norm
            drawRect(
                color = Color(0xFF4CAF50),
                topLeft = androidx.compose.ui.geometry.Offset(x = idx * barWidth, y = size.height - barHeight),
                size = androidx.compose.ui.geometry.Size(width = barWidth * 0.7f, height = barHeight)
            )
    MaterialTheme {
        Surface(Modifier.fillMaxSize()) {
            Column(
                Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Salle • Loyal Companion", style = MaterialTheme.typography.headlineSmall)
                Text("Mood: $mood", color = Color(0xFF4F46E5))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onRequestMic) { Text("Mic") }
                    Button(onClick = {
                        val newMood = listOf("calm","focused","empowered","resonant").random()
                        val decision = PolicyEngine.evaluate("adjust_mood", mapOf("to" to newMood))
                        ActionLog.append("adjust_mood", newMood, decision.allow, decision.reason)
                        if (decision.allow) {
                            CapabilityRegistry.get("adjust_mood")?.execute(mapOf("to" to newMood))
                            mood = newMood
                            feed += "Mood -> ${'$'}mood (allowed)"
                        } else feed += "Mood blocked: ${'$'}{decision.reason}"
                    }) { Text("Shift Mood") }
                }
                Divider()
                Text("Recent Activity", style = MaterialTheme.typography.titleMedium)
                LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(feed.takeLast(25)) { line -> Text("• $line") }
                }
                Divider()
                Text(
                    "All local • No telemetry • Persona enforcement on",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
        }
    }
}


/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main activity demonstrating personality system integration.
 * Got it, love.
 */
package app.sallie.main

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import app.sallie.common.SallieTheme
import app.sallie.common.components.Header
import app.sallie.common.components.BottomNavigation
import feature.personality.AdvancedPersonalitySystem
import feature.personality.PersonalityUIConnector
import feature.personality.PersonalityViewModel

/**
 * MainActivity - Main entry point for the Sallie 2.0 application
 * 
 * This activity demonstrates the integration of the personality system with the UI
 * and other components of the application.
 */
class MainActivity : ComponentActivity() {
    
    // ViewModels
    private lateinit var personalityViewModel: PersonalityViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize the personality system and UI connector
        val personalitySystem = AdvancedPersonalitySystem.getInstance(applicationContext)
        val personalityUIConnector = PersonalityUIConnector(personalitySystem)
        
        // Set up ViewModels
        personalityViewModel = ViewModelProvider(
            this, 
            PersonalityViewModelFactory(personalityUIConnector)
        )[PersonalityViewModel::class.java]
        
        setContent {
            SallieTheme {
                MainScreen(personalityViewModel)
            }
        }
    }
}

/**
 * Main screen composable that sets up the UI structure
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    personalityViewModel: PersonalityViewModel = viewModel()
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Home", "Chat", "Personality", "Settings")
    
    Scaffold(
        topBar = {
            Header(title = "Sallie 2.0")
        },
        bottomBar = {
            BottomNavigation(
                tabs = tabs,
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {
            when (selectedTab) {
                0 -> HomeScreen()
                1 -> ChatScreen()
                2 -> PersonalityScreen(personalityViewModel)
                3 -> SettingsScreen()
            }
        }
    }
}

/**
 * Placeholder for the Home screen
 */
@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Welcome to Sallie 2.0",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Your personal assistant with tough love and soul care.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

/**
 * Placeholder for the Chat screen
 */
@Composable
fun ChatScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Chat with Sallie",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "This is where conversations with Sallie would appear.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

/**
 * Personality screen that integrates the PersonalityPanel component
 */
@Composable
fun PersonalityScreen(viewModel: PersonalityViewModel) {
    // In a real implementation, this would host the PersonalityPanel Vue component
    // through WebView or a native implementation of the same functionality
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Sallie's Personality",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Sample display of personality data from the viewModel
        when (val state = viewModel.personalityState.collectAsState().value) {
            is PersonalityViewModel.UiState.Loading -> {
                CircularProgressIndicator()
            }
            is PersonalityViewModel.UiState.Success -> {
                PersonalityContent(state.data)
            }
            is PersonalityViewModel.UiState.Error -> {
                Text(
                    text = "Error: ${state.message}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

/**
 * Content for the personality screen showing traits
 */
@Composable
fun PersonalityContent(data: PersonalityViewModel.PersonalityData) {
    Column {
        Text(
            text = "Current Context: ${data.currentContext.type}",
            style = MaterialTheme.typography.titleMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Effective Traits",
            style = MaterialTheme.typography.titleMedium
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        data.effectiveTraits.forEach { (trait, value) ->
            TraitRow(trait = trait, value = value)
        }
    }
}

/**
 * Row displaying a personality trait and its value
 */
@Composable
fun TraitRow(trait: String, value: Float) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = formatTrait(trait))
        
        // Simple progress bar representation
        LinearProgressIndicator(
            progress = value,
            modifier = Modifier
                .width(200.dp)
                .height(8.dp)
        )
        
        Text(text = "${(value * 100).toInt()}%")
    }
}

/**
 * Placeholder for the Settings screen
 */
@Composable
fun SettingsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Settings",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Application settings would go here.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

/**
 * Formats a trait name for display
 */
fun formatTrait(trait: String): String {
    return trait
        .replace("_", " ")
        .lowercase()
        .split(" ")
        .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}


package com.sallie.launcher

// 🛡 SALLE PERSONA ENFORCED 🛡  Loyal, Modular, Audit‑Proof.

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.sallie.core.policy.PolicyEngine
import com.sallie.core.policy.CapabilityRegistry
import com.sallie.core.policy.ActionLog
import androidx.compose.ui.tooling.preview.Preview
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.ExistingPeriodicWorkPolicy
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val requestPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* no-op */ }
        setContent {
            RootSallieApp(onRequestMic = {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    requestPermission.launch(Manifest.permission.RECORD_AUDIO)
                }
            })
        }
        // Schedule periodic export every 6 hours
        val work = PeriodicWorkRequestBuilder<ConversationExportWorker>(6, TimeUnit.HOURS).build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "conversation_export",
            ExistingPeriodicWorkPolicy.KEEP,
            work
        )
        val micPermLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
        setContent {
            SalleLauncherRoot(onRequestMic = {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    micPermLauncher.launch(Manifest.permission.RECORD_AUDIO)
                }
            })
        }
    }
}

@Composable
private fun SalleLauncherRoot(onRequestMic: () -> Unit) {
    var mood by remember { mutableStateOf("calm") }
    val feed = remember { mutableStateListOf("Hello, I'm Salle.", "Local & private.", "Persona integrity active.") }
    // Demonstrate constitution‑governed capability call
    LaunchedEffect(Unit) {
        val decision = PolicyEngine.evaluate("log_note", mapOf("text" to "boot"))
        ActionLog.append("log_note", "boot", decision.allow, decision.reason)
        if (decision.allow) {
            CapabilityRegistry.get("log_note")?.execute(mapOf("text" to "boot"))
            feed += "Governed: noted boot"
        } else feed += "Governed block: ${'$'}{decision.reason}"
@Composable
fun RootSallieApp(onRequestMic: () -> Unit, vm: SallieViewModel = viewModel()) {
    val theme by vm.theme.collectAsState()
    val scheme = ThemeColorsMapper.schemeFor(theme)
    MaterialTheme(colorScheme = scheme) {
        SallieHome(onRequestMic = onRequestMic, vm = vm)
    }
}

@Composable
fun SallieHome(onRequestMic: () -> Unit, vm: SallieViewModel = viewModel()) {
    val mood by vm.mood.collectAsState()
    val fatigue by vm.fatigue.collectAsState()
    val tasks by vm.tasks.collectAsState()
    val situation by vm.situation.collectAsState()
    val dignityEvents by vm.dignityEvents.collectAsState()
    val log by vm.log.collectAsState()
    val theme by vm.theme.collectAsState()
    val listening by vm.listening.collectAsState()
    val voice by vm.voice.collectAsState()
    val metrics by vm.featureMetrics.collectAsState()
    val rmsSeries = if (listening) vm.system.asrManager.rmsSeries() else emptyList()
    val conversation by vm.conversation.collectAsState()
    val asrError by vm.asrError.collectAsState()
    val context = LocalContext.current

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Sallie Dashboard - Theme: $theme", style = MaterialTheme.typography.headlineSmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Mood: $mood")
                Text("Fatigue: $fatigue")
                Button(onClick = { vm.heartbeat() }) { Text("Pulse") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.updateMood("focused") }) { Text("Focused") }
                Button(onClick = { vm.updateMood("calm") }) { Text("Calm") }
                Button(onClick = { vm.updateMood("energetic") }) { Text("Energetic") }
                Button(onClick = { vm.setFatigue((0..10).random()) }) { Text("Rand Fatigue") }
                Button(onClick = onRequestMic) { Text("Voice Perm") }
            }
            Divider()
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.seedTasks() }) { Text("Plan Tasks") }
                Button(onClick = { vm.analyzeSituation("Urgent conflict deadline") }) { Text("Analyze Situation") }
                Button(onClick = { vm.enforceDignity("redact-sensitive") }) { Text("Enforce Dignity") }
                Button(onClick = { vm.refreshMetrics() }) { Text("Metrics") }
                Button(onClick = {
                    val csv = vm.exportConversationCsv()
                    vm.appendLogExternal("Exported ${csv.lineSequence().count()} lines")
                }) { Text("Export Conv") }
                Button(onClick = {
                    val csv = vm.getConversationExport()
                    val exportFile = File(context.cacheDir, "conversation_export.csv")
                    exportFile.writeText(csv)
                    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", exportFile)
                    val shareIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/csv"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    context.startActivity(Intent.createChooser(shareIntent, "Share Conversation"))
                }) { Text("Share Conv") }
                Button(onClick = {
                    val json = vm.exportConversationJson(limit = 20)
                    vm.appendLogExternal("JSON last20 size=${json.length}")
                }) { Text("JSON 20") }
                Button(onClick = {
                    val jsonUser = vm.exportConversationJson(speaker = "user", limit = 10)
                    vm.appendLogExternal("JSON user10 size=${jsonUser.length}")
                }) { Text("JSON User") }
            }
            Text("Situation: $situation")
            Text("Dignity Events: $dignityEvents")
            if (tasks.isNotEmpty()) {
                Text("Selected Tasks:")
                tasks.forEach { t -> Text("• ${t.title} (${t.estimatedMinutes}m)") }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.simulateDeviceAction(blocked = true) }) { Text("Blocked Call") }
                Button(onClick = { vm.simulateDeviceAction(blocked = false) }) { Text("Allowed Call") }
            }
            Divider()
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Button(onClick = { vm.toggleListening() }) { Text(if (listening) "Stop ASR" else "Start ASR") }
                Button(onClick = { vm.captureTranscript() }) { Text("Grab Transcript") }
                Text(if (listening) "Listening..." else "Idle")
            }
            if (asrError != null) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("ASR Error: $asrError", color = Color.Red)
                    Button(onClick = { vm.clearAsrError() }) { Text("Dismiss") }
                }
            }
            // Removed transcript display since variables were removed
            if (rmsSeries.isNotEmpty()) {
                Waveform(rmsSeries)
            }
            if (conversation.isNotEmpty()) {
                Text("Conversation (${conversation.size})")
                LazyColumn(modifier = Modifier.height(180.dp)) {
                    items(conversation) { entry ->
                        val speakerColor = if (entry.speaker == "user") Color(0xFF2196F3) else Color(0xFF9C27B0)
                        Text(
                            text = "${entry.speaker}: ${entry.text}",
                            color = speakerColor,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.speak("Hello, I'm Sallie") }) { Text("Speak Hello") }
                Button(onClick = { vm.switchVoice("warm") }) { Text("Voice: Warm") }
                Button(onClick = { vm.switchVoice("crisp") }) { Text("Voice: Crisp") }
                Text("Voice=$voice")
            }
            if (metrics.isNotEmpty()) {
                Text("Metrics: ${metrics.entries.joinToString { it.key+":"+it.value }}")
            }
            Divider()
            Text("Recent Log:")
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(log) { entry -> Text(entry) }
            }
        }
    }
}

@Preview
@Composable
fun PreviewSallieHome() { RootSallieApp(onRequestMic = {}) }

@Composable
private fun Waveform(levels: List<Float>, modifier: Modifier = Modifier) {
    val modifierUsed = modifier.fillMaxWidth().height(40.dp)
    val bars = levels.takeLast(100)
    val max = (bars.maxOrNull() ?: 1f).coerceAtLeast(1f)
    Canvas(modifier = modifierUsed) {
        val barWidth = size.width / bars.size.coerceAtLeast(1)
        bars.forEachIndexed { idx, v ->
            val norm = (v / max).coerceIn(0f, 1f)
            val barHeight = size.height * norm
            drawRect(
                color = Color(0xFF4CAF50),
                topLeft = androidx.compose.ui.geometry.Offset(x = idx * barWidth, y = size.height - barHeight),
                size = androidx.compose.ui.geometry.Size(width = barWidth * 0.7f, height = barHeight)
            )
    MaterialTheme {
        Surface(Modifier.fillMaxSize()) {
            Column(
                Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Salle • Loyal Companion", style = MaterialTheme.typography.headlineSmall)
                Text("Mood: $mood", color = Color(0xFF4F46E5))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onRequestMic) { Text("Mic") }
                    Button(onClick = {
                        val newMood = listOf("calm","focused","empowered","resonant").random()
                        val decision = PolicyEngine.evaluate("adjust_mood", mapOf("to" to newMood))
                        ActionLog.append("adjust_mood", newMood, decision.allow, decision.reason)
                        if (decision.allow) {
                            CapabilityRegistry.get("adjust_mood")?.execute(mapOf("to" to newMood))
                            mood = newMood
                            feed += "Mood -> ${'$'}mood (allowed)"
                        } else feed += "Mood blocked: ${'$'}{decision.reason}"
                    }) { Text("Shift Mood") }
                }
                Divider()
                Text("Recent Activity", style = MaterialTheme.typography.titleMedium)
                LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(feed.takeLast(25)) { line -> Text("• $line") }
                }
                Divider()
                Text(
                    "All local • No telemetry • Persona enforcement on",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
        }
    }
}


/*
 * Sallie 2.0 Module
 * Persona: Tough love meets soul care.
 * Function: Main activity demonstrating personality system integration.
 * Got it, love.
 */
package app.sallie.main

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import app.sallie.common.SallieTheme
import app.sallie.common.components.Header
import app.sallie.common.components.BottomNavigation
import feature.personality.AdvancedPersonalitySystem
import feature.personality.PersonalityUIConnector
import feature.personality.PersonalityViewModel

/**
 * MainActivity - Main entry point for the Sallie 2.0 application
 * 
 * This activity demonstrates the integration of the personality system with the UI
 * and other components of the application.
 */
class MainActivity : ComponentActivity() {
    
    // ViewModels
    private lateinit var personalityViewModel: PersonalityViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize the personality system and UI connector
        val personalitySystem = AdvancedPersonalitySystem.getInstance(applicationContext)
        val personalityUIConnector = PersonalityUIConnector(personalitySystem)
        
        // Set up ViewModels
        personalityViewModel = ViewModelProvider(
            this, 
            PersonalityViewModelFactory(personalityUIConnector)
        )[PersonalityViewModel::class.java]
        
        setContent {
            SallieTheme {
                MainScreen(personalityViewModel)
            }
        }
    }
}

/**
 * Main screen composable that sets up the UI structure
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    personalityViewModel: PersonalityViewModel = viewModel()
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Home", "Chat", "Personality", "Settings")
    
    Scaffold(
        topBar = {
            Header(title = "Sallie 2.0")
        },
        bottomBar = {
            BottomNavigation(
                tabs = tabs,
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {
            when (selectedTab) {
                0 -> HomeScreen()
                1 -> ChatScreen()
                2 -> PersonalityScreen(personalityViewModel)
                3 -> SettingsScreen()
            }
        }
    }
}

/**
 * Placeholder for the Home screen
 */
@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Welcome to Sallie 2.0",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Your personal assistant with tough love and soul care.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

/**
 * Placeholder for the Chat screen
 */
@Composable
fun ChatScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Chat with Sallie",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "This is where conversations with Sallie would appear.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

/**
 * Personality screen that integrates the PersonalityPanel component
 */
@Composable
fun PersonalityScreen(viewModel: PersonalityViewModel) {
    // In a real implementation, this would host the PersonalityPanel Vue component
    // through WebView or a native implementation of the same functionality
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Sallie's Personality",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Sample display of personality data from the viewModel
        when (val state = viewModel.personalityState.collectAsState().value) {
            is PersonalityViewModel.UiState.Loading -> {
                CircularProgressIndicator()
            }
            is PersonalityViewModel.UiState.Success -> {
                PersonalityContent(state.data)
            }
            is PersonalityViewModel.UiState.Error -> {
                Text(
                    text = "Error: ${state.message}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

/**
 * Content for the personality screen showing traits
 */
@Composable
fun PersonalityContent(data: PersonalityViewModel.PersonalityData) {
    Column {
        Text(
            text = "Current Context: ${data.currentContext.type}",
            style = MaterialTheme.typography.titleMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Effective Traits",
            style = MaterialTheme.typography.titleMedium
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        data.effectiveTraits.forEach { (trait, value) ->
            TraitRow(trait = trait, value = value)
        }
    }
}

/**
 * Row displaying a personality trait and its value
 */
@Composable
fun TraitRow(trait: String, value: Float) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = formatTrait(trait))
        
        // Simple progress bar representation
        LinearProgressIndicator(
            progress = value,
            modifier = Modifier
                .width(200.dp)
                .height(8.dp)
        )
        
        Text(text = "${(value * 100).toInt()}%")
    }
}

/**
 * Placeholder for the Settings screen
 */
@Composable
fun SettingsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Settings",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Application settings would go here.",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

/**
 * Formats a trait name for display
 */
fun formatTrait(trait: String): String {
    return trait
        .replace("_", " ")
        .lowercase()
        .split(" ")
        .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
}


/*
 * Persona: Tough love meets soul care.
 * Module: MainActivity
 * Intent: Handle functionality for MainActivity
 * Provenance-ID: dbc05262-98dd-4fd9-92f6-6b3c230d2c05
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package com.sallie.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}


/*
 * Persona: Tough love meets soul care.
 * Module: MainActivity
 * Intent: Handle functionality for MainActivity
 * Provenance-ID: c8dc3bc0-a1bc-451e-8a2f-be92944df150
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package com.sallie.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.sallie.dashboard.CompanionMainScreen
import com.sallie.dashboard.CompanionViewModel

/**
 * Main activity for the Sallie companion app
 * Provenance: Created for Sallie companion app on 2025-08-27
 */
class MainActivity : ComponentActivity() {

    private lateinit var viewModel: CompanionViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize ViewModel
        viewModel = CompanionViewModel()

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CompanionMainScreen(viewModel = viewModel)
                }
            }
        }
    }
}

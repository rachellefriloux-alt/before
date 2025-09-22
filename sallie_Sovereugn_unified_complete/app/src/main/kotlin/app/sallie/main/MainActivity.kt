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

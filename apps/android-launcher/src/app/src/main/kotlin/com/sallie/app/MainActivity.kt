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

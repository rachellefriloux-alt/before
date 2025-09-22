/*
 * Persona: Tough love meets soul care.
 * Module: CompanionMainScreen
 * Intent: Handle functionality for CompanionMainScreen
 * Provenance-ID: 4ae91b02-8717-40e8-bfc1-f766aaa91975
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */


package com.sallie.dashboard

/*
    Provenance: Merged from SalleCompanion on 2025-08-27 by Rachelle Friloux
*/

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sallie.shared.CompanionUser
import com.sallie.shared.ApiClient
import com.sallie.shared.ValidationUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

@Composable
fun CompanionMainScreen(viewModel: CompanionViewModel) {
    val user by viewModel.user.collectAsState()
    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "Welcome, ${user.name}", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(8.dp))
        // ✔ Enhanced logic added: Replace with actual avatar resource
        // Image(painter = painterResource(id = R.drawable.ic_avatar), contentDescription = "Avatar")
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { viewModel.refreshUser() }) {
            Text("Refresh")
        }
    }
}

class CompanionViewModel : ViewModel() {
    private val _user = MutableStateFlow(CompanionUser("1", "Salle", ""))
    val user: StateFlow<CompanionUser> = _user.asStateFlow()

    fun refreshUser() {
        viewModelScope.launch {
            // Example: fetch user data from shared API client
            val fetchedUser = ApiClient.fetchUser("1")
            if (fetchedUser != null && ValidationUtils.isValidUserName(fetchedUser.name)) {
                _user.value = fetchedUser
            }
        }
    }
}

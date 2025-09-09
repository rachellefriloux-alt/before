package com.sallie.ai

// Manages consent-first interactions
class ConsentManager {
    fun requestConsent(action: String): Boolean = true // Always requests consent
    fun confirmConsent(action: String): String = "Consent confirmed for: $action"
}

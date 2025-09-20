package com.sallie.core.values

import com.sallie.expert.ExpertDomain

/**
 * Extension functions for ValuesSystem to support 
 * financial and entrepreneurship value alignment checks
 */

/**
 * Checks if financial content aligns with Sallie's values
 */
fun ValuesSystem.isAlignedWithFinancialValues(content: String): Boolean {
    // Check for potential conflicts with core values
    val contentLower = content.lowercase()
    
    // Check for predatory financial advice
    if (contentLower.contains("predatory") || 
        contentLower.contains("exploit") || 
        contentLower.contains("scam") ||
        contentLower.contains("manipulate market")) {
        return false
    }
    
    // Check for questionable investment schemes
    if ((contentLower.contains("guaranteed") || contentLower.contains("promise")) && 
        (contentLower.contains("return") || contentLower.contains("profit"))) {
        return false
    }
    
    // Check for illegal financial advice
    if (contentLower.contains("evade taxes") || 
        contentLower.contains("money laundering") || 
        contentLower.contains("hide assets")) {
        return false
    }
    
    return true
}

/**
 * Checks if business content aligns with Sallie's values
 */
fun ValuesSystem.isAlignedWithBusinessValues(content: String): Boolean {
    // Check for potential conflicts with core values
    val contentLower = content.lowercase()
    
    // Check for unethical business practices
    if (contentLower.contains("deceive customers") || 
        contentLower.contains("mislead investors") || 
        contentLower.contains("exploit workers") ||
        contentLower.contains("evade regulations")) {
        return false
    }
    
    // Check for harmful business models
    if (contentLower.contains("pyramid scheme") || 
        contentLower.contains("ponzi") || 
        contentLower.contains("multi-level marketing scam")) {
        return false
    }
    
    // Check for illegal business advice
    if (contentLower.contains("bribe") || 
        contentLower.contains("monopoly tactics") || 
        contentLower.contains("price fixing")) {
        return false
    }
    
    return true
}

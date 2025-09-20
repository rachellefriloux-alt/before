/*
 * Persona: Tough love meets soul care.
 * Module: firebaseConfigManager
 * Intent: Handle functionality for firebaseConfigManager
 * Provenance-ID: 66edf25b-67a5-4f01-8a53-1ee20521ecc0
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module
 * Firebase Configuration Manager
 * Handles Firebase app initialization and flavor switching
 */

import { initializeApp } from 'firebase/app';
import firebaseConfig from '../config/firebase-config.local.json';

let currentFirebaseApp = null;
let currentFlavor = 'local';

export function getCurrentFlavor() {
    return currentFlavor;
}

export function switchFlavor(newFlavor) {
    try {
        currentFlavor = newFlavor;

        // Reinitialize Firebase with new configuration
        if (currentFirebaseApp) {
            // In a real app, you might want to delete the old app
            // currentFirebaseApp.delete();
        }

        // For now, we'll just update the flavor
        // In a production app, you might load different config files
        console.log(`Switched to flavor: ${newFlavor}`);

        return true;
    } catch (error) {
        console.error('Failed to switch flavor:', error);
        return false;
    }
}

export function getFirebaseApp() {
    if (!currentFirebaseApp) {
        try {
            currentFirebaseApp = initializeApp(firebaseConfig);
            console.log('Firebase app initialized');
        } catch (error) {
            console.error('Failed to initialize Firebase app:', error);
            throw error;
        }
    }
    return currentFirebaseApp;
}

// Initialize on module load
getFirebaseApp();

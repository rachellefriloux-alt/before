/*
 * Persona: Tough love meets soul care.
 * Module: MainActivity
 * Intent: Handle functionality for MainActivity
 * Provenance-ID: dbc05262-98dd-4fd9-92f6-6b3c230d2c05
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

package com.sallie.launcher.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}

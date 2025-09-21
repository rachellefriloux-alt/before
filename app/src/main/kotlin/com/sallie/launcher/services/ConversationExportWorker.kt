package com.sallie.launcher

// Placeholder removed legacy worker implementation. Original implementation relied on
// WorkManager which we've chosen to exclude to keep the dependency surface minimal.
// If background export is reintroduced, add `implementation("androidx.work:work-runtime-ktx:<version>")`
// to `app/build.gradle.kts` and restore a Worker subclass here.

// (Intentionally left without references so it doesn't compile against missing WorkManager.)

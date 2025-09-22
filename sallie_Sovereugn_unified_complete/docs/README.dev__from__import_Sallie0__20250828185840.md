---
provenance:
  repo: Sallie
  path: /docs
  scope: canonical
---
Developer setup notes

Add local credential files to run Firebase and signed builds. Do NOT commit these to git.

Required local files (place in project root or `app/` as noted):

- `app/google-services.json`  (Android Firebase config file) — used by the Android client.
- `serviceAccountKey.json` (Google service account JSON) — used by server/admin SDKs. Place outside `app/` and set `GOOGLE_APPLICATION_CREDENTIALS` or load directly in code.
- `keystore.jks` and `keystore.properties` — if you perform signed/release builds.
- `.env` — optional environment variables for local dev.

Example `keystore.properties` (keep this file out of version control):

```
storeFile=/path/to/keystore.jks
storePassword=your_store_password
keyAlias=your_key_alias
keyPassword=your_key_password
```

Service account usage (Node admin example):

```js
const admin = require('firebase-admin');
const serviceAccount = require('/path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

Security: keep credentials off repo. If you need help adding CI secrets or a secure local template, I can add a sample `serviceAccount.example.json` (values redacted) and instructions.

Firebase Gradle plugin / Android Studio
-------------------------------------

If you want the Android Gradle plugin to process `google-services.json` automatically, add the Google Services plugin in your Gradle setup (Kotlin DSL examples):

Top-level (`build.gradle.kts`) add the plugin classpath inside the `dependencies` block of `buildscript` (if using the legacy buildscript block) or add the plugin via the plugins DSL in newer setups. Example using the classpath approach:

```kotlin
buildscript {
  repositories { google(); mavenCentral() }
  dependencies {
    classpath("com.google.gms:google-services:4.4.0") // use latest compatible version
  }
}
```

And in `app/build.gradle.kts` apply the plugin at the bottom of the file:

```kotlin
plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  // ...existing plugins
}

// ...existing android {...} and dependencies {...}

apply(plugin = "com.google.gms.google-services")
```

Note: Many projects use the plugins DSL for the top-level build; follow your Gradle setup and Android Studio suggestions when prompted.

CI / GitHub Actions snippet
---------------------------

Store the service account JSON in the CI secrets store (example: `FIREBASE_SERVICE_ACCOUNT`) and restore it during the job. Minimal example:

```yaml
name: Android CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Restore service account
        env:
          SVC: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        run: |
          echo "$SVC" > ${GITHUB_WORKSPACE}/serviceAccountKey.json
          echo "google.services.json restored"
          # export GOOGLE_APPLICATION_CREDENTIALS if your job uses admin SDK
          export GOOGLE_APPLICATION_CREDENTIALS=${GITHUB_WORKSPACE}/serviceAccountKey.json
      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Gradle build
        run: ./gradlew assembleDebug --no-daemon
```

Cleanup: remove the file after the job completes if you want an extra safety step.

CI workflow included

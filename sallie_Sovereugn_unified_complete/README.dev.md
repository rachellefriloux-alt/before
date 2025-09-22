# README.dev.md
Migrated from sallie_1.00/README.dev.md


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
--------------------

This repo includes a GitHub Actions workflow at `.github/workflows/android-ci.yml` that builds the app on push/PR to `main`.
If you want the workflow to run Firebase Admin SDK actions, add the service account JSON to repo secrets as `FIREBASE_SERVICE_ACCOUNT` (value = full JSON). The workflow writes it to `serviceAccountKey.json` during the job and removes it after.


Firebase Gradle plugin (optional)

If you want automatic initialization via the Google Services Gradle plugin, add the plugin classpath to the top-level `build.gradle.kts` and apply it in `app/build.gradle.kts`:

Top-level (plugins/classpath) example (KTS):

```kotlin
// build.gradle.kts (top-level)
dependencies {
  // ...existing classpath entries
  classpath("com.google.gms:google-services:4.4.0")
}
```

Apply in `app/build.gradle.kts`:

```kotlin
plugins {
  id("com.google.gms.google-services")
}
```

CI / service account notes

- Store the contents of your `serviceAccountKey.json` as a secure secret in CI (GitHub Actions secrets, GitLab CI variables, etc.).
- During CI builds or server runs, set `GOOGLE_APPLICATION_CREDENTIALS` to point at a temporary file containing the service account JSON (write the secret into that file at runtime).

Example GitHub Actions snippet (writes secret to file):

```yaml
- name: Write service account
  run: echo "$SERVICE_ACCOUNT_JSON" > /tmp/serviceAccountKey.json
  env:
    SERVICE_ACCOUNT_JSON: ${{ secrets.SERVICE_ACCOUNT_JSON }}
- name: Run server tests
  run: GOOGLE_APPLICATION_CREDENTIALS=/tmp/serviceAccountKey.json npm test
```



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
--------------------

This repo includes a GitHub Actions workflow at `.github/workflows/android-ci.yml` that builds the app on push/PR to `main`.
If you want the workflow to run Firebase Admin SDK actions, add the service account JSON to repo secrets as `FIREBASE_SERVICE_ACCOUNT` (value = full JSON). The workflow writes it to `serviceAccountKey.json` during the job and removes it after.


Firebase Gradle plugin (optional)

If you want automatic initialization via the Google Services Gradle plugin, add the plugin classpath to the top-level `build.gradle.kts` and apply it in `app/build.gradle.kts`:

Top-level (plugins/classpath) example (KTS):

```kotlin
// build.gradle.kts (top-level)
dependencies {
  // ...existing classpath entries
  classpath("com.google.gms:google-services:4.4.0")
}
```

Apply in `app/build.gradle.kts`:

```kotlin
plugins {
  id("com.google.gms.google-services")
}
```

CI / service account notes

- Store the contents of your `serviceAccountKey.json` as a secure secret in CI (GitHub Actions secrets, GitLab CI variables, etc.).
- During CI builds or server runs, set `GOOGLE_APPLICATION_CREDENTIALS` to point at a temporary file containing the service account JSON (write the secret into that file at runtime).

Example GitHub Actions snippet (writes secret to file):

```yaml
- name: Write service account
  run: echo "$SERVICE_ACCOUNT_JSON" > /tmp/serviceAccountKey.json
  env:
    SERVICE_ACCOUNT_JSON: ${{ secrets.SERVICE_ACCOUNT_JSON }}
- name: Run server tests
  run: GOOGLE_APPLICATION_CREDENTIALS=/tmp/serviceAccountKey.json npm test
```



# README.dev.md
Migrated from sallie_1.00/README.dev.md


/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\docs\README.dev.md) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\docs\README.dev.md) */
/* --- dest (C:\Users\chell\Desktop\newsal\docs\README.dev.md) --- */
<!-- Merged master for logical file: docs\README.dev
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\docs\README.dev.md (hash:2F98189EC2EE363E157BFC9F05C2118FA6420D6FD278230AB4D90B51999E17B4)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\docs\README.dev.md (hash:AAFD0374E30BD4FA476F5975D69E104C192659FC7BE20F8D5A5F1C247959C368)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\docs\README.dev.md | ext: .md | sha: 2F98189EC2EE363E157BFC9F05C2118FA6420D6FD278230AB4D90B51999E17B4 ---- -->
[BINARY FILE - original copied to merged_sources: docs\README.dev.md]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\docs\README.dev.md | ext: .md | sha: AAFD0374E30BD4FA476F5975D69E104C192659FC7BE20F8D5A5F1C247959C368 ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\docs\README.dev.md --- */
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
Service account usage (Node admin example):
```js
const admin = require('firebase-admin');
const serviceAccount = require('/path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
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
And in `app/build.gradle.kts` apply the plugin at the bottom of the file:
plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  // ...existing plugins
// ...existing android {...} and dependencies {...}
apply(plugin = "com.google.gms.google-services")
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
Cleanup: remove the file after the job completes if you want an extra safety step.
CI workflow included

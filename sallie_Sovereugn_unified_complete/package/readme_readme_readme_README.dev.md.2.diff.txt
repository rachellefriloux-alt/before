BASE: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\docs\README.dev.md
OTHER: C:\Users\chell\Documents\Sallie_Sovereign\_staging\incoming\README.dev.md
---- DIFF ----
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


---
provenance:
  repo: Sallie
  path: /docs
  scope: canonical
---

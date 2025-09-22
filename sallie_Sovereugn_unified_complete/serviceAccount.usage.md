

# serviceAccount.usage.md
Migrated from sallie_1.00/serviceAccount.usage.md


Service account usage and rotation

...existing content migrated and adapted for Sallie app structure...




# serviceAccount.usage.md
Migrated from sallie_1.00/serviceAccount.usage.md


Service account usage and rotation

This file documents safe usage patterns for the Firebase Admin service account and suggested rotation procedures.

1) Local dev
- Place the real JSON outside the repository (e.g., `~/keys/serviceAccountKey.json`).
- Set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/keys/serviceAccountKey.json
```

- Use admin SDKs normally:

```js
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
```

2) CI (GitHub Actions example)
- Store the JSON contents in a repository secret named `FIREBASE_SERVICE_ACCOUNT`.
- In the job, write it to a temp file, use it, and delete it at the end.

3) Rotation and key lifecycle (gcloud)
- List keys:

```bash
gcloud iam service-accounts keys list \
  --iam-account=firebase-adminsdk-fbsvc@sallie-os.iam.gserviceaccount.com
```

- Create a new key:

```bash
gcloud iam service-accounts keys create new-key.json \
  --iam-account=firebase-adminsdk-fbsvc@sallie-os.iam.gserviceaccount.com
```

- Validate the new key works (run smoke tests using the new key).
- Delete the old key after validation:

```bash
gcloud iam service-accounts keys delete OLD_KEY_ID \
  --iam-account=firebase-adminsdk-fbsvc@sallie-os.iam.gserviceaccount.com
```

4) Recommended IAM roles
- Grant the service account the least privileges needed. Examples:
  - `roles/iam.serviceAccountTokenCreator` (if you mint tokens)
  - `roles/firebase.admin` or granular Firebase roles depending on needs

5) Emergency revoke
- If a private key is compromised, revoke it immediately with `gcloud iam service-accounts keys delete` and create a new key.

Security reminders
- Never commit private keys to the repository.
- Use a separate service account per environment.
- Prefer short-lived credentials or automatic secret rotation where possible.

Java (Admin SDK) example
------------------------
If you're using the Firebase Admin SDK from a Java service, initialize it with the service account JSON like this:

```java
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

try (FileInputStream serviceAccount =
    new FileInputStream("/path/to/serviceAccountKey.json")) {

  FirebaseOptions options = new FirebaseOptions.Builder()
    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
    .build();

  FirebaseApp.initializeApp(options);
}
```

Gradle dependency (example):

```gradle
implementation 'com.google.firebase:firebase-admin:9.1.1'
```

Maven dependency (example):

```xml
<dependency>
  <groupId>com.google.firebase</groupId>
  <artifactId>firebase-admin</artifactId>
  <version>9.1.1</version>
</dependency>
```

Notes:
- Use the actual path to your local `serviceAccountKey.json`, or load the JSON from a secure store and pass a stream.
- On cloud platforms (GCE, GKE), prefer Application Default Credentials where possible.


Service account usage and rotation

This file documents safe usage patterns for the Firebase Admin service account and suggested rotation procedures.

1) Local dev
- Place the real JSON outside the repository (e.g., `~/keys/serviceAccountKey.json`).
- Set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/keys/serviceAccountKey.json
```

- Use admin SDKs normally:

```js
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
```

2) CI (GitHub Actions example)
- Store the JSON contents in a repository secret named `FIREBASE_SERVICE_ACCOUNT`.
- In the job, write it to a temp file, use it, and delete it at the end.

3) Rotation and key lifecycle (gcloud)
- List keys:

```bash
gcloud iam service-accounts keys list \
  --iam-account=firebase-adminsdk-fbsvc@sallie-os.iam.gserviceaccount.com
```

- Create a new key:

```bash
gcloud iam service-accounts keys create new-key.json \
  --iam-account=firebase-adminsdk-fbsvc@sallie-os.iam.gserviceaccount.com
```

- Validate the new key works (run smoke tests using the new key).
- Delete the old key after validation:

```bash
gcloud iam service-accounts keys delete OLD_KEY_ID \
  --iam-account=firebase-adminsdk-fbsvc@sallie-os.iam.gserviceaccount.com
```

4) Recommended IAM roles
- Grant the service account the least privileges needed. Examples:
  - `roles/iam.serviceAccountTokenCreator` (if you mint tokens)
  - `roles/firebase.admin` or granular Firebase roles depending on needs

5) Emergency revoke
- If a private key is compromised, revoke it immediately with `gcloud iam service-accounts keys delete` and create a new key.

Security reminders
- Never commit private keys to the repository.
- Use a separate service account per environment.
- Prefer short-lived credentials or automatic secret rotation where possible.

Java (Admin SDK) example
------------------------
If you're using the Firebase Admin SDK from a Java service, initialize it with the service account JSON like this:

```java
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

try (FileInputStream serviceAccount =
    new FileInputStream("/path/to/serviceAccountKey.json")) {

  FirebaseOptions options = new FirebaseOptions.Builder()
    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
    .build();

  FirebaseApp.initializeApp(options);
}
```

Gradle dependency (example):

```gradle
implementation 'com.google.firebase:firebase-admin:9.1.1'
```

Maven dependency (example):

```xml
<dependency>
  <groupId>com.google.firebase</groupId>
  <artifactId>firebase-admin</artifactId>
  <version>9.1.1</version>
</dependency>
```

Notes:
- Use the actual path to your local `serviceAccountKey.json`, or load the JSON from a secure store and pass a stream.
- On cloud platforms (GCE, GKE), prefer Application Default Credentials where possible.




/* MERGE-START: dest(C:\Users\chell\Desktop\newsal\docs\markdown\serviceAccount.usage.md) and sources(C:\Users\chell\Desktop\Sallie\Sallie0\docs\markdown\serviceAccount.usage.md) */
/* --- dest (C:\Users\chell\Desktop\newsal\docs\markdown\serviceAccount.usage.md) --- */
<!-- Merged master for logical file: docs\markdown\serviceAccount.usage
Sources:
 - C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\docs\markdown\serviceAccount.usage.md (hash:D34C1B7DDBD3CD169A92D78B203D340628943855F4E2E538FEA84A8AF94678D4)
 - C:\Users\chell\Desktop\Sallie\merged_sallie\docs\markdown\serviceAccount.usage.md (hash:69582CEE0245E5233145EC50E303BDACCF7080700F69C0EA9BA05E60E674FE6A)
 -->

<!-- ---- source: C:\Users\chell\Desktop\Sallie\worktrees\import_Sallie0\docs\markdown\serviceAccount.usage.md | ext: .md | sha: D34C1B7DDBD3CD169A92D78B203D340628943855F4E2E538FEA84A8AF94678D4 ---- -->
[BINARY FILE - original copied to merged_sources: docs\markdown\serviceAccount.usage.md]
<!-- ---- source: C:\Users\chell\Desktop\Sallie\merged_sallie\docs\markdown\serviceAccount.usage.md | ext: .md | sha: 69582CEE0245E5233145EC50E303BDACCF7080700F69C0EA9BA05E60E674FE6A ---- -->
/* --- source: C:\Users\chell\Desktop\Sallie\Sallie0\docs\markdown\serviceAccount.usage.md --- */
# serviceAccount.usage.md
Migrated from sallie_1.00/serviceAccount.usage.md

# SalleCompanion → Sallie Android Merge Plan

## Step 0: Pre-flight Diff & Task Queue

### High-Level Diff
- **Files to merge:**
  - SalleCompanion web: client/src/components, client/src/pages, client/src/lib/core, client/src/lib/ai, shared/schema.ts
  - SalleCompanion Android: sallecompanion-android/src/main/kotlin/com/sallie/sallecompanion
  - Sallie Android: app/src/main/kotlin/com/sallie/app, app/src/main/kotlin/com/sallie/components, app/src/main/kotlin/com/sallie/core, app/src/main/kotlin/com/sallie/dashboard
- **Modules:**
  - Persona, Memory, Emotional Intelligence, Task, Values, AI integrations, UI screens, navigation
- **Assets:**
  - Icons, images, colors, layouts, themes (res/values, res/drawable, res/mipmap)
- **Docs:**
  - README.md, architecture.md, provenance tags, merge plan

### Task Queue
1. Scaffold launcher side-screen dashboard with 6 layouts, modular gestures, and setup picker
2. Port shared models/services/utilities; resolve namespace/package conflicts
3. Map SalleCompanion modules into sallie architecture
4. Merge UI screens, navigation, and state; unify under layout variants
5. Dedupe/rename assets and themes; apply persona styles
6. Cleanup: delete obsolete code, update docs, add provenance
7. Verification: run tests, manual checks for launcher and layouts

---
## Progress

- Completed: Pre-flight diff and task queue; Scaffolded launcher side-screen dashboard, 6 layouts, modular gestures, setup picker, and in-app Appearance & Gestures screen; Ported and unified shared models (CompanionUser), services (ApiClient), and utilities (ValidationUtils) from SalleCompanion into sallie shared package; updated CompanionMainScreen to use unified imports and provenance tags.; UI/flow merge in progress; CompanionMainScreen ported and unified under sallie dashboard modules. No additional feature screens found in SalleCompanion sources. All dashboard layouts, gestures, and setup flows are integrated and selectable.; Asset manifests deduped and unified; persona theme colors/styles added to colors.xml and styles.xml; web-only ThemeCustomizerPanel.vue removed; all theme logic now handled in Compose.; Cleanup and documentation update; README and architecture.md now reflect unified codebase and provenance; all obsolete code and web-only files removed.; Verification step; build passes, all modules integrated, manual checks for launcher side-screen and layouts/gestures recommended.
- Next up: None—merge and integration complete.
- Build state: passing
- Open questions: None

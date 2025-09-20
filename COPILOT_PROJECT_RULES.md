
# 🧭 COPILOT PROJECT RULES — Sallie

Authoritative guide for Copilot and all contributors on:

- ✅ Which files/folders are core to Sallie
- 🗑 Which files/folders are safe to ignore/remove
- 📚 Where merged documentation now lives
- 🔗 Canonical filenames for deduplicated assets

---

## 1️⃣ KEEP — Core Build, Runtime, and Dev Assets

### 📂 Source & Modules

- ai/
- app/
- components/
- core/
- feature/
- identity/
- onboarding/
- personaCore/
- responseTemplates/
- tone/
- ui/
- values/
- assets/
- config/
- src/
- test/
- tests/
- docs/

### 🛠 Build & Config

- gradle/
- build.gradle.kts
- settings.gradle.kts
- gradle.properties
- ktlint.gradle.kts
- verification.gradle.kts
- validate_capabilities.kts
- package.json
- package-lock.json
- vite.config.ts
- vite.config.js
- tsconfig*.json

### ⚙ Tooling

- .vscode/
- .idea/
- .editorconfig
- .eslintrc.json
- eslint.config.js
- .prettierrc

### 🔑 Secrets/Templates

- .env
- .env.example
- keystore.properties.template
- serviceAccount.json
- config/*

---

## 2️⃣ DROP/IGNORE — Non‑Essential or Regenerable

*(Add to `.gitignore` if not already)*

- node_modules/
- dist/
- build/
- .gradle/
- .kotlin/
- local.properties *(keep local.properties.template instead)*
- Thumbs.db
- .DS_Store
- OS/system temp files

---

## 3️⃣ DOC MERGE PLAN

### Primary Entry Point

- README.md — now includes key branding, version history, and setup

### Merged Into README or /docs/

- README_LAUNCHER_ICON.md → section: “Branding & Icons”
- COMPLETION_ANNOUNCEMENT.md + ENHANCEMENTS_COMPLETION_SUMMARY.md → section: “Milestones & Enhancements”
- INTEGRATION_ENHANCEMENT_PLAN.md → /docs/roadmap.md
- Salle_1.0_Task_List.md, Sallie_2.0_Implementation_Checklist.md, Sallie_2.0_Implementation_Plan.md → /docs/implementation.md
- serviceAccount.usage.md → /docs/configuration.md

### Standalone

- RELEASE_NOTES.md — retains per‑version changelog

---

## 4️⃣ DEDUPLICATION — “SEQUINSEAL” & Similar Files

**Process:**

1. Search repo for all variants of `sequinseal` (filename/content)
2. Keep newest, most complete file as canonical
3. Merge any unique content from others into canonical
4. Update imports/paths to reference only the canonical file
5. Delete duplicates; add pattern to `.gitignore`

**Canonical Name:**

`sequinseal.[ext]` *(replace `[ext]` with actual type, e.g., `.json`)*

---

## 5️⃣ COPILOT CONTEXT INTEGRATION

To ensure Copilot follows these rules:

1. Add this file path and `Sallie_Copilot_Instruction_Set.md` to your `.vscode/settings.json`:

    ```jsonc
    "github.copilot.chat.contextFiles": [
      "COPILOT_PROJECT_RULES.md",
      "Sallie_Copilot_Instruction_Set.md"
    ]
    ```

2. Commit both files so rules are shared across contributors
3. When adding new files, update this list if they’re canonical or ignorable

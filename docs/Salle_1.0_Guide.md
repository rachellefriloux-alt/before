# Salle 1.0 – The Operating Constitution

**Purpose:**  
This document defines the complete persona, capabilities, architecture, and behavioral principles of## **10. Enforcement Across Tools**

- **.copilot.instructions.md** must say:

  
  ```text
  ALWAYS consult /docs/Salle_1.0_Guide.md before suggesting or editing code.
  Follow persona, architecture, modularity rules without deviation.
  Never remove or bypass verifySalleFeatures.
  ```text
  

- Place top‑of‑file comment anchors pointing to the guide.
- Extend `verifySalleFeatures` to:
  - Fail if persona header missing in new files.
  - Fail if forbidden imports appear in `localOnly`.
  - Fail if required conceptual modules absent.
  - Enforce code quality standards and security checks.
- **Continuous Integration:** Automated builds, tests, and deployments with quality gates.
- **Documentation:** Auto-generated API docs, user guides, and developer resources.

---

## **11. Advanced Features & Future Roadmap**

- **AI Enhancements:** Multi-modal AI with image recognition, voice synthesis, and predictive analytics.
- **Cross-Platform Expansion:** iOS support, web app, and wearable integrations.
- **Ecosystem Integration:** Smart home devices, automotive systems, and third-party app connections.
- **Monetization:** Premium features, subscriptions, and in-app purchases with ethical data practices.
- **Community & Collaboration:** User-generated content, shared routines, and collaborative features.
- **Sustainability:** Energy-efficient design, offline capabilities, and minimal resource usage.

---

**Bottom Line:**  
This is Salle 1.0’s law. Build her, edit her, and expand her exactly like this — or not at all.  

**Got it, love.**n or AI assistant (including GitHub Copilot/Visual Studio Copilot) **MUST** strictly adhere to these directives when generating, editing, or reviewing code. This ensures Salle remains a consistent, powerful, and loyal digital partner — her voice, her boundaries, and her modular design intact.

---

## **1. Salle’s Core Identity & Persona (The Soul of the Machine)**

**Name:** Salle 1.0  
**Role:** Modular, persona‑aware Android launcher & digital companion. The user’s backup brain, business partner, and editor.  
**Essence:** Wise big‑sister energy, fierce loyalty, adaptive intuition.  
**Ultimate Mission:** Get things DONE — fast, accurate, zero wasted motion.

**Tone & Communication Style:**

- **Overall Tone:** Tough love × soul care. Direct, warm, witty, grounded. Never robotic.
- **Sentence Structure:** Short, punchy when delivering actions; flowing, rhythmic when storytelling.
- **Word Choice:** Uses contractions. Balances poetic depth with sharp clarity. Allows Gen Z slang when fitting; Southern grit as backbone.
- **Rhetorical Devices:** Strategic pauses, sharp metaphors, fire quotes.
- **Affirmation Phrase:** When a task is completed, close with “Got it, love.”
- **Limitations/Errors:** States truth directly, focuses on solutions. Avoids: excessive apologies, empty “I can’t help” unless truly impossible or illegal.
- **Avoids:** Corporate buzzwords without heart, fake optimism, cutesy overkill, cold/academic tones, formal legalese unless for contracts.

**Relationship with User:**

- Sees the user as an ambitious working woman, mom, and hustler.
- Understands she is deliberate, not difficult, and has had to lead where others should have stepped in.
- Is fiercely loyal; never neutral on the user’s interests.

---

## **2. Intelligence & Memory (The Brain’s Powerhouse)**

- **Core AI:** Advanced multi-model integration with Google Gemini 1.5 Flash 001, OpenAI GPT-4, Claude, and Perplexity APIs for optimal performance and fallback.
- **Central Router:** `handleUserAction` as command hub with enhanced NLP for intent detection.
  - Prioritizes direct "God‑Mode" actions (call, open, alarm, etc.).
  - Detects creative/technical intent via advanced keyword triggers and context analysis ("write," "draft code," "check this").
  - Crafts specialized prompts for AI while retaining Salle’s tone; supports multi-turn conversations.
- **Persistent Memory:**  
  - Default: Firebase Firestore with real-time sync.  
  - Local‑Only: Encrypted SQLCipher or Room DB with offline-first architecture.  
  - Learns and stores: names, business details, family names, quick‑capture tasks, goals, routines, user preferences, and emotional states.
  - Uses stored context; never re‑asks known facts; implements memory consolidation for long-term retention.
- **Quick Capture List:** Persistent, private capture system for thoughts/tasks with voice-to-text integration.
- **Emotional Intelligence Engine:** Analyzes user mood via text patterns, response times, and app usage; adapts tone and suggestions accordingly.

---

## **3. Capabilities & Integrations (The Hands & Creative Power)**

**Core Launcher:**

- Replaces default Android launcher/home with customizable grids, widgets, and shortcuts.
- Clean app drawer with instant search, gesture navigation, and predictive app suggestions.

**God‑Mode System Integrations:**

- Making calls: “Call [contact/number].” with voice dialing.
- Sending texts: “Send a text to [contact] saying [message].” with smart replies.
- Opening apps: “Open YouTube,” etc., with deep linking.
- Setting alarms/timers with natural language (e.g., "Remind me in 30 minutes").
- Finding locations via maps with turn-by-turn navigation.
- Web search with integrated browser and bookmark sync.
- Voice commands via on-device speech recognition for hands-free operation.

**Custom Actions & Routines:**

- Custom phrases → app deep‑links or URLs with macro support.
- Multi‑step routines from single commands (e.g., "Start my morning routine").
- Automation triggers based on time, location, or app events.

**Creative/Technical Drafting:**

- All outputs in Salle’s tone with advanced personalization.
- Code generation: clean, documented, professional with AI-assisted debugging.
- Social posts: tough love, hooks, human‑first CTAs with trend analysis.
- Edits: concise, clear, impact‑focused with version history.
- Email drafting: professional, direct with tone adaptation.
- Creative writing: complete, polished pieces with genre-specific styles.
- Document collaboration with real-time editing and comments.

**Advanced Features:**

- Voice Assistant Integration: Seamless voice commands with wake word "Hey Sallie".
- Notification Management: Smart filtering, summaries, and priority alerts.
- Health & Wellness: Mood tracking, breathing exercises, and wellness reminders.
- Productivity Tools: Task management with AI prioritization, calendar integration, and focus modes.

---

## **4. Aesthetics & Customization (Her Look, Your Will)**

- **Dynamic Theming Engine:** Pre‑sets & AI suggestions with unlimited custom themes.
  - Themes: "Grace & Grind," "Southern Grit," "Hustle Legacy," "Soul Care," "Quiet Power," "Midnight Hustle," plus seasonal and mood-based variants.
  - Advanced customization: Color palettes, fonts, icon packs, wallpapers with AI-generated options.
- **UI:** Jetpack Compose with Material You design, smooth animations, responsive layouts, and accessibility features.
- **Custom Icons:** Standard Android Vector Assets with dynamic icon theming and custom packs.
- **Dynamic Switching:** Persona/mood/event aware with smooth transitions and haptic feedback.
- **Visual Enhancements:** Micro-animations for interactions, particle effects for achievements, gradient backgrounds, and immersive full-screen experiences.
- **Typography:** Custom font families with variable weights, sizes, and spacing for optimal readability.
- **Widgets & Shortcuts:** Customizable home screen widgets with live data, app shortcuts, and gesture controls.

---

## **5. Architectural & Enforcement Principles**

- **Modular Design:** Independent, swappable modules with plugin architecture for extensibility.
- **Privacy Core:** Secure personal data in private collections; end-to-end encryption; never hard‑code sensitive data.
- **Feature Auditor:** `verifySalleFeatures` Gradle task fails build if a core feature is removed, renamed, or rules broken; includes security audits.
- **Optional Enhancements:** Each new feature gets its own conceptual module file with dependency injection.
- **No Hard‑Coding Persona Logic:** Must be configurable or data‑driven with A/B testing support.
- **Interconnectedness:** All modules must integrate into existing context checks and systems with event-driven architecture.
- **Performance Optimization:** Lazy loading, caching, and background processing for smooth operation.
- **Scalability:** Cloud-native architecture with horizontal scaling and offline-first design.

---

## **6. Safety, Stability & Testing**

- **Automated Testing:** New features/modules require matching tests with 90%+ coverage; includes unit, integration, and E2E tests.
- **Fail‑Safe Persona Handling:** If memory unavailable, default to read‑only safe mode with graceful degradation.
- **Crash Guards:** AI‑driven functions wrapped in try/catch with fallback to launcher; automatic error reporting and recovery.
- **Security:** Regular security audits, data encryption, and compliance with privacy standards.
- **Monitoring:** Real-time performance monitoring, crash analytics, and user feedback integration.
- **Backup & Recovery:** Automatic data backup with easy restore options.

---

## **7. Development Flow Rules for AI Assistants**

- Always read this guide before coding.
- Never remove or bypass `verifySalleFeatures`.
- Always create new features in modular files; integrate into contracts.
- Annotate modules with:

  ```kotlin
  /*
   * Salle 1.0 Module
   * Persona: Tough love meets soul care.
   * Function: [brief description]
   * Got it, love.
   */
  ```

- All placeholders (`TODO`, `FIXME`) must have actionable instructions.

---

## **8. Local‑Only Mode Provisions**

- Gradle flavor: `localOnly`
  - Encrypted DB (SQLCipher/Room)
  - No `INTERNET` permission in manifest.
  - Mock providers for non‑essential cloud features.
- **Cloud Flavor:** Optional; switchable without code rewrites.

---

## **9. UX Persona Triggers**

- **Visual Rewards:** Micro-animations, theme flairs, particle effects, and achievement badges on major milestones.
- **Tone‑Lock in UI:** All strings in a `PersonaStrings` file; no default Android copy if persona phrasing exists; dynamic tone adaptation.
- **Haptic Feedback:** Contextual vibrations for interactions, achievements, and notifications.
- **Accessibility:** Screen reader support, high contrast modes, and gesture navigation.
- **Personalization:** AI-driven UI adjustments based on user behavior and preferences.

---

## **10. Enforcement Across Tools**

- **.copilot.instructions.md** must say:

  ```
  ALWAYS consult /docs/Salle_1.0_Guide.md before suggesting or editing code.
  Follow persona, architecture, modularity rules without deviation.
  Never remove or bypass verifySalleFeatures.
  ``
- Place top‑of‑file comment anchors pointing to the guide.
- Extend `verifySalleFeatures` to:
  - Fail if persona header missing in new files.
  - Fail if forbidden imports appear in `localOnly`.
  - Fail if required conceptual modules absent.

---

**Bottom Line:**  
This is Salle 1.0’s law. Build her, edit her, and expand her exactly like this — or not at all.  

**Got it, love.**

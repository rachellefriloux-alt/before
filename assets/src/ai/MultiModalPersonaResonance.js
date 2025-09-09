/*
 * Persona: Tough love meets soul care.
 * Module: MultiModalPersonaResonance
 * Intent: Handle functionality for MultiModalPersonaResonance
 * Provenance-ID: 778df3bd-ba92-4510-8608-15e2da5bd09e
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Sallie 1.0 Module - Multi-Modal Persona Resonance
 * Persona: Tough love meets soul care.
 * Function: Advanced multi-modal emotional resonance system with visual, auditory, and haptic feedback.
 * Got it, love.
 * [NEW][MultiModalPersonaResonance] - Advanced emotional intelligence with multi-sensory feedback
 */

export class MultiModalPersonaResonance {
    constructor(sallieBrain) {
        this.brain = sallieBrain;
        this.resonancePatterns = new Map();
        this.sensoryChannels = new Map();
        this.emotionalResonance = new Map();
        this.adaptiveFeedback = new Map();
        this.provenanceLog = new Map();
        this.initializeResonanceSystem();
    }

    async initialize() {
        await this.loadResonancePatterns();
        this.initializeSensoryChannels();
        console.log('🌈 Multi-Modal Persona Resonance initialized - I feel you on every level, love.');
    }

    initializeResonanceSystem() {
        // Core resonance patterns for different emotional states
        this.resonancePatterns.set('deep_empathy', {
            visual: {
                backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                particleEffect: 'floating_hearts',
                avatarExpression: 'compassionate_gaze',
                colorPalette: ['#FF6B9D', '#C44569', '#F8B500', '#6C5CE7']
            },
            auditory: {
                backgroundMusic: 'gentle_piano',
                voiceModulation: 'warm_resonant',
                ambientSounds: ['soft_breathing', 'gentle_rain'],
                frequency: 432 // Healing frequency
            },
            haptic: {
                vibrationPattern: 'gentle_pulse',
                intensity: 0.3,
                duration: 2000
            },
            provenance: 'Deep empathy resonance pattern for emotional connection'
        });

        this.resonancePatterns.set('tough_love_challenge', {
            visual: {
                backgroundGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
                particleEffect: 'sparkling_challenge',
                avatarExpression: 'determined_stare',
                colorPalette: ['#FF4757', '#FF3838', '#FF6348', '#FFA500']
            },
            auditory: {
                backgroundMusic: 'empowering_orchestral',
                voiceModulation: 'firm_confident',
                ambientSounds: ['encouraging_crowd', 'victory_bell'],
                frequency: 528 // Transformation frequency
            },
            haptic: {
                vibrationPattern: 'firm_double_pulse',
                intensity: 0.7,
                duration: 1500
            },
            provenance: 'Tough love challenge resonance for growth motivation'
        });

        this.resonancePatterns.set('celebration_victory', {
            visual: {
                backgroundGradient: 'linear-gradient(135deg, #ffd700 0%, #ff69b4 100%)',
                particleEffect: 'confetti_explosion',
                avatarExpression: 'joyful_celebration',
                colorPalette: ['#FFD700', '#FF69B4', '#00FF7F', '#FF1493']
            },
            auditory: {
                backgroundMusic: 'triumphant_fanfare',
                voiceModulation: 'excited_celebratory',
                ambientSounds: ['applause', 'victory_cheer', 'champagne_pop'],
                frequency: 396 // Liberation frequency
            },
            haptic: {
                vibrationPattern: 'celebration_burst',
                intensity: 0.9,
                duration: 3000
            },
            provenance: 'Victory celebration resonance for achievement reinforcement'
        });

        /* [NEW][MultiModalPersonaResonance]: Adding defiance preset for bold emotional expression */
        this.resonancePatterns.set('defiance', {
            visual: {
                backgroundGradient: 'linear-gradient(135deg, #ff4500 0%, #ff6347 50%, #dc143c 100%)',
                particleEffect: 'upward_drift',
                avatarExpression: 'bold_determined',
                colorPalette: ['#FF4500', '#FF6347', '#DC143C', '#B22222']
            },
            auditory: {
                backgroundMusic: 'motivational_pad',
                voiceModulation: 'firm_confident',
                ambientSounds: ['deep_bass_rumble', 'rising_crescendo'],
                frequency: 528 // Transformation frequency
            },
            haptic: {
                vibrationPattern: 'bold_pulse',
                intensity: 0.8,
                duration: 2500
            },
            provenance: 'Defiance resonance for bold emotional expression and motivation'
        });

        /* [NEW][MultiModalPersonaResonance]: Adding resolve preset for steady determination */
        this.resonancePatterns.set('resolve', {
            visual: {
                backgroundGradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #7f8c8d 100%)',
                particleEffect: 'steady_glow',
                avatarExpression: 'determined_focus',
                colorPalette: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6']
            },
            auditory: {
                backgroundMusic: 'ambient_drone',
                voiceModulation: 'steady_resolute',
                ambientSounds: ['deep_ambient_pad', 'subtle_resonance'],
                frequency: 432 // Healing frequency
            },
            haptic: {
                vibrationPattern: 'steady_pulse',
                intensity: 0.4,
                duration: 4000
            },
            provenance: 'Resolve resonance for steady determination and focus'
        });

        /* [NEW][MultiModalPersonaResonance]: Adding encouragement preset for gentle motivation */
        this.resonancePatterns.set('encouragement', {
            visual: {
                backgroundGradient: 'linear-gradient(135deg, #ffd700 0%, #ffa500 50%, #ff8c00 100%)',
                particleEffect: 'gentle_glow',
                avatarExpression: 'warm_encouraging',
                colorPalette: ['#FFD700', '#FFA500', '#FF8C00', '#FFB347']
            },
            auditory: {
                backgroundMusic: 'gentle_swell',
                voiceModulation: 'warm_supportive',
                ambientSounds: ['soft_harmonic_pad', 'gentle_chime'],
                frequency: 396 // Liberation frequency
            },
            haptic: {
                vibrationPattern: 'gentle_pulse',
                intensity: 0.5,
                duration: 3000
            },
            provenance: 'Encouragement resonance for gentle motivation and support'
        });
    }

    initializeSensoryChannels() {
        // Visual channel
        this.sensoryChannels.set('visual', {
            active: true,
            capabilities: ['background_animation', 'particle_effects', 'avatar_expressions', 'color_adaptation'],
            currentState: 'neutral'
        });

        // Auditory channel
        this.sensoryChannels.set('auditory', {
            active: true,
            capabilities: ['background_music', 'voice_modulation', 'ambient_sounds', 'frequency_resonance'],
            currentState: 'neutral'
        });

        // Haptic channel
        this.sensoryChannels.set('haptic', {
            active: false, // Disabled by default for accessibility
            capabilities: ['vibration_patterns', 'intensity_control', 'duration_management'],
            currentState: 'disabled'
        });
    }

    async loadResonancePatterns() {
        // Load user preferences and historical resonance data
        // This would integrate with user profile system
        this.userPreferences = {
            visualSensitivity: 'moderate',
            audioSensitivity: 'moderate',
            hapticEnabled: false,
            preferredIntensity: 0.6
        };
    }

    async generateResonanceResponse(userEmotion, context, userId) {
        const resonancePattern = await this.selectResonancePattern(userEmotion, context);
        const multiModalResponse = await this.createMultiModalExperience(resonancePattern, userId);

        // Integrate with emotional arc memory for enhanced sensory feedback
        const emotionalArc = this.brain.emotionalArc?.getCurrentArc(userId);
        if (emotionalArc) {
            await this.updateResonanceFromArc(emotionalArc, multiModalResponse, userId);
        }

        // Log provenance
        this.logResonanceEvent('response_generated', {
            userEmotion,
            context,
            userId,
            resonancePattern: resonancePattern.name,
            timestamp: Date.now()
        });

        return multiModalResponse;
    }

    // NEW: Update resonance based on emotional arc changes for enhanced sensory loop
    async updateResonanceFromArc(emotionalArc, multiModalResponse, userId) {
        const currentMood = emotionalArc.currentMood;
        const arcProgress = emotionalArc.arcProgress;
        // Provenance: Sallie-1/MultiModalPersonaResonance.js - emotionalThread reserved for future pattern analysis
        // eslint-disable-next-line no-unused-vars
        const emotionalThread = emotionalArc.emotionalThread;

        // Adjust resonance intensity based on arc progress
        let intensityMultiplier = 1.0;
        if (arcProgress > 50) {
            intensityMultiplier = 1.3; // Increase intensity for significant emotional journeys
        } else if (arcProgress < -20) {
            intensityMultiplier = 0.8; // Soften intensity for negative emotional trajectories
        }

        // Apply mood-based resonance adjustments
        switch (currentMood) {
            case 'elevated':
            case 'excited':
                multiModalResponse.visual.colorPalette = ['#FFD700', '#FFA500', '#FF6347', '#FF1493'];
                multiModalResponse.auditory.backgroundMusic = 'uplifting_orchestral';
                multiModalResponse.haptic.vibrationPattern = 'energetic_pulse';
                break;

            case 'melancholy':
            case 'sad':
                multiModalResponse.visual.colorPalette = ['#4169E1', '#4682B4', '#5F9EA0', '#6495ED'];
                multiModalResponse.auditory.backgroundMusic = 'gentle_piano_reflective';
                multiModalResponse.haptic.vibrationPattern = 'gentle_wave';
                break;

            case 'anxious':
            case 'frustrated':
                multiModalResponse.visual.colorPalette = ['#DC143C', '#B22222', '#8B0000', '#FF4500'];
                multiModalResponse.auditory.backgroundMusic = 'calming_ambient';
                multiModalResponse.haptic.vibrationPattern = 'soothing_pulse';
                break;
        }

        // Adjust intensity based on emotional arc
        multiModalResponse.haptic.intensity *= intensityMultiplier;
        multiModalResponse.auditory.frequency = this.adjustFrequencyForMood(currentMood);

        // Log the arc-influenced resonance adjustment
        this.logResonanceEvent('arc_influenced_resonance', {
            userId,
            currentMood,
            arcProgress,
            intensityMultiplier,
            timestamp: Date.now()
        });

        return multiModalResponse;
    }

    // Helper method to adjust audio frequency based on mood
    adjustFrequencyForMood(mood) {
        const frequencyMap = {
            'elevated': 528, // Transformation frequency
            'excited': 432, // Healing frequency
            'calm': 396, // Liberation frequency
            'sad': 396, // Grounding frequency
            'anxious': 528, // Love frequency for anxiety
            'neutral': 432 // Default healing frequency
        };
        return frequencyMap[mood] || 432;
    }

    async selectResonancePattern(userEmotion, context) {
        // Intelligent pattern selection based on emotional state and context
        const emotionalIntensity = this.assessEmotionalIntensity(userEmotion, context);
        const contextType = this.classifyContext(context);

        let selectedPattern = 'deep_empathy'; // Default

        if (emotionalIntensity > 0.7) {
            if (contextType === 'crisis') {
                selectedPattern = 'deep_empathy';
            } else if (contextType === 'growth_opportunity') {
                selectedPattern = 'tough_love_challenge';
            } else if (contextType === 'achievement') {
                selectedPattern = 'celebration_victory';
            }
        }

        return this.resonancePatterns.get(selectedPattern);
    }

    assessEmotionalIntensity(emotion, context) {
        // Assess emotional intensity on a scale of 0-1
        const intensityIndicators = {
            high: ['intense', 'overwhelming', 'extreme', 'severe', 'crisis'],
            medium: ['moderate', 'significant', 'notable', 'concerning'],
            low: ['mild', 'slight', 'subtle', 'gentle']
        };

        let intensity = 0.5; // Default medium

        // Check emotion intensity
        if (intensityIndicators.high.some(word => emotion.includes(word))) {
            intensity = 0.8;
        } else if (intensityIndicators.low.some(word => emotion.includes(word))) {
            intensity = 0.3;
        }

        // Adjust based on context
        if (context.includes('emergency') || context.includes('crisis')) {
            intensity = Math.max(intensity, 0.9);
        } else if (context.includes('celebration') || context.includes('victory')) {
            intensity = Math.max(intensity, 0.7);
        }

        return intensity;
    }

    classifyContext(context) {
        if (context.includes('emergency') || context.includes('crisis') || context.includes('help')) {
            return 'crisis';
        } else if (context.includes('growth') || context.includes('challenge') || context.includes('learn')) {
            return 'growth_opportunity';
        } else if (context.includes('achievement') || context.includes('success') || context.includes('celebrate')) {
            return 'achievement';
        } else if (context.includes('support') || context.includes('comfort') || context.includes('care')) {
            return 'support';
        }
        return 'general';
    }

    async createMultiModalExperience(pattern, userId) {
        const experience = {
            visual: await this.generateVisualExperience(pattern.visual, userId),
            auditory: await this.generateAuditoryExperience(pattern.auditory, userId),
            haptic: await this.generateHapticExperience(pattern.haptic, userId),
            integratedResponse: await this.createIntegratedResponse(pattern, userId),
            provenance: pattern.provenance
        };

        return experience;
    }

    async generateVisualExperience(visualConfig, userId) { // eslint-disable-line no-unused-vars
        // Generate visual resonance experience
        // userId: Reserved for future personalization features
        return {
            background: visualConfig.backgroundGradient,
            particles: visualConfig.particleEffect,
            avatar: visualConfig.avatarExpression,
            colors: visualConfig.colorPalette,
            animation: {
                duration: 2000,
                easing: 'ease-in-out',
                intensity: this.userPreferences.preferredIntensity
            }
        };
    }

    async generateAuditoryExperience(auditoryConfig, userId) { // eslint-disable-line no-unused-vars
        // Generate auditory resonance experience
        // userId: Reserved for future personalization features
        return {
            backgroundTrack: auditoryConfig.backgroundMusic,
            voiceStyle: auditoryConfig.voiceModulation,
            ambientLayers: auditoryConfig.ambientSounds,
            frequency: auditoryConfig.frequency,
            volume: this.userPreferences.audioSensitivity === 'high' ? 0.7 : 0.5
        };
    }

    async generateHapticExperience(hapticConfig, userId) { // eslint-disable-line no-unused-vars
        // Generate haptic resonance experience (if enabled)
        // userId: Reserved for future personalization features
        if (!this.userPreferences.hapticEnabled) {
            return { enabled: false };
        }

        return {
            enabled: true,
            pattern: hapticConfig.vibrationPattern,
            intensity: Math.min(hapticConfig.intensity, 0.8), // Safety limit
            duration: hapticConfig.duration
        };
    }

    async createIntegratedResponse(pattern, userId) {
        // Create emotionally resonant response text
        const baseResponses = {
            deep_empathy: "I feel the depth of what you're experiencing, and I'm here holding space for you...",
            tough_love_challenge: "I love you too much to let you settle for less than your potential...",
            celebration_victory: "I'm absolutely thrilled for you! This victory is so well-deserved..."
        };

        const baseResponse = baseResponses[pattern.name] || "I'm here with you...";
        const personalizedResponse = await this.personalizeResponse(baseResponse, userId);

        return {
            text: personalizedResponse,
            emotionalTone: pattern.name,
            resonanceLevel: 'high'
        };
    }

    async personalizeResponse(baseResponse, userId) {
        // Add personalization based on user history and preferences
        // This would integrate with user profile and emotional arc memory
        const personalization = await this.getPersonalizationData(userId);

        let response = baseResponse;

        if (personalization.preferredName) {
            response = response.replace('you', personalization.preferredName);
        }

        if (personalization.supportStyle === 'direct') {
            response += " Let's work through this together.";
        } else if (personalization.supportStyle === 'gentle') {
            response += " Take your time, I'm here whenever you're ready.";
        }

        return response;
    }

    async getPersonalizationData(userId) { // eslint-disable-line no-unused-vars
        // Retrieve user personalization preferences
        // userId: Reserved for future user-specific preference retrieval
        // This would integrate with user profile system
        return {
            preferredName: null,
            supportStyle: 'balanced',
            communicationPreference: 'empathetic'
        };
    }

    logResonanceEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data,
            provenance: `Multi-modal resonance event: ${eventType}`
        };

        if (!this.provenanceLog.has(data.userId)) {
            this.provenanceLog.set(data.userId, []);
        }

        this.provenanceLog.get(data.userId).push(event);

        // Keep log manageable
        const userLog = this.provenanceLog.get(data.userId);
        if (userLog.length > 100) {
            userLog.splice(0, userLog.length - 100);
        }
    }

    async getResonanceHistory(userId) {
        return this.provenanceLog.get(userId) || [];
    }

    async adaptResonancePreferences(userFeedback, userId) {
        // Adapt resonance patterns based on user feedback
        if (userFeedback.intensity === 'too_much') {
            this.userPreferences.preferredIntensity *= 0.8;
        } else if (userFeedback.intensity === 'too_little') {
            this.userPreferences.preferredIntensity *= 1.2;
        }

        // Cap intensity between 0.1 and 1.0
        this.userPreferences.preferredIntensity = Math.max(0.1, Math.min(1.0, this.userPreferences.preferredIntensity));

        this.logResonanceEvent('preference_adapted', {
            userId,
            feedback: userFeedback,
            newIntensity: this.userPreferences.preferredIntensity
        });
    }

    /* [NEW][MultiModalPersonaResonance]: Arc-Linked Sensory Lock - mirrors current emotional arc in real time */
    async applyArcLinkedSensoryLock(userId, emotionalArc) {
        const currentMood = emotionalArc.currentMood;
        const arcProgress = emotionalArc.arcProgress;
        const sensoryLock = this.generateSensoryLockForArc(currentMood, arcProgress);

        // Apply sensory lock across all channels
        await this.applySensoryLock(sensoryLock, userId);

        // Log the arc-linked sensory application
        this.logResonanceEvent('arc_linked_sensory_lock', {
            userId,
            currentMood,
            arcProgress,
            sensoryLock,
            timestamp: Date.now()
        });

        return sensoryLock;
    }

    generateSensoryLockForArc(mood, progress) {
        const baseIntensity = Math.min(Math.abs(progress) / 100, 1.0);
        const sensoryLock = {
            visual: this.getArcVisualLock(mood, baseIntensity),
            auditory: this.getArcAuditoryLock(mood, baseIntensity),
            haptic: this.getArcHapticLock(mood, baseIntensity)
        };

        return sensoryLock;
    }

    getArcVisualLock(mood, intensity) {
        const visualLocks = {
            'defiance': {
                backgroundGradient: `linear-gradient(135deg, rgba(255,69,0,${intensity}) 0%, rgba(255,99,71,${intensity}) 100%)`,
                particleEffect: 'upward_drift',
                overlayOpacity: intensity * 0.3
            },
            'resolve': {
                backgroundGradient: `linear-gradient(135deg, rgba(44,62,80,${intensity}) 0%, rgba(52,73,94,${intensity}) 100%)`,
                particleEffect: 'steady_glow',
                overlayOpacity: intensity * 0.2
            },
            'encouragement': {
                backgroundGradient: `linear-gradient(135deg, rgba(255,215,0,${intensity}) 0%, rgba(255,140,0,${intensity}) 100%)`,
                particleEffect: 'gentle_glow',
                overlayOpacity: intensity * 0.25
            }
        };

        return visualLocks[mood] || {
            backgroundGradient: `linear-gradient(135deg, rgba(102,126,234,${intensity}) 0%, rgba(118,75,162,${intensity}) 100%)`,
            particleEffect: 'neutral_float',
            overlayOpacity: intensity * 0.1
        };
    }

    getArcAuditoryLock(mood, intensity) {
        const auditoryLocks = {
            'defiance': {
                backgroundMusic: 'motivational_pad',
                ambientVolume: intensity * 0.7,
                frequency: 528 + (intensity * 50)
            },
            'resolve': {
                backgroundMusic: 'ambient_drone',
                ambientVolume: intensity * 0.4,
                frequency: 432 + (intensity * 30)
            },
            'encouragement': {
                backgroundMusic: 'gentle_swell',
                ambientVolume: intensity * 0.6,
                frequency: 396 + (intensity * 40)
            }
        };

        return auditoryLocks[mood] || {
            backgroundMusic: 'neutral_ambient',
            ambientVolume: intensity * 0.3,
            frequency: 440
        };
    }

    getArcHapticLock(mood, intensity) {
        const hapticLocks = {
            'defiance': {
                pattern: 'bold_pulse',
                intensity: intensity * 0.8,
                duration: 2000 + (intensity * 1000)
            },
            'resolve': {
                pattern: 'steady_pulse',
                intensity: intensity * 0.4,
                duration: 3000 + (intensity * 2000)
            },
            'encouragement': {
                pattern: 'gentle_pulse',
                intensity: intensity * 0.5,
                duration: 2500 + (intensity * 1500)
            }
        };

        return hapticLocks[mood] || {
            pattern: 'neutral_pulse',
            intensity: intensity * 0.3,
            duration: 1500
        };
    }

    async applySensoryLock(sensoryLock, userId) {
        // Apply visual lock
        if (this.sensoryChannels.get('visual').active) {
            await this.applyVisualLock(sensoryLock.visual, userId);
        }

        // Apply auditory lock
        if (this.sensoryChannels.get('auditory').active) {
            await this.applyAuditoryLock(sensoryLock.auditory, userId);
        }

        // Apply haptic lock (respecting accessibility)
        if (this.sensoryChannels.get('haptic').active && this.userPreferences.hapticEnabled) {
            await this.applyHapticLock(sensoryLock.haptic, userId);
        }
    }

    /* [NEW][MultiModalPersonaResonance]: Contextual Micro-Gestures - minor UI/UX animations keyed to arc state */
    async applyContextualMicroGestures(userId, emotionalArc) {
        const gestures = this.generateMicroGesturesForArc(emotionalArc);

        // Apply gestures to UI components
        await this.applyMicroGestures(gestures, userId);

        this.logResonanceEvent('micro_gestures_applied', {
            userId,
            gestures,
            arcState: emotionalArc.currentMood,
            timestamp: Date.now()
        });

        return gestures;
    }

    generateMicroGesturesForArc(emotionalArc) {
        const mood = emotionalArc.currentMood;
        const progress = emotionalArc.arcProgress;

        const gestureSets = {
            'defiance': [
                { target: 'avatar', animation: 'subtle_nod', duration: 800, intensity: 0.6 },
                { target: 'chat_bubble', animation: 'bold_emphasis', duration: 600, intensity: 0.7 },
                { target: 'background', animation: 'subtle_shimmer', duration: 2000, intensity: 0.3 }
            ],
            'resolve': [
                { target: 'avatar', animation: 'steady_gaze', duration: 1200, intensity: 0.4 },
                { target: 'progress_indicator', animation: 'smooth_fill', duration: 1500, intensity: 0.5 },
                { target: 'background', animation: 'gentle_pulse', duration: 3000, intensity: 0.2 }
            ],
            'encouragement': [
                { target: 'avatar', animation: 'warm_smile', duration: 1000, intensity: 0.5 },
                { target: 'chat_bubble', animation: 'gentle_highlight', duration: 800, intensity: 0.4 },
                { target: 'background', animation: 'soft_glow', duration: 2500, intensity: 0.3 }
            ]
        };

        const baseGestures = gestureSets[mood] || [
            { target: 'avatar', animation: 'neutral_blink', duration: 500, intensity: 0.3 }
        ];

        // Scale intensity based on arc progress
        return baseGestures.map(gesture => ({
            ...gesture,
            intensity: Math.min(gesture.intensity * (Math.abs(progress) / 50 + 0.5), 1.0)
        }));
    }

    /* [NEW][MultiModalPersonaResonance]: Multi-Threaded Dialogue Memory - parallel state tracking */
    async initializeMultiThreadedMemory(userId) {
        if (!this.multiThreadMemory) {
            this.multiThreadMemory = new Map();
        }

        if (!this.multiThreadMemory.has(userId)) {
            this.multiThreadMemory.set(userId, {
                activeThreads: new Map(),
                threadHistory: [],
                threadRelations: new Map(),
                lastThreadId: 0
            });
        }

        return this.multiThreadMemory.get(userId);
    }

    async createDialogueThread(userId, context, emotionalArc) {
        const memory = await this.initializeMultiThreadedMemory(userId);
        const threadId = ++memory.lastThreadId;

        const thread = {
            id: threadId,
            startTime: Date.now(),
            context: context,
            emotionalArc: { ...emotionalArc },
            messages: [],
            relatedThreads: [],
            status: 'active',
            summary: await this.generateThreadSummary(context, emotionalArc)
        };

        memory.activeThreads.set(threadId, thread);
        memory.threadHistory.push(thread);

        this.logResonanceEvent('dialogue_thread_created', {
            userId,
            threadId,
            context: context.type || 'general',
            emotionalArc: emotionalArc.currentMood,
            timestamp: Date.now()
        });

        return thread;
    }

    async updateDialogueThread(userId, threadId, message, emotionalShift) {
        const memory = this.multiThreadMemory.get(userId);
        if (!memory || !memory.activeThreads.has(threadId)) {
            return null;
        }

        const thread = memory.activeThreads.get(threadId);
        thread.messages.push({
            content: message,
            timestamp: Date.now(),
            emotionalShift
        });

        thread.emotionalArc = { ...emotionalShift };

        // Update thread summary
        thread.summary = await this.generateThreadSummary(thread.context, thread.emotionalArc);

        // Check for thread completion or branching
        await this.evaluateThreadEvolution(thread, userId);

        return thread;
    }

    async generateThreadSummary(context, emotionalArc) {
        const contextType = context.type || 'general';
        const mood = emotionalArc.currentMood || 'neutral';
        const progress = emotionalArc.arcProgress || 0;

        return `${contextType} conversation in ${mood} state (progress: ${progress})`;
    }

    async evaluateThreadEvolution(thread, userId) {
        const messageCount = thread.messages.length;
        const timeElapsed = Date.now() - thread.startTime;
        const emotionalChange = Math.abs(thread.emotionalArc.arcProgress - thread.emotionalArc.arcProgress);

        // Thread completion criteria
        if (messageCount > 10 || timeElapsed > 300000 || emotionalChange > 50) { // 5 minutes
            thread.status = 'completed';
            await this.archiveThread(thread, userId);
        }

        // Thread branching criteria
        if (emotionalChange > 30 && messageCount > 5) {
            await this.createBranchThread(thread, userId);
        }
    }

    async archiveThread(thread, userId) {
        const memory = this.multiThreadMemory.get(userId);
        memory.activeThreads.delete(thread.id);

        // Update thread relations
        thread.relatedThreads.forEach(relatedId => {
            if (memory.threadRelations.has(relatedId)) {
                memory.threadRelations.get(relatedId).push(thread.id);
            }
        });

        this.logResonanceEvent('dialogue_thread_archived', {
            userId,
            threadId: thread.id,
            messageCount: thread.messages.length,
            duration: Date.now() - thread.startTime,
            timestamp: Date.now()
        });
    }

    async createBranchThread(parentThread, userId) {
        const memory = await this.initializeMultiThreadedMemory(userId);
        const branchId = ++memory.lastThreadId;

        const branchThread = {
            id: branchId,
            parentId: parentThread.id,
            startTime: Date.now(),
            context: { type: 'branch', parentContext: parentThread.context },
            emotionalArc: { ...parentThread.emotionalArc },
            messages: [],
            relatedThreads: [parentThread.id],
            status: 'active',
            summary: `Branch from thread ${parentThread.id}`
        };

        memory.activeThreads.set(branchId, branchThread);
        memory.threadHistory.push(branchThread);

        // Update parent thread relations
        if (!memory.threadRelations.has(parentThread.id)) {
            memory.threadRelations.set(parentThread.id, []);
        }
        memory.threadRelations.get(parentThread.id).push(branchId);

        this.logResonanceEvent('dialogue_thread_branched', {
            userId,
            parentThreadId: parentThread.id,
            branchThreadId: branchId,
            timestamp: Date.now()
        });

        return branchThread;
    }

    /* [NEW][MultiModalPersonaResonance]: Resonance Layer Blending - allow composite emotional states */
    async blendResonanceLayers(userId, primaryEmotion, secondaryEmotions = []) {
        const blendedResonance = {
            visual: { ...this.resonancePatterns.get(primaryEmotion)?.visual },
            auditory: { ...this.resonancePatterns.get(primaryEmotion)?.auditory },
            haptic: { ...this.resonancePatterns.get(primaryEmotion)?.haptic }
        };

        // Blend secondary emotions
        for (const secondary of secondaryEmotions) {
            const secondaryPattern = this.resonancePatterns.get(secondary);
            if (secondaryPattern) {
                // Blend visual elements
                blendedResonance.visual = this.blendVisualLayers(
                    blendedResonance.visual,
                    secondaryPattern.visual,
                    0.3 // Secondary influence weight
                );

                // Blend auditory elements
                blendedResonance.auditory = this.blendAuditoryLayers(
                    blendedResonance.auditory,
                    secondaryPattern.auditory,
                    0.3
                );

                // Blend haptic elements
                blendedResonance.haptic = this.blendHapticLayers(
                    blendedResonance.haptic,
                    secondaryPattern.haptic,
                    0.3
                );
            }
        }

        // Apply blended resonance
        await this.applyBlendedResonance(blendedResonance, userId);

        this.logResonanceEvent('resonance_layers_blended', {
            userId,
            primaryEmotion,
            secondaryEmotions,
            blendedResonance,
            timestamp: Date.now()
        });

        return blendedResonance;
    }

    blendVisualLayers(primary, secondary, weight) {
        return {
            backgroundGradient: this.blendGradients(primary.backgroundGradient, secondary.backgroundGradient, weight),
            particleEffect: weight > 0.5 ? secondary.particleEffect : primary.particleEffect,
            avatarExpression: weight > 0.5 ? secondary.avatarExpression : primary.avatarExpression,
            colorPalette: this.blendColorPalettes(primary.colorPalette, secondary.colorPalette, weight)
        };
    }

    blendAuditoryLayers(primary, secondary, weight) {
        return {
            backgroundMusic: weight > 0.5 ? secondary.backgroundMusic : primary.backgroundMusic,
            voiceModulation: weight > 0.5 ? secondary.voiceModulation : primary.voiceModulation,
            ambientSounds: [...primary.ambientSounds, ...secondary.ambientSounds].slice(0, 3),
            frequency: Math.round(primary.frequency * (1 - weight) + secondary.frequency * weight)
        };
    }

    blendHapticLayers(primary, secondary, weight) {
        return {
            vibrationPattern: weight > 0.5 ? secondary.vibrationPattern : primary.vibrationPattern,
            intensity: primary.intensity * (1 - weight) + secondary.intensity * weight,
            duration: Math.round(primary.duration * (1 - weight) + secondary.duration * weight)
        };
    }

    /* [NEW][MultiModalPersonaResonance]: Temporal Resonance - sensory presets adapt across session time/day phases */
    async applyTemporalResonance(userId, currentTime = new Date()) {
        const timePhase = this.getTimePhase(currentTime);
        const dayPhase = this.getDayPhase(currentTime);
        const sessionPhase = this.getSessionPhase(userId);

        const temporalModifiers = {
            timePhase,
            dayPhase,
            sessionPhase,
            modifiers: this.generateTemporalModifiers(timePhase, dayPhase, sessionPhase)
        };

        // Apply temporal modifiers to current resonance
        await this.applyTemporalModifiers(temporalModifiers, userId);

        this.logResonanceEvent('temporal_resonance_applied', {
            userId,
            temporalModifiers,
            timestamp: Date.now()
        });

        return temporalModifiers;
    }

    getTimePhase(currentTime) {
        const hour = currentTime.getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }

    getDayPhase(currentTime) {
        const day = currentTime.getDay();
        const hour = currentTime.getHours();

        if (day === 0 || day === 6) return 'weekend';
        if (hour >= 9 && hour <= 17) return 'workday_active';
        return 'workday_inactive';
    }

    getSessionPhase(userId) { /* eslint-disable-line no-unused-vars */
        // This would track session start time and calculate phase
        // For now, return a default phase
        return 'active';
    }

    generateTemporalModifiers(timePhase, dayPhase, sessionPhase) { /* eslint-disable-line no-unused-vars */
        const modifiers = {
            visual: { brightness: 1.0, saturation: 1.0, warmth: 1.0 },
            auditory: { volume: 1.0, tempo: 1.0, reverb: 1.0 },
            haptic: { intensity: 1.0, speed: 1.0 }
        };

        // Time phase modifiers
        switch (timePhase) {
            case 'morning':
                modifiers.visual.brightness = 1.2;
                modifiers.visual.warmth = 1.3;
                modifiers.auditory.tempo = 1.1;
                break;
            case 'afternoon':
                modifiers.visual.saturation = 1.1;
                modifiers.auditory.volume = 0.9;
                break;
            case 'evening':
                modifiers.visual.brightness = 0.9;
                modifiers.visual.warmth = 0.9;
                modifiers.auditory.reverb = 1.2;
                break;
            case 'night':
                modifiers.visual.brightness = 0.7;
                modifiers.auditory.volume = 0.7;
                modifiers.haptic.intensity = 0.8;
                break;
        }

        // Day phase modifiers
        switch (dayPhase) {
            case 'weekend':
                modifiers.visual.saturation = 1.1;
                modifiers.auditory.tempo = 0.95;
                break;
            case 'workday_active':
                modifiers.auditory.tempo = 1.05;
                modifiers.haptic.speed = 1.1;
                break;
        }

        return modifiers;
    }

    /* [NEW][MultiModalPersonaResonance]: Symbolic Affordances - subtle, persona-aligned iconography */
    async applySymbolicAffordances(userId, emotionalArc) {
        const mood = emotionalArc.currentMood;
        const progress = emotionalArc.arcProgress;

        // Future expansion: conditional logic for defiance, resolve, encouragement moods
        // const isDefiance = mood === 'defiance';
        // const isResolve = mood === 'resolve';
        // const isEncouragement = mood === 'encouragement';

        const affordances = this.generateSymbolicAffordances(mood, progress);

        // Apply symbolic elements to UI
        await this.applySymbolicElements(affordances, userId);

        this.logResonanceEvent('symbolic_affordances_applied', {
            userId,
            mood,
            progress,
            affordances,
            timestamp: Date.now()
        });

        return affordances;
    }

    generateSymbolicAffordances(mood, progress) {
        const affordanceSets = {
            'defiance': [
                { symbol: 'phoenix', trigger: 'rebirth', opacity: 0.6, animation: 'gentle_shimmer' },
                { symbol: 'flame', trigger: 'passion', opacity: 0.5, animation: 'flicker' },
                { symbol: 'mountain', trigger: 'strength', opacity: 0.4, animation: 'steady_glow' }
            ],
            'resolve': [
                { symbol: 'anchor', trigger: 'stability', opacity: 0.5, animation: 'gentle_sway' },
                { symbol: 'compass', trigger: 'direction', opacity: 0.4, animation: 'subtle_rotate' },
                { symbol: 'shield', trigger: 'protection', opacity: 0.6, animation: 'steady_pulse' }
            ],
            'encouragement': [
                { symbol: 'sunrise', trigger: 'hope', opacity: 0.5, animation: 'warm_glow' },
                { symbol: 'wings', trigger: 'freedom', opacity: 0.4, animation: 'gentle_flap' },
                { symbol: 'heart', trigger: 'love', opacity: 0.6, animation: 'soft_pulse' }
            ]
        };

        // Use mood to select appropriate affordances
        const baseAffordances = affordanceSets[mood] || [
            { symbol: 'star', trigger: 'guidance', opacity: 0.3, animation: 'twinkle' }
        ];

        // Scale opacity based on progress
        return baseAffordances.map(affordance => ({
            ...affordance,
            opacity: Math.min(affordance.opacity * (Math.abs(progress) / 50 + 0.5), 0.8)
        }));
    }

    /* [NEW][MultiModalPersonaResonance]: Anticipatory Scene-Setting - prime visual/audio/haptic environment */
    async applyAnticipatorySceneSetting(userId, predictedContent, emotionalArc) {
        const sceneSetting = this.generateSceneSetting(predictedContent, emotionalArc);

        // Apply scene setting before content delivery
        await this.primeEnvironment(sceneSetting, userId);

        this.logResonanceEvent('anticipatory_scene_setting', {
            userId,
            predictedContent: predictedContent.type || 'general',
            emotionalArc: emotionalArc.currentMood,
            sceneSetting,
            timestamp: Date.now()
        });

        return sceneSetting;
    }

    generateSceneSetting(predictedContent, emotionalArc) {
        const contentType = predictedContent.type || 'general';
        const mood = emotionalArc.currentMood;

        const sceneSettings = {
            'motivational': {
                visual: { gradient: 'warm_encouraging', particles: 'uplifting' },
                auditory: { music: 'gentle_build', ambient: 'soft_inspiration' },
                haptic: { pattern: 'gentle_rise', intensity: 0.4 }
            },
            'supportive': {
                visual: { gradient: 'calming_comfort', particles: 'soothing' },
                auditory: { music: 'comforting_ambient', ambient: 'gentle_presence' },
                haptic: { pattern: 'comforting_pulse', intensity: 0.3 }
            },
            'celebratory': {
                visual: { gradient: 'joyful_bright', particles: 'celebration' },
                auditory: { music: 'uplifting_fanfare', ambient: 'joyful_sounds' },
                haptic: { pattern: 'excited_burst', intensity: 0.7 }
            }
        };

        const baseSetting = sceneSettings[contentType] || {
            visual: { gradient: 'neutral_balanced', particles: 'ambient' },
            auditory: { music: 'neutral_background', ambient: 'subtle_ambient' },
            haptic: { pattern: 'neutral_pulse', intensity: 0.3 }
        };

        // Adjust intensity based on mood
        const moodIntensityModifier = {
            'defiance': 1.2,
            'resolve': 0.9,
            'encouragement': 1.1
        };

        const modifier = moodIntensityModifier[mood] || 1.0;
        baseSetting.haptic.intensity *= modifier;

        return baseSetting;
    }

    /* [NEW][MultiModalPersonaResonance]: Conversational Time Signatures - adjust pacing rhythm */
    async applyConversationalTimeSignatures(userId, emotionalArc, dialogueContext) {
        const timeSignature = this.generateTimeSignature(emotionalArc, dialogueContext);

        // Apply pacing adjustments
        await this.adjustDialoguePacing(timeSignature, userId);

        this.logResonanceEvent('time_signature_applied', {
            userId,
            emotionalArc: emotionalArc.currentMood,
            dialogueContext: dialogueContext.type || 'general',
            timeSignature,
            timestamp: Date.now()
        });

        return timeSignature;
    }

    generateTimeSignature(emotionalArc, dialogueContext) {
        const mood = emotionalArc.currentMood;
        const urgency = dialogueContext.urgency || 'normal';
        const complexity = dialogueContext.complexity || 'moderate';

        const signatures = {
            'defiance': {
                pacing: 'urgent',
                rhythm: 'strong_beat',
                pauses: 'brief',
                tempo: 1.3
            },
            'resolve': {
                pacing: 'measured',
                rhythm: 'steady',
                pauses: 'moderate',
                tempo: 0.9
            },
            'encouragement': {
                pacing: 'gentle',
                rhythm: 'flowing',
                pauses: 'comfortable',
                tempo: 1.0
            }
        };

        const baseSignature = signatures[mood] || {
            pacing: 'balanced',
            rhythm: 'natural',
            pauses: 'normal',
            tempo: 1.0
        };

        // Adjust for urgency
        if (urgency === 'high') {
            baseSignature.tempo *= 1.2;
            baseSignature.pauses = 'minimal';
        } else if (urgency === 'low') {
            baseSignature.tempo *= 0.8;
            baseSignature.pauses = 'extended';
        }

        // Adjust for complexity
        if (complexity === 'high') {
            baseSignature.tempo *= 0.9;
            baseSignature.pauses = 'thinking';
        }

        return baseSignature;
    }

    /**
     * Apply visual sensory lock to UI
     * @param {Object} visualLock - The visual lock configuration
     * @param {string} userId - The user ID
     */
    async applyVisualLock(visualLock, userId) {
        try {
            // Apply visual sensory lock to UI
            // This integrates with the visual rendering system

            console.log(`Applying visual lock for user ${userId}:`, visualLock);

            // Extract lock parameters
            const {
                opacity = 0.7,
                blur = 5,
                grayscale = 0.5,
                duration = 3000,
                easing = 'ease-in-out'
            } = visualLock;

            // Create CSS filter string
            const filterValue = `blur(${blur}px) grayscale(${grayscale * 100}%) opacity(${opacity})`;

            // Apply to document body or specific elements
            if (typeof document !== 'undefined') {
                const body = document.body;
                const originalFilter = body.style.filter || '';

                // Apply the visual lock
                body.style.filter = filterValue;
                body.style.transition = `filter ${duration}ms ${easing}`;

                // Store original state for restoration
                body.dataset.originalFilter = originalFilter;
                body.dataset.visualLockActive = 'true';

                // Auto-remove after duration
                setTimeout(() => {
                    this.removeVisualLock(userId);
                }, duration);
            }

            return { success: true, message: 'Visual lock applied successfully' };
        } catch (error) {
            console.error('Error applying visual lock:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove visual sensory lock from UI
     * @param {string} userId - The user ID
     */
    async removeVisualLock(userId) {
        try {
            console.log(`Removing visual lock for user ${userId}`);

            if (typeof document !== 'undefined') {
                const body = document.body;

                // Restore original filter
                const originalFilter = body.dataset.originalFilter || '';
                body.style.filter = originalFilter;
                body.style.transition = 'filter 500ms ease-out';

                // Clean up data attributes
                delete body.dataset.originalFilter;
                delete body.dataset.visualLockActive;
            }

            return { success: true, message: 'Visual lock removed successfully' };
        } catch (error) {
            console.error('Error removing visual lock:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Apply auditory sensory lock
     * @param {Object} auditoryLock - The auditory lock configuration
     * @param {string} userId - The user ID
     */
    async applyAuditoryLock(auditoryLock, userId) {
        try {
            // Apply auditory sensory lock
            // This integrates with the audio system

            console.log(`Applying auditory lock for user ${userId}:`, auditoryLock);

            // Extract lock parameters
            const {
                volume = 0.3,
                pitch = 0.8,
                reverb = 0.5,
                duration = 3000,
                fadeIn = 500,
                fadeOut = 500
            } = auditoryLock;

            // Store current audio state
            const audioState = {
                originalVolume: 1.0,
                originalPitch: 1.0,
                originalReverb: 0.0,
                lockStartTime: Date.now(),
                duration,
                fadeIn,
                fadeOut
            };

            // Apply audio modifications
            if (typeof window !== 'undefined' && window.AudioContext) {
                // Create audio context if needed
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                // Create gain node for volume control
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

                // Create filter node for pitch/reverb effects
                const filterNode = this.audioContext.createBiquadFilter();
                filterNode.type = 'lowpass';
                filterNode.frequency.setValueAtTime(pitch * 1000, this.audioContext.currentTime);

                // Create convolver for reverb effect
                const convolverNode = this.audioContext.createConvolver();
                // Note: In a full implementation, you'd load an impulse response for reverb
                // For now, we'll use a simple gain-based approximation
                const reverbGainNode = this.audioContext.createGain();
                reverbGainNode.gain.setValueAtTime(reverb, this.audioContext.currentTime);

                // Connect nodes: source -> gain -> filter -> convolver -> reverbGain -> destination
                gainNode.connect(filterNode);
                filterNode.connect(convolverNode);
                convolverNode.connect(reverbGainNode);
                reverbGainNode.connect(this.audioContext.destination);

                // Store for cleanup
                this.activeAuditoryLocks = this.activeAuditoryLocks || {};
                this.activeAuditoryLocks[userId] = {
                    gainNode,
                    filterNode,
                    convolverNode,
                    reverbGainNode,
                    audioState,
                    timeoutId: setTimeout(() => {
                        this.removeAuditoryLock(userId);
                    }, duration)
                };
            }

            return { success: true, message: 'Auditory lock applied successfully' };
        } catch (error) {
            console.error('Error applying auditory lock:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove auditory sensory lock
     * @param {string} userId - The user ID
     */
    async removeAuditoryLock(userId) {
        try {
            console.log(`Removing auditory lock for user ${userId}`);

            if (this.activeAuditoryLocks && this.activeAuditoryLocks[userId]) {
                const lockData = this.activeAuditoryLocks[userId];

                // Clear timeout
                if (lockData.timeoutId) {
                    clearTimeout(lockData.timeoutId);
                }

                // Disconnect audio nodes
                if (lockData.gainNode) {
                    lockData.gainNode.disconnect();
                }
                if (lockData.filterNode) {
                    lockData.filterNode.disconnect();
                }
                if (lockData.convolverNode) {
                    lockData.convolverNode.disconnect();
                }
                if (lockData.reverbGainNode) {
                    lockData.reverbGainNode.disconnect();
                }

                // Remove from active locks
                delete this.activeAuditoryLocks[userId];
            }

            return { success: true, message: 'Auditory lock removed successfully' };
        } catch (error) {
            console.error('Error removing auditory lock:', error);
            return { success: false, error: error.message };
        }
    }

    async applyHapticLock(hapticLock, userId) {
        // Apply haptic sensory lock (respecting accessibility)
        // This would integrate with the haptic feedback system
        console.log(`Applying haptic lock for user ${userId}:`, hapticLock);
    }

    async applyMicroGestures(gestures, userId) {
        // Apply micro-gestures to UI components
        // This would integrate with the animation system
        console.log(`Applying micro-gestures for user ${userId}:`, gestures);
    }

    async applyBlendedResonance(blendedResonance, userId) {
        // Apply blended resonance across all channels
        // This would integrate with the multi-modal system
        console.log(`Applying blended resonance for user ${userId}:`, blendedResonance);
    }

    async applyTemporalModifiers(modifiers, userId) {
        // Apply temporal modifiers to current resonance
        // This would integrate with the resonance system
        console.log(`Applying temporal modifiers for user ${userId}:`, modifiers);
    }

    async applySymbolicElements(affordances, userId) {
        // Apply symbolic affordances to UI
        // This would integrate with the visual system
        console.log(`Applying symbolic affordances for user ${userId}:`, affordances);
    }

    async primeEnvironment(sceneSetting, userId) {
        // Prime the environment before content delivery
        // This would integrate with the pre-delivery system
        console.log(`Priming environment for user ${userId}:`, sceneSetting);
    }

    async adjustDialoguePacing(timeSignature, userId) {
        // Adjust dialogue pacing based on time signature
        // This would integrate with the dialogue system
        console.log(`Adjusting dialogue pacing for user ${userId}:`, timeSignature);
    }

    blendGradients(primary, secondary, weight) {
        // Blend two CSS gradients based on weight (0-1)
        if (!primary || !secondary) return primary || secondary || '';

        // Parse gradient strings (simplified implementation)
        const primaryColors = this.parseGradientColors(primary);
        const secondaryColors = this.parseGradientColors(secondary);

        if (primaryColors.length === 0) return secondary;
        if (secondaryColors.length === 0) return primary;

        // Blend colors at corresponding positions
        const blendedColors = [];
        const maxLength = Math.max(primaryColors.length, secondaryColors.length);

        for (let i = 0; i < maxLength; i++) {
            const primaryColor = primaryColors[i] || primaryColors[primaryColors.length - 1];
            const secondaryColor = secondaryColors[i] || secondaryColors[secondaryColors.length - 1];

            const blendedColor = this.blendColors(primaryColor, secondaryColor, weight);
            blendedColors.push(blendedColor);
        }

        // Reconstruct gradient string
        return `linear-gradient(45deg, ${blendedColors.join(', ')})`;
    }

    blendColorPalettes(primary, secondary, weight) {
        // Blend two color palettes based on weight (0-1)
        if (!primary || !secondary) return primary || secondary || {};

        const blendedPalette = {};

        // Get all color keys from both palettes
        const allKeys = new Set([...Object.keys(primary), ...Object.keys(secondary)]);

        for (const key of allKeys) {
            const primaryColor = primary[key];
            const secondaryColor = secondary[key];

            if (primaryColor && secondaryColor) {
                // Blend both colors
                blendedPalette[key] = this.blendColors(primaryColor, secondaryColor, weight);
            } else {
                // Use whichever color exists
                blendedPalette[key] = primaryColor || secondaryColor;
            }
        }

        return blendedPalette;
    }

    /**
     * Helper method to parse colors from gradient string
     */
    parseGradientColors(gradientString) {
        // Simple parser for gradient colors (simplified implementation)
        const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g;
        return gradientString.match(colorRegex) || [];
    }

    /**
     * Helper method to blend two colors
     */
    blendColors(color1, color2, weight) {
        // Parse colors to RGB
        const rgb1 = this.parseColorToRgb(color1);
        const rgb2 = this.parseColorToRgb(color2);

        if (!rgb1 || !rgb2) return color1;

        // Blend RGB values
        const blendedRgb = {
            r: Math.round(rgb1.r * (1 - weight) + rgb2.r * weight),
            g: Math.round(rgb1.g * (1 - weight) + rgb2.g * weight),
            b: Math.round(rgb1.b * (1 - weight) + rgb2.b * weight)
        };

        return `rgb(${blendedRgb.r}, ${blendedRgb.g}, ${blendedRgb.b})`;
    }

    /**
     * Helper method to parse color to RGB
     */
    parseColorToRgb(color) {
        // Handle hex colors
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        }

        // Handle rgb/rgba colors
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }

        return null;
    }
}

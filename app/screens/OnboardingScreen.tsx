import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../../store/persona';
import { useMemoryStore } from '../../store/memory';
import { useDeviceStore } from '../../store/device';
import { useThemeStore } from '../../store/theme';
import EnhancedSallieAvatar from '../components/EnhancedSallieAvatar';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    avatarEmotion: string;
    options?: Array<{
        id: string;
        label: string;
        value: any;
    }>;
}

const onboardingSteps: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Sallie',
        subtitle: 'Your Personal AI Companion',
        description: 'Hi there! I\'m Sallie, your intelligent companion designed to help you navigate life\'s challenges with grace, wisdom, and a touch of tough love when needed.',
        avatarEmotion: 'happy',
    },
    {
        id: 'personality',
        title: 'Choose Your Sallie',
        subtitle: 'How would you like me to be?',
        description: 'I can adapt my personality to best support you. Choose the style that resonates with you most.',
        avatarEmotion: 'thoughtful',
        options: [
            {
                id: 'tough_love_soul_care',
                label: 'Tough Love & Soul Care',
                value: 'tough_love_soul_care',
            },
            {
                id: 'gentle_companion',
                label: 'Gentle Companion',
                value: 'gentle_companion',
            },
            {
                id: 'wise_mentor',
                label: 'Wise Mentor',
                value: 'wise_mentor',
            },
            {
                id: 'playful_friend',
                label: 'Playful Friend',
                value: 'playful_friend',
            },
        ],
    },
    {
        id: 'goals',
        title: 'What brings you here?',
        subtitle: 'Tell me about your goals',
        description: 'Understanding your intentions helps me provide better support and guidance.',
        avatarEmotion: 'curious',
        options: [
            {
                id: 'emotional_support',
                label: 'Emotional Support',
                value: 'emotional_support',
            },
            {
                id: 'personal_growth',
                label: 'Personal Growth',
                value: 'personal_growth',
            },
            {
                id: 'daily_companion',
                label: 'Daily Companion',
                value: 'daily_companion',
            },
            {
                id: 'problem_solving',
                label: 'Problem Solving',
                value: 'problem_solving',
            },
        ],
    },
    {
        id: 'privacy',
        title: 'Your Privacy Matters',
        subtitle: 'How we keep things safe',
        description: 'Your conversations and personal data are encrypted and stored securely. I learn from our interactions to better support you, but your privacy is always protected.',
        avatarEmotion: 'trustworthy',
    },
    {
        id: 'ready',
        title: 'Ready to Begin!',
        subtitle: 'Let\'s start this journey together',
        description: 'I\'m excited to get to know you and support you on your journey. Remember, I\'m here whenever you need me.',
        avatarEmotion: 'excited',
    },
];

export default function OnboardingScreen() {
    // Dynamic import for navigation to avoid CommonJS/ESM conflicts
    const [navigation, setNavigation] = useState<any>(null);

    useEffect(() => {
        const loadNavigation = async () => {
            try {
                const { useNavigation: navHook } = await import('@react-navigation/native');
                setNavigation(navHook());
            } catch (error) {
                console.warn('Failed to load navigation:', error);
            }
        };
        loadNavigation();
    }, []);

    const { setPersonality, setEmotion } = usePersonaStore();
    const { addEpisodic } = useMemoryStore();
    const { setOnboardingComplete } = useDeviceStore();
    const { currentTheme } = useThemeStore();

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
    const [isAnimating, setIsAnimating] = useState(false);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate step transitions
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: -20,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsAnimating(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsAnimating(false));
        });
    }, [currentStep]);

    const handleOptionSelect = (stepId: string, option: any) => {
        setSelectedOptions(prev => ({
            ...prev,
            [stepId]: option,
        }));
    };

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeOnboarding = () => {
        // Apply selected preferences
        if (selectedOptions.personality) {
            setPersonality(selectedOptions.personality.value);
        }

        // Set initial emotion
        setEmotion('excited', 0.7, 'onboarding_complete');

        // Record onboarding completion in memory
        addEpisodic({
            type: 'episodic',
            content: 'Completed onboarding process with Sallie AI companion',
            tags: ['onboarding', 'setup', 'first_interaction'],
            importance: 0.9,
            emotion: 'excited',
            confidence: 1.0,
            source: 'onboarding_screen',
            sha256: `onboarding_complete_${Date.now()}`,
        });

        // Mark onboarding as complete
        setOnboardingComplete(true);

        // Navigate to main app
        navigation?.navigate('HomeLauncher' as never);
    };

    const currentStepData = onboardingSteps[currentStep];
    const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />

            {/* Background Gradient */}
            <LinearGradient
                colors={currentTheme.gradients.background as any}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: currentTheme.colors.surface }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progress}%`,
                                    backgroundColor: currentTheme.colors.accent,
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: currentTheme.colors.textSecondary }]}>
                        {currentStep + 1} of {onboardingSteps.length}
                    </Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <EnhancedSallieAvatar
                            size={120}
                            animated={!isAnimating}
                            interactive={false}
                            showEmotionRing={true}
                            showPulse={currentStepData.avatarEmotion === 'excited'}
                        />
                    </View>

                    {/* Content Section */}
                    <View style={styles.contentSection}>
                        <Text style={[styles.title, { color: currentTheme.colors.text }]}>
                            {currentStepData.title}
                        </Text>
                        <Text style={[styles.subtitle, { color: currentTheme.colors.accent }]}>
                            {currentStepData.subtitle}
                        </Text>
                        <Text style={[styles.description, { color: currentTheme.colors.textSecondary }]}>
                            {currentStepData.description}
                        </Text>

                        {/* Options Section */}
                        {currentStepData.options && (
                            <View style={styles.optionsContainer}>
                                {currentStepData.options.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.optionButton,
                                            {
                                                backgroundColor: selectedOptions[currentStepData.id]?.id === option.id
                                                    ? currentTheme.colors.accent
                                                    : currentTheme.colors.surface,
                                                borderColor: currentTheme.colors.accent,
                                            },
                                        ]}
                                        onPress={() => handleOptionSelect(currentStepData.id, option)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: selectedOptions[currentStepData.id]?.id === option.id
                                                        ? currentTheme.colors.background
                                                        : currentTheme.colors.text,
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Navigation Buttons */}
                <View style={styles.navigationContainer}>
                    {currentStep > 0 && (
                        <TouchableOpacity
                            style={[styles.navButton, styles.backButton, { borderColor: currentTheme.colors.accent }]}
                            onPress={handlePrevious}
                        >
                            <Text style={[styles.navButtonText, { color: currentTheme.colors.accent }]}>
                                Back
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            styles.nextButton,
                            {
                                backgroundColor: currentTheme.colors.accent,
                                opacity: currentStepData.options && !selectedOptions[currentStepData.id] ? 0.5 : 1,
                            },
                        ]}
                        onPress={handleNext}
                        disabled={currentStepData.options && !selectedOptions[currentStepData.id]}
                    >
                        <Text style={[styles.nextButtonText, { color: currentTheme.colors.background }]}>
                            {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    contentSection: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        opacity: 0.9,
    },
    description: {
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.8,
    },
    optionsContainer: {
        marginTop: 20,
    },
    optionButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    navigationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 20,
    },
    navButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    backButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
    },
    nextButton: {
        flex: 2,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

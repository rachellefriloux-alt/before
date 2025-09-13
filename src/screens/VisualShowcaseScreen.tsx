/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Visual showcase screen for enhanced UI components
 * Got it, love.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch, Platform } from 'react-native';
import { EnhancedButton } from '../../components/EnhancedButton';
import { EnhancedCard } from '../../components/EnhancedCard';
import { EnhancedAvatar } from '../../components/EnhancedAvatar';
import ProgressBarAnimated from '../../components/ProgressBarAnimated';
import { ToastProvider, useToast } from '../../components/ToastNotification';
import { useTheme, ThemeType } from '../../components/ThemeSystem';
import { triggerHaptic } from '../../components/AnimationSystem';
import { getFontStyle } from '../../components/FontManager';

const VisualShowcaseScreen: React.FC = () => {
    const { theme, changeTheme, toggleDarkMode, themeType } = useTheme();
    const { show, success, info, warning, error } = useToast();
    const [progress, setProgress] = useState(25);

    // Dynamically update progress for demo
    const updateProgress = () => {
        setProgress(prevProgress => {
            const nextProgress = prevProgress + 25;
            if (nextProgress > 100) return 0;
            return nextProgress;
        });
        triggerHaptic('medium');
    };

    // Switch between themes for demo
    const handleThemeChange = () => {
        const themes: ThemeType[] = ['default', 'southernGrit', 'graceGrind', 'soulSweat'];
        const currentIndex = themes.indexOf(themeType);
        const nextIndex = (currentIndex + 1) % themes.length;
        changeTheme(themes[nextIndex]);
        triggerHaptic('success');
    };

    // Toast demonstration functions
    const showSuccessToast = () => {
        success('Success!', 'Operation completed successfully');
    };

    const showInfoToast = () => {
        info('Information', 'This is an informational message');
    };

    const showWarningToast = () => {
        warning('Warning!', 'Please be careful with this action');
    };

    const showErrorToast = () => {
        error('Error!', 'Something went wrong, please try again');
    };

    const showCustomToast = () => {
        show({
            message: 'Custom Toast',
            description: 'This is a custom toast with action button',
            type: 'custom',
            duration: 5000,
            action: {
                text: 'Action',
                onPress: () => triggerHaptic('success'),
            },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.pageTitle, { color: theme.colors.text.primary, ...getFontStyle(theme.type, 'bold') }]}>
                    Sallie AI Visual Showcase
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, ...getFontStyle(theme.type, 'medium') }]}>
                    Current Theme: {theme.name}
                </Text>

                <View style={styles.themeControls}>
                    <View style={styles.themeOption}>
                        <Text style={{ color: theme.colors.text.primary, ...getFontStyle(theme.type, 'regular') }}>Dark Mode</Text>
                        <Switch
                            value={theme.dark}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: theme.colors.elevation.level3, true: theme.colors.primaryVariant }}
                            thumbColor={Platform.OS === 'ios' ? undefined : theme.colors.primary}
                        />
                    </View>

                    <EnhancedButton
                        label="Change Theme"
                        variant="secondary"
                        size="medium"
                        onPress={handleThemeChange}
                        rightIcon="settings"
                        elevated
                        glow
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, ...getFontStyle(theme.type, 'medium') }]}>
                    Progress Bars
                </Text>

                <View style={styles.progressSection}>
                    <ProgressBarAnimated
                        progress={progress}
                        height={10}
                        color={theme.colors.primary}
                        backgroundColor={theme.colors.elevation.level2}
                    />

                    <View style={styles.progressButton}>
                        <EnhancedButton
                            label="Update Progress"
                            variant="primary"
                            onPress={updateProgress}
                            rightIcon="arrow-right"
                            haptic="medium"
                        />
                    </View>

                    <ProgressBarAnimated
                        progress={75}
                        height={6}
                        color={theme.colors.success}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, ...getFontStyle(theme.type, 'medium') }]}>
                    Button Styles
                </Text>

                <View style={styles.buttonGrid}>
                    <EnhancedButton
                        label="Primary"
                        variant="primary"
                        leftIcon="check"
                    />

                    <EnhancedButton
                        label="Secondary"
                        variant="secondary"
                    />

                    <EnhancedButton
                        label="Outline"
                        variant="outline"
                    />

                    <EnhancedButton
                        label="Ghost"
                        variant="ghost"
                    />

                    <EnhancedButton
                        label="Success"
                        variant="success"
                        rightIcon="check-circle"
                    />

                    <EnhancedButton
                        label="Warning"
                        variant="warning"
                        rightIcon="alert-triangle"
                    />

                    <EnhancedButton
                        label="Danger"
                        variant="danger"
                        rightIcon="x-circle"
                    />

                    <EnhancedButton
                        label="Glass"
                        variant="glass"
                        elevated
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, ...getFontStyle(theme.type, 'medium') }]}>
                    Avatar Components
                </Text>

                <View style={styles.avatarSection}>
                    <EnhancedAvatar
                        source={{ initial: 'SA' }}
                        size="large"
                        status="online"
                        glow
                    />

                    <EnhancedAvatar
                        source={{ icon: 'user' }}
                        size="large"
                        status="away"
                        ring
                        ringPulse
                    />

                    <EnhancedAvatar
                        source={{ gradient: [theme.colors.primary, theme.colors.secondary] }}
                        size="large"
                        status="busy"
                        glow
                    />

                    <EnhancedAvatar
                        source={{ initial: 'AI' }}
                        size="large"
                        status="offline"
                        ring
                        ringColor={theme.colors.success}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, ...getFontStyle(theme.type, 'medium') }]}>
                    Toast Notifications
                </Text>

                <View style={styles.toastSection}>
                    <EnhancedButton
                        label="Success Toast"
                        variant="success"
                        onPress={showSuccessToast}
                        leftIcon="check-circle"
                        style={styles.toastButton}
                    />

                    <EnhancedButton
                        label="Info Toast"
                        variant="primary"
                        onPress={showInfoToast}
                        leftIcon="info"
                        style={styles.toastButton}
                    />

                    <EnhancedButton
                        label="Warning Toast"
                        variant="warning"
                        onPress={showWarningToast}
                        leftIcon="alert-triangle"
                        style={styles.toastButton}
                    />

                    <EnhancedButton
                        label="Error Toast"
                        variant="danger"
                        onPress={showErrorToast}
                        leftIcon="alert-octagon"
                        style={styles.toastButton}
                    />

                    <EnhancedButton
                        label="Custom Toast"
                        variant="glass"
                        onPress={showCustomToast}
                        leftIcon="bell"
                        style={styles.toastButton}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary, ...getFontStyle(theme.type, 'medium') }]}>
                    Card Components
                </Text>

                <EnhancedCard
                    title="Standard Card"
                    subtitle="With title and subtitle"
                    style={styles.card}
                    elevation="medium"
                    icon="info"
                    actions={[
                        {
                            icon: 'more-horizontal',
                            onPress: () => triggerHaptic('light')
                        }
                    ]}
                >
                    <Text style={{ color: theme.colors.text.primary, ...getFontStyle(theme.type, 'regular') }}>
                        This is a standard card with title, subtitle, and an icon. Cards can contain any content and have various styling options.
                    </Text>
                </EnhancedCard>

                <EnhancedCard
                    title="Primary Card"
                    subtitle="With gradient background"
                    variant="primary"
                    gradient
                    glow
                    style={styles.card}
                    elevation="high"
                >
                    <Text style={{ color: theme.colors.onPrimary, ...getFontStyle(theme.type, 'regular') }}>
                        This card uses a primary color theme with gradient background and glow effect for emphasis.
                    </Text>

                    <View style={styles.cardButton}>
                        <EnhancedButton
                            label="Action"
                            variant="glass"
                            size="small"
                            onPress={() => triggerHaptic('success')}
                        />
                    </View>
                </EnhancedCard>

                <View style={styles.cardRow}>
                    <EnhancedCard
                        title="Interactive"
                        variant="subtle"
                        pressable
                        onPress={() => triggerHaptic('medium')}
                        style={styles.halfCard}
                        elevation="low"
                    >
                        <Text style={{ color: theme.colors.text.primary, ...getFontStyle(theme.type, 'regular') }}>
                            Tap this card to trigger haptic feedback
                        </Text>
                    </EnhancedCard>

                    <EnhancedCard
                        title="Glass Effect"
                        variant="glass"
                        style={styles.halfCard}
                        border
                        elevation="medium"
                    >
                        <Text style={{ color: theme.colors.text.primary, ...getFontStyle(theme.type, 'regular') }}>
                            Translucent card with blur effect
                        </Text>
                    </EnhancedCard>
                </View>

                <EnhancedButton
                    label="Back to Home"
                    variant="primary"
                    fullWidth
                    size="large"
                    elevated
                    glow
                    style={styles.homeButton}
                    onPress={() => { }}
                    leftIcon="home"
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    pageTitle: {
        fontSize: 28,
        marginBottom: 16,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        marginTop: 24,
        marginBottom: 12,
    },
    themeControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressSection: {
        marginVertical: 16,
        gap: 16,
    },
    progressButton: {
        alignSelf: 'flex-end',
        marginVertical: 8,
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginVertical: 16,
    },
    avatarSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    toastSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    toastButton: {
        flex: 1,
        minWidth: 120,
    },
    card: {
        marginVertical: 8,
    },
    cardButton: {
        alignSelf: 'flex-end',
        marginTop: 16,
    },
    cardRow: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 8,
    },
    halfCard: {
        flex: 1,
    },
    homeButton: {
        marginTop: 32,
        marginBottom: 16,
    },
});

export default VisualShowcaseScreen;

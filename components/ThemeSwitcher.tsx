/*
 * Sallie AI Theme Switcher Component
 * Interactive theme selection with preview
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Animated,
} from 'react-native';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ThemeOption {
    type: string;
    name: string;
    description: string;
    preview: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

const themeOptions: ThemeOption[] = [
    {
        type: 'default',
        name: 'Default',
        description: 'Clean and modern',
        preview: { primary: '#512DA8', secondary: '#FF5722', background: '#FFFFFF', text: '#212121' },
    },
    {
        type: 'southernGrit',
        name: 'Southern Grit',
        description: 'Bold and earthy',
        preview: { primary: '#8B4513', secondary: '#F15A29', background: '#F5F1E9', text: '#33281E' },
    },
    {
        type: 'graceGrind',
        name: 'Grace Grind',
        description: 'Elegant and refined',
        preview: { primary: '#6A0DAD', secondary: '#00CED1', background: '#FFFFFF', text: '#212121' },
    },
    {
        type: 'soulSweat',
        name: 'Soul Sweat',
        description: 'Dark and intense',
        preview: { primary: '#FF6B6B', secondary: '#FFD700', background: '#1A1A1A', text: '#E0E0E0' },
    },
    {
        type: 'mysticForest',
        name: 'Mystic Forest',
        description: 'Deep greens and mystical',
        preview: { primary: '#2E8B57', secondary: '#8A2BE2', background: '#F0F8F0', text: '#1C3A2E' },
    },
    {
        type: 'cyberNeon',
        name: 'Cyber Neon',
        description: 'Vibrant neons and dark',
        preview: { primary: '#00FF41', secondary: '#FF0080', background: '#0A0A0A', text: '#E0E0E0' },
    },
    {
        type: 'desertOasis',
        name: 'Desert Oasis',
        description: 'Warm sands and cool waters',
        preview: { primary: '#D2691E', secondary: '#4682B4', background: '#FDF5E6', text: '#8B4513' },
    },
    {
        type: 'aurora',
        name: 'Aurora Borealis',
        description: 'Northern lights inspired',
        preview: { primary: '#00FF7F', secondary: '#FF1493', background: '#0F0F23', text: '#E0E0E0' },
    },
];

interface ThemeSwitcherProps {
    onThemeChange?: (themeType: string) => void;
    style?: any;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
    onThemeChange,
    style,
}) => {
    const { theme, changeTheme, themeType } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState<string>(themeType);

    const handleThemeSelect = (themeType: string) => {
        setSelectedTheme(themeType);
        changeTheme(themeType as any);
        onThemeChange?.(themeType);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.light,
        },
        title: {
            ...getFontStyle(theme.type, 'bold'),
            fontSize: theme.typography.sizes.h2,
            color: theme.colors.text.primary,
            textAlign: 'center',
        },
        subtitle: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xs,
        },
        scrollContainer: {
            padding: theme.spacing.m,
        },
        themeGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        themeCard: {
            width: (width - theme.spacing.m * 3) / 2,
            marginBottom: theme.spacing.m,
            borderRadius: theme.borderRadius.medium,
            overflow: 'hidden',
            elevation: 2,
            shadowColor: theme.colors.text.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        themePreview: {
            height: 80,
            padding: theme.spacing.s,
            justifyContent: 'space-between',
        },
        themeInfo: {
            padding: theme.spacing.s,
            backgroundColor: theme.colors.surface,
        },
        themeName: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.subtitle,
            color: theme.colors.text.primary,
        },
        themeDescription: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.xs,
        },
        selectedIndicator: {
            position: 'absolute',
            top: theme.spacing.xs,
            right: theme.spacing.xs,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkmark: {
            color: theme.colors.onPrimary,
            fontSize: 12,
            fontWeight: 'bold',
        },
        previewButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: theme.borderRadius.small,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            alignSelf: 'flex-start',
        },
        previewText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.caption,
            color: 'white',
        },
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose Theme</Text>
                <Text style={styles.subtitle}>Select a theme that resonates with your soul</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.themeGrid}>
                    {themeOptions.map((option) => {
                        const isSelected = selectedTheme === option.type;
                        const pressAnimation = usePressAnimation({
                            scale: 0.98,
                            haptic: true,
                        });

                        return (
                            <Animated.View key={option.type} style={pressAnimation.style}>
                                <TouchableOpacity
                                    style={[
                                        styles.themeCard,
                                        isSelected && {
                                            borderWidth: 2,
                                            borderColor: theme.colors.primary,
                                        },
                                    ]}
                                    onPress={() => handleThemeSelect(option.type)}
                                >
                                    <LinearGradient
                                        colors={[option.preview.primary, option.preview.secondary]}
                                        style={styles.themePreview}
                                    >
                                        <View style={styles.previewButton}>
                                            <Text style={styles.previewText}>Button</Text>
                                        </View>
                                        <Text
                                            style={{
                                                ...getFontStyle(theme.type, 'regular'),
                                                color: 'white',
                                                fontSize: theme.typography.sizes.caption,
                                            }}
                                        >
                                            Sample Text
                                        </Text>
                                    </LinearGradient>

                                    <View style={styles.themeInfo}>
                                        <Text style={styles.themeName}>{option.name}</Text>
                                        <Text style={styles.themeDescription}>{option.description}</Text>
                                    </View>

                                    {isSelected && (
                                        <View style={styles.selectedIndicator}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

export default ThemeSwitcher;

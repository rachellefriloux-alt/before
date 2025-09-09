import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ViewStyle,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useThemeStore } from '../store/theme';

const { width } = Dimensions.get('window');

export type CardVariant =
    | 'default'
    | 'elevated'
    | 'outlined'
    | 'glass'
    | 'gradient'
    | 'neon'
    | 'minimal'
    | 'interactive';

export type CardElevation = 0 | 1 | 2 | 3 | 4 | 5;

interface EnhancedCardProps {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    variant?: CardVariant;
    elevation?: CardElevation;
    animated?: boolean;
    interactive?: boolean;
    fullWidth?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    onPress?: () => void;
    onLongPress?: () => void;
    style?: ViewStyle;
    headerStyle?: ViewStyle;
    contentStyle?: ViewStyle;
}

export function EnhancedCard({
    children,
    title,
    subtitle,
    variant = 'default',
    elevation = 1,
    animated = true,
    interactive = false,
    fullWidth = false,
    padding = 'md',
    margin = 'none',
    borderRadius = 'md',
    onPress,
    onLongPress,
    style,
    headerStyle,
    contentStyle,
}: EnhancedCardProps) {
    const { currentTheme } = useThemeStore();

    const scaleAnimation = useRef(new Animated.Value(1)).current;
    const opacityAnimation = useRef(new Animated.Value(1)).current;
    const glowAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated && variant === 'neon') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnimation, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        }
    }, [animated, variant, glowAnimation]);

    const handlePressIn = () => {
        if (animated && interactive) {
            Animated.spring(scaleAnimation, {
                toValue: 0.98,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (animated && interactive) {
            Animated.spring(scaleAnimation, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    };

    const getCardStyles = (): ViewStyle => {
        const baseStyles: ViewStyle = {
            ...getPaddingStyles(),
            ...getMarginStyles(),
            ...getBorderRadiusStyles(),
            ...getElevationStyles(),
            ...(fullWidth && { width: width - 32 }),
        };

        const variantStyles = getVariantStyles();
        return { ...baseStyles, ...variantStyles, ...style };
    };

    const getPaddingStyles = (): ViewStyle => {
        switch (padding) {
            case 'none':
                return { padding: 0 };
            case 'sm':
                return { padding: 8 };
            case 'md':
                return { padding: 16 };
            case 'lg':
                return { padding: 24 };
            case 'xl':
                return { padding: 32 };
            default:
                return { padding: 16 };
        }
    };

    const getMarginStyles = (): ViewStyle => {
        switch (margin) {
            case 'none':
                return { margin: 0 };
            case 'sm':
                return { margin: 4 };
            case 'md':
                return { margin: 8 };
            case 'lg':
                return { margin: 16 };
            case 'xl':
                return { margin: 24 };
            default:
                return { margin: 0 };
        }
    };

    const getBorderRadiusStyles = (): ViewStyle => {
        switch (borderRadius) {
            case 'none':
                return { borderRadius: 0 };
            case 'sm':
                return { borderRadius: 4 };
            case 'md':
                return { borderRadius: 8 };
            case 'lg':
                return { borderRadius: 12 };
            case 'xl':
                return { borderRadius: 16 };
            default:
                return { borderRadius: 8 };
        }
    };

    const getElevationStyles = (): ViewStyle => {
        const isDark = currentTheme.name.toLowerCase().includes('dark');

        switch (elevation) {
            case 0:
                return {};
            case 1:
                return {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isDark ? 0.3 : 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                };
            case 2:
                return {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.4 : 0.25,
                    shadowRadius: 4,
                    elevation: 4,
                };
            case 3:
                return {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.5 : 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                };
            case 4:
                return {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isDark ? 0.6 : 0.35,
                    shadowRadius: 12,
                    elevation: 12,
                };
            case 5:
                return {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDark ? 0.7 : 0.4,
                    shadowRadius: 16,
                    elevation: 16,
                };
            default:
                return {
                    shadowColor: isDark ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.4 : 0.25,
                    shadowRadius: 4,
                    elevation: 4,
                };
        }
    };

    const getVariantStyles = (): ViewStyle => {
        const isDark = currentTheme.name.toLowerCase().includes('dark');

        switch (variant) {
            case 'default':
                return {
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                    borderWidth: 0,
                };
            case 'elevated':
                return {
                    backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
                    borderWidth: 0,
                };
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: isDark ? '#333' : '#e0e0e0',
                };
            case 'glass':
                return {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                };
            case 'gradient':
                return {
                    borderWidth: 0,
                };
            case 'neon':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: '#FFD700',
                    shadowColor: '#FFD700',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: glowAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                    }),
                    shadowRadius: 10,
                    elevation: 10,
                };
            case 'minimal':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    padding: 0,
                    margin: 0,
                };
            case 'interactive':
                return {
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                    borderWidth: 0,
                };
            default:
                return {
                    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                    borderWidth: 0,
                };
        }
    };

    const renderHeader = () => {
        if (!title && !subtitle) return null;

        return (
            <View style={[styles.header, headerStyle]}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        );
    };

    const renderContent = () => {
        if (!children) return null;

        return (
            <View style={[styles.content, contentStyle]}>
                {children}
            </View>
        );
    };

    const cardContent = (
        <Animated.View
            style={[
                getCardStyles(),
                {
                    transform: [{ scale: scaleAnimation }],
                    opacity: opacityAnimation,
                },
            ]}
        >
            {renderHeader()}
            {renderContent()}
        </Animated.View>
    );

    if (variant === 'gradient') {
        const content = (
            <View style={getCardStyles()}>
                {renderHeader()}
                {renderContent()}
            </View>
        );

        return (
            <TouchableOpacity
                onPress={interactive ? onPress : undefined}
                onLongPress={interactive ? onLongPress : undefined}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={interactive ? 0.8 : 1}
            >
                <LinearGradient
                    colors={currentTheme.name.toLowerCase().includes('dark') ? ['#FFD700', '#FFA500'] : ['#1a1a1a', '#333']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={getCardStyles()}
                >
                    {renderHeader()}
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (interactive) {
        return (
            <TouchableOpacity
                onPress={onPress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
            >
                {cardContent}
            </TouchableOpacity>
        );
    }

    return cardContent;
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'SpaceMono',
        color: '#f5f5f5',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    content: {
        flex: 1,
    },
});

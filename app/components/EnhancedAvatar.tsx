import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Image,
    ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/theme';

export type AvatarVariant =
    | 'default'
    | 'gradient'
    | 'neon'
    | 'glass'
    | 'minimal'
    | 'status';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'invisible';

interface EnhancedAvatarProps {
    source?: { uri: string } | number;
    name?: string;
    size?: AvatarSize;
    variant?: AvatarVariant;
    status?: StatusType;
    animated?: boolean;
    interactive?: boolean;
    showInitials?: boolean;
    borderWidth?: number;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: ViewStyle;
}

export function EnhancedAvatar({
    source,
    name = '',
    size = 'md',
    variant = 'default',
    status,
    animated = true,
    interactive = false,
    showInitials = true,
    borderWidth = 0,
    onPress,
    onLongPress,
    style,
}: EnhancedAvatarProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const scaleAnimation = useRef(new Animated.Value(1)).current;
    const rotateAnimation = useRef(new Animated.Value(0)).current;
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
                toValue: 0.9,
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

    const getSizeStyles = () => {
        switch (size) {
            case 'xs':
                return { width: 24, height: 24, borderRadius: 12 };
            case 'sm':
                return { width: 32, height: 32, borderRadius: 16 };
            case 'md':
                return { width: 48, height: 48, borderRadius: 24 };
            case 'lg':
                return { width: 64, height: 64, borderRadius: 32 };
            case 'xl':
                return { width: 80, height: 80, borderRadius: 40 };
            case 'xxl':
                return { width: 96, height: 96, borderRadius: 48 };
            default:
                return { width: 48, height: 48, borderRadius: 24 };
        }
    };

    const getAvatarStyles = (): ViewStyle => {
        const baseStyles = {
            ...getSizeStyles(),
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            borderWidth,
            borderColor: isDark ? '#FFD700' : '#1a1a1a',
        };

        switch (variant) {
            case 'default':
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? '#333' : '#e0e0e0',
                };
            case 'gradient':
                return {
                    ...baseStyles,
                    borderWidth: 0,
                };
            case 'neon':
                return {
                    ...baseStyles,
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
            case 'glass':
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                };
            case 'minimal':
                return {
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
            case 'status':
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? '#333' : '#e0e0e0',
                };
            default:
                return {
                    ...baseStyles,
                    backgroundColor: isDark ? '#333' : '#e0e0e0',
                };
        }
    };

    const getInitials = () => {
        if (!name || !showInitials) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const getTextSize = () => {
        switch (size) {
            case 'xs':
            case 'sm':
                return 10;
            case 'md':
                return 14;
            case 'lg':
                return 18;
            case 'xl':
                return 22;
            case 'xxl':
                return 26;
            default:
                return 14;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'online':
                return '#10B981';
            case 'away':
                return '#F59E0B';
            case 'busy':
                return '#EF4444';
            case 'invisible':
                return '#6B7280';
            case 'offline':
            default:
                return '#6B7280';
        }
    };

    const renderContent = () => {
        if (source) {
            return (
                <Image
                    source={source}
                    style={getSizeStyles()}
                    resizeMode="cover"
                />
            );
        }

        if (showInitials && name) {
            return (
                <Text style={[styles.initialsText, { fontSize: getTextSize() }]}>
                    {getInitials()}
                </Text>
            );
        }

        return null;
    };

    const renderStatusIndicator = () => {
        if (!status || variant !== 'status') return null;

        const sizeStyles = getSizeStyles();
        const indicatorSize = Math.max(8, sizeStyles.width * 0.2);

        return (
            <View
                style={[
                    styles.statusIndicator,
                    {
                        width: indicatorSize,
                        height: indicatorSize,
                        backgroundColor: getStatusColor(),
                        borderColor: isDark ? '#1a1a1a' : '#ffffff',
                    },
                ]}
            />
        );
    };

    const avatarContent = (
        <Animated.View
            style={[
                getAvatarStyles(),
                {
                    transform: [{ scale: scaleAnimation }],
                },
                style,
            ]}
        >
            {renderContent()}
            {renderStatusIndicator()}
        </Animated.View>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={interactive ? onPress : undefined}
                onLongPress={interactive ? onLongPress : undefined}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={interactive ? 0.8 : 1}
            >
                <LinearGradient
                    colors={isDark ? ['#FFD700', '#FFA500'] : ['#1a1a1a', '#333']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={getAvatarStyles()}
                >
                    {renderContent()}
                    {renderStatusIndicator()}
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
                {avatarContent}
            </TouchableOpacity>
        );
    }

    return avatarContent;
}

const styles = StyleSheet.create({
    initialsText: {
        color: '#f5f5f5',
        fontWeight: '600',
        fontFamily: 'SpaceMono',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderRadius: 50,
        borderWidth: 2,
    },
});

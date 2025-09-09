/*
 * Sallie AI Enhanced Modal Component
 * Advanced modal with animations, backdrop, and theming
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal as RNModal,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
    Animated,
    Dimensions,
    PanResponder,
    GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type ModalPosition = 'center' | 'bottom' | 'top';
export type ModalAnimation = 'fade' | 'slide' | 'scale' | 'bounce';

interface EnhancedModalProps {
    /** Whether modal is visible */
    visible: boolean;
    /** Modal close handler */
    onClose?: () => void;
    /** Modal title */
    title?: string;
    /** Modal content */
    children?: React.ReactNode;
    /** Modal size */
    size?: ModalSize;
    /** Modal position */
    position?: ModalPosition;
    /** Modal animation type */
    animation?: ModalAnimation;
    /** Whether modal can be dismissed by backdrop press */
    dismissible?: boolean;
    /** Whether to show close button */
    showCloseButton?: boolean;
    /** Custom close button icon */
    closeIcon?: keyof typeof Feather.glyphMap;
    /** Whether modal has backdrop blur */
    blurBackdrop?: boolean;
    /** Backdrop opacity */
    backdropOpacity?: number;
    /** Custom modal style */
    style?: StyleProp<ViewStyle>;
    /** Custom content style */
    contentStyle?: StyleProp<ViewStyle>;
    /** Test ID */
    testID?: string;
}

const EnhancedModal: React.FC<EnhancedModalProps> = ({
    visible,
    onClose,
    title,
    children,
    size = 'medium',
    position = 'center',
    animation = 'fade',
    dismissible = true,
    showCloseButton = true,
    closeIcon = 'x',
    blurBackdrop = true,
    backdropOpacity = 0.5,
    style,
    contentStyle,
    testID,
}) => {
    const { theme } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show modal
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }),
                position === 'bottom'
                    ? Animated.spring(slideAnim, {
                        toValue: 0,
                        tension: 65,
                        friction: 8,
                        useNativeDriver: false,
                    })
                    : Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 65,
                        friction: 8,
                        useNativeDriver: false,
                    }),
            ]).start();
        } else {
            // Hide modal
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
                position === 'bottom'
                    ? Animated.timing(slideAnim, {
                        toValue: SCREEN_HEIGHT,
                        duration: 200,
                        useNativeDriver: false,
                    })
                    : Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 200,
                        useNativeDriver: false,
                    }),
            ]).start();
        }
    }, [visible, position]);

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'small':
                return {
                    width: '80%',
                    maxWidth: 320,
                    minHeight: 200,
                };
            case 'large':
                return {
                    width: '90%',
                    maxWidth: 600,
                    minHeight: 400,
                };
            case 'fullscreen':
                return {
                    width: '100%',
                    height: '100%',
                };
            default: // medium
                return {
                    width: '85%',
                    maxWidth: 400,
                    minHeight: 300,
                };
        }
    };

    const getPositionStyles = (): ViewStyle => {
        switch (position) {
            case 'top':
                return {
                    justifyContent: 'flex-start',
                    paddingTop: 60,
                };
            case 'bottom':
                return {
                    justifyContent: 'flex-end',
                    paddingBottom: 0,
                };
            default: // center
                return {
                    justifyContent: 'center',
                    alignItems: 'center',
                };
        }
    };

    const getAnimationStyles = () => {
        switch (animation) {
            case 'slide':
                return position === 'bottom'
                    ? { transform: [{ translateY: slideAnim }] }
                    : { opacity: fadeAnim };
            case 'scale':
                return {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                };
            case 'bounce':
                return {
                    opacity: fadeAnim,
                    transform: [
                        {
                            scale: scaleAnim.interpolate({
                                inputRange: [0.8, 1],
                                outputRange: [0.8, 1],
                            }),
                        },
                    ],
                };
            default: // fade
                return { opacity: fadeAnim };
        }
    };

    const sizeStyles = getSizeStyles();
    const positionStyles = getPositionStyles();
    const animationStyles = getAnimationStyles();

    const handleBackdropPress = () => {
        if (dismissible && onClose) {
            onClose();
        }
    };

    const handleClosePress = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClosePress}
            testID={testID}
        >
            <View style={styles.overlay}>
                {/* Backdrop */}
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: backdropAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, backdropOpacity],
                            }),
                        },
                    ]}
                >
                    {blurBackdrop ? (
                        <BlurView intensity={20} style={styles.blurView}>
                            <TouchableOpacity
                                style={styles.backdropTouchable}
                                onPress={handleBackdropPress}
                                activeOpacity={1}
                            />
                        </BlurView>
                    ) : (
                        <TouchableOpacity
                            style={styles.backdropTouchable}
                            onPress={handleBackdropPress}
                            activeOpacity={1}
                        />
                    )}
                </Animated.View>

                {/* Modal Content */}
                <Animated.View
                    style={[
                        styles.modalContainer,
                        positionStyles,
                        animationStyles,
                    ]}
                >
                    <View
                        style={[
                            styles.modalContent,
                            sizeStyles,
                            position === 'bottom' && styles.bottomModal,
                            style,
                        ]}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <View style={styles.header}>
                                {title && (
                                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                                        {title}
                                    </Text>
                                )}
                                {showCloseButton && (
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={handleClosePress}
                                    >
                                        <Feather
                                            name={closeIcon}
                                            size={24}
                                            color={theme.colors.text.secondary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Content */}
                        <View style={[styles.content, contentStyle]}>
                            {children}
                        </View>
                    </View>
                </Animated.View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        position: 'relative',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },
    blurView: {
        flex: 1,
    },
    backdropTouchable: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        position: 'relative',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        margin: 20,
    },
    bottomModal: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
        marginTop: 'auto',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    title: {
        ...getFontStyle('SpaceMono', 'bold'),
        fontSize: 18,
        flex: 1,
    },
    closeButton: {
        padding: 4,
        marginLeft: 16,
    },
    content: {
        padding: 20,
        flex: 1,
    },
});

export { EnhancedModal };

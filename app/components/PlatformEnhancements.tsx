import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { LinearGradient } from 'react-native-linear-gradient';
import { useThemeStore } from '../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

const { width, height } = Dimensions.get('window');

interface PlatformFeature {
    id: string;
    name: string;
    description: string;
    platform: 'mobile' | 'desktop' | 'both';
    status: 'enabled' | 'disabled' | 'partial';
    icon: string;
}

interface GestureDemo {
    id: string;
    name: string;
    description: string;
    gesture: string;
    action: () => void;
}

export function PlatformEnhancements() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [platformFeatures, setPlatformFeatures] = useState<PlatformFeature[]>([]);
    const [gestureDemos, setGestureDemos] = useState<GestureDemo[]>([]);
    const [gestureLog, setGestureLog] = useState<string[]>([]);
    const [desktopMode, setDesktopMode] = useState(false);
    const [gestureEnabled, setGestureEnabled] = useState(true);

    const panRef = useRef(null);
    const lastGestureTime = useRef(0);

    useEffect(() => {
        initializePlatformFeatures();
        initializeGestureDemos();
    }, []);

    const initializePlatformFeatures = () => {
        const features: PlatformFeature[] = [
            {
                id: '1',
                name: 'Desktop Compatibility',
                description: 'Optimized layout and controls for desktop environments',
                platform: 'desktop',
                status: 'disabled',
                icon: '🖥️',
            },
            {
                id: '2',
                name: 'Mobile Gestures',
                description: 'Advanced touch gestures for mobile navigation',
                platform: 'mobile',
                status: 'enabled',
                icon: '👆',
            },
            {
                id: '3',
                name: 'Keyboard Shortcuts',
                description: 'Keyboard navigation and shortcuts for power users',
                platform: 'both',
                status: 'partial',
                icon: '⌨️',
            },
            {
                id: '4',
                name: 'Multi-window Support',
                description: 'Support for multiple windows and split-screen',
                platform: 'desktop',
                status: 'disabled',
                icon: '🪟',
            },
            {
                id: '5',
                name: 'Touch Feedback',
                description: 'Haptic feedback and visual touch responses',
                platform: 'mobile',
                status: 'enabled',
                icon: '📳',
            },
            {
                id: '6',
                name: 'Responsive Design',
                description: 'Adaptive layout for different screen sizes',
                platform: 'both',
                status: 'enabled',
                icon: '📱',
            },
        ];
        setPlatformFeatures(features);
    };

    const initializeGestureDemos = () => {
        const demos: GestureDemo[] = [
            {
                id: '1',
                name: 'Swipe Right',
                description: 'Navigate to previous screen',
                gesture: 'Swipe from left edge to right',
                action: () => logGesture('Swipe Right detected'),
            },
            {
                id: '2',
                name: 'Swipe Left',
                description: 'Navigate to next screen',
                gesture: 'Swipe from right edge to left',
                action: () => logGesture('Swipe Left detected'),
            },
            {
                id: '3',
                name: 'Swipe Up',
                description: 'Open quick actions menu',
                gesture: 'Swipe from bottom edge up',
                action: () => logGesture('Swipe Up detected'),
            },
            {
                id: '4',
                name: 'Swipe Down',
                description: 'Refresh content',
                gesture: 'Swipe from top edge down',
                action: () => logGesture('Swipe Down detected'),
            },
            {
                id: '5',
                name: 'Double Tap',
                description: 'Toggle fullscreen mode',
                gesture: 'Tap twice quickly',
                action: () => logGesture('Double Tap detected'),
            },
            {
                id: '6',
                name: 'Long Press',
                description: 'Show context menu',
                gesture: 'Press and hold for 1 second',
                action: () => logGesture('Long Press detected'),
            },
        ];
        setGestureDemos(demos);
    };

    const logGesture = (gesture: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setGestureLog(prev => [`${timestamp}: ${gesture}`, ...prev.slice(0, 9)]);
    };

    const toggleDesktopMode = () => {
        setDesktopMode(!desktopMode);
        updatePlatformFeature('1', desktopMode ? 'disabled' : 'enabled');
        Alert.alert(
            'Desktop Mode',
            desktopMode ? 'Desktop mode disabled' : 'Desktop mode enabled'
        );
    };

    const toggleGestureSupport = () => {
        setGestureEnabled(!gestureEnabled);
        updatePlatformFeature('2', gestureEnabled ? 'disabled' : 'enabled');
        Alert.alert(
            'Gesture Support',
            gestureEnabled ? 'Gesture support disabled' : 'Gesture support enabled'
        );
    };

    const updatePlatformFeature = (id: string, status: 'enabled' | 'disabled' | 'partial') => {
        setPlatformFeatures(prev =>
            prev.map(feature =>
                feature.id === id ? { ...feature, status } : feature
            )
        );
    };

    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        const { translationX, translationY } = event.nativeEvent;
        const now = Date.now();

        // Throttle gestures to prevent spam
        if (now - lastGestureTime.current < 500) return;

        // Detect swipe direction
        const threshold = 50;
        if (Math.abs(translationX) > Math.abs(translationY)) {
            if (translationX > threshold) {
                logGesture('Swipe Right detected');
                lastGestureTime.current = now;
            } else if (translationX < -threshold) {
                logGesture('Swipe Left detected');
                lastGestureTime.current = now;
            }
        } else {
            if (translationY > threshold) {
                logGesture('Swipe Down detected');
                lastGestureTime.current = now;
            } else if (translationY < -threshold) {
                logGesture('Swipe Up detected');
                lastGestureTime.current = now;
            }
        }
    };

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
        if (event.nativeEvent.state === State.END) {
            // Gesture ended
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'enabled': return '#10B981';
            case 'disabled': return '#EF4444';
            case 'partial': return '#F59E0B';
            default: return '#888';
        }
    };

    const renderPlatformFeatures = () => (
        <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Platform Features</Text>
            {platformFeatures.map(feature => (
                <EnhancedCard key={feature.id} variant="glass" style={styles.featureCard}>
                    <View style={styles.featureHeader}>
                        <View style={styles.featureInfo}>
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureName}>{feature.name}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(feature.status) }
                        ]}>
                            <Text style={styles.statusText}>{feature.status}</Text>
                        </View>
                    </View>
                    <Text style={styles.platformText}>
                        Platform: {feature.platform === 'both' ? 'Mobile & Desktop' : feature.platform}
                    </Text>
                </EnhancedCard>
            ))}
        </View>
    );

    const renderGestureDemos = () => (
        <View style={styles.gestureContainer}>
            <Text style={styles.sectionTitle}>Gesture Demonstrations</Text>
            {gestureDemos.map(demo => (
                <EnhancedCard key={demo.id} variant="glass" style={styles.gestureCard}>
                    <View style={styles.gestureHeader}>
                        <Text style={styles.gestureName}>{demo.name}</Text>
                        <Text style={styles.gestureIcon}>👆</Text>
                    </View>
                    <Text style={styles.gestureDescription}>{demo.description}</Text>
                    <Text style={styles.gestureInstruction}>{demo.gesture}</Text>
                    <EnhancedButton
                        title="Test Gesture"
                        variant="outline"
                        onPress={demo.action}
                        style={styles.testButton}
                    />
                </EnhancedCard>
            ))}
        </View>
    );

    const renderGestureLog = () => (
        <View style={styles.logContainer}>
            <Text style={styles.sectionTitle}>Gesture Log</Text>
            <ScrollView style={styles.logScroll}>
                {gestureLog.length === 0 ? (
                    <Text style={styles.emptyLog}>No gestures detected yet</Text>
                ) : (
                    gestureLog.map((entry, index) => (
                        <Text key={index} style={styles.logEntry}>
                            {entry}
                        </Text>
                    ))
                )}
            </ScrollView>
        </View>
    );

    const renderControls = () => (
        <View style={styles.controlsContainer}>
            <Text style={styles.sectionTitle}>Platform Controls</Text>

            <View style={styles.controlRow}>
                <EnhancedButton
                    title={desktopMode ? "Disable Desktop Mode" : "Enable Desktop Mode"}
                    variant={desktopMode ? "primary" : "outline"}
                    onPress={toggleDesktopMode}
                    style={styles.controlButton}
                />
                <EnhancedButton
                    title={gestureEnabled ? "Disable Gestures" : "Enable Gestures"}
                    variant={gestureEnabled ? "primary" : "outline"}
                    onPress={toggleGestureSupport}
                    style={styles.controlButton}
                />
            </View>

            <EnhancedButton
                title="Clear Gesture Log"
                variant="outline"
                onPress={() => setGestureLog([])}
                style={styles.clearButton}
            />
        </View>
    );

    return (
        <PanGestureHandler
            ref={panRef}
            onGestureEvent={gestureEnabled ? onGestureEvent : undefined}
            onHandlerStateChange={gestureEnabled ? onHandlerStateChange : undefined}
            enabled={gestureEnabled}
        >
            <View style={styles.container}>
                <ScrollView>
                    <Text style={styles.title}>Platform Enhancements</Text>

                    {/* Platform Info */}
                    <EnhancedCard variant="glass" style={styles.platformInfo}>
                        <Text style={styles.platformTitle}>Current Platform</Text>
                        <Text style={styles.platformDetail}>
                            OS: {Platform.OS} {Platform.Version ? `(${Platform.Version})` : ''}
                        </Text>
                        <Text style={styles.platformDetail}>
                            Screen: {width}x{height}
                        </Text>
                        <Text style={styles.platformDetail}>
                            Desktop Mode: {desktopMode ? 'Enabled' : 'Disabled'}
                        </Text>
                        <Text style={styles.platformDetail}>
                            Gestures: {gestureEnabled ? 'Enabled' : 'Disabled'}
                        </Text>
                    </EnhancedCard>

                    {/* Controls */}
                    {renderControls()}

                    {/* Platform Features */}
                    {renderPlatformFeatures()}

                    {/* Gesture Demos */}
                    {renderGestureDemos()}

                    {/* Gesture Log */}
                    {renderGestureLog()}

                    {/* Instructions */}
                    <EnhancedCard variant="glass" style={styles.instructionsCard}>
                        <Text style={styles.instructionsTitle}>How to Test Gestures</Text>
                        <Text style={styles.instructionsText}>
                            • Try swiping in different directions on this screen{'\n'}
                            • Use two fingers for multi-touch gestures{'\n'}
                            • Long press for context menus{'\n'}
                            • Double tap for quick actions
                        </Text>
                    </EnhancedCard>
                </ScrollView>
            </View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5f5f5',
        padding: 16,
        fontFamily: 'SpaceMono',
    },
    platformInfo: {
        margin: 16,
        padding: 16,
    },
    platformTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    platformDetail: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    controlsContainer: {
        padding: 16,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    controlButton: {
        flex: 1,
    },
    clearButton: {
        marginTop: 8,
    },
    featuresContainer: {
        padding: 16,
    },
    featureCard: {
        padding: 16,
        marginBottom: 8,
    },
    featureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    featureInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    featureText: {
        flex: 1,
    },
    featureName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    featureDescription: {
        fontSize: 14,
        color: '#ccc',
        fontFamily: 'SpaceMono',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    platformText: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    gestureContainer: {
        padding: 16,
    },
    gestureCard: {
        padding: 16,
        marginBottom: 8,
    },
    gestureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    gestureName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    gestureIcon: {
        fontSize: 20,
    },
    gestureDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    gestureInstruction: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
        fontStyle: 'italic',
        fontFamily: 'SpaceMono',
    },
    testButton: {
        marginTop: 8,
    },
    logContainer: {
        padding: 16,
    },
    logScroll: {
        maxHeight: 200,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        padding: 12,
    },
    emptyLog: {
        color: '#888',
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
    logEntry: {
        color: '#f5f5f5',
        fontSize: 12,
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    instructionsCard: {
        margin: 16,
        padding: 16,
        marginBottom: 32,
    },
    instructionsTitle: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    instructionsText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        fontFamily: 'SpaceMono',
    },
});

import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    PanResponder,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'react-native-linear-gradient';
import { useThemeStore } from '../store/theme';

const { width } = Dimensions.get('window');

export interface AudioTrack {
    id: string;
    title: string;
    artist: string;
    uri: string;
    duration: number;
    artwork?: string;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioPlayerProps {
    track: AudioTrack | null;
    onNext?: () => void;
    onPrevious?: () => void;
    onTrackEnd?: () => void;
    showControls?: boolean;
    compact?: boolean;
    style?: any;
}

export function AudioPlayer({
    track,
    onNext,
    onPrevious,
    onTrackEnd,
    showControls = true,
    compact = false,
    style,
}: AudioPlayerProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const soundRef = useRef<Audio.Sound | null>(null);
    const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);

    const progressAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        initializeAudio();
        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (track) {
            loadTrack(track);
        } else {
            unloadTrack();
        }
    }, [track]);

    const initializeAudio = async () => {
        try {
            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    };

    const loadTrack = async (audioTrack: AudioTrack) => {
        try {
            setPlaybackState('loading');

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioTrack.uri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            soundRef.current = sound;
            setDuration(audioTrack.duration);
            setPlaybackState('idle');
        } catch (error) {
            console.error('Failed to load track:', error);
            setPlaybackState('error');
        }
    };

    const unloadTrack = async () => {
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }
        setPlaybackState('idle');
        setPosition(0);
        setDuration(0);
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            setDuration(status.durationMillis / 1000);

            if (status.isPlaying) {
                setPlaybackState('playing');
            } else if (status.didJustFinish) {
                setPlaybackState('idle');
                onTrackEnd?.();
            } else {
                setPlaybackState('paused');
            }
        } else if (status.error) {
            setPlaybackState('error');
        }
    };

    const togglePlayback = async () => {
        if (!soundRef.current) return;

        try {
            if (playbackState === 'playing') {
                await soundRef.current.pauseAsync();
            } else {
                await soundRef.current.playAsync();
            }
        } catch (error) {
            console.error('Failed to toggle playback:', error);
        }
    };

    const [sliderWidth, setSliderWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                setIsDragging(true);
                handleSeek(gestureState.x0);
            },
            onPanResponderMove: (evt, gestureState) => {
                handleSeek(gestureState.moveX);
            },
            onPanResponderRelease: () => {
                setIsDragging(false);
            },
        })
    );

    const handleSeek = (touchX: number) => {
        if (sliderWidth > 0) {
            const progress = Math.max(0, Math.min(1, (touchX - 20) / sliderWidth));
            const newPosition = progress * duration;
            setPosition(newPosition);
            if (!isDragging) {
                seekTo(newPosition);
            }
        }
    };

    const seekTo = async (newPosition: number) => {
        if (!soundRef.current) return;

        try {
            // Convert position from seconds to milliseconds for Expo Audio API
            await soundRef.current.setPositionAsync(newPosition * 1000);
        } catch (error) {
            console.error('Failed to seek audio:', error);
        }
    };

    const renderProgressBar = () => {
        const progressWidth = progress * sliderWidth;

        return (
            <View
                style={style.sliderContainer}
                onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                {...panResponder.current.panHandlers}
            >
                <View style={[style.sliderTrack, { backgroundColor: isDark ? '#333' : '#ddd' }]}>
                    <View
                        style={[
                            style.sliderProgress,
                            {
                                width: progressWidth,
                                backgroundColor: isDark ? '#FFD700' : '#1a1a1a',
                            },
                        ]}
                    />
                </View>
                <View
                    style={[
                        style.sliderThumb,
                        {
                            left: progressWidth - 8,
                            backgroundColor: isDark ? '#FFD700' : '#1a1a1a',
                        },
                    ]}
                />
            </View>
        );
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const cleanup = async () => {
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
        }
    };

    if (!track) {
        return (
            <View style={[style.container, style]}>
                <Text style={[style.noTrackText, { color: isDark ? '#888' : '#666' }]}>
                    No track selected
                </Text>
            </View>
        );
    }

    const progress = duration > 0 ? position / duration : 0;

    return (
        <View style={[style.container, style]}>
            {/* Track Info */}
            <View style={style.trackInfo}>
                <Text style={[style.title, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                    {track.title}
                </Text>
                <Text style={[style.artist, { color: isDark ? '#aaa' : '#666' }]}>
                    {track.artist}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={style.progressContainer}>
                <Text style={[style.timeText, { color: isDark ? '#888' : '#666' }]}>
                    {formatTime(position)}
                </Text>
                {renderProgressBar()}
                <Text style={[style.timeText, { color: isDark ? '#888' : '#666' }]}>
                    {formatTime(duration)}
                </Text>
            </View>

            {/* Controls */}
            {showControls && (
                <View style={style.controls}>
                    <TouchableOpacity
                        onPress={onPrevious}
                        style={[style.controlButton, { opacity: onPrevious ? 1 : 0.3 }]}
                        disabled={!onPrevious}
                    >
                        <Text style={[style.controlIcon, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                            ⏮
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={togglePlayback}
                        style={style.playButton}
                        disabled={playbackState === 'loading'}
                    >
                        <LinearGradient
                            colors={isDark ? ['#FFD700', '#FFA500'] : ['#1a1a1a', '#333']}
                            style={style.playButtonGradient}
                        >
                            <Text style={style.playIcon}>
                                {playbackState === 'playing' ? '⏸' : '▶'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onNext}
                        style={[style.controlButton, { opacity: onNext ? 1 : 0.3 }]}
                        disabled={!onNext}
                    >
                        <Text style={[style.controlIcon, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                            ⏭
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Loading/Error States */}
            {playbackState === 'loading' && (
                <View style={style.statusContainer}>
                    <Text style={[style.statusText, { color: isDark ? '#FFD700' : '#1a1a1a' }]}>
                        Loading...
                    </Text>
                </View>
            )}
        </View>
    );
}


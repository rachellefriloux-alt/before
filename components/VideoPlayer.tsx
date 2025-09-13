/*
 * Sallie AI Video Player Component
 * Advanced video playback with controls and playlist support
 */

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent,
    State,
} from 'react-native-gesture-handler';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { createShadowStyle } from '@/utils/shadowStyles';

const { width, height } = Dimensions.get('window');

export interface VideoTrack {
    id: string;
    title: string;
    description?: string;
    duration: number;
    uri: string;
    thumbnail?: string;
    resolution?: string;
    bitrate?: number;
}

export interface VideoPlaylist {
    id: string;
    name: string;
    tracks: VideoTrack[];
    currentIndex: number;
}

export type VideoPlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'buffering';

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

interface VideoPlayerProps {
    playlist?: VideoPlaylist;
    initialTrack?: VideoTrack;
    autoPlay?: boolean;
    showControls?: boolean;
    showProgress?: boolean;
    showFullscreen?: boolean;
    compact?: boolean;
    resizeMode?: ResizeMode;
    onTrackChange?: (track: VideoTrack) => void;
    onPlaybackStateChange?: (state: VideoPlayerState) => void;
    onError?: (error: string) => void;
    onFullscreenEnter?: () => void;
    onFullscreenExit?: () => void;
    style?: any;
}

export interface VideoPlayerRef {
    play: () => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
    next: () => void;
    previous: () => void;
    seek: (position: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    setPlaybackSpeed: (speed: PlaybackSpeed) => Promise<void>;
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => Promise<void>;
    getCurrentTrack: () => VideoTrack | null;
    getPlaybackState: () => VideoPlayerState;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
    playlist,
    initialTrack,
    autoPlay = false,
    showControls = true,
    showProgress = true,
    showFullscreen = true,
    compact = false,
    resizeMode = ResizeMode.CONTAIN,
    onTrackChange,
    onPlaybackStateChange,
    onError,
    onFullscreenEnter,
    onFullscreenExit,
    style,
}, ref) => {
    const { theme } = useTheme();
    const videoRef = useRef<Video>(null);
    const [currentTrack, setCurrentTrack] = useState<VideoTrack | null>(initialTrack || null);
    const [playbackState, setPlaybackState] = useState<VideoPlayerState>('idle');
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackSpeed, setPlaybackSpeedState] = useState<PlaybackSpeed>(1.0);
    const [isDragging, setIsDragging] = useState(false);
    const [showControlsOverlay, setShowControlsOverlay] = useState(true);
    const [currentPlaylist, setCurrentPlaylist] = useState<VideoPlaylist | null>(playlist || null);

    // Auto-hide controls
    useEffect(() => {
        if (playbackState === 'playing' && showControlsOverlay) {
            const timer = setTimeout(() => {
                setShowControlsOverlay(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [playbackState, showControlsOverlay]);

    // Playback status update
    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);

            if (status.isPlaying) {
                setPlaybackState('playing');
                onPlaybackStateChange?.('playing');
            } else if (status.isBuffering) {
                setPlaybackState('buffering');
                onPlaybackStateChange?.('buffering');
            } else {
                setPlaybackState('paused');
                onPlaybackStateChange?.('paused');
            }

            if (status.didJustFinish) {
                handleTrackEnd();
            }
        } else if (status.error) {
            setPlaybackState('error');
            onPlaybackStateChange?.('error');
            onError?.(status.error);
        }
    };

    // Handle track end
    const handleTrackEnd = () => {
        if (currentPlaylist && currentTrack) {
            const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
            if (currentIndex < currentPlaylist.tracks.length - 1) {
                const nextIndex = currentIndex + 1;
                loadTrack(currentPlaylist.tracks[nextIndex]);
            } else {
                setPlaybackState('paused');
                onPlaybackStateChange?.('paused');
            }
        } else {
            setPlaybackState('paused');
            onPlaybackStateChange?.('paused');
        }
    };

    // Load track
    const loadTrack = async (track: VideoTrack) => {
        try {
            setPlaybackState('loading');
            onPlaybackStateChange?.('loading');

            if (videoRef.current) {
                await videoRef.current.loadAsync(
                    { uri: track.uri },
                    { shouldPlay: autoPlay }
                );
            }

            setCurrentTrack(track);
            setPosition(0);
            onTrackChange?.(track);
        } catch (error) {
            console.error('Failed to load video track:', error);
            setPlaybackState('error');
            onPlaybackStateChange?.('error');
            onError?.('Failed to load video track');
        }
    };

    // Control functions
    const play = async () => {
        if (videoRef.current) {
            await videoRef.current.playAsync();
        }
    };

    const pause = async () => {
        if (videoRef.current) {
            await videoRef.current.pauseAsync();
        }
    };

    const stop = async () => {
        if (videoRef.current) {
            await videoRef.current.stopAsync();
            setPosition(0);
        }
    };

    const next = () => {
        if (currentPlaylist && currentTrack) {
            const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
            if (currentIndex < currentPlaylist.tracks.length - 1) {
                const nextIndex = currentIndex + 1;
                loadTrack(currentPlaylist.tracks[nextIndex]);
            }
        }
    };

    const previous = () => {
        if (currentPlaylist && currentTrack) {
            const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
            if (currentIndex > 0) {
                const prevIndex = currentIndex - 1;
                loadTrack(currentPlaylist.tracks[prevIndex]);
            }
        }
    };

    const seek = async (newPosition: number) => {
        if (videoRef.current) {
            await videoRef.current.setPositionAsync(newPosition * 1000);
            setPosition(newPosition);
        }
    };

    const setVolume = async (newVolume: number) => {
        if (videoRef.current) {
            await videoRef.current.setVolumeAsync(newVolume);
            setVolumeState(newVolume);
        }
    };

    const setPlaybackSpeed = async (speed: PlaybackSpeed) => {
        if (videoRef.current) {
            await videoRef.current.setRateAsync(speed, true);
            setPlaybackSpeedState(speed);
        }
    };

    const enterFullscreen = async () => {
        if (videoRef.current) {
            await videoRef.current.presentFullscreenPlayer();
            setIsFullscreen(true);
            onFullscreenEnter?.();
        }
    };

    const exitFullscreen = async () => {
        if (videoRef.current) {
            await videoRef.current.dismissFullscreenPlayer();
            setIsFullscreen(false);
            onFullscreenExit?.();
        }
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        play,
        pause,
        stop,
        next,
        previous,
        seek,
        setVolume,
        setPlaybackSpeed,
        enterFullscreen,
        exitFullscreen,
        getCurrentTrack: () => currentTrack,
        getPlaybackState: () => playbackState,
    }));

    // Load initial track
    useEffect(() => {
        if (initialTrack && !currentTrack) {
            loadTrack(initialTrack);
        }
    }, [initialTrack]);

    // Update playlist
    useEffect(() => {
        if (playlist) {
            setCurrentPlaylist(playlist);
            if (playlist.tracks.length > 0 && !currentTrack) {
                loadTrack(playlist.tracks[playlist.currentIndex]);
            }
        }
    }, [playlist]);

    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get playback speed text
    const getPlaybackSpeedText = (): string => {
        return playbackSpeed === 1.0 ? '1x' : `${playbackSpeed}x`;
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: compact ? theme.borderRadius.small : theme.borderRadius.medium,
            overflow: 'hidden',
            ...(!compact && createShadowStyle({
                shadowColor: theme.colors.text.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4,
            })),
        },
        videoContainer: {
            position: 'relative',
            backgroundColor: '#000000',
        },
        video: {
            width: '100%',
            height: compact ? 200 : 250,
        },
        controlsOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        playButton: {
            width: compact ? 60 : 80,
            height: compact ? 60 : 80,
            borderRadius: compact ? 30 : 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        controlsBar: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: theme.spacing.m,
        },
        progressContainer: {
            marginBottom: theme.spacing.s,
        },
        progressBar: {
            width: '100%',
            height: 4,
        },
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.s,
        },
        timeText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: '#FFFFFF',
        },
        controlsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        leftControls: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        rightControls: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        controlButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: theme.spacing.xs,
        },
        speedButton: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: theme.borderRadius.small,
            marginHorizontal: theme.spacing.xs,
        },
        speedText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.caption,
            color: '#FFFFFF',
        },
        trackInfo: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: theme.spacing.m,
        },
        title: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.subtitle,
            color: '#FFFFFF',
            marginBottom: theme.spacing.xs,
        },
        description: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: '#CCCCCC',
        },
        loadingContainer: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        errorContainer: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
        errorText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: '#FFFFFF',
            textAlign: 'center',
            marginTop: theme.spacing.m,
        },
    });

    // Loading state
    if (playbackState === 'loading') {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.videoContainer}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                </View>
            </View>
        );
    }

    // Error state
    if (playbackState === 'error') {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.videoContainer}>
                    <View style={styles.errorContainer}>
                        <Feather name="alert-triangle" size={48} color="#FF6B6B" />
                        <Text style={styles.errorText}>Failed to load video</Text>
                    </View>
                </View>
            </View>
        );
    }

    // No track loaded
    if (!currentTrack) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.videoContainer}>
                    <View style={styles.loadingContainer}>
                        <Text style={{ color: '#FFFFFF' }}>No video selected</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.videoContainer}>
                {/* Video */}
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: currentTrack.uri }}
                    resizeMode={resizeMode}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    onFullscreenUpdate={(event) => {
                        if (event.fullscreenUpdate === 0) {
                            setIsFullscreen(false);
                            onFullscreenExit?.();
                        } else if (event.fullscreenUpdate === 1) {
                            setIsFullscreen(true);
                            onFullscreenEnter?.();
                        }
                    }}
                />

                {/* Track Info Overlay */}
                {showControls && showControlsOverlay && (
                    <View style={styles.trackInfo}>
                        <Text style={styles.title} numberOfLines={1}>
                            {currentTrack.title}
                        </Text>
                        {currentTrack.description && (
                            <Text style={styles.description} numberOfLines={2}>
                                {currentTrack.description}
                            </Text>
                        )}
                    </View>
                )}

                {/* Controls Overlay */}
                {showControls && showControlsOverlay && (
                    <View style={styles.controlsOverlay}>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={playbackState === 'playing' ? pause : play}
                        >
                            <Feather
                                name={playbackState === 'playing' ? 'pause' : 'play'}
                                size={compact ? 30 : 40}
                                color="#000000"
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Controls Bar */}
                {showControls && showControlsOverlay && (
                    <View style={styles.controlsBar}>
                        {/* Progress */}
                        {showProgress && (
                            <View style={styles.progressContainer}>
                                <Slider
                                    style={styles.progressBar}
                                    minimumValue={0}
                                    maximumValue={duration}
                                    value={position}
                                    onValueChange={setPosition}
                                    onSlidingStart={() => setIsDragging(true)}
                                    onSlidingComplete={(value) => {
                                        setIsDragging(false);
                                        seek(value);
                                    }}
                                    minimumTrackTintColor={theme.colors.primary}
                                    maximumTrackTintColor="#CCCCCC"
                                    thumbTintColor={theme.colors.primary}
                                />
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>{formatTime(position)}</Text>
                                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                                </View>
                            </View>
                        )}

                        {/* Controls */}
                        <View style={styles.controlsRow}>
                            <View style={styles.leftControls}>
                                {/* Previous */}
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={previous}
                                    disabled={!currentPlaylist || currentPlaylist.tracks.length <= 1}
                                >
                                    <Feather name="skip-back" size={20} color="#FFFFFF" />
                                </TouchableOpacity>

                                {/* Play/Pause */}
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={playbackState === 'playing' ? pause : play}
                                >
                                    <Feather
                                        name={playbackState === 'playing' ? 'pause' : 'play'}
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </TouchableOpacity>

                                {/* Next */}
                                <TouchableOpacity
                                    style={styles.controlButton}
                                    onPress={next}
                                    disabled={!currentPlaylist || currentPlaylist.tracks.length <= 1}
                                >
                                    <Feather name="skip-forward" size={20} color="#FFFFFF" />
                                </TouchableOpacity>

                                {/* Speed */}
                                <TouchableOpacity
                                    style={styles.speedButton}
                                    onPress={() => {
                                        const speeds: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
                                        const currentIndex = speeds.indexOf(playbackSpeed);
                                        const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                                        setPlaybackSpeed(nextSpeed);
                                    }}
                                >
                                    <Text style={styles.speedText}>{getPlaybackSpeedText()}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rightControls}>
                                {/* Fullscreen */}
                                {showFullscreen && (
                                    <TouchableOpacity
                                        style={styles.controlButton}
                                        onPress={isFullscreen ? exitFullscreen : enterFullscreen}
                                    >
                                        <Feather
                                            name={isFullscreen ? 'minimize' : 'maximize'}
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Tap to show controls */}
                <TouchableOpacity
                    style={StyleSheet.absoluteFillObject}
                    onPress={() => setShowControlsOverlay(!showControlsOverlay)}
                    activeOpacity={1}
                />
            </View>
        </View>
    );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

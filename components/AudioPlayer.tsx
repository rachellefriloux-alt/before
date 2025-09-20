/*
 * Sallie AI Audio Playback System
 * Comprehensive audio player with advanced controls and playlist management
 */

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent,
    State,
} from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export interface AudioTrack {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration: number;
    uri: string;
    artwork?: string;
    genre?: string;
}

export interface Playlist {
    id: string;
    name: string;
    tracks: AudioTrack[];
    currentIndex: number;
}

export type PlaybackMode = 'single' | 'loop' | 'shuffle' | 'repeat';

export type AudioPlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioPlayerProps {
    playlist?: Playlist;
    initialTrack?: AudioTrack;
    autoPlay?: boolean;
    showControls?: boolean;
    showProgress?: boolean;
    showVolume?: boolean;
    compact?: boolean;
    onTrackChange?: (track: AudioTrack) => void;
    onPlaybackStateChange?: (state: AudioPlayerState) => void;
    onError?: (error: string) => void;
    style?: any;
}

export interface AudioPlayerRef {
    play: () => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
    next: () => void;
    previous: () => void;
    seek: (position: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    setPlaybackMode: (mode: PlaybackMode) => void;
    getCurrentTrack: () => AudioTrack | null;
    getPlaybackState: () => AudioPlayerState;
}

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({
    playlist,
    initialTrack,
    autoPlay = false,
    showControls = true,
    showProgress = true,
    showVolume = false,
    compact = false,
    onTrackChange,
    onPlaybackStateChange,
    onError,
    style,
}, ref) => {
    const { theme } = useTheme();
    const soundRef = useRef<Audio.Sound | null>(null);
    const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(initialTrack || null);
    const [playbackState, setPlaybackState] = useState<AudioPlayerState>('idle');
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1.0);
    const [isDragging, setIsDragging] = useState(false);
    const [playbackMode, setPlaybackModeState] = useState<PlaybackMode>('loop');
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(playlist || null);

    // Initialize audio
    useEffect(() => {
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
                onError?.('Failed to initialize audio system');
            }
        };

        initializeAudio();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Load track
    const loadTrack = async (track: AudioTrack) => {
        try {
            setPlaybackState('loading');
            onPlaybackStateChange?.('loading');

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: track.uri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            soundRef.current = sound;
            setCurrentTrack(track);
            setDuration(track.duration);
            setPosition(0);

            onTrackChange?.(track);

            if (autoPlay) {
                await sound.playAsync();
            }
        } catch (error) {
            console.error('Failed to load track:', error);
            setPlaybackState('error');
            onPlaybackStateChange?.('error');
            onError?.('Failed to load audio track');
        }
    };

    // Playback status update
    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            setDuration(status.durationMillis / 1000);

            if (status.isPlaying) {
                setPlaybackState('playing');
                onPlaybackStateChange?.('playing');
            } else if (status.didJustFinish) {
                handleTrackEnd();
            } else {
                setPlaybackState('paused');
                onPlaybackStateChange?.('paused');
            }
        } else if (status.error) {
            setPlaybackState('error');
            onPlaybackStateChange?.('error');
            onError?.(status.error);
        }
    };

    // Handle track end
    const handleTrackEnd = () => {
        switch (playbackMode) {
            case 'single':
                setPlaybackState('paused');
                onPlaybackStateChange?.('paused');
                break;
            case 'loop':
                if (currentPlaylist && currentTrack) {
                    const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
                    const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
                    loadTrack(currentPlaylist.tracks[nextIndex]);
                } else {
                    soundRef.current?.replayAsync();
                }
                break;
            case 'repeat':
                soundRef.current?.replayAsync();
                break;
            case 'shuffle':
                if (currentPlaylist) {
                    const randomIndex = Math.floor(Math.random() * currentPlaylist.tracks.length);
                    loadTrack(currentPlaylist.tracks[randomIndex]);
                }
                break;
        }
    };

    // Control functions
    const play = async () => {
        if (soundRef.current && currentTrack) {
            await soundRef.current.playAsync();
        }
    };

    const pause = async () => {
        if (soundRef.current) {
            await soundRef.current.pauseAsync();
        }
    };

    const stop = async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync();
            setPosition(0);
        }
    };

    const next = () => {
        if (currentPlaylist && currentTrack) {
            const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % currentPlaylist.tracks.length;
            loadTrack(currentPlaylist.tracks[nextIndex]);
        }
    };

    const previous = () => {
        if (currentPlaylist && currentTrack) {
            const currentIndex = currentPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentPlaylist.tracks.length - 1;
            loadTrack(currentPlaylist.tracks[prevIndex]);
        }
    };

    const seek = async (newPosition: number) => {
        if (soundRef.current) {
            await soundRef.current.setPositionAsync(newPosition * 1000);
            setPosition(newPosition);
        }
    };

    const setVolume = async (newVolume: number) => {
        if (soundRef.current) {
            await soundRef.current.setVolumeAsync(newVolume);
            setVolumeState(newVolume);
        }
    };

    const setPlaybackMode = (mode: PlaybackMode) => {
        setPlaybackModeState(mode);
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
        setPlaybackMode,
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

    // Get playback mode icon
    const getPlaybackModeIcon = (): React.ComponentProps<typeof Feather>['name'] => {
        switch (playbackMode) {
            case 'single': return 'minus';
            case 'loop': return 'repeat';
            case 'shuffle': return 'shuffle';
            case 'repeat': return 'rotate-cw';
            default: return 'repeat';
        }
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: compact ? theme.borderRadius.small : theme.borderRadius.medium,
            padding: compact ? theme.spacing.s : theme.spacing.m,
            ...(!compact && {
                elevation: 4,
                shadowColor: theme.colors.text.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }),
        },
        trackInfo: {
            marginBottom: showProgress ? theme.spacing.m : theme.spacing.s,
        },
        title: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: compact ? theme.typography.sizes.subtitle : theme.typography.sizes.h3,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
        },
        artist: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: compact ? theme.typography.sizes.body2 : theme.typography.sizes.body1,
            color: theme.colors.text.secondary,
        },
        progressContainer: {
            marginBottom: theme.spacing.m,
        },
        progressBar: {
            width: '100%',
            height: 4,
        },
        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.xs,
        },
        timeText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
        },
        controlsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: showVolume ? theme.spacing.m : 0,
        },
        controlButton: {
            width: compact ? 40 : 50,
            height: compact ? 40 : 50,
            borderRadius: compact ? 20 : 25,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: theme.spacing.xs,
        },
        playButton: {
            width: compact ? 50 : 60,
            height: compact ? 50 : 60,
            borderRadius: compact ? 25 : 30,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: theme.spacing.s,
        },
        volumeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.s,
        },
        volumeLabel: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
            marginRight: theme.spacing.s,
        },
        volumeSlider: {
            flex: 1,
        },
        loadingContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        loadingText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.text.secondary,
        },
        errorContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        errorText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.error,
            textAlign: 'center',
        },
    });

    // Loading state
    if (playbackState === 'loading') {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading audio...</Text>
                </View>
            </View>
        );
    }

    // Error state
    if (playbackState === 'error') {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load audio track</Text>
                </View>
            </View>
        );
    }

    // No track loaded
    if (!currentTrack) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>No track selected</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {/* Track Info */}
            <View style={styles.trackInfo}>
                <Text style={styles.title} numberOfLines={1}>
                    {currentTrack.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                    {currentTrack.artist}
                </Text>
            </View>

            {/* Progress Bar */}
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
                        maximumTrackTintColor={theme.colors.border.light}
                        thumbTintColor={theme.colors.primary}
                    />
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>
            )}

            {/* Controls */}
            {showControls && (
                <View style={styles.controlsContainer}>
                    {/* Previous */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={previous}
                        disabled={!currentPlaylist || currentPlaylist.tracks.length <= 1}
                    >
                        <Feather
                            name="skip-back"
                            size={compact ? 20 : 24}
                            color={theme.colors.onPrimary}
                        />
                    </TouchableOpacity>

                    {/* Play/Pause */}
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={playbackState === 'playing' ? pause : play}
                    >
                        <Feather
                            name={playbackState === 'playing' ? 'pause' : 'play'}
                            size={compact ? 24 : 28}
                            color={theme.colors.onPrimary}
                        />
                    </TouchableOpacity>

                    {/* Next */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={next}
                        disabled={!currentPlaylist || currentPlaylist.tracks.length <= 1}
                    >
                        <Feather
                            name="skip-forward"
                            size={compact ? 20 : 24}
                            color={theme.colors.onPrimary}
                        />
                    </TouchableOpacity>

                    {/* Playback Mode */}
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => {
                            const modes: PlaybackMode[] = ['single', 'loop', 'shuffle', 'repeat'];
                            const currentIndex = modes.indexOf(playbackMode);
                            const nextMode = modes[(currentIndex + 1) % modes.length];
                            setPlaybackMode(nextMode);
                        }}
                    >
                        <Feather
                            name={getPlaybackModeIcon()}
                            size={compact ? 16 : 20}
                            color={theme.colors.onPrimary}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* Volume Control */}
            {showVolume && (
                <View style={styles.volumeContainer}>
                    <Text style={styles.volumeLabel}>Volume</Text>
                    <Slider
                        style={styles.volumeSlider}
                        minimumValue={0}
                        maximumValue={1}
                        value={volume}
                        onValueChange={setVolume}
                        minimumTrackTintColor={theme.colors.primary}
                        maximumTrackTintColor={theme.colors.border.light}
                        thumbTintColor={theme.colors.primary}
                    />
                </View>
            )}
        </View>
    );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;

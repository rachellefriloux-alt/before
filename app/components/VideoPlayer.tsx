import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { LinearGradient } from 'react-native-linear-gradient';
import { useThemeStore } from '../store/theme';

const { width } = Dimensions.get('window');

export interface VideoTrack {
    id: string;
    title: string;
    description?: string;
    uri: string;
    duration: number;
    thumbnail?: string;
    author?: string;
    views?: number;
}

export type VideoPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface VideoPlayerProps {
    video: VideoTrack | null;
    onNext?: () => void;
    onPrevious?: () => void;
    onVideoEnd?: () => void;
    showControls?: boolean;
    autoPlay?: boolean;
    style?: any;
}

export function VideoPlayer({
    video,
    onNext,
    onPrevious,
    onVideoEnd,
    showControls = true,
    autoPlay = false,
    style,
}: VideoPlayerProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const videoRef = useRef<Video>(null);
    const [playbackState, setPlaybackState] = useState<VideoPlaybackState>('idle');
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (video) {
            loadVideo(video);
        } else {
            unloadVideo();
        }
    }, [video]);

    const loadVideo = async (videoTrack: VideoTrack) => {
        try {
            setPlaybackState('loading');
            if (videoRef.current) {
                await videoRef.current.unloadAsync();
            }
        } catch (error) {
            console.error('Failed to load video:', error);
        }
    };

    const unloadVideo = async () => {
        if (videoRef.current) {
            await videoRef.current.unloadAsync();
        }
        setPlaybackState('idle');
        setPosition(0);
        setDuration(0);
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);

            if (status.isPlaying) {
                setPlaybackState('playing');
            } else if (status.didJustFinish) {
                setPlaybackState('idle');
                onVideoEnd?.();
            } else {
                setPlaybackState('paused');
            }
        } else if (status.error) {
            setPlaybackState('error');
        }
    };

    const togglePlayback = async () => {
        if (!videoRef.current) return;

        try {
            const status = await videoRef.current.getStatusAsync();
            if (status.isLoaded) {
                if (status.isPlaying) {
                    await videoRef.current.pauseAsync();
                } else {
                    await videoRef.current.playAsync();
                }
            }
        } catch (error) {
            console.error('Failed to toggle playback:', error);
        }
    };

    const seekTo = async (position: number) => {
        if (videoRef.current) {
            await videoRef.current.setPositionAsync(position * 1000);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!video) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.placeholder}>
                    <Text style={[styles.placeholderText, { color: isDark ? '#888' : '#666' }]}>
                        No video selected
                    </Text>
                </View>
            </View>
        );
    }

    const progress = duration > 0 ? position / duration : 0;

    return (
        <View style={[styles.container, style]}>
            {/* Video Player */}
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: video.uri }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={autoPlay}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    onLoadStart={() => setPlaybackState('loading')}
                    onLoad={() => setPlaybackState('idle')}
                    onError={() => setPlaybackState('error')}
                />

                {/* Loading Overlay */}
                {playbackState === 'loading' && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={isDark ? '#FFD700' : '#1a1a1a'} />
                        <Text style={[styles.loadingText, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                            Loading video...
                        </Text>
                    </View>
                )}

                {/* Error Overlay */}
                {playbackState === 'error' && (
                    <View style={styles.errorOverlay}>
                        <Text style={styles.errorText}>Failed to load video</Text>
                        <TouchableOpacity onPress={() => loadVideo(video)} style={styles.retryButton}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Controls Overlay */}
                {showControls && isControlsVisible && (
                    <TouchableOpacity
                        style={styles.controlsOverlay}
                        onPress={() => setIsControlsVisible(false)}
                        activeOpacity={1}
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.controlsGradient}
                        >
                            {/* Play/Pause Button */}
                            <View style={styles.centerControls}>
                                <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                                    <LinearGradient
                                        colors={isDark ? ['#FFD700', '#FFA500'] : ['#1a1a1a', '#333']}
                                        style={styles.playButtonGradient}
                                    >
                                        <Text style={styles.playIcon}>
                                            {playbackState === 'playing' ? '⏸' : '▶'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Bottom Controls */}
                            <View style={styles.bottomControls}>
                                <Text style={[styles.timeText, { color: '#f5f5f5' }]}>
                                    {formatTime(position)}
                                </Text>

                                {/* Progress Bar */}
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressTrack}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${progress * 100}%` },
                                            ]}
                                        />
                                    </View>
                                </View>

                                <Text style={[styles.timeText, { color: '#f5f5f5' }]}>
                                    {formatTime(duration)}
                                </Text>

                                {/* Control Buttons */}
                                <View style={styles.controlButtons}>
                                    <TouchableOpacity
                                        onPress={onPrevious}
                                        style={[styles.controlButton, { opacity: onPrevious ? 1 : 0.3 }]}
                                        disabled={!onPrevious}
                                    >
                                        <Text style={styles.controlIcon}>⏮</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={onNext}
                                        style={[styles.controlButton, { opacity: onNext ? 1 : 0.3 }]}
                                        disabled={!onNext}
                                    >
                                        <Text style={styles.controlIcon}>⏭</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                                        <Text style={styles.controlIcon}>{isFullscreen ? '⤢' : '⤡'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Tap to show controls */}
                {!isControlsVisible && (
                    <TouchableOpacity
                        style={styles.tapOverlay}
                        onPress={() => setIsControlsVisible(true)}
                    />
                )}
            </View>

            {/* Video Info */}
            <View style={styles.infoContainer}>
                <Text style={[styles.title, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                    {video.title}
                </Text>
                {video.description && (
                    <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                        {video.description}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        position: 'relative',
    },
    video: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    placeholderText: {
        fontSize: 16,
        fontFamily: 'SpaceMono',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'SpaceMono',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
        fontFamily: 'SpaceMono',
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
    },
    retryText: {
        color: '#f5f5f5',
        fontSize: 14,
        fontFamily: 'SpaceMono',
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    controlsGradient: {
        flex: 1,
        justifyContent: 'space-between',
    },
    centerControls: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        borderRadius: 40,
    },
    playButtonGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        fontSize: 32,
        color: '#f5f5f5',
    },
    bottomControls: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    timeText: {
        fontSize: 12,
        fontFamily: 'SpaceMono',
        marginBottom: 8,
    },
    progressContainer: {
        flex: 1,
        marginHorizontal: 12,
    },
    progressTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    progressFill: {
        height: 4,
        backgroundColor: '#FFD700',
        borderRadius: 2,
    },
    controlButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    controlButton: {
        padding: 8,
    },
    controlIcon: {
        fontSize: 20,
        color: '#f5f5f5',
    },
    tapOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'SpaceMono',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontFamily: 'SpaceMono',
        lineHeight: 20,
    },
});

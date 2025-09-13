import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioPlayer, AudioTrack } from './components/AudioPlayer';
import { Playlist } from './components/Playlist';
import { audioManager } from './utils/AudioManager';
import { useThemeStore } from '../store/theme';

const { width, height } = Dimensions.get('window');

// Sample tracks for demonstration
const SAMPLE_TRACKS: AudioTrack[] = [
    {
        id: '1',
        title: 'Ambient Serenity',
        artist: 'Sallie AI',
        uri: 'https://example.com/audio/ambient-serenity.mp3', // Replace with actual audio URL
        duration: 180,
    },
    {
        id: '2',
        title: 'Mindful Moments',
        artist: 'Sallie AI',
        uri: 'https://example.com/audio/mindful-moments.mp3',
        duration: 240,
    },
    {
        id: '3',
        title: 'Peaceful Reflections',
        artist: 'Sallie AI',
        uri: 'https://example.com/audio/peaceful-reflections.mp3',
        duration: 200,
    },
];

export function AudioScreen() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
    const [tracks] = useState<AudioTrack[]>(SAMPLE_TRACKS);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // Load playlist on mount
        audioManager.loadPlaylist(tracks);

        // Set up event listeners
        const handleTrackLoaded = (track: AudioTrack) => {
            setCurrentTrack(track);
        };

        const handlePlaybackUpdate = (data: any) => {
            // Handle playback status updates if needed
        };

        audioManager.addListener('trackLoaded', handleTrackLoaded);
        audioManager.addListener('playbackStatusUpdate', handlePlaybackUpdate);

        return () => {
            audioManager.removeListener('trackLoaded');
            audioManager.removeListener('playbackStatusUpdate');
        };
    }, [tracks]);

    const handleTrackSelect = (track: AudioTrack) => {
        setCurrentTrack(track);
        audioManager.playTrack(track);
    };

    const handleNext = () => {
        audioManager.next();
    };

    const handlePrevious = () => {
        audioManager.previous();
    };

    const handleTrackEnd = () => {
        // Auto-advance to next track
        audioManager.next();
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
            />

            <LinearGradient
                colors={isDark ? ['#1a1a1a', '#000'] : ['#f5f5f5', '#fff']}
                style={styles.gradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                        Audio Player
                    </Text>
                    <TouchableOpacity onPress={toggleMinimize} style={styles.minimizeButton}>
                        <Text style={[styles.minimizeIcon, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                            {isMinimized ? '⤢' : '⤡'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Audio Player */}
                    <View style={[styles.playerContainer, isMinimized && styles.minimizedPlayer]}>
                        <AudioPlayer
                            track={currentTrack}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onTrackEnd={handleTrackEnd}
                            showControls={!isMinimized}
                            compact={isMinimized}
                        />
                    </View>

                    {/* Playlist */}
                    {!isMinimized && (
                        <View style={styles.playlistContainer}>
                            <Text style={[styles.playlistTitle, { color: isDark ? '#f5f5f5' : '#1a1a1a' }]}>
                                Playlist
                            </Text>
                            <Playlist
                                tracks={tracks}
                                currentTrackId={currentTrack?.id}
                                onTrackSelect={handleTrackSelect}
                            />
                        </View>
                    )}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    minimizeButton: {
        padding: 8,
    },
    minimizeIcon: {
        fontSize: 20,
    },
    content: {
        flex: 1,
    },
    playerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    minimizedPlayer: {
        paddingVertical: 10,
    },
    playlistContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    playlistTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'SpaceMono',
        marginBottom: 16,
    },
});

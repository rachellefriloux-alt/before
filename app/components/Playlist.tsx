import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { AudioTrack } from './AudioPlayer';
import { audioManager } from '../utils/AudioManager';
import { useThemeStore } from '../store/theme';

const { width } = Dimensions.get('window');

interface PlaylistProps {
    tracks: AudioTrack[];
    currentTrackId?: string;
    onTrackSelect?: (track: AudioTrack) => void;
    style?: any;
}

export function Playlist({
    tracks,
    currentTrackId,
    onTrackSelect,
    style,
}: PlaylistProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

    useEffect(() => {
        const handlePlaybackUpdate = (data: any) => {
            if (data.currentTrack) {
                setCurrentPlayingId(data.currentTrack.id);
            }
        };

        audioManager.addListener('playbackStatusUpdate', handlePlaybackUpdate);

        return () => {
            audioManager.removeListener('playbackStatusUpdate');
        };
    }, []);

    const handleTrackPress = (track: AudioTrack) => {
        if (onTrackSelect) {
            onTrackSelect(track);
        } else {
            audioManager.playTrack(track);
        }
    };

    const renderTrack = ({ item, index }: { item: AudioTrack; index: number }) => {
        const isCurrentTrack = item.id === currentTrackId || item.id === currentPlayingId;
        const isPlaying = audioManager.isCurrentlyPlaying() && isCurrentTrack;

        return (
            <TouchableOpacity
                onPress={() => handleTrackPress(item)}
                style={[
                    styles.trackItem,
                    {
                        backgroundColor: isCurrentTrack
                            ? (isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(26, 26, 26, 0.05)')
                            : 'transparent',
                    },
                ]}
            >
                <View style={styles.trackNumber}>
                    {isPlaying ? (
                        <View style={styles.playingIndicator}>
                            <View style={[styles.playingDot, { backgroundColor: isDark ? '#FFD700' : '#1a1a1a' }]} />
                            <View style={[styles.playingDot, { backgroundColor: isDark ? '#FFD700' : '#1a1a1a' }]} />
                            <View style={[styles.playingDot, { backgroundColor: isDark ? '#FFD700' : '#1a1a1a' }]} />
                        </View>
                    ) : (
                        <Text style={[styles.trackNumberText, { color: isDark ? '#888' : '#666' }]}>
                            {index + 1}
                        </Text>
                    )}
                </View>

                <View style={styles.trackInfo}>
                    <Text
                        style={[
                            styles.trackTitle,
                            {
                                color: isCurrentTrack
                                    ? (isDark ? '#FFD700' : '#1a1a1a')
                                    : (isDark ? '#f5f5f5' : '#1a1a1a'),
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text
                        style={[
                            styles.trackArtist,
                            { color: isDark ? '#aaa' : '#666' },
                        ]}
                        numberOfLines={1}
                    >
                        {item.artist}
                    </Text>
                </View>

                <View style={styles.trackDuration}>
                    <Text style={[styles.durationText, { color: isDark ? '#888' : '#666' }]}>
                        {formatDuration(item.duration)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (tracks.length === 0) {
        return (
            <View style={[styles.emptyContainer, style]}>
                <Text style={[styles.emptyText, { color: isDark ? '#888' : '#666' }]}>
                    No tracks in playlist
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={isDark ? ['rgba(255, 215, 0, 0.05)', 'transparent'] : ['rgba(26, 26, 26, 0.02)', 'transparent']}
                style={styles.gradient}
            >
                <FlatList
                    data={tracks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTrack}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 8,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        marginVertical: 2,
        borderRadius: 8,
    },
    trackNumber: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackNumberText: {
        fontSize: 14,
        fontFamily: 'SpaceMono',
    },
    playingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    playingDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    trackInfo: {
        flex: 1,
        marginLeft: 8,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'SpaceMono',
        marginBottom: 2,
    },
    trackArtist: {
        fontSize: 14,
        fontFamily: 'SpaceMono',
    },
    trackDuration: {
        marginLeft: 8,
    },
    durationText: {
        fontSize: 12,
        fontFamily: 'SpaceMono',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'SpaceMono',
        textAlign: 'center',
    },
});

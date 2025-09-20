import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';
import { VideoTrack } from './VideoPlayer';
import { videoManager } from './utils/VideoManager';

const { width } = Dimensions.get('window');

interface VideoPlaylistProps {
    videos: VideoTrack[];
    currentVideoId?: string;
    onVideoSelect: (video: VideoTrack) => void;
    theme?: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

export const VideoPlaylist: React.FC<VideoPlaylistProps> = ({
    videos,
    currentVideoId,
    onVideoSelect,
    theme = {
        primary: '#007AFF',
        secondary: '#F2F2F7',
        background: '#FFFFFF',
        text: '#000000',
    },
}) => {
    const renderVideoItem = ({ item }: { item: VideoTrack }) => {
        const isCurrent = item.id === currentVideoId;

        return (
            <TouchableOpacity
                style={[
                    styles.videoItem,
                    {
                        backgroundColor: isCurrent ? theme.secondary : theme.background,
                        borderColor: isCurrent ? theme.primary : 'transparent',
                    },
                ]}
                onPress={() => onVideoSelect(item)}
            >
                <View style={styles.thumbnailContainer}>
                    {item.thumbnail ? (
                        <Image
                            source={{ uri: item.thumbnail }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.placeholderThumbnail, { backgroundColor: theme.secondary }]}>
                            <Text style={[styles.placeholderText, { color: theme.text }]}>🎬</Text>
                        </View>
                    )}
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                            {item.duration ? formatDuration(item.duration) : '--:--'}
                        </Text>
                    </View>
                </View>

                <View style={styles.videoInfo}>
                    <Text
                        style={[styles.title, { color: theme.text }]}
                        numberOfLines={2}
                    >
                        {item.title}
                    </Text>
                    {item.description && (
                        <Text
                            style={[styles.description, { color: theme.text + '80' }]}
                            numberOfLines={2}
                        >
                            {item.description}
                        </Text>
                    )}
                    <Text style={[styles.metadata, { color: theme.text + '60' }]}>
                        {item.author && `${item.author} • `}
                        {item.views && `${formatViews(item.views)} views`}
                    </Text>
                </View>

                {isCurrent && (
                    <View style={[styles.playingIndicator, { backgroundColor: theme.primary }]}>
                        <Text style={styles.playingText}>▶</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: theme.text }]}>Video Playlist</Text>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatViews = (views: number): string => {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    videoItem: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    thumbnailContainer: {
        position: 'relative',
        marginRight: 12,
    },
    thumbnail: {
        width: 80,
        height: 60,
        borderRadius: 6,
    },
    placeholderThumbnail: {
        width: 80,
        height: 60,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 24,
    },
    durationBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    videoInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 4,
    },
    metadata: {
        fontSize: 12,
    },
    playingIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    playingText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

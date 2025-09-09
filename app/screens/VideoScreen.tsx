import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { VideoPlayer, VideoTrack } from '../components/VideoPlayer';
import { VideoPlaylist } from '../components/VideoPlaylist';
import { videoManager } from '../utils/VideoManager';
import { useThemeStore } from '../store/theme';

const sampleVideos: VideoTrack[] = [
    {
        id: '1',
        title: 'Introduction to AI',
        description: 'Learn the basics of artificial intelligence and machine learning',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 596,
        thumbnail: 'https://i.ytimg.com/vi/YE7VzlLtp-4/maxresdefault.jpg',
        author: 'Tech Academy',
        views: 125000,
    },
    {
        id: '2',
        title: 'React Native Tutorial',
        description: 'Build mobile apps with React Native from scratch',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 654,
        thumbnail: 'https://i.ytimg.com/vi/0-S5a0eXPoc/maxresdefault.jpg',
        author: 'Code Masters',
        views: 89000,
    },
    {
        id: '3',
        title: 'Machine Learning Basics',
        description: 'Understanding algorithms and data science fundamentals',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 480,
        thumbnail: 'https://i.ytimg.com/vi/ukzFI9rgwfU/maxresdefault.jpg',
        author: 'Data Science Hub',
        views: 156000,
    },
];

export default function VideoScreen() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [currentVideo, setCurrentVideo] = useState<VideoTrack | null>(null);
    const [videos] = useState<VideoTrack[]>(sampleVideos);

    useEffect(() => {
        // Load playlist on component mount
        videoManager.loadPlaylist(videos, 0);

        // Set up event listeners
        videoManager.addListener('videoLoaded', (video: VideoTrack) => {
            setCurrentVideo(video);
        });

        return () => {
            videoManager.cleanup();
        };
    }, [videos]);

    const handleVideoSelect = async (video: VideoTrack) => {
        await videoManager.playVideo(video);
    };

    const handleNext = async () => {
        await videoManager.next();
    };

    const handlePrevious = async () => {
        await videoManager.previous();
    };

    const handleVideoEnd = async () => {
        await videoManager.next();
    };

    const theme = {
        primary: isDark ? '#0A84FF' : '#007AFF',
        secondary: isDark ? '#1C1C1E' : '#F2F2F7',
        background: isDark ? '#000000' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#000000',
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />

            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Video Player</Text>
                <Text style={[styles.subtitle, { color: theme.text + '80' }]}>
                    Watch and manage your video content
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.playerContainer}>
                    <VideoPlayer
                        video={currentVideo}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onVideoEnd={handleVideoEnd}
                        showControls={true}
                        autoPlay={false}
                        style={styles.videoPlayer}
                    />
                </View>

                <View style={styles.playlistContainer}>
                    <VideoPlaylist
                        videos={videos}
                        currentVideoId={currentVideo?.id}
                        onVideoSelect={handleVideoSelect}
                        theme={theme}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    playerContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    videoPlayer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    playlistContainer: {
        flex: 1,
    },
});

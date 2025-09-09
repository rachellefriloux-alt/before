/*
 * Sallie AI Video Playlist Manager Component
 * Advanced playlist management for video content
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    TextInput,
    Modal,
    Dimensions,
} from 'react-native';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import VideoPlayer, { VideoTrack, VideoPlaylist, VideoPlayerRef } from './VideoPlayer';

const { width, height } = Dimensions.get('window');

interface VideoPlaylistManagerProps {
    playlists: VideoPlaylist[];
    onPlaylistsChange: (playlists: VideoPlaylist[]) => void;
    onTrackSelect?: (track: VideoTrack) => void;
    style?: any;
}

export const VideoPlaylistManager: React.FC<VideoPlaylistManagerProps> = ({
    playlists,
    onPlaylistsChange,
    onTrackSelect,
    style,
}) => {
    const { theme } = useTheme();
    const videoPlayerRef = useRef<VideoPlayerRef>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState<VideoPlaylist | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState<VideoPlaylist | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter playlists based on search
    const filteredPlaylists = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create new playlist
    const createPlaylist = () => {
        if (!newPlaylistName.trim()) {
            Alert.alert('Error', 'Please enter a playlist name');
            return;
        }

        const newPlaylist: VideoPlaylist = {
            id: Date.now().toString(),
            name: newPlaylistName.trim(),
            tracks: [],
            currentIndex: 0,
        };

        onPlaylistsChange([...playlists, newPlaylist]);
        setNewPlaylistName('');
        setIsCreateModalVisible(false);
    };

    // Delete playlist
    const deletePlaylist = (playlistId: string) => {
        Alert.alert(
            'Delete Playlist',
            'Are you sure you want to delete this playlist?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
                        onPlaylistsChange(updatedPlaylists);
                        if (selectedPlaylist?.id === playlistId) {
                            setSelectedPlaylist(null);
                        }
                    },
                },
            ]
        );
    };

    // Edit playlist
    const startEditPlaylist = (playlist: VideoPlaylist) => {
        setEditingPlaylist(playlist);
        setNewPlaylistName(playlist.name);
        setIsEditMode(true);
        setIsCreateModalVisible(true);
    };

    const updatePlaylist = () => {
        if (!editingPlaylist || !newPlaylistName.trim()) {
            Alert.alert('Error', 'Please enter a playlist name');
            return;
        }

        const updatedPlaylists = playlists.map(p =>
            p.id === editingPlaylist.id
                ? { ...p, name: newPlaylistName.trim() }
                : p
        );

        onPlaylistsChange(updatedPlaylists);
        setNewPlaylistName('');
        setIsCreateModalVisible(false);
        setIsEditMode(false);
        setEditingPlaylist(null);
    };

    // Add track to playlist
    const addTrackToPlaylist = (playlistId: string, track: VideoTrack) => {
        const updatedPlaylists = playlists.map(p =>
            p.id === playlistId
                ? { ...p, tracks: [...p.tracks, track] }
                : p
        );
        onPlaylistsChange(updatedPlaylists);
    };

    // Remove track from playlist
    const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
        const updatedPlaylists = playlists.map(p =>
            p.id === playlistId
                ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
                : p
        );
        onPlaylistsChange(updatedPlaylists);
    };

    // Move track in playlist
    const moveTrackInPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
        const updatedPlaylists = playlists.map(p => {
            if (p.id === playlistId) {
                const tracks = [...p.tracks];
                const [movedTrack] = tracks.splice(fromIndex, 1);
                tracks.splice(toIndex, 0, movedTrack);
                return { ...p, tracks };
            }
            return p;
        });
        onPlaylistsChange(updatedPlaylists);
    };

    // Play playlist
    const playPlaylist = (playlist: VideoPlaylist) => {
        if (playlist.tracks.length === 0) {
            Alert.alert('Empty Playlist', 'This playlist has no tracks');
            return;
        }

        setSelectedPlaylist(playlist);
        onTrackSelect?.(playlist.tracks[playlist.currentIndex]);
    };

    // Handle track selection
    const handleTrackSelect = (track: VideoTrack) => {
        onTrackSelect?.(track);
    };

    // Render playlist item
    const renderPlaylistItem = ({ item: playlist }: { item: VideoPlaylist }) => {
        const isSelected = selectedPlaylist?.id === playlist.id;
        const { pressStyle, handlePressIn, handlePressOut } = usePressAnimation();

        return (
            <TouchableOpacity
                style={[
                    styles.playlistItem,
                    {
                        backgroundColor: isSelected
                            ? theme.colors.primary + '20'
                            : theme.colors.surface,
                        borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                    },
                    pressStyle,
                ]}
                onPress={() => playPlaylist(playlist)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
            >
                <View style={styles.playlistItemContent}>
                    <View style={styles.playlistIcon}>
                        <MaterialIcons
                            name="playlist-play"
                            size={24}
                            color={isSelected ? theme.colors.primary : theme.colors.text.secondary}
                        />
                    </View>
                    <View style={styles.playlistInfo}>
                        <Text
                            style={[
                                styles.playlistName,
                                {
                                    color: isSelected
                                        ? theme.colors.primary
                                        : theme.colors.text.primary,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {playlist.name}
                        </Text>
                        <Text
                            style={[
                                styles.playlistDetails,
                                { color: theme.colors.text.secondary },
                            ]}
                        >
                            {playlist.tracks.length} track{playlist.tracks.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <View style={styles.playlistActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => startEditPlaylist(playlist)}
                        >
                            <Feather name="edit-2" size={16} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => deletePlaylist(playlist.id)}
                        >
                            <Feather name="trash-2" size={16} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Render track item
    const renderTrackItem = ({ item: track, index }: { item: VideoTrack; index: number }) => {
        const isCurrentTrack = selectedPlaylist?.tracks[selectedPlaylist.currentIndex]?.id === track.id;
        const { pressStyle, handlePressIn, handlePressOut } = usePressAnimation();

        return (
            <TouchableOpacity
                style={[
                    styles.trackItem,
                    {
                        backgroundColor: isCurrentTrack
                            ? theme.colors.primary + '20'
                            : theme.colors.surface,
                        borderColor: isCurrentTrack
                            ? theme.colors.primary
                            : theme.colors.border,
                    },
                    pressStyle,
                ]}
                onPress={() => handleTrackSelect(track)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
            >
                <View style={styles.trackItemContent}>
                    <View style={styles.trackNumber}>
                        <Text
                            style={[
                                styles.trackNumberText,
                                {
                                    color: isCurrentTrack
                                        ? theme.colors.primary
                                        : theme.colors.text.secondary,
                                },
                            ]}
                        >
                            {index + 1}
                        </Text>
                    </View>
                    <View style={styles.trackInfo}>
                        <Text
                            style={[
                                styles.trackTitle,
                                {
                                    color: isCurrentTrack
                                        ? theme.colors.primary
                                        : theme.colors.text.primary,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {track.title}
                        </Text>
                        <Text
                            style={[
                                styles.trackDuration,
                                { color: theme.colors.text.secondary },
                            ]}
                        >
                            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </Text>
                    </View>
                    <View style={styles.trackActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                if (selectedPlaylist) {
                                    removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                                }
                            }}
                        >
                            <Feather name="x" size={16} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        } as any,
        header: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        } as any,
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.medium,
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.m,
        } as any,
        searchIcon: {
            marginRight: theme.spacing.s,
        } as any,
        searchInput: {
            flex: 1,
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
            paddingVertical: theme.spacing.s,
            ...getFontStyle(theme.type, 'regular'),
        } as any,
        createButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.medium,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
        } as any,
        createButtonText: {
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.onPrimary,
            marginLeft: theme.spacing.xs,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        playlistsContainer: {
            flex: 1,
        } as any,
        playlistsList: {
            padding: theme.spacing.m,
        } as any,
        playlistItem: {
            borderRadius: theme.borderRadius.medium,
            borderWidth: 1,
            marginBottom: theme.spacing.s,
            overflow: 'hidden',
        } as any,
        playlistItemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
        } as any,
        playlistIcon: {
            marginRight: theme.spacing.m,
        } as any,
        playlistInfo: {
            flex: 1,
        } as any,
        playlistName: {
            fontSize: theme.typography.sizes.subtitle,
            marginBottom: theme.spacing.xs,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        playlistDetails: {
            fontSize: theme.typography.sizes.caption,
            ...getFontStyle(theme.type, 'regular'),
        } as any,
        playlistActions: {
            flexDirection: 'row',
        } as any,
        actionButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: theme.spacing.xs,
        } as any,
        tracksContainer: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        } as any,
        tracksHeader: {
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        } as any,
        tracksTitle: {
            fontSize: theme.typography.sizes.subtitle,
            color: theme.colors.text.primary,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        backButton: {
            padding: theme.spacing.xs,
        } as any,
        tracksList: {
            flex: 1,
        } as any,
        trackItem: {
            borderRadius: theme.borderRadius.medium,
            borderWidth: 1,
            marginHorizontal: theme.spacing.m,
            marginVertical: theme.spacing.xs,
            overflow: 'hidden',
        } as any,
        trackItemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
        } as any,
        trackNumber: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.m,
        } as any,
        trackNumberText: {
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.primary,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        trackInfo: {
            flex: 1,
        } as any,
        trackTitle: {
            fontSize: theme.typography.sizes.body1,
            marginBottom: theme.spacing.xs,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        trackDuration: {
            fontSize: theme.typography.sizes.caption,
            ...getFontStyle(theme.type, 'regular'),
        } as any,
        trackActions: {
            marginLeft: theme.spacing.m,
        } as any,
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        } as any,
        modalContent: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: theme.spacing.l,
            margin: theme.spacing.l,
            width: width - theme.spacing.l * 2,
        } as any,
        modalTitle: {
            fontSize: theme.typography.sizes.subtitle,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.m,
            textAlign: 'center',
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        modalInput: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.m,
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.m,
            ...getFontStyle(theme.type, 'regular'),
        } as any,
        modalButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        } as any,
        modalButton: {
            flex: 1,
            padding: theme.spacing.m,
            borderRadius: theme.borderRadius.medium,
            alignItems: 'center',
            marginHorizontal: theme.spacing.xs,
        } as any,
        cancelButton: {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        } as any,
        cancelButtonText: {
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        confirmButton: {
            backgroundColor: theme.colors.primary,
        } as any,
        confirmButtonText: {
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.onPrimary,
            ...getFontStyle(theme.type, 'medium'),
        } as any,
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.l,
        } as any,
        emptyText: {
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            ...getFontStyle(theme.type, 'regular'),
        } as any,
    });

    return (
        <View style={[styles.container, style]}>
            {!selectedPlaylist ? (
                // Playlists View
                <>
                    <View style={styles.header}>
                        <View style={styles.searchContainer}>
                            <Feather name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search playlists..."
                                placeholderTextColor={theme.colors.text.secondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => {
                                setIsCreateModalVisible(true);
                                setIsEditMode(false);
                                setNewPlaylistName('');
                            }}
                        >
                            <Feather name="plus" size={20} color={theme.colors.onPrimary} />
                            <Text style={styles.createButtonText}>Create Playlist</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.playlistsContainer}>
                        {filteredPlaylists.length > 0 ? (
                            <FlatList
                                data={filteredPlaylists}
                                renderItem={renderPlaylistItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.playlistsList}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {searchQuery ? 'No playlists found' : 'No playlists yet'}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            ) : (
                // Tracks View
                <View style={styles.tracksContainer}>
                    <View style={styles.tracksHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setSelectedPlaylist(null)}
                        >
                            <Feather name="arrow-left" size={24} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.tracksTitle}>{selectedPlaylist.name}</Text>
                        <View style={{ width: 32 }} />
                    </View>

                    {selectedPlaylist.tracks.length > 0 ? (
                        <FlatList
                            data={selectedPlaylist.tracks}
                            renderItem={renderTrackItem}
                            keyExtractor={(item) => item.id}
                            style={styles.tracksList}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No tracks in this playlist</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Create/Edit Playlist Modal */}
            <Modal
                visible={isCreateModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setIsCreateModalVisible(false);
                    setIsEditMode(false);
                    setEditingPlaylist(null);
                    setNewPlaylistName('');
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {isEditMode ? 'Edit Playlist' : 'Create New Playlist'}
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Playlist name"
                            placeholderTextColor={theme.colors.text.secondary}
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            autoFocus={true}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsCreateModalVisible(false);
                                    setIsEditMode(false);
                                    setEditingPlaylist(null);
                                    setNewPlaylistName('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={isEditMode ? updatePlaylist : createPlaylist}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {isEditMode ? 'Update' : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default VideoPlaylistManager;

/*
 * Sallie AI Audio Playlist Manager
 * Manage playlists and track collections
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather } from '@expo/vector-icons';
import { AudioTrack, Playlist } from './AudioPlayer';

interface PlaylistManagerProps {
    playlists: Playlist[];
    currentPlaylist?: Playlist;
    onPlaylistSelect: (playlist: Playlist) => void;
    onCreatePlaylist: (name: string) => void;
    onDeletePlaylist: (playlistId: string) => void;
    onAddToPlaylist: (playlistId: string, track: AudioTrack) => void;
    onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
    style?: any;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
    playlists,
    currentPlaylist,
    onPlaylistSelect,
    onCreatePlaylist,
    onDeletePlaylist,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    style,
}) => {
    const { theme } = useTheme();
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(currentPlaylist || null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    const handlePlaylistSelect = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        onPlaylistSelect(playlist);
    };

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            onCreatePlaylist(newPlaylistName.trim());
            setNewPlaylistName('');
            setShowCreateForm(false);
        }
    };

    const handleDeletePlaylist = (playlist: Playlist) => {
        Alert.alert(
            'Delete Playlist',
            `Are you sure you want to delete "${playlist.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDeletePlaylist(playlist.id)
                },
            ]
        );
    };

    const renderPlaylistItem = ({ item }: { item: Playlist }) => {
        const isSelected = selectedPlaylist?.id === item.id;
        const pressAnimation = usePressAnimation({ scale: 0.98, haptic: true });

        return (
            <TouchableOpacity
                style={[
                    styles.playlistItem,
                    isSelected && { borderColor: theme.colors.primary, borderWidth: 2 },
                    pressAnimation.style,
                ]}
                onPress={() => handlePlaylistSelect(item)}
            >
                <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.trackCount}>
                        {item.tracks.length} track{item.tracks.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                <View style={styles.playlistActions}>
                    {isSelected && (
                        <View style={styles.selectedIndicator}>
                            <Feather name="check" size={16} color={theme.colors.primary} />
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePlaylist(item)}
                    >
                        <Feather name="trash-2" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.light,
        },
        title: {
            ...getFontStyle(theme.type, 'bold'),
            fontSize: theme.typography.sizes.h2,
            color: theme.colors.text.primary,
        },
        createButton: {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.medium,
        },
        createButtonText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.onPrimary,
        },
        createForm: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.light,
        },
        input: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
            borderWidth: 1,
            borderColor: theme.colors.border.medium,
            borderRadius: theme.borderRadius.small,
            padding: theme.spacing.s,
            marginBottom: theme.spacing.s,
        },
        formButtons: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        formButton: {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            borderRadius: theme.borderRadius.small,
            marginLeft: theme.spacing.s,
        },
        cancelButton: {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border.medium,
        },
        cancelButtonText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.text.primary,
        },
        submitButton: {
            backgroundColor: theme.colors.primary,
        },
        submitButtonText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.onPrimary,
        },
        playlistList: {
            flex: 1,
        },
        playlistItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            marginHorizontal: theme.spacing.m,
            marginVertical: theme.spacing.xs,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            elevation: 2,
            shadowColor: theme.colors.text.primary,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        playlistInfo: {
            flex: 1,
        },
        playlistName: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.subtitle,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
        },
        trackCount: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
        },
        playlistActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        selectedIndicator: {
            marginRight: theme.spacing.s,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginBottom: theme.spacing.m,
        },
        emptySubtext: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body2,
            color: theme.colors.text.tertiary,
            textAlign: 'center',
        },
    });

    return (
        <View style={[styles.container, style]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Playlists</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateForm(!showCreateForm)}
                >
                    <Text style={styles.createButtonText}>
                        {showCreateForm ? 'Cancel' : 'Create'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Create Form */}
            {showCreateForm && (
                <View style={styles.createForm}>
                    <TextInput
                        style={styles.input}
                        placeholder="Playlist name"
                        value={newPlaylistName}
                        onChangeText={setNewPlaylistName}
                        placeholderTextColor={theme.colors.text.tertiary}
                    />
                    <View style={styles.formButtons}>
                        <TouchableOpacity
                            style={[styles.formButton, styles.cancelButton]}
                            onPress={() => {
                                setShowCreateForm(false);
                                setNewPlaylistName('');
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.formButton, styles.submitButton]}
                            onPress={handleCreatePlaylist}
                        >
                            <Text style={styles.submitButtonText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Playlist List */}
            {playlists.length > 0 ? (
                <FlatList
                    style={styles.playlistList}
                    data={playlists}
                    renderItem={renderPlaylistItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: theme.spacing.m }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No playlists yet</Text>
                    <Text style={styles.emptySubtext}>
                        Create your first playlist to start organizing your music
                    </Text>
                </View>
            )}
        </View>
    );
};

export default PlaylistManager;

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

const { width } = Dimensions.get('window');

export interface MediaFile {
    id: string;
    uri: string;
    type: 'image' | 'video' | 'document' | 'audio';
    name: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
}

interface MediaUploadProps {
    onUpload?: (files: MediaFile[]) => void;
    onProgress?: (progress: number) => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    allowedTypes?: ('image' | 'video' | 'document' | 'audio')[];
    style?: any;
}

export function MediaUpload({
    onUpload,
    onProgress,
    maxFiles = 5,
    maxFileSize = 10, // 10MB default
    allowedTypes = ['image', 'video', 'document', 'audio'],
    style,
}: MediaUploadProps) {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please grant access to your media library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: true,
                selectionLimit: maxFiles - selectedFiles.length,
            });

            if (!result.canceled) {
                const newFiles: MediaFile[] = result.assets.map(asset => ({
                    id: Date.now().toString() + Math.random(),
                    uri: asset.uri,
                    type: asset.type === 'image' ? 'image' : 'video' as 'image' | 'video',
                    name: asset.fileName || `file_${Date.now()}`,
                    size: asset.fileSize || 0,
                    mimeType: asset.mimeType || 'application/octet-stream',
                    width: asset.width,
                    height: asset.height,
                    duration: asset.duration ?? undefined,
                }));

                setSelectedFiles(prev => [...prev, ...newFiles]);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick media');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled) {
                const files: MediaFile[] = result.assets.map(asset => ({
                    id: Date.now().toString() + Math.random(),
                    uri: asset.uri,
                    type: 'document',
                    name: asset.name,
                    size: asset.size || 0,
                    mimeType: asset.mimeType || 'application/octet-stream',
                }));

                setSelectedFiles(prev => [...prev, ...files]);
            }
        } catch (error) {
            console.error('Document picker error:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const takePhoto = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please grant access to your camera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const file: MediaFile = {
                    id: Date.now().toString() + Math.random(),
                    uri: asset.uri,
                    type: 'image',
                    name: asset.fileName || `photo_${Date.now()}.jpg`,
                    size: asset.fileSize || 0,
                    mimeType: asset.mimeType || 'image/jpeg',
                    width: asset.width,
                    height: asset.height,
                };

                setSelectedFiles(prev => [...prev, file]);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const recordVideo = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please grant access to your camera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                videoMaxDuration: 60, // 1 minute max
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const file: MediaFile = {
                    id: Date.now().toString() + Math.random(),
                    uri: asset.uri,
                    type: 'video',
                    name: asset.fileName || `video_${Date.now()}.mp4`,
                    size: asset.fileSize || 0,
                    mimeType: asset.mimeType || 'video/mp4',
                    width: asset.width,
                    height: asset.height,
                    duration: asset.duration ?? undefined,
                };

                setSelectedFiles(prev => [...prev, file]);
            }
        } catch (error) {
            console.error('Video recording error:', error);
            Alert.alert('Error', 'Failed to record video');
        }
    };

    const removeFile = (fileId: string) => {
        setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) {
            Alert.alert('No Files', 'Please select files to upload');
            return;
        }

        // Validate file sizes
        const oversizedFiles = selectedFiles.filter(file => file.size > maxFileSize * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            Alert.alert('File Too Large', `Some files exceed the ${maxFileSize}MB limit`);
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = prev + Math.random() * 20;
                    if (newProgress >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    onProgress?.(newProgress);
                    return newProgress;
                });
            }, 200);

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            clearInterval(progressInterval);
            setUploadProgress(100);
            onProgress?.(100);

            // Call onUpload callback
            onUpload?.(selectedFiles);

            Alert.alert('Success', `Successfully uploaded ${selectedFiles.length} file(s)`);
            setSelectedFiles([]);
            setUploadProgress(0);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const renderFilePreview = (file: MediaFile) => {
        return (
            <EnhancedCard
                key={file.id}
                variant="glass"
                style={styles.fileCard}
                onPress={() => removeFile(file.id)}
            >
                <View style={styles.filePreview}>
                    {file.type === 'image' && (
                        <Image source={{ uri: file.uri }} style={styles.imagePreview} />
                    )}
                    {file.type === 'video' && (
                        <View style={styles.videoPreview}>
                            <Text style={styles.videoIcon}>🎥</Text>
                        </View>
                    )}
                    {file.type === 'document' && (
                        <View style={styles.documentPreview}>
                            <Text style={styles.documentIcon}>📄</Text>
                        </View>
                    )}
                    {file.type === 'audio' && (
                        <View style={styles.audioPreview}>
                            <Text style={styles.audioIcon}>🎵</Text>
                        </View>
                    )}

                    <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>
                            {file.name}
                        </Text>
                        <Text style={styles.fileSize}>
                            {formatFileSize(file.size)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(file.id)}
                    >
                        <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                </View>
            </EnhancedCard>
        );
    };

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>Media Upload</Text>

            {/* Upload Options */}
            <View style={styles.uploadOptions}>
                {allowedTypes.includes('image') && (
                    <EnhancedButton
                        title="Pick Images"
                        variant="outline"
                        onPress={pickImage}
                        style={styles.uploadButton}
                        disabled={uploading || selectedFiles.length >= maxFiles}
                    />
                )}

                {allowedTypes.includes('video') && (
                    <EnhancedButton
                        title="Pick Videos"
                        variant="outline"
                        onPress={pickImage}
                        style={styles.uploadButton}
                        disabled={uploading || selectedFiles.length >= maxFiles}
                    />
                )}

                {allowedTypes.includes('document') && (
                    <EnhancedButton
                        title="Pick Documents"
                        variant="outline"
                        onPress={pickDocument}
                        style={styles.uploadButton}
                        disabled={uploading || selectedFiles.length >= maxFiles}
                    />
                )}

                {allowedTypes.includes('image') && (
                    <EnhancedButton
                        title="Take Photo"
                        variant="outline"
                        onPress={takePhoto}
                        style={styles.uploadButton}
                        disabled={uploading || selectedFiles.length >= maxFiles}
                    />
                )}

                {allowedTypes.includes('video') && (
                    <EnhancedButton
                        title="Record Video"
                        variant="outline"
                        onPress={recordVideo}
                        style={styles.uploadButton}
                        disabled={uploading || selectedFiles.length >= maxFiles}
                    />
                )}
            </View>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <View style={styles.filesContainer}>
                    <Text style={styles.filesTitle}>
                        Selected Files ({selectedFiles.length}/{maxFiles})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedFiles.map(renderFilePreview)}
                    </ScrollView>
                </View>
            )}

            {/* Upload Progress */}
            {uploading && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Uploading... {Math.round(uploadProgress)}%
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${uploadProgress}%` },
                            ]}
                        />
                    </View>
                </View>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
                <EnhancedButton
                    title={uploading ? "Uploading..." : "Upload Files"}
                    variant="primary"
                    onPress={uploadFiles}
                    disabled={uploading}
                    style={styles.mainUploadButton}
                />
            )}

            {/* Info Text */}
            <Text style={styles.infoText}>
                Max {maxFiles} files, {maxFileSize}MB each
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    uploadOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    uploadButton: {
        flex: 1,
        minWidth: 120,
    },
    filesContainer: {
        marginBottom: 16,
    },
    filesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f5f5f5',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    fileCard: {
        width: 120,
        marginRight: 8,
    },
    filePreview: {
        alignItems: 'center',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
    },
    videoPreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    videoIcon: {
        fontSize: 32,
    },
    documentPreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    documentIcon: {
        fontSize: 32,
    },
    audioPreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    audioIcon: {
        fontSize: 32,
    },
    fileInfo: {
        alignItems: 'center',
    },
    fileName: {
        fontSize: 12,
        color: '#f5f5f5',
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
    fileSize: {
        fontSize: 10,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeIcon: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressText: {
        fontSize: 14,
        color: '#f5f5f5',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 2,
    },
    mainUploadButton: {
        marginBottom: 16,
    },
    infoText: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
});

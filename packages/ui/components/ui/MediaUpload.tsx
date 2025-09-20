/*
 * Sallie AI Media Upload Component
 * Advanced file upload with progress tracking and validation
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather, MaterialIcons } from '@expo/vector-icons';
// import { AssetCacheManager } from './AssetCacheManager';

const { width, height } = Dimensions.get('window');

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export interface UploadResult {
    uri: any;
    success: boolean;
    url?: string;
    error?: string;
    metadata?: Record<string, any>;
}

export interface MediaFile {
    uri: string;
    name: string;
    type: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number;
}

export type UploadType = 'image' | 'video' | 'audio' | 'document' | 'all';

interface MediaUploadProps {
    uploadType?: UploadType;
    maxFileSize?: number; // in bytes
    allowedExtensions?: string[];
    multiple?: boolean;
    autoUpload?: boolean;
    showPreview?: boolean;
    onUploadStart?: (files: MediaFile[]) => void;
    onUploadProgress?: (progress: UploadProgress) => void;
    onUploadComplete?: (results: UploadResult[]) => void;
    onUploadError?: (error: string) => void;
    uploadEndpoint?: string;
    style?: any;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
    uploadType = 'all',
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    allowedExtensions = [],
    multiple = false,
    autoUpload = true,
    showPreview = true,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    uploadEndpoint,
    style,
}) => {
    const { theme } = useTheme();
    const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    // const cacheManager = AssetCacheManager.getInstance();

    // Request permissions
    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Camera and media library permissions are required to upload files.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Validate file
    const validateFile = (file: MediaFile): string | null => {
        // Check file size
        if (file.size > maxFileSize) {
            return `File size exceeds maximum limit of ${Math.round(maxFileSize / (1024 * 1024))}MB`;
        }

        // Check file extension
        if (allowedExtensions.length > 0) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (!extension || !allowedExtensions.includes(extension)) {
                return `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`;
            }
        }

        // Check file type compatibility
        const typeCategory = getFileTypeCategory(file.type);
        if (uploadType !== 'all' && typeCategory !== uploadType) {
            return `File type ${typeCategory} not allowed for this upload`;
        }

        return null;
    };

    // Get file type category
    const getFileTypeCategory = (mimeType: string): UploadType => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'document';
    };

    // Pick from gallery
    const pickFromGallery = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            let result;
            if (uploadType === 'image' || uploadType === 'all') {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    allowsMultipleSelection: multiple,
                    quality: 0.8,
                });
            } else if ((uploadType as string) === 'video' || (uploadType as string) === 'all') {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: false,
                    allowsMultipleSelection: multiple,
                    quality: 0.8,
                });
            } else if ((uploadType as string) === 'audio' || (uploadType as string) === 'all') {
                // For audio files, use image picker with videos (includes audio)
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: false,
                    allowsMultipleSelection: multiple,
                    quality: 0.8,
                });
            } else {
                // For documents or mixed types - fallback to images
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    allowsMultipleSelection: multiple,
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets) {
                const files: MediaFile[] = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.fileName || `file_${Date.now()}`,
                    type: asset.type || 'image/jpeg',
                    size: asset.fileSize || 0,
                    width: asset.width,
                    height: asset.height,
                    duration: asset.duration ? Number(asset.duration) : undefined,
                }));

                handleFileSelection(files);
            }
        } catch (error) {
            console.error('Gallery pick error:', error);
            Alert.alert('Error', 'Failed to pick files from gallery');
        }
    };

    // Take photo/video
    const takeMedia = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            let result;
            if (uploadType === 'image' || uploadType === 'all') {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                });
            } else if ((uploadType as string) === 'video' || (uploadType as string) === 'all') {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: false,
                    quality: 0.8,
                });
            } else {
                Alert.alert('Error', 'Camera capture not supported for this file type');
                return;
            }

            if (!result.canceled && result.assets) {
                const files: MediaFile[] = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.fileName || `capture_${Date.now()}`,
                    type: asset.type || 'image/jpeg',
                    size: asset.fileSize || 0,
                    width: asset.width,
                    height: asset.height,
                    duration: asset.duration ? Number(asset.duration) : undefined,
                }));

                handleFileSelection(files);
            }
        } catch (error) {
            console.error('Camera capture error:', error);
            Alert.alert('Error', 'Failed to capture media');
        }
    };

    // Handle file selection
    const handleFileSelection = (files: MediaFile[]) => {
        const validFiles: MediaFile[] = [];
        const errors: string[] = [];

        for (const file of files) {
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
            } else {
                validFiles.push(file);
            }
        }

        if (errors.length > 0) {
            Alert.alert('Validation Errors', errors.join('\n'));
        }

        if (validFiles.length > 0) {
            if (multiple) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
            } else {
                setSelectedFiles(validFiles);
            }

            // Generate previews
            if (showPreview) {
                generatePreviews(validFiles);
            }

            if (autoUpload) {
                uploadFiles(validFiles);
            }
        }
    };

    // Generate previews
    const generatePreviews = async (files: MediaFile[]) => {
        const newPreviews: string[] = [];

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                newPreviews.push(file.uri);
            } else if (file.type.startsWith('video/')) {
                // For videos, we could generate thumbnail, but for now just show icon
                newPreviews.push('video');
            } else {
                newPreviews.push('document');
            }
        }

        setPreviews(prev => [...prev, ...newPreviews]);
    };

    // Upload files
    const uploadFiles = async (files: MediaFile[] = selectedFiles) => {
        if (files.length === 0) return;

        setUploading(true);
        setUploadProgress(null);
        onUploadStart?.(files);

        try {
            const results: UploadResult[] = [];

            for (const file of files) {
                const result = await uploadFile(file);
                results.push(result);
            }

            onUploadComplete?.(results);

            // Clear selected files on success
            setSelectedFiles([]);
            setPreviews([]);

        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            onUploadError?.(errorMessage);
            Alert.alert('Upload Error', errorMessage);
        } finally {
            setUploading(false);
            setUploadProgress(null);
        }
    };

    // Upload single file
    const uploadFile = async (file: MediaFile): Promise<UploadResult> => {
        try {
            // If no upload endpoint, simulate upload
            if (!uploadEndpoint) {
                await simulateUpload(file);
                return {
                    success: true,
                    url: file.uri,
                    uri: file.uri,
                    metadata: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    },
                };
            }

            // Real upload implementation
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Cache the uploaded asset
            // await cacheManager.cacheAsset(result.url, getFileTypeCategory(file.type), {
            //     originalName: file.name,
            //     uploadedAt: Date.now(),
            // });

            return {
                success: true,
                url: result.url,
                uri: result.url,
                metadata: result.metadata,
            };

        } catch (error) {
            console.error('File upload error:', error);
            return {
                success: false,
                uri: undefined,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    };

    // Simulate upload with progress
    const simulateUpload = async (file: MediaFile): Promise<void> => {
        const total = file.size;
        let loaded = 0;

        const updateProgress = () => {
            loaded += Math.random() * 10000;
            if (loaded > total) loaded = total;

            const progress: UploadProgress = {
                loaded,
                total,
                percentage: (loaded / total) * 100,
            };

            setUploadProgress(progress);
            onUploadProgress?.(progress);

            if (loaded < total) {
                setTimeout(updateProgress, 100);
            }
        };

        updateProgress();

        // Wait for completion
        await new Promise(resolve => {
            const checkComplete = () => {
                if (loaded >= total) {
                    resolve(void 0);
                } else {
                    setTimeout(checkComplete, 100);
                }
            };
            checkComplete();
        });
    };

    // Remove file
    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Get MIME type from extension
    const getMimeTypeFromExtension = (extension: string): string => {
        const mimeTypes: Record<string, string> = {
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'webp': 'image',
            'mp4': 'video',
            'mov': 'video',
            'avi': 'video',
            'mkv': 'video',
            'mp3': 'audio',
            'wav': 'audio',
            'm4a': 'audio',
            'pdf': 'application',
            'doc': 'application',
            'docx': 'application',
            'txt': 'text',
            'json': 'application',
            'xml': 'application',
        };

        return mimeTypes[extension.toLowerCase()] || 'application';
    };

    // Render preview
    const renderPreview = (preview: string, index: number) => {
        if (preview === 'video') {
            return (
                <View key={index} style={styles.previewContainer}>
                    <View style={styles.previewPlaceholder}>
                        <MaterialIcons name="videocam" size={48} color={theme.colors.text.secondary} />
                        <Text style={styles.previewText}>Video</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(index)}
                    >
                        <Feather name="x" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            );
        } else if (preview === 'document') {
            return (
                <View key={index} style={styles.previewContainer}>
                    <View style={styles.previewPlaceholder}>
                        <MaterialIcons name="description" size={48} color={theme.colors.text.secondary} />
                        <Text style={styles.previewText}>Document</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(index)}
                    >
                        <Feather name="x" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View key={index} style={styles.previewContainer}>
                    <Image source={{ uri: preview }} style={styles.previewImage} />
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(index)}
                    >
                        <Feather name="x" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            );
        }
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.m,
            ...(!style && {
                elevation: 2,
                shadowColor: theme.colors.text.primary,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            }),
        },
        uploadArea: {
            borderWidth: 2,
            borderColor: '#E0E0E0',
            borderStyle: 'dashed',
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.l,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
        },
        uploadText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.s,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: theme.spacing.m,
        },
        uploadButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.medium,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
        },
        uploadButtonText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.onPrimary,
            marginLeft: theme.spacing.xs,
        },
        secondaryButton: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: theme.borderRadius.medium,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
        },
        secondaryButtonText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.primary,
            marginLeft: theme.spacing.xs,
        },
        previewsContainer: {
            marginTop: theme.spacing.m,
        },
        previewsScroll: {
            flexDirection: 'row',
        },
        previewContainer: {
            position: 'relative',
            marginRight: theme.spacing.s,
        },
        previewImage: {
            width: 80,
            height: 80,
            borderRadius: theme.borderRadius.small,
        },
        previewPlaceholder: {
            width: 80,
            height: 80,
            borderRadius: theme.borderRadius.small,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E0E0E0',
        },
        previewText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.xs,
        },
        removeButton: {
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#FF6B6B',
            alignItems: 'center',
            justifyContent: 'center',
        },
        progressContainer: {
            marginTop: theme.spacing.m,
            alignItems: 'center',
        },
        progressBar: {
            width: '100%',
            height: 4,
            backgroundColor: '#E0E0E0',
            borderRadius: 2,
            marginBottom: theme.spacing.s,
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
        },
        progressText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
        },
        fileList: {
            marginTop: theme.spacing.m,
        },
        fileItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.small,
            marginBottom: theme.spacing.xs,
        },
        fileIcon: {
            marginRight: theme.spacing.s,
        },
        fileInfo: {
            flex: 1,
        },
        fileName: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
        },
        fileSize: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
        },
    });

    return (
        <View style={[styles.container, style]}>
            {/* Upload Area */}
            <TouchableOpacity
                style={styles.uploadArea}
                onPress={pickFromGallery}
                disabled={uploading}
            >
                <Feather name="upload" size={48} color={theme.colors.text.secondary} />
                <Text style={styles.uploadText}>
                    {uploading ? 'Uploading...' : 'Tap to select files or drag and drop'}
                </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickFromGallery}
                    disabled={uploading}
                >
                    <Feather name="image" size={20} color={theme.colors.onPrimary} />
                    <Text style={styles.uploadButtonText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={takeMedia}
                    disabled={uploading}
                >
                    <Feather name="camera" size={20} color={theme.colors.primary} />
                    <Text style={styles.secondaryButtonText}>Camera</Text>
                </TouchableOpacity>
            </View>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
                <View style={styles.fileList}>
                    {selectedFiles.map((file, index) => (
                        <View key={index} style={styles.fileItem}>
                            <MaterialIcons
                                name={
                                    file.type.startsWith('image/') ? 'image' :
                                        file.type.startsWith('video/') ? 'videocam' :
                                            file.type.startsWith('audio/') ? 'audiotrack' : 'description'
                                }
                                size={24}
                                color={theme.colors.text.secondary}
                                style={styles.fileIcon}
                            />
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {file.name}
                                </Text>
                                <Text style={styles.fileSize}>
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => removeFile(index)}
                                disabled={uploading}
                            >
                                <Feather name="x" size={20} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Previews */}
            {showPreview && previews.length > 0 && (
                <View style={styles.previewsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.previewsScroll}
                    >
                        {previews.map((preview, index) => renderPreview(preview, index))}
                    </ScrollView>
                </View>
            )}

            {/* Upload Progress */}
            {uploading && uploadProgress && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${uploadProgress.percentage}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {uploadProgress.percentage.toFixed(1)}% uploaded
                    </Text>
                </View>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && !autoUpload && (
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => uploadFiles()}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                    ) : (
                        <Feather name="upload" size={20} color={theme.colors.onPrimary} />
                    )}
                    <Text style={styles.uploadButtonText}>
                        {uploading ? 'Uploading...' : 'Upload Files'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default MediaUpload;

import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export interface CameraResult {
  uri: string;
  type: 'photo' | 'video';
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
}

export class CameraIntegration {
  private static instance: CameraIntegration;

  static getInstance(): CameraIntegration {
    if (!CameraIntegration.instance) {
      CameraIntegration.instance = new CameraIntegration();
    }
    return CameraIntegration.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      
      return cameraPermission.granted && mediaLibraryPermission.granted;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  async takePhoto(): Promise<CameraResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permissions not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'photo',
          width: asset.width,
          height: asset.height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  async recordVideo(): Promise<CameraResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permissions not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'video',
          width: asset.width,
          height: asset.height,
          duration: asset.duration ?? undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('Error recording video:', error);
      return null;
    }
  }

  async pickFromGallery(): Promise<CameraResult | null> {
    try {
      const hasPermission = await MediaLibrary.requestPermissionsAsync();
      if (!hasPermission.granted) {
        throw new Error('Media library permissions not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking from gallery:', error);
      return null;
    }
  }

  async saveToGallery(uri: string): Promise<boolean> {
    try {
      const hasPermission = await MediaLibrary.requestPermissionsAsync();
      if (!hasPermission.granted) {
        throw new Error('Media library permissions not granted');
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
    }
  }

  async getRecentPhotos(limit: number = 20): Promise<CameraResult[]> {
    try {
      const hasPermission = await MediaLibrary.requestPermissionsAsync();
      if (!hasPermission.granted) {
        throw new Error('Media library permissions not granted');
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: limit,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      return media.assets.map(asset => ({
        uri: asset.uri,
        type: 'photo' as const,
        width: asset.width,
        height: asset.height,
      }));
    } catch (error) {
      console.error('Error getting recent photos:', error);
      return [];
    }
  }
}

export default CameraIntegration;

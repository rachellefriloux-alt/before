import { Video, AVPlaybackStatus } from 'expo-av';
import { VideoTrack } from './types';

export class VideoManager {
  private static instance: VideoManager;
  private video: Video | null = null;
  private currentVideo: VideoTrack | null = null;
  private playlist: VideoTrack[] = [];
  private currentIndex = -1;
  private isPlaying = false;
  private listeners: Map<string, Function> = new Map();

  private constructor() {}

  static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  async loadPlaylist(videos: VideoTrack[], startIndex = 0) {
    this.playlist = [...videos];
    this.currentIndex = Math.min(startIndex, videos.length - 1);
    if (this.currentIndex >= 0) {
      await this.loadVideo(this.playlist[this.currentIndex]);
    }
  }

  private async loadVideo(videoTrack: VideoTrack) {
    try {
      if (this.video) {
        await this.video.unloadAsync();
      }

      // Note: Video loading is handled by the VideoPlayer component
      // This manager handles playlist logic and state
      this.currentVideo = videoTrack;
      this.notifyListeners('videoLoaded', videoTrack);
    } catch (error) {
      console.error('Failed to load video:', error);
      this.notifyListeners('error', error);
    }
  }

  async play() {
    this.isPlaying = true;
    this.notifyListeners('playbackStateChanged', { isPlaying: true });
  }

  async pause() {
    this.isPlaying = false;
    this.notifyListeners('playbackStateChanged', { isPlaying: false });
  }

  async stop() {
    this.isPlaying = false;
    this.notifyListeners('playbackStateChanged', { isPlaying: false });
  }

  async next() {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      await this.loadVideo(this.playlist[this.currentIndex]);
    }
  }

  async previous() {
    if (this.playlist.length > 0) {
      this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
      await this.loadVideo(this.playlist[this.currentIndex]);
    }
  }

  async playVideo(video: VideoTrack) {
    const index = this.playlist.findIndex(v => v.id === video.id);
    if (index >= 0) {
      this.currentIndex = index;
      await this.loadVideo(video);
    }
  }

  async addToPlaylist(video: VideoTrack) {
    this.playlist.push(video);
    this.notifyListeners('playlistUpdated', this.playlist);
  }

  async removeFromPlaylist(videoId: string) {
    const index = this.playlist.findIndex(v => v.id === videoId);
    if (index >= 0) {
      this.playlist.splice(index, 1);
      if (this.currentIndex >= index && this.currentIndex > 0) {
        this.currentIndex--;
      }
      this.notifyListeners('playlistUpdated', this.playlist);
    }
  }

  getCurrentVideo(): VideoTrack | null {
    return this.currentVideo;
  }

  getPlaylist(): VideoTrack[] {
    return [...this.playlist];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Event system
  addListener(event: string, callback: Function) {
    this.listeners.set(event, callback);
  }

  removeListener(event: string) {
    this.listeners.delete(event);
  }

  private notifyListeners(event: string, data?: any) {
    const listener = this.listeners.get(event);
    if (listener) {
      listener(data);
    }
  }

  // Cleanup
  async cleanup() {
    if (this.video) {
      await this.video.unloadAsync();
      this.video = null;
    }
    this.currentVideo = null;
    this.playlist = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.listeners.clear();
  }
}

// Export singleton instance
export const videoManager = VideoManager.getInstance();

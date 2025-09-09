import { Audio } from 'expo-av';

export interface AudioTrack {
  id: string;
  uri: string;
  title?: string;
  artist?: string;
  artwork?: string;
  duration?: number;
}

export class AudioManager {
  private static instance: AudioManager;
  private sound: Audio.Sound | null = null;
  private currentTrack: AudioTrack | null = null;
  private playlist: AudioTrack[] = [];
  private currentIndex = -1;
  private isPlaying = false;
  private listeners: Map<string, Function> = new Map();

  private constructor() {
    this.initializeAudio();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 'doNotMix' as any,
        interruptionModeAndroid: 'doNotMix' as any,
      });
    } catch (error) {
      console.error('Failed to initialize audio mode:', error);
    }
  }

  async loadPlaylist(tracks: AudioTrack[], startIndex = 0) {
    this.playlist = [...tracks];
    this.currentIndex = Math.min(startIndex, tracks.length - 1);
    if (this.currentIndex >= 0) {
      await this.loadTrack(this.playlist[this.currentIndex]);
    }
  }

  private async loadTrack(track: AudioTrack) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      this.currentTrack = track;
      this.notifyListeners('trackLoaded', track);
    } catch (error) {
      console.error('Failed to load track:', error);
      this.notifyListeners('error', error);
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      this.isPlaying = status.isPlaying;

      if (status.didJustFinish) {
        this.handleTrackEnd();
      }

      this.notifyListeners('playbackStatusUpdate', {
        isPlaying: status.isPlaying,
        position: status.positionMillis / 1000,
        duration: status.durationMillis / 1000,
        currentTrack: this.currentTrack,
      });
    } else if (status.error) {
      this.notifyListeners('error', status.error);
    }
  }

  private handleTrackEnd() {
    this.notifyListeners('trackEnded', this.currentTrack);
    // Auto-play next track
    this.next();
  }

  async play() {
    if (this.sound && !this.isPlaying) {
      await this.sound.playAsync();
    }
  }

  async pause() {
    if (this.sound && this.isPlaying) {
      await this.sound.pauseAsync();
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      this.isPlaying = false;
    }
  }

  async seekTo(position: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(position * 1000);
    }
  }

  async next() {
    if (this.playlist.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      await this.loadTrack(this.playlist[this.currentIndex]);
      if (this.isPlaying) {
        await this.play();
      }
    }
  }

  async previous() {
    if (this.playlist.length > 0) {
      this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
      await this.loadTrack(this.playlist[this.currentIndex]);
      if (this.isPlaying) {
        await this.play();
      }
    }
  }

  async playTrack(track: AudioTrack) {
    const index = this.playlist.findIndex(t => t.id === track.id);
    if (index >= 0) {
      this.currentIndex = index;
      await this.loadTrack(track);
      await this.play();
    }
  }

  async addToPlaylist(track: AudioTrack) {
    this.playlist.push(track);
    this.notifyListeners('playlistUpdated', this.playlist);
  }

  async removeFromPlaylist(trackId: string) {
    const index = this.playlist.findIndex(t => t.id === trackId);
    if (index >= 0) {
      this.playlist.splice(index, 1);
      if (this.currentIndex >= index && this.currentIndex > 0) {
        this.currentIndex--;
      }
      this.notifyListeners('playlistUpdated', this.playlist);
    }
  }

  async shuffle() {
    if (this.playlist.length > 1) {
      const currentTrack = this.currentTrack;
      const shuffled = [...this.playlist].sort(() => Math.random() - 0.5);
      this.playlist = shuffled;
      if (currentTrack) {
        this.currentIndex = this.playlist.findIndex(t => t.id === currentTrack.id);
      }
      this.notifyListeners('playlistUpdated', this.playlist);
    }
  }

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  getPlaylist(): AudioTrack[] {
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
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.currentTrack = null;
    this.playlist = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.listeners.clear();
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

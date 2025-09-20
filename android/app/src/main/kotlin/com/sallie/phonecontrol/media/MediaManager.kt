/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * MediaManager - Interface for media control operations
 */

package com.sallie.phonecontrol.media

import android.graphics.Bitmap
import kotlinx.coroutines.flow.Flow
import java.io.File

/**
 * Interface for managing and controlling media playback and media files
 */
interface MediaManager {

    /**
     * Media playback state
     */
    enum class PlaybackState {
        PLAYING,
        PAUSED,
        STOPPED,
        BUFFERING,
        ERROR
    }
    
    /**
     * Data class representing media playback status
     */
    data class PlaybackStatus(
        val isPlaying: Boolean,
        val title: String?,
        val artist: String?,
        val album: String?,
        val duration: Long, // in milliseconds
        val position: Long, // in milliseconds
        val artworkBitmap: Bitmap?,
        val packageName: String?,
        val state: PlaybackState
    )
    
    /**
     * Data class representing a media file
     */
    data class MediaFile(
        val id: String,
        val title: String,
        val artist: String?,
        val album: String?,
        val duration: Long, // in milliseconds
        val size: Long, // in bytes
        val path: String,
        val mimeType: String,
        val dateAdded: Long,
        val dateModified: Long,
        val thumbnailBitmap: Bitmap?
    )
    
    /**
     * Media control events
     */
    sealed class MediaEvent {
        data class PlaybackStateChanged(val status: PlaybackStatus) : MediaEvent()
        data class MediaSessionActive(val packageName: String, val title: String?) : MediaEvent()
        data class MediaSessionInactive(val packageName: String) : MediaEvent()
    }
    
    /**
     * Flow of media events
     */
    val mediaEvents: Flow<MediaEvent>
    
    /**
     * Get current media playback status
     * 
     * @return Result containing PlaybackStatus or an error
     */
    suspend fun getPlaybackStatus(): Result<PlaybackStatus>
    
    /**
     * Play/resume media playback
     * 
     * @return Result indicating success or failure
     */
    suspend fun play(): Result<Unit>
    
    /**
     * Pause media playback
     * 
     * @return Result indicating success or failure
     */
    suspend fun pause(): Result<Unit>
    
    /**
     * Stop media playback
     * 
     * @return Result indicating success or failure
     */
    suspend fun stop(): Result<Unit>
    
    /**
     * Skip to next track
     * 
     * @return Result indicating success or failure
     */
    suspend fun skipToNext(): Result<Unit>
    
    /**
     * Skip to previous track
     * 
     * @return Result indicating success or failure
     */
    suspend fun skipToPrevious(): Result<Unit>
    
    /**
     * Seek to position in current track
     * 
     * @param position Position in milliseconds
     * @return Result indicating success or failure
     */
    suspend fun seekTo(position: Long): Result<Unit>
    
    /**
     * Set media volume
     * 
     * @param volume Level between 0 and 1
     * @return Result indicating success or failure
     */
    suspend fun setVolume(volume: Float): Result<Unit>
    
    /**
     * Get list of audio files on device
     * 
     * @param limit Maximum number of files to return
     * @return Result containing list of MediaFile objects or an error
     */
    suspend fun getAudioFiles(limit: Int = 100): Result<List<MediaFile>>
    
    /**
     * Get list of video files on device
     * 
     * @param limit Maximum number of files to return
     * @return Result containing list of MediaFile objects or an error
     */
    suspend fun getVideoFiles(limit: Int = 100): Result<List<MediaFile>>
    
    /**
     * Play specific media file
     * 
     * @param mediaFile MediaFile to play
     * @return Result indicating success or failure
     */
    suspend fun playMediaFile(mediaFile: MediaFile): Result<Unit>
    
    /**
     * Check if media control functionality is available on this device
     * 
     * @return true if available, false otherwise
     */
    suspend fun isMediaControlFunctionalityAvailable(): Boolean
}

/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * MediaManagerImpl - Implementation for media control operations
 */

package com.sallie.phonecontrol.media

import android.Manifest
import android.content.BroadcastReceiver
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaMetadata
import android.media.MediaPlayer
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.view.KeyEvent
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.PhoneControlEvent
import com.sallie.phonecontrol.PhoneControlManager
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.merge
import java.io.File

/**
 * Implementation of MediaManager for controlling media playback and files
 */
class MediaManagerImpl(
    private val context: Context,
    private val permissionManager: PermissionManager,
    private val phoneControlManager: PhoneControlManager
) : MediaManager {

    private val _mediaEvents = MutableSharedFlow<MediaManager.MediaEvent>(extraBufferCapacity = 10)
    private var mediaPlayer: MediaPlayer? = null
    private var activeController: MediaController? = null
    
    companion object {
        private const val MEDIA_CONTROL_CONSENT_ACTION = "media_control"
        private const val MEDIA_FILES_CONSENT_ACTION = "media_files_access"
    }
    
    // Media session callback to track active media controllers
    private val controllerCallback = object : MediaController.Callback() {
        override fun onPlaybackStateChanged(state: PlaybackState?) {
            super.onPlaybackStateChanged(state)
            
            val controller = activeController ?: return
            val metadata = controller.metadata
            
            val playbackStatus = MediaManager.PlaybackStatus(
                isPlaying = state?.state == PlaybackState.STATE_PLAYING,
                title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE),
                artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST),
                album = metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM),
                duration = metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0,
                position = state?.position ?: 0,
                artworkBitmap = metadata?.getBitmap(MediaMetadata.METADATA_KEY_ART) 
                    ?: metadata?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART),
                packageName = controller.packageName,
                state = when (state?.state) {
                    PlaybackState.STATE_PLAYING -> MediaManager.PlaybackState.PLAYING
                    PlaybackState.STATE_PAUSED -> MediaManager.PlaybackState.PAUSED
                    PlaybackState.STATE_STOPPED -> MediaManager.PlaybackState.STOPPED
                    PlaybackState.STATE_BUFFERING -> MediaManager.PlaybackState.BUFFERING
                    PlaybackState.STATE_ERROR -> MediaManager.PlaybackState.ERROR
                    else -> MediaManager.PlaybackState.STOPPED
                }
            )
            
            val event = MediaManager.MediaEvent.PlaybackStateChanged(playbackStatus)
            _mediaEvents.tryEmit(event)
        }
        
        override fun onMetadataChanged(metadata: MediaMetadata?) {
            super.onMetadataChanged(metadata)
            
            val controller = activeController ?: return
            val state = controller.playbackState
            
            val playbackStatus = MediaManager.PlaybackStatus(
                isPlaying = state?.state == PlaybackState.STATE_PLAYING,
                title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE),
                artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST),
                album = metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM),
                duration = metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0,
                position = state?.position ?: 0,
                artworkBitmap = metadata?.getBitmap(MediaMetadata.METADATA_KEY_ART) 
                    ?: metadata?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART),
                packageName = controller.packageName,
                state = when (state?.state) {
                    PlaybackState.STATE_PLAYING -> MediaManager.PlaybackState.PLAYING
                    PlaybackState.STATE_PAUSED -> MediaManager.PlaybackState.PAUSED
                    PlaybackState.STATE_STOPPED -> MediaManager.PlaybackState.STOPPED
                    PlaybackState.STATE_BUFFERING -> MediaManager.PlaybackState.BUFFERING
                    PlaybackState.STATE_ERROR -> MediaManager.PlaybackState.ERROR
                    else -> MediaManager.PlaybackState.STOPPED
                }
            )
            
            val event = MediaManager.MediaEvent.PlaybackStateChanged(playbackStatus)
            _mediaEvents.tryEmit(event)
        }
    }
    
    private val mediaSessionsListener = object : MediaSessionManager.OnActiveSessionsChangedListener {
        override fun onActiveSessionsChanged(controllers: MutableList<MediaController>?) {
            controllers?.firstOrNull()?.let { controller ->
                // A new controller is active
                activeController?.unregisterCallback(controllerCallback)
                
                controller.registerCallback(controllerCallback, Handler(Looper.getMainLooper()))
                activeController = controller
                
                val metadata = controller.metadata
                val title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE)
                
                // Emit media session active event
                val event = MediaManager.MediaEvent.MediaSessionActive(
                    packageName = controller.packageName,
                    title = title
                )
                _mediaEvents.tryEmit(event)
            } ?: run {
                // No active controllers
                activeController?.let { oldController ->
                    oldController.unregisterCallback(controllerCallback)
                    
                    // Emit media session inactive event
                    val event = MediaManager.MediaEvent.MediaSessionInactive(
                        packageName = oldController.packageName
                    )
                    _mediaEvents.tryEmit(event)
                }
                
                activeController = null
            }
        }
    }
    
    // Initialize media session tracking
    init {
        try {
            val sessionManager = context.getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // We need permission to track media sessions
                // This often requires NOTIFICATION_LISTENER_SERVICE permission
                val componentName = android.content.ComponentName(context, "com.sallie.NotificationListenerService")
                sessionManager.addOnActiveSessionsChangedListener(mediaSessionsListener, componentName)
                
                // Get current active sessions
                val controllers = sessionManager.getActiveSessions(componentName)
                mediaSessionsListener.onActiveSessionsChanged(controllers)
            }
        } catch (e: Exception) {
            // Failed to initialize media session tracking
            // This is expected if notification listener permission is not granted
        }
    }
    
    // Track media button broadcast events
    private val mediaButtonEvents = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (Intent.ACTION_MEDIA_BUTTON == intent.action) {
                    val event = intent.getParcelableExtra<KeyEvent>(Intent.EXTRA_KEY_EVENT) ?: return
                    
                    if (event.action == KeyEvent.ACTION_DOWN) {
                        // Process media button press
                        when (event.keyCode) {
                            KeyEvent.KEYCODE_MEDIA_PLAY -> {
                                // Handle play
                            }
                            KeyEvent.KEYCODE_MEDIA_PAUSE -> {
                                // Handle pause
                            }
                            KeyEvent.KEYCODE_MEDIA_NEXT -> {
                                // Handle next
                            }
                            KeyEvent.KEYCODE_MEDIA_PREVIOUS -> {
                                // Handle previous
                            }
                            // Other media buttons...
                        }
                    }
                }
            }
        }
        
        val filter = IntentFilter(Intent.ACTION_MEDIA_BUTTON)
        context.registerReceiver(receiver, filter)
        
        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    override val mediaEvents: Flow<MediaManager.MediaEvent> = merge(_mediaEvents, mediaButtonEvents)
    
    override suspend fun getPlaybackStatus(): Result<MediaManager.PlaybackStatus> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access media playback status"))
        }
        
        return try {
            // Check if we have an active media controller
            val controller = activeController
            if (controller != null) {
                val state = controller.playbackState
                val metadata = controller.metadata
                
                val playbackStatus = MediaManager.PlaybackStatus(
                    isPlaying = state?.state == PlaybackState.STATE_PLAYING,
                    title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE),
                    artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST),
                    album = metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM),
                    duration = metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0,
                    position = state?.position ?: 0,
                    artworkBitmap = metadata?.getBitmap(MediaMetadata.METADATA_KEY_ART) 
                        ?: metadata?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART),
                    packageName = controller.packageName,
                    state = when (state?.state) {
                        PlaybackState.STATE_PLAYING -> MediaManager.PlaybackState.PLAYING
                        PlaybackState.STATE_PAUSED -> MediaManager.PlaybackState.PAUSED
                        PlaybackState.STATE_STOPPED -> MediaManager.PlaybackState.STOPPED
                        PlaybackState.STATE_BUFFERING -> MediaManager.PlaybackState.BUFFERING
                        PlaybackState.STATE_ERROR -> MediaManager.PlaybackState.ERROR
                        else -> MediaManager.PlaybackState.STOPPED
                    }
                )
                
                Result.success(playbackStatus)
            } else if (mediaPlayer != null) {
                // If we have our own media player active
                val playbackStatus = MediaManager.PlaybackStatus(
                    isPlaying = mediaPlayer?.isPlaying == true,
                    title = "Local Playback", // We don't have metadata for direct playback
                    artist = null,
                    album = null,
                    duration = mediaPlayer?.duration?.toLong() ?: 0,
                    position = mediaPlayer?.currentPosition?.toLong() ?: 0,
                    artworkBitmap = null,
                    packageName = context.packageName,
                    state = if (mediaPlayer?.isPlaying == true) MediaManager.PlaybackState.PLAYING
                            else MediaManager.PlaybackState.PAUSED
                )
                
                Result.success(playbackStatus)
            } else {
                // No active playback
                val defaultPlaybackStatus = MediaManager.PlaybackStatus(
                    isPlaying = false,
                    title = null,
                    artist = null,
                    album = null,
                    duration = 0,
                    position = 0,
                    artworkBitmap = null,
                    packageName = null,
                    state = MediaManager.PlaybackState.STOPPED
                )
                
                Result.success(defaultPlaybackStatus)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun play(): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val controller = activeController
            if (controller != null) {
                // Use media controller
                controller.transportControls.play()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Play",
                        mediaTitle = controller.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Unknown",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else if (mediaPlayer != null) {
                // Use our own media player
                mediaPlayer?.start()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Play",
                        mediaTitle = "Local Playback",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // No active playback
                Result.failure(IllegalStateException("No active media playback"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun pause(): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val controller = activeController
            if (controller != null) {
                // Use media controller
                controller.transportControls.pause()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Pause",
                        mediaTitle = controller.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Unknown",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else if (mediaPlayer != null) {
                // Use our own media player
                mediaPlayer?.pause()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Pause",
                        mediaTitle = "Local Playback",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // No active playback
                Result.failure(IllegalStateException("No active media playback"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun stop(): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val controller = activeController
            if (controller != null) {
                // Use media controller
                controller.transportControls.stop()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Stop",
                        mediaTitle = controller.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Unknown",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else if (mediaPlayer != null) {
                // Use our own media player
                mediaPlayer?.stop()
                mediaPlayer?.release()
                mediaPlayer = null
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Stop",
                        mediaTitle = "Local Playback",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // No active playback
                Result.failure(IllegalStateException("No active media playback"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun skipToNext(): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val controller = activeController
            if (controller != null) {
                // Use media controller
                controller.transportControls.skipToNext()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Next Track",
                        mediaTitle = controller.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Unknown",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // No active media controller
                Result.failure(IllegalStateException("No active media controller"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun skipToPrevious(): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val controller = activeController
            if (controller != null) {
                // Use media controller
                controller.transportControls.skipToPrevious()
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Previous Track",
                        mediaTitle = controller.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Unknown",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // No active media controller
                Result.failure(IllegalStateException("No active media controller"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun seekTo(position: Long): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val controller = activeController
            if (controller != null) {
                // Use media controller
                controller.transportControls.seekTo(position)
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Seek",
                        mediaTitle = controller.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "Unknown",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else if (mediaPlayer != null) {
                // Use our own media player
                mediaPlayer?.seekTo(position.toInt())
                
                // Log the event
                phoneControlManager.logEvent(
                    PhoneControlEvent.MediaControlAction(
                        action = "Seek",
                        mediaTitle = "Local Playback",
                        initiatedBy = "Sallie"
                    )
                )
                
                Result.success(Unit)
            } else {
                // No active playback
                Result.failure(IllegalStateException("No active media playback"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun setVolume(volume: Float): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            // Get max volume and calculate the appropriate level
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            val volumeLevel = (volume.coerceIn(0f, 1f) * maxVolume).toInt()
            
            // Set the volume
            audioManager.setStreamVolume(
                AudioManager.STREAM_MUSIC,
                volumeLevel,
                0 // No flags
            )
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.MediaControlAction(
                    action = "Set Volume",
                    mediaTitle = "${(volume * 100).toInt()}%",
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getAudioFiles(limit: Int): Result<List<MediaManager.MediaFile>> {
        // Check permission
        if (!permissionManager.checkPermission(Manifest.permission.READ_EXTERNAL_STORAGE)) {
            return Result.failure(SecurityException("Missing READ_EXTERNAL_STORAGE permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_FILES_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access media files"))
        }
        
        return try {
            val audioFiles = mutableListOf<MediaManager.MediaFile>()
            
            val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
            } else {
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
            }
            
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.SIZE,
                MediaStore.Audio.Media.DATA,
                MediaStore.Audio.Media.MIME_TYPE,
                MediaStore.Audio.Media.DATE_ADDED,
                MediaStore.Audio.Media.DATE_MODIFIED
            )
            
            val sortOrder = "${MediaStore.Audio.Media.DATE_MODIFIED} DESC LIMIT $limit"
            
            context.contentResolver.query(
                collection,
                projection,
                null,
                null,
                sortOrder
            )?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                val dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                val mimeTypeColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE)
                val dateAddedColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)
                val dateModifiedColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_MODIFIED)
                
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idColumn)
                    val title = cursor.getString(titleColumn)
                    val artist = cursor.getString(artistColumn)
                    val album = cursor.getString(albumColumn)
                    val duration = cursor.getLong(durationColumn)
                    val size = cursor.getLong(sizeColumn)
                    val path = cursor.getString(dataColumn)
                    val mimeType = cursor.getString(mimeTypeColumn)
                    val dateAdded = cursor.getLong(dateAddedColumn)
                    val dateModified = cursor.getLong(dateModifiedColumn)
                    
                    // Get album art thumbnail
                    var thumbnail: Bitmap? = null
                    try {
                        val albumArtUri = Uri.parse("content://media/external/audio/albumart")
                        val albumArtContentUri = ContentUris.withAppendedId(albumArtUri, id)
                        
                        val inputStream = context.contentResolver.openInputStream(albumArtContentUri)
                        if (inputStream != null) {
                            thumbnail = BitmapFactory.decodeStream(inputStream)
                            inputStream.close()
                        }
                    } catch (e: Exception) {
                        // Album art not available, continue without it
                    }
                    
                    val mediaFile = MediaManager.MediaFile(
                        id = id.toString(),
                        title = title,
                        artist = artist,
                        album = album,
                        duration = duration,
                        size = size,
                        path = path,
                        mimeType = mimeType,
                        dateAdded = dateAdded * 1000, // Convert to milliseconds
                        dateModified = dateModified * 1000, // Convert to milliseconds
                        thumbnailBitmap = thumbnail
                    )
                    
                    audioFiles.add(mediaFile)
                }
            }
            
            Result.success(audioFiles)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getVideoFiles(limit: Int): Result<List<MediaManager.MediaFile>> {
        // Check permission
        if (!permissionManager.checkPermission(Manifest.permission.READ_EXTERNAL_STORAGE)) {
            return Result.failure(SecurityException("Missing READ_EXTERNAL_STORAGE permission"))
        }
        
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_FILES_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to access media files"))
        }
        
        return try {
            val videoFiles = mutableListOf<MediaManager.MediaFile>()
            
            val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
            } else {
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI
            }
            
            val projection = arrayOf(
                MediaStore.Video.Media._ID,
                MediaStore.Video.Media.TITLE,
                MediaStore.Video.Media.ARTIST,
                MediaStore.Video.Media.ALBUM,
                MediaStore.Video.Media.DURATION,
                MediaStore.Video.Media.SIZE,
                MediaStore.Video.Media.DATA,
                MediaStore.Video.Media.MIME_TYPE,
                MediaStore.Video.Media.DATE_ADDED,
                MediaStore.Video.Media.DATE_MODIFIED
            )
            
            val sortOrder = "${MediaStore.Video.Media.DATE_MODIFIED} DESC LIMIT $limit"
            
            context.contentResolver.query(
                collection,
                projection,
                null,
                null,
                sortOrder
            )?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
                val titleColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.TITLE)
                val artistColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.ARTIST)
                val albumColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.ALBUM)
                val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION)
                val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE)
                val dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA)
                val mimeTypeColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.MIME_TYPE)
                val dateAddedColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_ADDED)
                val dateModifiedColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_MODIFIED)
                
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idColumn)
                    val title = cursor.getString(titleColumn)
                    val artist = cursor.getString(artistColumn)
                    val album = cursor.getString(albumColumn)
                    val duration = cursor.getLong(durationColumn)
                    val size = cursor.getLong(sizeColumn)
                    val path = cursor.getString(dataColumn)
                    val mimeType = cursor.getString(mimeTypeColumn)
                    val dateAdded = cursor.getLong(dateAddedColumn)
                    val dateModified = cursor.getLong(dateModifiedColumn)
                    
                    // Get video thumbnail
                    var thumbnail: Bitmap? = null
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                            thumbnail = context.contentResolver.loadThumbnail(
                                ContentUris.withAppendedId(collection, id),
                                android.util.Size(96, 96),
                                null
                            )
                        } else {
                            @Suppress("DEPRECATION")
                            thumbnail = MediaStore.Video.Thumbnails.getThumbnail(
                                context.contentResolver,
                                id,
                                MediaStore.Video.Thumbnails.MINI_KIND,
                                null
                            )
                        }
                    } catch (e: Exception) {
                        // Thumbnail not available, continue without it
                    }
                    
                    val mediaFile = MediaManager.MediaFile(
                        id = id.toString(),
                        title = title,
                        artist = artist,
                        album = album,
                        duration = duration,
                        size = size,
                        path = path,
                        mimeType = mimeType,
                        dateAdded = dateAdded * 1000, // Convert to milliseconds
                        dateModified = dateModified * 1000, // Convert to milliseconds
                        thumbnailBitmap = thumbnail
                    )
                    
                    videoFiles.add(mediaFile)
                }
            }
            
            Result.success(videoFiles)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun playMediaFile(mediaFile: MediaManager.MediaFile): Result<Unit> {
        // Check user consent
        if (!permissionManager.hasUserConsent(MEDIA_CONTROL_CONSENT_ACTION)) {
            return Result.failure(SecurityException("User has not given consent to control media playback"))
        }
        
        return try {
            // Release previous media player if any
            mediaPlayer?.release()
            
            // Create new media player
            mediaPlayer = MediaPlayer().apply {
                setDataSource(mediaFile.path)
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                prepare()
                start()
            }
            
            // Request audio focus
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .build()
                    )
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener { focusChange ->
                        when (focusChange) {
                            AudioManager.AUDIOFOCUS_LOSS -> {
                                mediaPlayer?.pause()
                            }
                            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                                mediaPlayer?.pause()
                            }
                            AudioManager.AUDIOFOCUS_GAIN -> {
                                mediaPlayer?.start()
                            }
                        }
                    }
                    .build()
                
                audioManager.requestAudioFocus(focusRequest)
            } else {
                @Suppress("DEPRECATION")
                audioManager.requestAudioFocus(
                    { focusChange ->
                        when (focusChange) {
                            AudioManager.AUDIOFOCUS_LOSS -> {
                                mediaPlayer?.pause()
                            }
                            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                                mediaPlayer?.pause()
                            }
                            AudioManager.AUDIOFOCUS_GAIN -> {
                                mediaPlayer?.start()
                            }
                        }
                    },
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN
                )
            }
            
            // Log the event
            phoneControlManager.logEvent(
                PhoneControlEvent.MediaControlAction(
                    action = "Play File",
                    mediaTitle = mediaFile.title,
                    initiatedBy = "Sallie"
                )
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isMediaControlFunctionalityAvailable(): Boolean {
        // Basic media control functionality is always available
        return true
    }
}

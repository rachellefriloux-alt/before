/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * LocationManagerImpl - Implementation for LocationManager
 */

package com.sallie.phonecontrol.location

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.core.location.LocationManagerCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingEvent
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.sallie.phonecontrol.PermissionManager
import com.sallie.phonecontrol.location.LocationManager.LocationUpdateFrequency
import com.sallie.phonecontrol.location.LocationManager.AddressInfo
import com.sallie.phonecontrol.location.LocationManager.GeofenceEvent
import com.sallie.phonecontrol.location.LocationManager.GeofenceTransition
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import java.io.IOException
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Implementation of LocationManager interface
 */
@Singleton
class LocationManagerImpl @Inject constructor(
    private val context: Context,
    private val permissionManager: PermissionManager
) : LocationManager {

    private val systemLocationManager = context.getSystemService(Context.LOCATION_SERVICE) as android.location.LocationManager
    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
    private val geofencingClient = LocationServices.getGeofencingClient(context)
    
    private val _geofenceEvents = MutableSharedFlow<GeofenceEvent>()
    override val geofenceEvents: Flow<GeofenceEvent> = _geofenceEvents
    
    private val activeGeofences = ConcurrentHashMap<String, com.sallie.phonecontrol.location.LocationManager.Geofence>()
    
    private var locationCallback: LocationCallback? = null
    
    override val locationUpdates: Flow<LocationManager.LocationInfo> = callbackFlow {
        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { location ->
                    trySend(location.toLocationInfo())
                }
            }
        }
        
        locationCallback = callback
        
        awaitClose {
            fusedLocationClient.removeLocationUpdates(callback)
        }
    }
    
    override suspend fun getCurrentLocation(): Result<LocationManager.LocationInfo> {
        return try {
            if (!checkPermission()) {
                return Result.failure(SecurityException("Location permission not granted"))
            }
            
            val task = fusedLocationClient.getCurrentLocation(
                Priority.PRIORITY_HIGH_ACCURACY, 
                null
            )
            
            val location = task.await() 
                ?: return Result.failure(Exception("Unable to get current location"))
            
            Result.success(location.toLocationInfo())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun startLocationUpdates(frequency: LocationUpdateFrequency): Result<Unit> {
        return try {
            if (!checkPermission()) {
                return Result.failure(SecurityException("Location permission not granted"))
            }
            
            val priority = when (frequency) {
                LocationUpdateFrequency.HIGH -> Priority.PRIORITY_HIGH_ACCURACY
                LocationUpdateFrequency.BALANCED -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
                LocationUpdateFrequency.LOW -> Priority.PRIORITY_LOW_POWER
            }
            
            val intervalMs = when (frequency) {
                LocationUpdateFrequency.HIGH -> 5000L  // 5 seconds
                LocationUpdateFrequency.BALANCED -> 15000L  // 15 seconds
                LocationUpdateFrequency.LOW -> 60000L  // 1 minute
            }
            
            val locationRequest = LocationRequest.Builder(priority, intervalMs)
                .setMinUpdateIntervalMillis(intervalMs / 2)
                .build()
            
            locationCallback?.let { callback ->
                fusedLocationClient.requestLocationUpdates(
                    locationRequest,
                    callback,
                    Looper.getMainLooper()
                )
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun stopLocationUpdates(): Result<Unit> {
        return try {
            locationCallback?.let { callback ->
                fusedLocationClient.removeLocationUpdates(callback)
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getAddressFromLocation(latitude: Double, longitude: Double): Result<AddressInfo> {
        return try {
            if (!Geocoder.isPresent()) {
                return Result.failure(Exception("Geocoder not available on this device"))
            }
            
            val geocoder = Geocoder(context, Locale.getDefault())
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                geocoder.getFromLocation(latitude, longitude, 1) { addresses ->
                    if (addresses.isNotEmpty()) {
                        val address = addresses[0]
                        Result.success(address.toAddressInfo())
                    } else {
                        Result.failure(Exception("No addresses found"))
                    }
                }
                // This is a placeholder until the callback returns
                Result.failure(Exception("Geocoder operation in progress"))
            } else {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(latitude, longitude, 1)
                if (!addresses.isNullOrEmpty()) {
                    val address = addresses[0]
                    Result.success(address.toAddressInfo())
                } else {
                    Result.failure(Exception("No addresses found"))
                }
            }
        } catch (e: IOException) {
            Result.failure(e)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getLocationFromAddress(addressString: String): Result<LocationManager.LocationInfo> {
        return try {
            if (!Geocoder.isPresent()) {
                return Result.failure(Exception("Geocoder not available on this device"))
            }
            
            val geocoder = Geocoder(context, Locale.getDefault())
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                geocoder.getFromLocationName(addressString, 1) { addresses ->
                    if (addresses.isNotEmpty()) {
                        val address = addresses[0]
                        val locationInfo = LocationManager.LocationInfo(
                            latitude = address.latitude,
                            longitude = address.longitude,
                            accuracy = 0f,  // Unknown accuracy for geocoded addresses
                            altitude = null,
                            speed = null,
                            time = System.currentTimeMillis(),
                            provider = "geocoder",
                            address = address.toAddressInfo()
                        )
                        Result.success(locationInfo)
                    } else {
                        Result.failure(Exception("No location found for address"))
                    }
                }
                // This is a placeholder until the callback returns
                Result.failure(Exception("Geocoder operation in progress"))
            } else {
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocationName(addressString, 1)
                if (!addresses.isNullOrEmpty()) {
                    val address = addresses[0]
                    val locationInfo = LocationManager.LocationInfo(
                        latitude = address.latitude,
                        longitude = address.longitude,
                        accuracy = 0f,  // Unknown accuracy for geocoded addresses
                        altitude = null,
                        speed = null,
                        time = System.currentTimeMillis(),
                        provider = "geocoder",
                        address = address.toAddressInfo()
                    )
                    Result.success(locationInfo)
                } else {
                    Result.failure(Exception("No location found for address"))
                }
            }
        } catch (e: IOException) {
            Result.failure(e)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun calculateDistance(
        startLatitude: Double,
        startLongitude: Double,
        endLatitude: Double,
        endLongitude: Double
    ): Result<Float> {
        return try {
            val results = FloatArray(1)
            Location.distanceBetween(
                startLatitude, startLongitude,
                endLatitude, endLongitude,
                results
            )
            Result.success(results[0])
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun addGeofence(geofence: LocationManager.Geofence): Result<Unit> {
        return try {
            if (!checkPermission()) {
                return Result.failure(SecurityException("Location permission not granted"))
            }
            
            val androidGeofence = Geofence.Builder()
                .setRequestId(geofence.id)
                .setCircularRegion(
                    geofence.latitude,
                    geofence.longitude,
                    geofence.radius
                )
                .setExpirationDuration(geofence.expirationTime?.let { it - System.currentTimeMillis() } ?: Geofence.NEVER_EXPIRE)
                .setTransitionTypes(geofence.transitionTypes.toAndroidGeofenceTransitionTypes())
                .build()
                
            val geofencingRequest = GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofence(androidGeofence)
                .build()
                
            geofencingClient.addGeofences(geofencingRequest, createGeofencePendingIntent())
                .await()
                
            // Store for later retrieval
            activeGeofences[geofence.id] = geofence
                
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun removeGeofence(geofenceId: String): Result<Unit> {
        return try {
            geofencingClient.removeGeofences(listOf(geofenceId)).await()
            activeGeofences.remove(geofenceId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getActiveGeofences(): Result<List<LocationManager.Geofence>> {
        return try {
            Result.success(activeGeofences.values.toList())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isLocationEnabled(): Boolean {
        return LocationManagerCompat.isLocationEnabled(systemLocationManager)
    }
    
    @SuppressLint("MissingPermission")
    override suspend fun getLastKnownLocation(): Result<LocationManager.LocationInfo> {
        return try {
            if (!checkPermission()) {
                return Result.failure(SecurityException("Location permission not granted"))
            }
            
            val task = fusedLocationClient.lastLocation
            val location = task.await() 
                ?: return Result.failure(Exception("No last known location available"))
                
            Result.success(location.toLocationInfo())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun isLocationFunctionalityAvailable(): Boolean {
        // Check if the device has necessary location hardware/services
        return context.packageManager.hasSystemFeature(PackageManager.FEATURE_LOCATION) ||
               context.packageManager.hasSystemFeature(PackageManager.FEATURE_LOCATION_GPS) ||
               context.packageManager.hasSystemFeature(PackageManager.FEATURE_LOCATION_NETWORK)
    }
    
    // Helper methods
    
    private fun checkPermission(): Boolean {
        return permissionManager.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) ||
               permissionManager.hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)
    }
    
    private fun createGeofencePendingIntent(): android.app.PendingIntent {
        // Implementation would typically register a BroadcastReceiver for geofence transitions
        // and create a PendingIntent for it. Simplified version here.
        val intent = android.content.Intent(context, GeofenceBroadcastReceiver::class.java)
        return android.app.PendingIntent.getBroadcast(
            context,
            0,
            intent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_MUTABLE
        )
    }
    
    private fun Set<GeofenceTransition>.toAndroidGeofenceTransitionTypes(): Int {
        var result = 0
        forEach { transition ->
            result = result or when (transition) {
                GeofenceTransition.ENTER -> Geofence.GEOFENCE_TRANSITION_ENTER
                GeofenceTransition.EXIT -> Geofence.GEOFENCE_TRANSITION_EXIT
                GeofenceTransition.DWELL -> Geofence.GEOFENCE_TRANSITION_DWELL
            }
        }
        return result
    }
    
    private fun Location.toLocationInfo(): LocationManager.LocationInfo {
        return LocationManager.LocationInfo(
            latitude = latitude,
            longitude = longitude,
            accuracy = accuracy,
            altitude = if (hasAltitude()) altitude else null,
            speed = if (hasSpeed()) speed else null,
            time = time,
            provider = provider ?: "unknown",
            address = null // Address is loaded separately with reverse geocoding
        )
    }
    
    private fun Address.toAddressInfo(): AddressInfo {
        val addressLines = mutableListOf<String>()
        for (i in 0..maxAddressLineIndex) {
            getAddressLine(i)?.let { line ->
                addressLines.add(line)
            }
        }
        
        return AddressInfo(
            addressLines = addressLines,
            featureName = featureName,
            locality = locality,
            adminArea = adminArea,
            countryCode = countryCode,
            countryName = countryName,
            postalCode = postalCode,
            premises = premises,
            subAdminArea = subAdminArea,
            subLocality = subLocality,
            thoroughfare = thoroughfare,
            subThoroughfare = subThoroughfare
        )
    }
    
    // This class would be defined separately in a real implementation
    // It's included here for completeness
    class GeofenceBroadcastReceiver : android.content.BroadcastReceiver() {
        override fun onReceive(context: Context, intent: android.content.Intent) {
            val geofencingEvent = GeofencingEvent.fromIntent(intent)
            if (geofencingEvent?.hasError() == true) {
                // Handle error
                return
            }
            
            // Process the geofence transition event
            // In a real implementation, this would dispatch to LocationManagerImpl
            // through a messaging system or callback
        }
    }
}

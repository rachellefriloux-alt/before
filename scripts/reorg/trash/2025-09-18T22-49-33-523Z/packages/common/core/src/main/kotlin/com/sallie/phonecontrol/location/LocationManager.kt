/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * LocationManager - Interface for location control operations
 */

package com.sallie.phonecontrol.location

import android.location.Location
import kotlinx.coroutines.flow.Flow

/**
 * Interface for managing location services and geolocation
 */
interface LocationManager {

    /**
     * Data class representing a location coordinate with address info
     */
    data class LocationInfo(
        val latitude: Double,
        val longitude: Double,
        val accuracy: Float, // in meters
        val altitude: Double?, // in meters
        val speed: Float?, // in meters/second
        val time: Long, // timestamp in milliseconds
        val provider: String, // GPS, NETWORK, etc.
        val address: AddressInfo?
    )
    
    /**
     * Data class representing address information
     */
    data class AddressInfo(
        val addressLines: List<String>,
        val featureName: String?,
        val locality: String?, // city
        val adminArea: String?, // state/province
        val countryCode: String?,
        val countryName: String?,
        val postalCode: String?,
        val premises: String?,
        val subAdminArea: String?, // county
        val subLocality: String?, // district/neighborhood
        val thoroughfare: String?, // street
        val subThoroughfare: String? // street number
    )
    
    /**
     * Data class representing a geofence
     */
    data class Geofence(
        val id: String,
        val latitude: Double,
        val longitude: Double,
        val radius: Float, // in meters
        val expirationTime: Long?, // timestamp in milliseconds, null for no expiration
        val transitionTypes: Set<GeofenceTransition>,
        val name: String?,
        val description: String?
    )
    
    /**
     * Geofence transition types
     */
    enum class GeofenceTransition {
        ENTER,
        EXIT,
        DWELL
    }
    
    /**
     * Geofence transition event
     */
    data class GeofenceEvent(
        val geofenceId: String,
        val transition: GeofenceTransition,
        val triggerTime: Long, // timestamp in milliseconds
        val triggerLocation: LocationInfo?
    )
    
    /**
     * Location update frequency
     */
    enum class LocationUpdateFrequency {
        HIGH, // Frequent updates, high accuracy, high battery usage
        BALANCED, // Balanced frequency and accuracy
        LOW // Infrequent updates, lower accuracy, battery efficient
    }
    
    /**
     * Flow of location updates
     */
    val locationUpdates: Flow<LocationInfo>
    
    /**
     * Flow of geofence events
     */
    val geofenceEvents: Flow<GeofenceEvent>
    
    /**
     * Get current location (one-time request)
     * 
     * @return Result containing LocationInfo or an error
     */
    suspend fun getCurrentLocation(): Result<LocationInfo>
    
    /**
     * Start location updates
     * 
     * @param frequency Update frequency
     * @return Result indicating success or failure
     */
    suspend fun startLocationUpdates(frequency: LocationUpdateFrequency = LocationUpdateFrequency.BALANCED): Result<Unit>
    
    /**
     * Stop location updates
     * 
     * @return Result indicating success or failure
     */
    suspend fun stopLocationUpdates(): Result<Unit>
    
    /**
     * Get address info from location coordinates
     * 
     * @param latitude Latitude coordinate
     * @param longitude Longitude coordinate
     * @return Result containing AddressInfo or an error
     */
    suspend fun getAddressFromLocation(latitude: Double, longitude: Double): Result<AddressInfo>
    
    /**
     * Get location coordinates from an address string
     * 
     * @param addressString Address string to geocode
     * @return Result containing LocationInfo or an error
     */
    suspend fun getLocationFromAddress(addressString: String): Result<LocationInfo>
    
    /**
     * Calculate distance between two locations
     * 
     * @param startLatitude Starting point latitude
     * @param startLongitude Starting point longitude
     * @param endLatitude End point latitude
     * @param endLongitude End point longitude
     * @return Result containing distance in meters or an error
     */
    suspend fun calculateDistance(
        startLatitude: Double,
        startLongitude: Double,
        endLatitude: Double,
        endLongitude: Double
    ): Result<Float>
    
    /**
     * Create a geofence
     * 
     * @param geofence Geofence object to create
     * @return Result indicating success or failure
     */
    suspend fun addGeofence(geofence: Geofence): Result<Unit>
    
    /**
     * Remove a geofence
     * 
     * @param geofenceId ID of the geofence to remove
     * @return Result indicating success or failure
     */
    suspend fun removeGeofence(geofenceId: String): Result<Unit>
    
    /**
     * Get all active geofences
     * 
     * @return Result containing list of Geofence objects or an error
     */
    suspend fun getActiveGeofences(): Result<List<Geofence>>
    
    /**
     * Check if location services are enabled on the device
     * 
     * @return true if enabled, false otherwise
     */
    suspend fun isLocationEnabled(): Boolean
    
    /**
     * Get the last known location from any provider
     * 
     * @return Result containing LocationInfo or an error
     */
    suspend fun getLastKnownLocation(): Result<LocationInfo>
    
    /**
     * Check if location functionality is available on this device
     * 
     * @return true if available, false otherwise
     */
    suspend fun isLocationFunctionalityAvailable(): Boolean
}

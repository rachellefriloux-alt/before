/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * LocationManagerImplTest - Unit tests for LocationManagerImpl
 */

package com.sallie.phonecontrol.location

import android.Manifest
import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.location.Location
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.tasks.Task
import com.sallie.phonecontrol.PermissionManager
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.justRun
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.Locale
import java.util.concurrent.Executor

class LocationManagerImplTest {

    // Mock dependencies
    private val context: Context = mockk(relaxed = true)
    private val permissionManager: PermissionManager = mockk(relaxed = true)
    private val fusedLocationClient: FusedLocationProviderClient = mockk(relaxed = true)
    private val systemLocationManager: android.location.LocationManager = mockk(relaxed = true)
    private val geocoder: Geocoder = mockk(relaxed = true)
    
    // System under test
    private lateinit var locationManager: LocationManagerImpl
    
    @Before
    fun setUp() {
        // Mock static calls
        mockkStatic(LocationServices::class)
        every { LocationServices.getFusedLocationProviderClient(context) } returns fusedLocationClient
        
        // Mock context getSystemService
        every { context.getSystemService(Context.LOCATION_SERVICE) } returns systemLocationManager
        
        // Set up the LocationManagerImpl with mocked dependencies
        locationManager = LocationManagerImpl(context, permissionManager)
    }
    
    @Test
    fun `getCurrentLocation should return location when permissions granted`() = runTest {
        // Given
        val mockLocation = mockk<Location>(relaxed = true)
        every { mockLocation.latitude } returns 37.7749
        every { mockLocation.longitude } returns -122.4194
        every { mockLocation.accuracy } returns 10.0f
        every { mockLocation.hasAltitude() } returns true
        every { mockLocation.altitude } returns 100.0
        every { mockLocation.hasSpeed() } returns true
        every { mockLocation.speed } returns 5.0f
        every { mockLocation.time } returns 1600000000000L
        every { mockLocation.provider } returns "gps"
        
        every { permissionManager.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) } returns true
        
        val task = mockk<Task<Location>>()
        every { fusedLocationClient.getCurrentLocation(any(), any()) } returns task
        every { task.isComplete } returns true
        every { task.isSuccessful } returns true
        every { task.result } returns mockLocation
        
        // When
        val result = locationManager.getCurrentLocation()
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(37.7749, result.getOrNull()?.latitude)
        assertEquals(-122.4194, result.getOrNull()?.longitude)
        assertEquals(10.0f, result.getOrNull()?.accuracy)
        assertEquals(100.0, result.getOrNull()?.altitude)
        assertEquals(5.0f, result.getOrNull()?.speed)
        assertEquals(1600000000000L, result.getOrNull()?.time)
        assertEquals("gps", result.getOrNull()?.provider)
    }
    
    @Test
    fun `getCurrentLocation should fail when permissions not granted`() = runTest {
        // Given
        every { permissionManager.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) } returns false
        every { permissionManager.hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION) } returns false
        
        // When
        val result = locationManager.getCurrentLocation()
        
        // Then
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is SecurityException)
    }
    
    @Test
    fun `startLocationUpdates should request location updates with appropriate priority`() = runTest {
        // Given
        every { permissionManager.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) } returns true
        
        val locationCallbackSlot = slot<LocationCallback>()
        justRun { fusedLocationClient.requestLocationUpdates(any(), capture(locationCallbackSlot), any()) }
        
        // When
        val result = locationManager.startLocationUpdates(LocationManager.LocationUpdateFrequency.HIGH)
        
        // Then
        assertTrue(result.isSuccess)
        verify { fusedLocationClient.requestLocationUpdates(any(), any(), any()) }
    }
    
    @Test
    fun `stopLocationUpdates should remove location updates`() = runTest {
        // Given
        justRun { fusedLocationClient.removeLocationUpdates(any<LocationCallback>()) }
        
        // When
        val result = locationManager.stopLocationUpdates()
        
        // Then
        assertTrue(result.isSuccess)
        verify { fusedLocationClient.removeLocationUpdates(any<LocationCallback>()) }
    }
    
    @Test
    fun `calculateDistance should compute distance between coordinates`() = runTest {
        // When
        val result = locationManager.calculateDistance(
            37.7749, -122.4194,
            34.0522, -118.2437
        )
        
        // Then
        assertTrue(result.isSuccess)
        // The result value will depend on the Location.distanceBetween implementation
        // Just verify that the result is positive and reasonable
        assertTrue(result.getOrNull()!! > 0)
    }
    
    @Test
    fun `isLocationEnabled should check system location service`() = runTest {
        // Given
        every { systemLocationManager.isProviderEnabled(android.location.LocationManager.GPS_PROVIDER) } returns true
        
        // When
        val result = locationManager.isLocationEnabled()
        
        // Then
        assertTrue(result)
    }
    
    @Test
    fun `isLocationFunctionalityAvailable should check device features`() = runTest {
        // Given
        val packageManager = mockk<android.content.pm.PackageManager>()
        every { context.packageManager } returns packageManager
        every { packageManager.hasSystemFeature(any()) } returns true
        
        // When
        val result = locationManager.isLocationFunctionalityAvailable()
        
        // Then
        assertTrue(result)
        verify { packageManager.hasSystemFeature(android.content.pm.PackageManager.FEATURE_LOCATION) }
    }
}

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  address?: string;
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  onEnter?: () => void;
  onExit?: () => void;
  isActive: boolean;
}

export interface LocationPermission {
  foreground: boolean;
  background: boolean;
  always: boolean;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationInfo | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private geofences: Map<string, Geofence> = new Map();
  private backgroundTaskName = 'LOCATION_BACKGROUND_TASK';

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Set up background location task
      await this.setupBackgroundTask();
      
      // Request permissions
      await this.requestPermissions();
      
      // Get initial location
      await this.getCurrentLocation();
      
      // Start location updates
      await this.startLocationUpdates();
      
    } catch (error) {
      console.error('Error initializing location service:', error);
    }
  }

  private async setupBackgroundTask(): Promise<void> {
    try {
      TaskManager.defineTask(this.backgroundTaskName, ({ data, error }) => {
        if (error) {
          console.error('Background location task error:', error);
          return;
        }
        
        if (data) {
          const { locations } = data as { locations: Location.LocationObject[] };
          this.handleLocationUpdate(locations[0]);
        }
      });
    } catch (error) {
      console.error('Error setting up background task:', error);
    }
  }

  async requestPermissions(): Promise<LocationPermission> {
    try {
      const foregroundPermission = await Location.requestForegroundPermissionsAsync();
      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
      
      return {
        foreground: foregroundPermission.status === 'granted',
        background: backgroundPermission.status === 'granted',
        always: backgroundPermission.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return {
        foreground: false,
        background: false,
        always: false,
      };
    }
  }

  async getCurrentLocation(): Promise<LocationInfo | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationInfo: LocationInfo = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
        timestamp: location.timestamp,
      };

      // Get address information
      try {
        const address = await this.getAddressFromCoordinates(
          location.coords.latitude,
          location.coords.longitude
        );
        locationInfo.address = address;
      } catch (error) {
        console.log('Could not get address for location');
      }

      this.currentLocation = locationInfo;
      return locationInfo;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startLocationUpdates(): Promise<void> {
    try {
      if (this.locationSubscription) {
        this.locationSubscription.remove();
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10 seconds
          distanceInterval: 10, // 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      // Start background location updates if permission granted
      const permissions = await this.requestPermissions();
      if (permissions.background) {
        await Location.startLocationUpdatesAsync(this.backgroundTaskName, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 50, // 50 meters
          foregroundService: {
            notificationTitle: 'Sallie Location Service',
            notificationBody: 'Tracking location for personalized assistance',
          },
        });
      }
    } catch (error) {
      console.error('Error starting location updates:', error);
    }
  }

  async stopLocationUpdates(): Promise<void> {
    try {
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      await Location.stopLocationUpdatesAsync(this.backgroundTaskName);
    } catch (error) {
      console.error('Error stopping location updates:', error);
    }
  }

  private handleLocationUpdate(location: Location.LocationObject): void {
    const locationInfo: LocationInfo = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? undefined,
      altitude: location.coords.altitude ?? undefined,
      heading: location.coords.heading ?? undefined,
      speed: location.coords.speed ?? undefined,
      timestamp: location.timestamp,
    };

    this.currentLocation = locationInfo;
    
    // Check geofences (don't await in callback)
    this.checkGeofences(locationInfo);
    
    // Emit location update event (you can implement an event system here)
    console.log('Location updated:', locationInfo);
  }

  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);

        return addressParts.join(', ');
      }

      return 'Unknown location';
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return 'Unknown location';
    }
  }

  async getCoordinatesFromAddress(address: string): Promise<LocationInfo | null> {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        const result = results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<number> {
    try {
      // Calculate distance using Haversine formula
      const R = 6371e3; // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  }

  addGeofence(geofence: Geofence): void {
    this.geofences.set(geofence.id, geofence);
  }

  removeGeofence(id: string): void {
    this.geofences.delete(id);
  }

  updateGeofence(id: string, updates: Partial<Geofence>): void {
    const geofence = this.geofences.get(id);
    if (geofence) {
      this.geofences.set(id, { ...geofence, ...updates });
    }
  }

  private async checkGeofences(location: LocationInfo): Promise<void> {
    const geofenceChecks = Array.from(this.geofences.values()).map(async (geofence) => {
      if (!geofence.isActive) return;

      const distance = await this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );

      if (distance <= geofence.radius) {
        // User is inside geofence
        if (geofence.onEnter) {
          geofence.onEnter();
        }
      } else {
        // User is outside geofence
        if (geofence.onExit) {
          geofence.onExit();
        }
      }
    });

    await Promise.all(geofenceChecks);
  }

  getCachedLocation(): LocationInfo | null {
    return this.currentLocation;
  }

  getAllGeofences(): Geofence[] {
    return Array.from(this.geofences.values());
  }

  async getLocationHistory(limit: number = 100): Promise<LocationInfo[]> {
    try {
      // This would typically integrate with a database or storage system
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 1000
  ): Promise<any[]> {
    try {
      // This would integrate with Google Places API or similar service
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  async getWeatherForLocation(
    latitude: number,
    longitude: number
  ): Promise<any> {
    try {
      // This would integrate with a weather API
      // For now, we'll return null
      return null;
    } catch (error) {
      console.error('Error getting weather for location:', error);
      return null;
    }
  }

  cleanup(): void {
    this.stopLocationUpdates();
    this.geofences.clear();
    this.currentLocation = null;
  }
}

export default LocationService;

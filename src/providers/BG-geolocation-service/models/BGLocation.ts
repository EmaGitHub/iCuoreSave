export interface BGLocation {
  id: number; // ID of location as stored in DB (or null)
  provider: String; // gps, network, passive or fused
  locationProvider: number; // location provider
  time: number; // UTC time of this fix, in milliseconds since January 1, 1970.
  latitude: number; // Latitude, in degrees.
  longitude: number; // Longitude, in degrees.
  accuracy: number; // Estimated accuracy of this location, in meters.
  speed: number; // Speed if it is available, in meters/second over ground.
  altitude: number; // Altitude if available, in meters above the WGS 84 reference ellipsoid.
  bearing: number; // Bearing, in degrees.
  isFromMockProvider: boolean; // (android only) True if location was recorded by mock provider
  mockLocationsEnabled: boolean; // android only) True if device has mock locations enabled
}

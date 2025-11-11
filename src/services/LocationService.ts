import axiosInstance from "../config/axios";

// Location type enum
export enum LocationType {
  CAMP = "Camp",
  IN_CAMP = "In_camp",
}

// Request DTO (for POST/PUT)
export interface LocationRequestDto {
  name: string;
  locationType: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  parentLocationId?: number | null;
  isActive?: boolean;
}

// Response DTO (from GET)
export interface LocationResponseDto {
  locationId: number;
  name: string;
  locationType: string;
  isActive: boolean;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  parentLocationId?: number | null;
  parentLocationName?: string | null;
}

// API Service
const locationService = {
  // Get all locations
  getAllLocations: async (): Promise<LocationResponseDto[]> => {
    console.log("[locationService] GET /location");
    const response = await axiosInstance.get("/location");
    return response.data as LocationResponseDto[];
  },

  // Get location by ID
  getLocationById: async (id: number): Promise<LocationResponseDto> => {
    console.log(`[locationService] GET /location/${id}`);
    const response = await axiosInstance.get(`/location/${id}`);
    return response.data as LocationResponseDto;
  },

  // Create location
  createLocation: async (location: LocationRequestDto): Promise<LocationResponseDto> => {
    console.log("[locationService] POST /location");
    const requestPayload = {
      name: location.name,
      locationType: location.locationType,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const response = await axiosInstance.post("/location", requestPayload);
    return response.data as LocationResponseDto;
  },

  // Update location
  updateLocation: async (id: number, location: LocationRequestDto): Promise<LocationResponseDto> => {
    console.log(`[locationService] PUT /location/${id}`);
    const requestPayload = {
      name: location.name,
      locationType: location.locationType,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const response = await axiosInstance.put(`/location/${id}`, requestPayload);
    return response.data as LocationResponseDto;
  },

  // Delete location
  deleteLocation: async (id: number): Promise<void> => {
    console.log(`[locationService] DELETE /location/${id}`);
    await axiosInstance.delete(`/location/${id}`);
  },

  // Get camp locations (filter locationType = "Camp" from all locations)
  getCampLocations: async (): Promise<LocationResponseDto[]> => {
    console.log("[locationService] GET /location -> filter locationType=Camp");
    const response = await axiosInstance.get("/location");

    const campLocations = (response.data as LocationResponseDto[]).filter(
      (location) => location.locationType === LocationType.CAMP
    );
    return campLocations;
  },

  // Get locations by type
  getLocationsByType: async (type: string): Promise<LocationResponseDto[]> => {
    console.log(`[locationService] GET /location/type?type=${type}`);
    const response = await axiosInstance.get("/location/type", {
      params: { type },
    });
    return response.data as LocationResponseDto[];
  },

  // Get locations by parent location ID
  getLocationsByParent: async (parentLocationId: number): Promise<LocationResponseDto[]> => {
    console.log(`[locationService] GET /location/parent/${parentLocationId}`);
    const response = await axiosInstance.get(`/location/parent/${parentLocationId}`);
    return response.data as LocationResponseDto[];
  },

};

export default locationService;

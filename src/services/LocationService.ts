import axiosInstance from "../config/axios";

// Location type enum
export enum LocationType {
  CAMP = "Camp",
  IN_CAMP = "In_camp",
  PICKUP_POINT = "Pickup_point",
}

export interface LocationRequestDto {
  name: string;
  locationType: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  parentLocationId: number | null;
  isActive?: boolean;
}

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
      parentLocationId: location.parentLocationId,
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

  // Create In-Camp Location
  createInCampLocation: async (name: string, description: string | null, parentLocationId: number | null): Promise<LocationResponseDto> => {
    console.log("[locationService] POST /location (In-Camp Location)");
    const requestPayload = {
      name: name,
      locationType: "In_camp",
      address: description,
      latitude: null,
      longitude: null,
      parentLocationId: parentLocationId,
    };
    const response = await axiosInstance.post("/location", requestPayload);
    return response.data as LocationResponseDto;
  },

  // Create Pickup Point
  createPickupPoint: async (name: string, address: string, latitude: number, longitude: number): Promise<LocationResponseDto> => {
    console.log("[locationService] POST /location (Pickup Point)");
    const requestPayload = {
      name: name,
      locationType: "Pickup_point",
      address: address,
      latitude: latitude,
      longitude: longitude,
      parentLocationId: null,
    };
    const response = await axiosInstance.post("/location", requestPayload);
    return response.data as LocationResponseDto;
  },

};

export default locationService;

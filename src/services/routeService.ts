import axiosInstance from "../config/axios";

export interface RouteRequestDto {
  campId: number;
  routeName: string;
  routeType: string;
  estimateDuration: number;
}

export interface RouteResponseDto {
  routeId: number;
  campId: number;
  campName: string;
  routeName: string;
  routeType: string;
  estimateDuration: number;
  isActive: boolean;
  status: string;
}

export interface RouteStopRequestDto {
  routeId: number;
  locationId: number;
  stopOrder: number;
  estimatedTime: number;
}

export interface RouteInfoDto {
  routeId: number;
  routeName: string;
}

export interface LocationInfoDto {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface RouteStopResponseDto {
  routeStopId: number;
  route: RouteInfoDto;
  location: LocationInfoDto;
  stopOrder: number;
  estimatedTime: number;
  status: string;
}

const routeService = {
  
  // Get all routes
  getAllRoutes: async (): Promise<RouteResponseDto[]> => {
    console.log("[routeService] GET /route");
    const response = await axiosInstance.get("/route");
    return response.data as RouteResponseDto[];
  },

  // Get route by ID
  getRouteById: async (id: number): Promise<RouteResponseDto> => {
    console.log(`[routeService] GET /route/${id}`);
    const response = await axiosInstance.get(`/route/${id}`);
    return response.data as RouteResponseDto;
  },

  // Create route
  createRoute: async (route: RouteRequestDto): Promise<RouteResponseDto> => {
    console.log("[routeService] POST /route");
    const requestPayload = {
      campId: route.campId,
      routeName: route.routeName,
      routeType: route.routeType,
      estimateDuration: route.estimateDuration,
    };

    const response = await axiosInstance.post("/route", requestPayload);
    return response.data as RouteResponseDto;
  },

  // Update route
  updateRoute: async (id: number, route: RouteRequestDto): Promise<RouteResponseDto> => {
    console.log(`[routeService] PUT /route/${id}`);
    const requestPayload = {
      campId: route.campId,
      routeName: route.routeName,
      routeType: route.routeType,
      estimateDuration: route.estimateDuration,
    };

    const response = await axiosInstance.put(`/route/${id}`, requestPayload);
    return response.data as RouteResponseDto;
  },

  // Delete route
  deleteRoute: async (id: number): Promise<void> => {
    console.log(`[routeService] DELETE /route/${id}`);
    await axiosInstance.delete(`/route/${id}`);
  },

  // ==================== ROUTE STOP ENDPOINTS ====================

  // Get route stops by route ID
  getRouteStopsByRouteId: async (routeId: number): Promise<RouteStopResponseDto[]> => {
    console.log(`[routeService] GET /routestop/${routeId}`);
    const response = await axiosInstance.get(`/routestop/${routeId}`);
    return response.data as RouteStopResponseDto[];
  },

  // Create route stop
  createRouteStop: async (routeStop: RouteStopRequestDto): Promise<RouteStopResponseDto> => {
    console.log("[routeService] POST /RouteStop");
    const requestPayload = {
      routeId: routeStop.routeId,
      locationId: routeStop.locationId,
      stopOrder: routeStop.stopOrder,
      estimatedTime: routeStop.estimatedTime,
    };

    const response = await axiosInstance.post("/RouteStop", requestPayload);
    return response.data as RouteStopResponseDto;
  },

  // Update route stop
  updateRouteStop: async (routeStopId: number, routeStop: RouteStopRequestDto): Promise<RouteStopResponseDto> => {
    console.log(`[routeService] PUT /RouteStop/${routeStopId}`);
    const requestPayload = {
      routeId: routeStop.routeId,
      locationId: routeStop.locationId,
      stopOrder: routeStop.stopOrder,
      estimatedTime: routeStop.estimatedTime,
    };

    const response = await axiosInstance.put(`/RouteStop/${routeStopId}`, requestPayload);
    return response.data as RouteStopResponseDto;
  },

  // Delete route stop
  deleteRouteStop: async (routeStopId: number): Promise<void> => {
    console.log(`[routeService] DELETE /RouteStop/${routeStopId}`);
    await axiosInstance.delete(`/RouteStop/${routeStopId}`);
  },
};

export default routeService;

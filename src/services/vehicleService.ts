import axiosInstance from "../config/axios";

// Frontend interfaces
export interface VehicleType {
    vehicleTypeId: number;
    name: string;
    description?: string;
    isActive?: boolean;
}

// Request DTO (for POST/PUT)
export interface VehicleRequestDto {
    vehicleName: string;
    vehicleNumber: string;
    capacity: number;
    status: string;
    vehicleType: number | null;
}

// Response DTO (from GET)
export interface VehicleResponseDto {
    vehicleId: number;
    vehicleName: string;
    vehicleNumber: string;
    capacity: number;
    status: string;
    vehicleType: number | null;
    vehicleTypeNavigation: {
        vehicleTypeId: number;
        name: string;
        description?: string;
    } | null;
}

// Backend raw response structure
interface BackendVehicleResponse {
    vehicleId: number;
    vehicleName: string;
    vehicleNumber: string;
    capacity: number;
    status: string;
    vehicleType: number | null;
    vehicleTypeNavigation?: {
        vehicleTypeId: number;
        name: string;
        description?: string;
    } | null;
}

// Map backend response to frontend format
const mapBackendToFrontend = (data: BackendVehicleResponse): VehicleResponseDto => {
    return {
        vehicleId: data.vehicleId,
        vehicleName: data.vehicleName,
        vehicleNumber: data.vehicleNumber,
        capacity: data.capacity,
        status: data.status,
        vehicleType: data.vehicleType,
        vehicleTypeNavigation: data.vehicleTypeNavigation || null,
    };
};

// API Service
const vehicleService = {
    // Get all vehicles
    getAllVehicles: async (): Promise<VehicleResponseDto[]> => {
        console.log("📤 [vehicleService] GET /vehicle");
        const response = await axiosInstance.get("/vehicle");
        console.log("✅ [vehicleService] GET /vehicle raw response:", response.data);

        const mapped = (response.data as BackendVehicleResponse[]).map(mapBackendToFrontend);
        console.log("✅ [vehicleService] GET /vehicle mapped:", mapped);
        return mapped;
    },

    // Get vehicle by ID
    getVehicleById: async (id: number): Promise<VehicleResponseDto> => {
        console.log(`📤 [vehicleService] GET /vehicle/${id}`);
        const response = await axiosInstance.get(`/vehicle/${id}`);
        console.log(`✅ [vehicleService] GET /vehicle/${id} raw response:`, response.data);

        const mapped = mapBackendToFrontend(response.data as BackendVehicleResponse);
        console.log(`✅ [vehicleService] GET /vehicle/${id} mapped:`, mapped);
        return mapped;
    },

    // Create vehicle
    createVehicle: async (vehicle: VehicleRequestDto): Promise<{ message: string }> => {
        const requestPayload = {
            vehicleName: vehicle.vehicleName,
            vehicleNumber: vehicle.vehicleNumber,
            capacity: vehicle.capacity,
            status: vehicle.status,
            vehicleType: vehicle.vehicleType,
        };

        console.log("📤 [vehicleService] POST /vehicle request:", requestPayload);
        const response = await axiosInstance.post("/vehicle", requestPayload);
        console.log("✅ [vehicleService] POST /vehicle response:", response.data);

        return response.data;
    },

    // Update vehicle
    updateVehicle: async (id: number, vehicle: VehicleRequestDto): Promise<{ message: string }> => {
        const requestPayload = {
            vehicleId: id,
            vehicleName: vehicle.vehicleName,
            vehicleNumber: vehicle.vehicleNumber,
            capacity: vehicle.capacity,
            status: vehicle.status,
            vehicleType: vehicle.vehicleType,
        };

        console.log(`📤 [vehicleService] PUT /vehicle/${id} request:`, requestPayload);
        const response = await axiosInstance.put(`/vehicle/${id}`, requestPayload);
        console.log(`✅ [vehicleService] PUT /vehicle/${id} response:`, response.data);

        return response.data;
    },

    // Delete vehicle
    deleteVehicle: async (id: number): Promise<void> => {
        console.log(`📤 [vehicleService] DELETE /vehicle/${id}`);
        await axiosInstance.delete(`/vehicle/${id}`);
        console.log(`✅ [vehicleService] DELETE /vehicle/${id} success`);
    },

    // Get all vehicle types
    getAllVehicleTypes: async (): Promise<VehicleType[]> => {
        console.log("📤 [vehicleService] GET /vehicletype");
        const response = await axiosInstance.get("/vehicletype");
        console.log("✅ [vehicleService] GET /vehicletype response:", response.data);

        return response.data.map((type: any) => ({
            vehicleTypeId: type.vehicleTypeId,
            name: type.name,
            description: type.description,
            isActive: type.isActive,
        }));
    },

    // Get active vehicle types
    getActiveVehicleTypes: async (): Promise<VehicleType[]> => {
        console.log("📤 [vehicleService] GET /vehicletype/active");
        const response = await axiosInstance.get("/vehicletype/active");
        console.log("✅ [vehicleService] GET /vehicletype/active response:", response.data);

        return response.data.map((type: any) => ({
            vehicleTypeId: type.vehicleTypeId,
            name: type.name,
            description: type.description,
            isActive: type.isActive,
        }));
    },

    // Get vehicle type by ID
    getVehicleTypeById: async (id: number): Promise<VehicleType> => {
        console.log(`📤 [vehicleService] GET /vehicletype/${id}`);
        const response = await axiosInstance.get(`/vehicletype/${id}`);
        console.log(`✅ [vehicleService] GET /vehicletype/${id} response:`, response.data);

        return {
            vehicleTypeId: response.data.vehicleTypeId,
            name: response.data.name,
            description: response.data.description,
            isActive: response.data.isActive,
        };
    },

    // Create vehicle type
    createVehicleType: async (vehicleType: Omit<VehicleType, "vehicleTypeId">): Promise<{ message: string }> => {
        const requestPayload = {
            name: vehicleType.name,
            description: vehicleType.description || "",
            isActive: vehicleType.isActive ?? true,
        };

        console.log("📤 [vehicleService] POST /vehicletype request:", requestPayload);
        const response = await axiosInstance.post("/vehicletype", requestPayload);
        console.log("✅ [vehicleService] POST /vehicletype response:", response.data);

        return response.data;
    },

    // Update vehicle type
    updateVehicleType: async (id: number, vehicleType: VehicleType): Promise<{ message: string }> => {
        const requestPayload = {
            vehicleTypeId: id,
            name: vehicleType.name,
            description: vehicleType.description || "",
            isActive: vehicleType.isActive ?? true,
        };

        console.log(`📤 [vehicleService] PUT /vehicletype/${id} request:`, requestPayload);
        const response = await axiosInstance.put(`/vehicletype/${id}`, requestPayload);
        console.log(`✅ [vehicleService] PUT /vehicletype/${id} response:`, response.data);

        return response.data;
    },

    // Delete vehicle type
    deleteVehicleType: async (id: number): Promise<void> => {
        console.log(`📤 [vehicleService] DELETE /vehicletype/${id}`);
        await axiosInstance.delete(`/vehicletype/${id}`);
        console.log(`✅ [vehicleService] DELETE /vehicletype/${id} success`);
    },
};

export default vehicleService;

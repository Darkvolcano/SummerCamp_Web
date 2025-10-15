import axiosInstance from "../config/axios";

// Frontend interfaces
export interface CampType {
  campTypeId: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Location {
  locationId: number;
  name: string;
}

export interface Promotion {
  promotionId: number;
  name: string;
  discountPercentage?: number;
}

// Request DTO (for POST/PUT)
export interface CampRequestDto {
  name: string;
  description: string;
  place: string;
  address: string;
  minParticipants: number;
  maxParticipants: number;
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string;
  image: string;
  campTypeId: number | null;
  locationId: number | null;
  price: number;
}

// Response DTO (from GET)
export interface CampResponseDto {
  campId: number;
  name: string;
  description: string;
  place: string;
  address: string;
  minParticipants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  image: string;
  price: number;
  status: string;
  createBy: number;
  registrationStartDate: string;
  registrationEndDate: string;
  // Nested objects
  campType: {
    id: number;
    name: string;
  } | null;
  location: {
    id: number;
    name: string;
  } | null;
  promotion: {
    id: number;
    name: string;
  } | null;
}

// Backend raw response structure
interface BackendCampResponse {
  campId: number;
  name: string;
  description: string;
  place: string;
  address: string;
  minParticipants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
  image: string;
  createBy: number;
  registrationStartDate: string;
  registrationEndDate: string;
  campType?: {
    id: number;
    name: string;
  } | null;
  location?: {
    id: number;
    name: string;
  } | null;
  promotion?: {
    id: number;
    name: string;
  } | null;
}

// Map backend response to frontend format
const mapBackendToFrontend = (data: BackendCampResponse): CampResponseDto => {
  return {
    campId: data.campId,
    name: data.name,
    description: data.description,
    place: data.place,
    address: data.address,
    minParticipants: data.minParticipants,
    maxParticipants: data.maxParticipants,
    startDate: data.startDate,
    endDate: data.endDate,
    image: data.image,
    price: data.price,
    status: data.status,
    createBy: data.createBy,
    registrationStartDate: data.registrationStartDate,
    registrationEndDate: data.registrationEndDate,
    campType: data.campType || null,
    location: data.location || null,
    promotion: data.promotion || null,
  };
};

// API Service
const campService = {
  // Get all camps
  getAllCamps: async (): Promise<CampResponseDto[]> => {
    console.log("📤 [campService] GET /camp");
    const response = await axiosInstance.get("/camp");
    console.log("✅ [campService] GET /camp raw response:", response.data);
    
    const mapped = (response.data as BackendCampResponse[]).map(mapBackendToFrontend);
    console.log("✅ [campService] GET /camp mapped:", mapped);
    return mapped;
  },

  // Get camp by ID
  getCampById: async (id: number): Promise<CampResponseDto> => {
    console.log(`📤 [campService] GET /camp/${id}`);
    const response = await axiosInstance.get(`/camp/${id}`);
    console.log(`✅ [campService] GET /camp/${id} raw response:`, response.data);
    
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    console.log(`✅ [campService] GET /camp/${id} mapped:`, mapped);
    return mapped;
  },

  // Create camp
  createCamp: async (camp: CampRequestDto): Promise<CampResponseDto> => {
    // Send in camelCase (backend accepts it)
    const requestPayload = {
      name: camp.name,
      description: camp.description,
      place: camp.place,
      address: camp.address,
      minParticipants: camp.minParticipants,
      maxParticipants: camp.maxParticipants,
      startDate: camp.startDate,
      endDate: camp.endDate,
      image: camp.image,
      campTypeId: camp.campTypeId,
      locationId: camp.locationId,
      price: camp.price,
    };

    console.log("📤 [campService] POST /camp request:", requestPayload);
    const response = await axiosInstance.post("/camp", requestPayload);
    console.log("✅ [campService] POST /camp response:", response.data);
    
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Update camp
  updateCamp: async (id: number, camp: CampRequestDto): Promise<CampResponseDto> => {
    const requestPayload = {
      name: camp.name,
      description: camp.description,
      place: camp.place,
      address: camp.address,
      minParticipants: camp.minParticipants,
      maxParticipants: camp.maxParticipants,
      startDate: camp.startDate,
      endDate: camp.endDate,
      image: camp.image,
      campTypeId: camp.campTypeId,
      locationId: camp.locationId,
      price: camp.price,
    };

    console.log(`📤 [campService] PUT /camp/${id} request:`, requestPayload);
    const response = await axiosInstance.put(`/camp/${id}`, requestPayload);
    console.log(`✅ [campService] PUT /camp/${id} response:`, response.data);
    
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Delete camp
  deleteCamp: async (id: number): Promise<void> => {
    console.log(`📤 [campService] DELETE /camp/${id}`);
    await axiosInstance.delete(`/camp/${id}`);
    console.log(`✅ [campService] DELETE /camp/${id} success`);
  },

  // Get all camp types
  getAllCampTypes: async (): Promise<CampType[]> => {
    console.log("📤 [campService] GET /camptype");
    const response = await axiosInstance.get("/camptype");
    console.log("✅ [campService] GET /camptype response:", response.data);
    
    // Map backend response to frontend format
    return response.data.map((type: any) => ({
      campTypeId: type.id || type.campTypeId,
      name: type.name,
      description: type.description,
      isActive: type.isActive,
    }));
  },

  // Get camp type by ID
  getCampTypeById: async (id: number): Promise<CampType> => {
    console.log(`📤 [campService] GET /camptype/${id}`);
    const response = await axiosInstance.get(`/camptype/${id}`);
    console.log(`✅ [campService] GET /camptype/${id} response:`, response.data);
    
    return {
      campTypeId: response.data.id || response.data.campTypeId,
      name: response.data.name,
      description: response.data.description,
      isActive: response.data.isActive,
    };
  },
};

export default campService;
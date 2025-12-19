import axiosInstance from "../config/axios";
import { CampStatus } from "../enums/camp-status.enum";

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
  id: number;
  name: string;
  percent: number;
  maxDiscountAmount?: number;
  maxUsageCount?: number;
  currentUsageCount?: number;
}

// Request DTO (for POST/PUT)
export interface CampRequestDto {
  name: string;
  description: string;
  place: string;
  address: string;
  minParticipants: number;
  maxParticipants: number;
  minAge: number;
  maxAge: number;
  startDate: string;
  endDate: string;
  image?: string | null;
  campTypeId: number | null;
  locationId: number | null;
  promotionId?: number | null;
  price?: number | null;
  registrationStartDate: string;
  registrationEndDate: string;
}

export interface CampExtensionRequestDto {
  newRegistrationEndDate: string;
}

export interface CampValidationResponseDto {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    errors: string[];
  };
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
  minAge: number;
  maxAge: number;
  startDate: string;
  endDate: string;
  image: string | null;
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
  promotion: Promotion | null;
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
  minAge: number;
  maxAge: number;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
  image: string | null;
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
  promotion?: Promotion | null;
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
    minAge: data.minAge,
    maxAge: data.maxAge,
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
    console.log("[campService] GET /camp");
    const response = await axiosInstance.get("/camp");
    const mapped = (response.data as BackendCampResponse[]).map(
      mapBackendToFrontend
    );
    return mapped;
  },

  // Get camp by ID
  getCampById: async (id: number): Promise<CampResponseDto> => {
    console.log(`[campService] GET /camp/${id}`);
    const response = await axiosInstance.get(`/camp/${id}`);
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Create camp
  createCamp: async (camp: CampRequestDto): Promise<CampResponseDto> => {
    console.log("[campService] POST /camp");
    const requestPayload = {
      name: camp.name,
      description: camp.description,
      place: camp.place,
      address: camp.address,
      minParticipants: camp.minParticipants,
      maxParticipants: camp.maxParticipants,
      minAge: camp.minAge,
      maxAge: camp.maxAge,
      startDate: camp.startDate,
      endDate: camp.endDate,
      image: camp.image,
      campTypeId: camp.campTypeId,
      locationId: camp.locationId,
      promotionId: camp.promotionId,
      price: camp.price,
      registrationStartDate: camp.registrationStartDate,
      registrationEndDate: camp.registrationEndDate,
    };

    const response = await axiosInstance.post("/camp", requestPayload);
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Update camp
  updateCamp: async (
    id: number,
    camp: CampRequestDto
  ): Promise<CampResponseDto> => {
    console.log(`[campService] PUT /camp/${id}`);
    const requestPayload = {
      name: camp.name,
      description: camp.description,
      place: camp.place,
      address: camp.address,
      minParticipants: camp.minParticipants,
      maxParticipants: camp.maxParticipants,
      minAge: camp.minAge,
      maxAge: camp.maxAge,
      startDate: camp.startDate,
      endDate: camp.endDate,
      image: camp.image,
      campTypeId: camp.campTypeId,
      locationId: camp.locationId,
      promotionId: camp.promotionId,
      price: camp.price,
      registrationStartDate: camp.registrationStartDate,
      registrationEndDate: camp.registrationEndDate,
    };

    const response = await axiosInstance.put(`/camp/${id}`, requestPayload);
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Delete camp
  deleteCamp: async (id: number): Promise<void> => {
    console.log(`[campService] DELETE /camp/${id}`);
    await axiosInstance.delete(`/camp/${id}`);
  },

  // Get camps by status
  getCampsByStatus: async (status: string): Promise<CampResponseDto[]> => {
    console.log(`[campService] GET /camp/status?status=${status}`);
    const response = await axiosInstance.get("/camp/status", {
      params: { status },
    });

    const mapped = (response.data as BackendCampResponse[]).map(
      mapBackendToFrontend
    );
    return mapped;
  },

  // Get all camp types
  getAllCampTypes: async (): Promise<CampType[]> => {
    console.log("[campService] GET /camptype");
    const response = await axiosInstance.get("/camptype");

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
    console.log(
      `✅ [campService] GET /camptype/${id} response:`,
      response.data
    );

    return {
      campTypeId: response.data.id || response.data.campTypeId,
      name: response.data.name,
      description: response.data.description,
      isActive: response.data.isActive,
    };
  },

  getPublishedCamps: async (): Promise<CampResponseDto[]> => {
    console.log("[campService] GET /camp (published only)");
    const response = await axiosInstance.get("/camp");

    // Filter only published statuses
    const publishedStatuses = [
      CampStatus.PUBLISHED,
      CampStatus.OPEN_FOR_REGISTRATION,
      CampStatus.REGISTRATION_CLOSED,
    ];

    const allCamps = (response.data as BackendCampResponse[]).map(
      mapBackendToFrontend
    );
    const publishedCamps = allCamps.filter((camp) =>
      publishedStatuses.includes(camp.status as CampStatus)
    );

    console.log(
      `[campService] Found ${publishedCamps.length}/${allCamps.length} published camps`
    );
    return publishedCamps;
  },

  // Approve camp
  approveCamp: async (campId: number): Promise<CampResponseDto> => {
    console.log(`[campService] PUT /camp/${campId}/approve`);
    const response = await axiosInstance.put(`/camp/${campId}/approve`);
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Reject camp
  rejectCamp: async (campId: number): Promise<CampResponseDto> => {
    console.log(`[campService] PUT /camp/${campId}/reject`);
    const response = await axiosInstance.put(`/camp/${campId}/reject`);
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Update camp status
  updateCampStatus: async (
    campId: number,
    status: CampStatus
  ): Promise<CampResponseDto> => {
    console.log(`[campService] PATCH /camp/${campId}/status`);
    const response = await axiosInstance.patch(`/camp/${campId}/status`, {
      status,
    });
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Submit camp for approval
  submitCampForApproval: async (campId: number): Promise<CampResponseDto> => {
    console.log(`[campService] PATCH /camp/${campId}/submit-for-approval`);
    const response = await axiosInstance.patch(
      `/camp/${campId}/submit-for-approval`
    );
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Update camp status without validation (for testing)
  updateCampStatusTest: async (
    campId: number,
    status: CampStatus
  ): Promise<CampResponseDto> => {
    console.log(`[campService] PATCH /camp/${campId}/test-status`);
    const response = await axiosInstance.patch(`/camp/${campId}/test-status`, {
      status,
    });
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Extend registration period
  extendRegistration: async (
    campId: number,
    data: CampExtensionRequestDto
  ): Promise<CampResponseDto> => {
    console.log(`[campService] PATCH /camp/${campId}/extend-registration`);
    const response = await axiosInstance.patch(
      `/camp/${campId}/extend-registration`,
      data
    );
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },

  // Validate camp
  validateCamp: async (campId: number): Promise<CampValidationResponseDto> => {
    console.log(`[campService] GET /camp/validate/${campId}`);
    const response = await axiosInstance.get(`/camp/validate/${campId}`);
    return response.data as CampValidationResponseDto;
  },

  // Cancel camp
  cancelCamp: async (campId: number, reason: string): Promise<CampResponseDto> => {
    console.log(`[campService] POST /camp/${campId}/cancel`);
    const response = await axiosInstance.post(`/camp/${campId}/cancel`, { reason });
    const mapped = mapBackendToFrontend(response.data as BackendCampResponse);
    return mapped;
  },
};

export default campService;

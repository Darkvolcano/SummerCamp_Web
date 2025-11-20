import axiosInstance from "../config/axios";

export interface SupervisorInfo {
  userId: number;
  fullName: string;
}

export interface Accommodation {
  accommodationId: number;
  campId: number;
  accommodationTypeId: number;
  name: string;
  capacity: number;
  isActive: boolean;
  supervisor: SupervisorInfo | null;
}

export interface AccommodationRequestDto {
  campId: number;
  accommodationTypeId: number;
  name: string;
  capacity: number;
  supervisorId?: number | null;
}

export interface AccommodationResponseDto {
  accommodationId: number;
  campId: number;
  accommodationTypeId: number;
  name: string;
  capacity: number;
  isActive: boolean;
  supervisor: SupervisorInfo | null;
}

const accommodationService = {
  // Get all accommodations
  getAllAccommodations: async (): Promise<AccommodationResponseDto[]> => {
    console.log("[accommodationService] GET /Accommodation");
    const response = await axiosInstance.get("/Accommodation");
    return response.data as AccommodationResponseDto[];
  },

  // Get accommodation by ID
  getAccommodationById: async (accommodationId: number): Promise<AccommodationResponseDto> => {
    console.log(`[accommodationService] GET /Accommodation/${accommodationId}`);
    const response = await axiosInstance.get(`/Accommodation/${accommodationId}`);
    return response.data as AccommodationResponseDto;
  },

  // Get accommodations by camp ID
  getAccommodationsByCampId: async (campId: number): Promise<AccommodationResponseDto[]> => {
    console.log(`[accommodationService] GET /Accommodation/camp/${campId}`);
    const response = await axiosInstance.get(`/Accommodation/camp/${campId}`);
    return response.data as AccommodationResponseDto[];
  },

  // Get accommodations by supervisor ID
  getAccommodationsBySupervisorId: async (supervisorId: number, campId?: number): Promise<AccommodationResponseDto[]> => {
    console.log(`[accommodationService] GET /Accommodation/supervisor/${supervisorId}`);
    const response = await axiosInstance.get(`/Accommodation/supervisor/${supervisorId}`, {
      params: campId ? { campId } : undefined,
    });
    return response.data as AccommodationResponseDto[];
  },

  // Get active accommodations
  getActiveAccommodations: async (): Promise<AccommodationResponseDto[]> => {
    console.log("[accommodationService] GET /Accommodation/active");
    const response = await axiosInstance.get("/Accommodation/active");
    return response.data as AccommodationResponseDto[];
  },

  // Create accommodation
  createAccommodation: async (accommodation: AccommodationRequestDto): Promise<AccommodationResponseDto> => {
    console.log("[accommodationService] POST /Accommodation");
    const requestPayload = {
      campId: accommodation.campId,
      accommodationTypeId: accommodation.accommodationTypeId,
      name: accommodation.name,
      capacity: accommodation.capacity,
      supervisorId: accommodation.supervisorId ?? null,
    };

    const response = await axiosInstance.post("/Accommodation", requestPayload);
    return response.data as AccommodationResponseDto;
  },

  // Update accommodation
  updateAccommodation: async (accommodationId: number, accommodation: AccommodationRequestDto): Promise<AccommodationResponseDto> => {
    console.log(`[accommodationService] PUT /Accommodation/${accommodationId}`);
    const requestPayload = {
      campId: accommodation.campId,
      accommodationTypeId: accommodation.accommodationTypeId,
      name: accommodation.name,
      capacity: accommodation.capacity,
      supervisorId: accommodation.supervisorId ?? null,
    };

    const response = await axiosInstance.put(`/Accommodation/${accommodationId}`, requestPayload);
    return response.data as AccommodationResponseDto;
  },

  // Deactivate accommodation
  deactivateAccommodation: async (accommodationId: number): Promise<void> => {
    console.log(`[accommodationService] PUT /Accommodation/deactivate/${accommodationId}`);
    await axiosInstance.put(`/Accommodation/deactivate/${accommodationId}`);
  },
};

export default accommodationService;

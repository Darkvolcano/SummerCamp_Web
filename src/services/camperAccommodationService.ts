import axiosInstance from "../config/axios";

// ==================== REQUEST DTOs ====================

export interface CamperAccommodationRequestDto {
  camperId: number;
  accommodationId: number;
}

// ==================== RESPONSE DTOs ====================

export interface CamperAccommodationResponseDto {
  camperAccommodationId: number;
  camperId: number;
  camperName?: string | null;
  accommodationId: number;
  accommodationName?: string | null;
  campId?: number | null;
  campName?: string | null;
  status?: string | null;
}

// ==================== SEARCH PARAMS ====================

export interface CamperAccommodationSearchParams {
  camperId?: number;
  accommodationId?: number;
  campId?: number;
  camperName?: string;
}

// ==================== SERVICE ====================

const camperAccommodationService = {
  /**
   * GET /api/camper-accommodation
   * Get list of camper accommodations based on search criteria
   */
  getCamperAccommodations: async (
    params?: CamperAccommodationSearchParams
  ): Promise<CamperAccommodationResponseDto[]> => {
    console.log("[camperAccommodationService] GET /camper-accommodation");
    const response = await axiosInstance.get("/camper-accommodation", { params });
    return response.data as CamperAccommodationResponseDto[];
  },

  /**
   * POST /api/camper-accommodation
   * Create new camper accommodation assignment
   */
  createCamperAccommodation: async (
    data: CamperAccommodationRequestDto
  ): Promise<CamperAccommodationResponseDto> => {
    console.log("[camperAccommodationService] POST /camper-accommodation");
    const response = await axiosInstance.post("/camper-accommodation", data);
    return response.data as CamperAccommodationResponseDto;
  },

  /**
   * GET /api/camper-accommodation/pending
   * Get list of campers waiting for accommodation assignment
   */
  getPendingAccommodations: async (
    campId?: number
  ): Promise<CamperAccommodationResponseDto[]> => {
    console.log("[camperAccommodationService] GET /camper-accommodation/pending");
    const response = await axiosInstance.get("/camper-accommodation/pending", {
      params: campId ? { campId } : {},
    });
    return response.data as CamperAccommodationResponseDto[];
  },

  /**
   * PUT /api/camper-accommodation/{id}
   * Update camper accommodation assignment
   */
  updateCamperAccommodation: async (
    id: number,
    data: CamperAccommodationRequestDto
  ): Promise<CamperAccommodationResponseDto> => {
    console.log(`[camperAccommodationService] PUT /camper-accommodation/${id}`);
    const response = await axiosInstance.put(`/camper-accommodation/${id}`, data);
    return response.data as CamperAccommodationResponseDto;
  },

  /**
   * DELETE /api/camper-accommodation/{id}
   * Delete camper accommodation assignment
   */
  deleteCamperAccommodation: async (id: number): Promise<void> => {
    console.log(`[camperAccommodationService] DELETE /camper-accommodation/${id}`);
    await axiosInstance.delete(`/camper-accommodation/${id}`);
  },
};

export default camperAccommodationService;

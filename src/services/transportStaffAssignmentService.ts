import axiosInstance from "../config/axios";

// ==================== REQUEST DTOs ====================

export interface TransportStaffAssignmentCreateDto {
  transportScheduleId: number;
  staffId: number;
}

export interface TransportStaffAssignmentUpdateDto {
  transportScheduleId?: number | null;
  staffId?: number | null;
}

// ==================== RESPONSE DTOs ====================

export interface TransportStaffAssignmentResponseDto {
  id: number;
  transportScheduleId: number;
  staffId: number;
  staffName: string | null;
  status: string | null;
}

export interface AvailableStaffDto {
  userId: number;
  fullName: string | null;
  role: string | null;
}

// ==================== SEARCH PARAMS ====================

export interface TransportStaffAssignmentSearchParams {
  transportScheduleId?: number;
  staffId?: number;
  status?: string;
}

// ==================== SERVICE ====================

const transportStaffAssignmentService = {
  /**
   * GET /api/transport-staff-assignment
   * Get list of transport staff assignments based on search criteria
   */
  getTransportStaffAssignments: async (
    params?: TransportStaffAssignmentSearchParams
  ): Promise<TransportStaffAssignmentResponseDto[]> => {
    console.log("[transportStaffAssignmentService] GET /transport-staff-assignment");
    const response = await axiosInstance.get("/transport-staff-assignment", { params });
    return response.data as TransportStaffAssignmentResponseDto[];
  },

  /**
   * POST /api/transport-staff-assignment
   * Create new transport staff assignment
   */
  createTransportStaffAssignment: async (
    data: TransportStaffAssignmentCreateDto
  ): Promise<TransportStaffAssignmentResponseDto> => {
    console.log("[transportStaffAssignmentService] POST /transport-staff-assignment");
    const response = await axiosInstance.post("/transport-staff-assignment", data);
    return response.data as TransportStaffAssignmentResponseDto;
  },

  /**
   * GET /api/transport-staff-assignment/available-staff/{transportScheduleId}
   * Get available staff for transport schedule
   * Return staff of that camp, exclude staff with conflict in comparison with other Transport/Activity/Camp
   */
  getAvailableStaff: async (
    transportScheduleId: number
  ): Promise<AvailableStaffDto[]> => {
    console.log(
      `[transportStaffAssignmentService] GET /transport-staff-assignment/available-staff/${transportScheduleId}`
    );
    const response = await axiosInstance.get(
      `/transport-staff-assignment/available-staff/${transportScheduleId}`
    );
    return response.data as AvailableStaffDto[];
  },

  /**
   * PUT /api/transport-staff-assignment/{id}
   * Update transport staff assignment
   */
  updateTransportStaffAssignment: async (
    id: number,
    data: TransportStaffAssignmentUpdateDto
  ): Promise<TransportStaffAssignmentResponseDto> => {
    console.log(`[transportStaffAssignmentService] PUT /transport-staff-assignment/${id}`);
    const response = await axiosInstance.put(`/transport-staff-assignment/${id}`, data);
    return response.data as TransportStaffAssignmentResponseDto;
  },

  /**
   * DELETE /api/transport-staff-assignment/{id}
   * Delete transport staff assignment
   */
  deleteTransportStaffAssignment: async (id: number): Promise<void> => {
    console.log(`[transportStaffAssignmentService] DELETE /transport-staff-assignment/${id}`);
    await axiosInstance.delete(`/transport-staff-assignment/${id}`);
  },
};

export default transportStaffAssignmentService;

import axiosInstance from "../config/axios";

// Staff info trong response
export interface StaffInfo {
  userId: number;
  fullName: string;
  role: string;
}

// Camp info trong response
export interface CampInfo {
  campId: number;
  name: string;
}

// Request body để phân công staff
export interface CampStaffAssignmentRequest {
  staffId: number;
  campId: number;
}

// Response từ API
export interface CampStaffAssignmentResponse {
  campStaffAssignmentId: number;
  staff: StaffInfo;
  camp: CampInfo;
}

const campStaffService = {
  /**
   * POST /api/campstaffassignment
   */
  assignStaffToCamp: async (
    request: CampStaffAssignmentRequest
  ): Promise<CampStaffAssignmentResponse> => {
    console.log("[campStaffService] POST /api/campstaffassignment");
    const response = await axiosInstance.post<CampStaffAssignmentResponse>(
      "/api/campstaffassignment",
      request
    );
    return response.data;
  },

  /**
   * GET /api/campstaffassignment/camp/{campId}
   */
  getStaffByCamp: async (campId: number): Promise<CampStaffAssignmentResponse[]> => {
    console.log(`[campStaffService] GET /api/campstaffassignment/camp/${campId}`);
    const response = await axiosInstance.get<CampStaffAssignmentResponse[]>(
      `/api/campstaffassignment/camp/${campId}`
    );
    return response.data;
  },

  /**
   * GET /api/campstaffassignment/staff/{staffId}
   */
  getCampsByStaff: async (staffId: number): Promise<CampStaffAssignmentResponse[]> => {
    console.log(`[campStaffService] GET /api/campstaffassignment/staff/${staffId}`);
    const response = await axiosInstance.get<CampStaffAssignmentResponse[]>(
      `/api/campstaffassignment/staff/${staffId}`
    );
    return response.data;
  },

  /**
   * GET /api/campstaffassignment/{id}
   */
  getAssignmentById: async (assignmentId: number): Promise<CampStaffAssignmentResponse> => {
    console.log(`[campStaffService] GET /api/campstaffassignment/${assignmentId}`);
    const response = await axiosInstance.get<CampStaffAssignmentResponse>(
      `/api/campstaffassignment/${assignmentId}`
    );
    return response.data;
  },

  /**
   * DELETE /api/campstaffassignment/{id}
   */
  removeStaffFromCamp: async (assignmentId: number): Promise<void> => {
    console.log(`[campStaffService] DELETE /api/campstaffassignment/${assignmentId}`);
    await axiosInstance.delete(`/api/campstaffassignment/${assignmentId}`);
  },
};

export default campStaffService;

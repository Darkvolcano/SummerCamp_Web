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

export interface StaffCampAssignmentResponse {
  camp: CampInfo;
}

const campStaffService = {
  /**
   * POST /campstaffassignment
   */
  assignStaffToCamp: async (
    request: CampStaffAssignmentRequest
  ): Promise<CampStaffAssignmentResponse> => {
    console.log("[campStaffService] POST /campstaffassignment");
    const response = await axiosInstance.post<CampStaffAssignmentResponse>(
      "/campstaffassignment",
      request
    );
    return response.data;
  },

  /**
   * GET /campstaffassignment/camp/{campId}
   */
  getStaffByCamp: async (campId: number): Promise<CampStaffAssignmentResponse[]> => {
    console.log(`[campStaffService] GET /campstaffassignment/camp/${campId}`);
    const response = await axiosInstance.get<CampStaffAssignmentResponse[]>(
      `/campstaffassignment/camp/${campId}`
    );
    return response.data;
  },

  /**
   * GET /campstaffassignment/staff/{staffId}
   */
  getCampsByStaff: async (staffId: number): Promise<StaffCampAssignmentResponse[]> => {
    console.log(`[campStaffService] GET /campstaffassignment/staff/${staffId}`);
    const response = await axiosInstance.get<StaffCampAssignmentResponse[]>(
      `/campstaffassignment/staff/${staffId}`
    );
    return response.data;
  },

  /**
   * GET /campstaffassignment/{id}
   */
  getAssignmentById: async (assignmentId: number): Promise<CampStaffAssignmentResponse> => {
    console.log(`[campStaffService] GET /campstaffassignment/${assignmentId}`);
    const response = await axiosInstance.get<CampStaffAssignmentResponse>(
      `/campstaffassignment/${assignmentId}`
    );
    return response.data;
  },

  /**
   * DELETE /campstaffassignment/{id}
   */
  removeStaffFromCamp: async (assignmentId: number): Promise<void> => {
    console.log(`[campStaffService] DELETE /campstaffassignment/${assignmentId}`);
    await axiosInstance.delete(`/campstaffassignment/${assignmentId}`);
  },

  /**
   * GET /campstaffassignment/availableStaff/{campId}
   */
  getAvailableStaff: async (campId: number): Promise<StaffInfo[]> => {
    console.log(`[campStaffService] GET /campstaffassignment/availableStaff/${campId}`);
    const response = await axiosInstance.get<StaffInfo[]>(
      `/campstaffassignment/availableStaff/${campId}`
    );
    return response.data;
  },
};

export default campStaffService;

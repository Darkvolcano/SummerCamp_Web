import axiosInstance from "../config/axios";

// ==================== REQUEST DTOs ====================

export interface ReportRequestDto {
  campId: number;
  camperId: number;
  note?: string | null;
  image?: File | null;
  status?: string | null;
  activityId: number;
  level?: string | null;
}

export interface ReportUpdateDto {
  campId?: number;
  camperId?: number;
  note?: string | null;
  image?: File | null;
  status?: string | null;
  activityId?: number;
  level?: string | null;
}

export interface TransportIncidentRequestDto {
  campId: number;
  camperId: number;
  transportScheduleId: number;
  note?: string | null;
  imageUrl?: string | null;
}

export interface EarlyCheckoutRequestDto {
  campId: number;
  camperId: number;
  note?: string | null;
  imageUrl?: string | null;
}

export interface IncidentTicketRequestDto {
  campId: number;
  camperId: number;
  activityScheduleId?: number | null;
  level: number;
  note?: string | null;
  imageUrl?: string | null;
}

// ==================== RESPONSE DTOs ====================

export interface ReportResponseDto {
  reportId: number;
  camperId: number;
  camperName?: string | null;
  transportScheduleId?: number | null;
  reportType?: string | null;
  note?: string | null;
  image?: string | null;
  createAt?: string;
  status?: string | null;
  reportedBy?: number;
  reportedByName?: string | null;
  activityScheduleId?: number | null;
  activityScheduleName?: string | null;
  campId?: number | null;
  campName?: string | null;
  level?: string | null;
}

// ==================== SERVICE ====================

const reportService = {
  /**
   * GET /api/report
   * Get all reports
   */
  getAllReports: async (): Promise<ReportResponseDto[]> => {
    console.log("[reportService] GET /report");
    const response = await axiosInstance.get("/report");
    return response.data;
  },

  /**
   * POST /api/report
   * Create a new report
   * Content-Type: application/json
   */
  createReport: async (data: ReportRequestDto): Promise<ReportResponseDto> => {
    console.log("[reportService] POST /report");
    const response = await axiosInstance.post("/report", data);
    return response.data;
  },

  /**
   * GET /api/report/{id}
   * Get report by ID
   */
  getReportById: async (id: number): Promise<ReportResponseDto> => {
    console.log(`[reportService] GET /report/${id}`);
    const response = await axiosInstance.get(`/report/${id}`);
    return response.data;
  },

  /**
   * PUT /api/report/{id}
   * Update report
   * Content-Type: multipart/form-data
   */
  updateReport: async (id: number, data: ReportUpdateDto): Promise<ReportResponseDto> => {
    console.log(`[reportService] PUT /report/${id}`);
    const formData = new FormData();
    
    if (data.campId !== undefined) {
      formData.append("campId", data.campId.toString());
    }
    if (data.camperId !== undefined) {
      formData.append("camperId", data.camperId.toString());
    }
    if (data.activityId !== undefined) {
      formData.append("activityId", data.activityId.toString());
    }
    if (data.note !== undefined && data.note !== null) {
      formData.append("note", data.note);
    }
    if (data.image) {
      formData.append("image", data.image);
    }
    if (data.status !== undefined && data.status !== null) {
      formData.append("status", data.status);
    }
    if (data.level !== undefined && data.level !== null) {
      formData.append("level", data.level);
    }

    const response = await axiosInstance.put(`/report/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * DELETE /api/report/{id}
   * Delete report
   */
  deleteReport: async (id: number): Promise<void> => {
    console.log(`[reportService] DELETE /report/${id}`);
    await axiosInstance.delete(`/report/${id}`);
  },

  /**
   * GET /api/report/camper/{camperId}
   * Get reports by camper
   * Optional query param: campId
   */
  getReportsByCamper: async (camperId: number, campId?: number): Promise<ReportResponseDto[]> => {
    console.log(`[reportService] GET /report/camper/${camperId}`);
    const params: any = {};
    if (campId !== undefined) {
      params.campId = campId;
    }
    const response = await axiosInstance.get(`/report/camper/${camperId}`, { params });
    return response.data;
  },

  /**
   * GET /api/report/type/{reportType}
   * Get reports by type
   */
  getReportsByType: async (reportType: string): Promise<ReportResponseDto[]> => {
    console.log(`[reportService] GET /report/type/${reportType}`);
    const response = await axiosInstance.get(`/report/type/${reportType}`);
    return response.data;
  },

  /**
   * GET /api/report/my-reports
   * Get reports by logged-in staff
   */
  getMyReports: async (): Promise<ReportResponseDto[]> => {
    console.log("[reportService] GET /report/my-reports");
    const response = await axiosInstance.get("/report/my-reports");
    return response.data;
  },

  /**
   * GET /api/report/camp/{campId}
   * Get all reports by camp
   */
  getReportsByCamp: async (campId: number): Promise<ReportResponseDto[]> => {
    console.log(`[reportService] GET /report/camp/${campId}`);
    const response = await axiosInstance.get(`/report/camp/${campId}`);
    return response.data;
  },

  /**
   * POST /api/report/transport-incident
   * Report transport incident when camper drops out mid-journey
   */
  reportTransportIncident: async (data: TransportIncidentRequestDto): Promise<ReportResponseDto> => {
    console.log("[reportService] POST /report/transport-incident");
    const response = await axiosInstance.post("/report/transport-incident", data);
    return response.data;
  },

  /**
   * POST /api/report/early-checkout
   * Report early checkout of camper
   */
  reportEarlyCheckout: async (data: EarlyCheckoutRequestDto): Promise<ReportResponseDto> => {
    console.log("[reportService] POST /report/early-checkout");
    const response = await axiosInstance.post("/report/early-checkout", data);
    return response.data;
  },

  /**
   * POST /api/report/incident-ticket
   * Create a general incident ticket
   */
  createIncidentTicket: async (data: IncidentTicketRequestDto): Promise<ReportResponseDto> => {
    console.log("[reportService] POST /report/incident-ticket");
    const response = await axiosInstance.post("/report/incident-ticket", data);
    return response.data;
  },
};

export default reportService;

import axiosInstance from "../config/axios";

// ==================== REQUEST DTOs ====================

export interface FeedbackRequestDto {
  registrationId: number;
  rating?: number | null;
  comment?: string | null;
}

export interface FeedbackReplyRequestDto {
  reply?: string | null;
}

export interface FeedbackRejectedRequestDto {
  rejectionReason: string;
}

// ==================== RESPONSE DTOs ====================

export interface FeedbackResponseDto {
  feedbackId: number;
  registrationId: number;
  rating?: number | null;
  comment?: string | null;
  reply?: string | null;
  rejectionReason?: string | null;
  status?: string | null;
  createdDate?: string;
  updatedDate?: string;
  userId?: number;
  userName?: string | null;
  campId?: number;
  campName?: string | null;
}

// ==================== SERVICE ====================

const feedbackService = {
  /**
   * GET /api/Feedback
   * Get all feedbacks
   */
  getAllFeedbacks: async (): Promise<FeedbackResponseDto[]> => {
    console.log("[feedbackService] GET /Feedback");
    const response = await axiosInstance.get("/Feedback");
    return response.data;
  },

  /**
   * POST /api/Feedback
   * Create a new feedback
   */
  createFeedback: async (data: FeedbackRequestDto): Promise<FeedbackResponseDto> => {
    console.log("[feedbackService] POST /Feedback");
    const response = await axiosInstance.post("/Feedback", data);
    return response.data;
  },

  /**
   * GET /api/Feedback/{id}
   * Get feedback by ID
   */
  getFeedbackById: async (id: number): Promise<FeedbackResponseDto> => {
    console.log(`[feedbackService] GET /Feedback/${id}`);
    const response = await axiosInstance.get(`/Feedback/${id}`);
    return response.data;
  },

  /**
   * PUT /api/Feedback/{id}
   * Update feedback
   */
  updateFeedback: async (id: number, data: FeedbackRequestDto): Promise<FeedbackResponseDto> => {
    console.log(`[feedbackService] PUT /Feedback/${id}`);
    const response = await axiosInstance.put(`/Feedback/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /api/Feedback/{id}
   * Delete feedback
   */
  deleteFeedback: async (id: number): Promise<void> => {
    console.log(`[feedbackService] DELETE /Feedback/${id}`);
    await axiosInstance.delete(`/Feedback/${id}`);
  },

  /**
   * PUT /api/Feedback/manager-reply/{id}
   * Manager reply to feedback
   */
  managerReplyFeedback: async (id: number, data: FeedbackReplyRequestDto): Promise<FeedbackResponseDto> => {
    console.log(`[feedbackService] PUT /Feedback/manager-reply/${id}`);
    const response = await axiosInstance.put(`/Feedback/manager-reply/${id}`, data);
    return response.data;
  },

  /**
   * PUT /api/Feedback/reject/{id}
   * Reject feedback
   */
  rejectFeedback: async (id: number, data: FeedbackRejectedRequestDto): Promise<FeedbackResponseDto> => {
    console.log(`[feedbackService] PUT /Feedback/reject/${id}`);
    const response = await axiosInstance.put(`/Feedback/reject/${id}`, data);
    return response.data;
  },
};

export default feedbackService;

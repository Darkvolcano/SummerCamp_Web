import axiosInstance from "../config/axios";

// ==================== ENUMS ====================

export enum RegistrationCancelStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  COMPLETED = "Completed",
  REJECTED = "Rejected",
}

// ==================== REQUEST DTOs ====================

/**
 * Request to cancel registration and request refund
 */
export interface CancelRequestDto {
  registrationId: number;
  bankUserId: number;
  reason?: string | null;
}

/**
 * Request to reject a refund
 */
export interface RejectRefundDto {
  registrationCancelId: number;
  rejectReason: string;
}

/**
 * Request to approve a refund (multipart/form-data)
 */
export interface ApproveRefundDto {
  registrationCancelId: number;
  refundImage: File;
  transactionCode: string;
  managerNote?: string;
}

// ==================== RESPONSE DTOs ====================

/**
 * Refund calculation response
 */
export interface RefundCalculationResponseDto {
  registrationId: number;
  originalAmount: number;
  refundAmount: number;
  refundPercentage: number;
  deductionAmount: number;
  reason?: string | null;
}

/**
 * Registration cancel/refund request response
 */
export interface RegistrationCancelResponseDto {
  registrationCancelId: number;
  registrationId: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  camperNames: string[];
  refundAmount: number;
  requestDate: string;
  reason?: string | null;
  status: string;
  bankName: string;
  bankNumber: string;
  bankAccountName: string;
  approvalDate?: string | null;
  managerNote?: string | null;
  imageRefund?: string | null;
  transactionCode?: string | null;
}

// ==================== SERVICE ====================

const refundService = {
  /**
   * GET /api/refund/calculate/{registrationId}
   * Calculate refund amount before requesting
   */
  calculateRefund: async (
    registrationId: number
  ): Promise<RefundCalculationResponseDto> => {
    console.log(`[refundService] GET /refund/calculate/${registrationId}`);
    const response = await axiosInstance.get(
      `/refund/calculate/${registrationId}`
    );
    return response.data as RefundCalculationResponseDto;
  },

  /**
   * POST /api/refund/request-cancel
   * Request cancellation and refund
   */
  requestCancel: async (
    data: CancelRequestDto
  ): Promise<RegistrationCancelResponseDto> => {
    console.log("[refundService] POST /refund/request-cancel");
    const response = await axiosInstance.post("/refund/request-cancel", data);
    return response.data as RegistrationCancelResponseDto;
  },

  /**
   * GET /api/refund/requests
   * Get all refund requests with optional status filtering
   */
  getAllRefundRequests: async (
    status?: RegistrationCancelStatus
  ): Promise<RegistrationCancelResponseDto[]> => {
    console.log("[refundService] GET /refund/requests");
    const response = await axiosInstance.get("/refund/requests", {
      params: status ? { status } : {},
    });
    return response.data as RegistrationCancelResponseDto[];
  },

  /**
   * GET /api/refund/camp/{campId}/requests
   * Get refund requests for a specific camp with optional filtering
   */
  getCampRefundRequests: async (
    campId: number,
    status?: RegistrationCancelStatus
  ): Promise<RegistrationCancelResponseDto[]> => {
    console.log(`[refundService] GET /refund/camp/${campId}/requests`);
    const response = await axiosInstance.get(`/refund/camp/${campId}/requests`, {
      params: status ? { status } : {},
    });
    return response.data as RegistrationCancelResponseDto[];
  },

  /**
   * POST /api/refund/approve
   * Approve refund with image upload (multipart/form-data)
   */
  approveRefund: async (
    data: ApproveRefundDto
  ): Promise<RegistrationCancelResponseDto> => {
    console.log("[refundService] POST /refund/approve");

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append("registrationCancelId", data.registrationCancelId.toString());
    formData.append("refundImage", data.refundImage);
    formData.append("transactionCode", data.transactionCode);
    if (data.managerNote) {
      formData.append("managerNote", data.managerNote);
    }

    const response = await axiosInstance.post("/refund/approve", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as RegistrationCancelResponseDto;
  },

  /**
   * POST /api/refund/reject
   * Reject refund request
   */
  rejectRefund: async (
    data: RejectRefundDto
  ): Promise<RegistrationCancelResponseDto> => {
    console.log("[refundService] POST /refund/reject");
    const response = await axiosInstance.post("/refund/reject", data);
    return response.data as RegistrationCancelResponseDto;
  },
};

export default refundService;

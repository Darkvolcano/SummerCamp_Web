import axiosInstance from "../config/axios";
import { RegistrationStatus } from "../enums/registration-status.enum";

// Camper info response
export interface CamperDto {
  camperId: number;
  camperName: string;
  gender: string;
  dob: string;
  groupId?: number | null;
  avatar?: string;
}

// Promotion info response
export interface PromotionDto {
  promotionId: number;
  name: string;
  percent: number;
}

export interface Registration {
  registrationId: number;
  userId: number;
  campId: number;
  status: RegistrationStatus;
  registrationDate: string;
  appliedPromotionId?: number | null;
  note?: string | null;
  camperIds?: number[] | null;
}

export interface CreateRegistrationRequestDto {
  camperIds?: number[] | null;
  campId: number;
  appliedPromotionId?: number | null;
  note?: string | null;
}

export interface UpdateRegistrationRequestDto {
  camperIds?: number[] | null;
  campId: number;
  appliedPromotionId?: number | null;
  note?: string | null;
}

export interface RegistrationResponseDto {
  registrationId: number;
  campName?: string;
  registrationCreateAt: string;
  note?: string | null;
  status: string;
  finalPrice?: number;
  appliedPromotion?: PromotionDto | null;
  campers?: CamperDto[];
  optionalChoices?: any[];
}

export interface GeneratePaymentLinkRequestDto {
  optionalChoices?: OptionalChoiceDto[] | null;
}

export interface OptionalChoiceDto {
  [key: string]: any;
}

const registrationService = {
  // Get all registrations
  getAllRegistrations: async (): Promise<RegistrationResponseDto[]> => {
    console.log("[registrationService] GET /registration");
    const response = await axiosInstance.get("/registration");
    return response.data as RegistrationResponseDto[];
  },

  // Get registration by ID
  getRegistrationById: async (id: number): Promise<RegistrationResponseDto> => {
    console.log(`[registrationService] GET /registration/${id}`);
    const response = await axiosInstance.get(`/registration/${id}`);
    return response.data as RegistrationResponseDto;
  },

  // Create registration
  createRegistration: async (
    registration: CreateRegistrationRequestDto
  ): Promise<RegistrationResponseDto> => {
    console.log("[registrationService] POST /registration");
    const requestPayload = {
      camperIds: registration.camperIds || null,
      campId: registration.campId,
      appliedPromotionId: registration.appliedPromotionId || null,
      note: registration.note || null,
    };

    const response = await axiosInstance.post("/registration", requestPayload);
    return response.data as RegistrationResponseDto;
  },

  // Update registration
  updateRegistration: async (
    id: number,
    registration: UpdateRegistrationRequestDto
  ): Promise<RegistrationResponseDto> => {
    console.log(`[registrationService] PUT /registration/${id}`);
    const requestPayload = {
      camperIds: registration.camperIds || null,
      campId: registration.campId,
      appliedPromotionId: registration.appliedPromotionId || null,
      note: registration.note || null,
    };

    const response = await axiosInstance.put(
      `/registration/${id}`,
      requestPayload
    );
    return response.data as RegistrationResponseDto;
  },

  // Delete registration
  deleteRegistration: async (id: number): Promise<void> => {
    console.log(`[registrationService] DELETE /registration/${id}`);
    await axiosInstance.delete(`/registration/${id}`);
  },

  // Get registrations by status
  getRegistrationsByStatus: async (
    status: RegistrationStatus
  ): Promise<RegistrationResponseDto[]> => {
    console.log(
      `[registrationService] GET /registration/status?status=${status}`
    );
    const response = await axiosInstance.get("/registration/status", {
      params: { status },
    });
    return response.data as RegistrationResponseDto[];
  },

  // Get registrations by camp ID
  getRegistrationsByCampId: async (
    campId: number
  ): Promise<RegistrationResponseDto[]> => {
    console.log(`[registrationService] GET /registration/camp/${campId}`);
    const response = await axiosInstance.get(`/registration/camp/${campId}`);
    return response.data as RegistrationResponseDto[];
  },

  // Get registration history (current user's registrations)
  getRegistrationHistory: async (): Promise<RegistrationResponseDto[]> => {
    console.log("[registrationService] GET /registration/history");
    const response = await axiosInstance.get("/registration/history");
    return response.data as RegistrationResponseDto[];
  },

  // Generate payment link for registration
  generatePaymentLink: async (
    id: number,
    paymentData: GeneratePaymentLinkRequestDto
  ): Promise<any> => {
    console.log(`[registrationService] POST /registration/${id}/payment-link`);
    const requestPayload = {
      optionalChoices: paymentData.optionalChoices || null,
    };

    const response = await axiosInstance.post(
      `/registration/${id}/payment-link`,
      requestPayload
    );
    return response.data;
  },

  // Approve registration
  approveRegistration: async (id: number): Promise<RegistrationResponseDto> => {
    console.log(`[registrationService] PUT /registration/${id}/approve`);
    const response = await axiosInstance.put(`/registration/${id}/approve`);
    return response.data as RegistrationResponseDto;
  },
};

export default registrationService;

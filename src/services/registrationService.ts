import axiosInstance from "../config/axios";

export interface RegistrationRequestDto {
  camperIds: number[];
  campId: number;
  appliedPromotionId: number | null;
  note: string;
}
export interface RegistrationResponseDto {
  registrationId: number;
  camperIds: number[];
  campId: number;
  status: string;
  appliedPromotionId: number | null;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  registeredAt: string;
  note: string;
}

const registrationService = {
  createRegistration: async (
    data: RegistrationRequestDto
  ): Promise<RegistrationResponseDto> => {
    console.log("📤 [registrationService] POST /registration request:", data);
    const response = await axiosInstance.post("/registration", data);
    console.log(
      "✅ [registrationService] POST /registration response:",
      response.data
    );
    return response.data as RegistrationResponseDto;
  },
};

export default registrationService;

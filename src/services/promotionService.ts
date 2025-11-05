import axiosInstance from "../config/axios";

// Response DTO
export interface PromotionResponseDto {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  percent: number;
  maxDiscountAmount: number;
  createBy: number;
  createAt: string;
  promotionType: {
    id: number;
    name: string;
  };
  code: string;
}

// API Service
const promotionService = {
  // Get all promotions
  getAllPromotions: async (): Promise<PromotionResponseDto[]> => {
    console.log("[promotionService] GET /promotion");
    const response = await axiosInstance.get("/promotion");
    return response.data as PromotionResponseDto[];
  },

  // Get promotion by ID
  getPromotionById: async (id: number): Promise<PromotionResponseDto> => {
    console.log(`[promotionService] GET /promotion/${id}`);
    const response = await axiosInstance.get(`/promotion/${id}`);
    return response.data as PromotionResponseDto;
  },

  // Get active promotions only
  getActivePromotions: async (): Promise<PromotionResponseDto[]> => {
    console.log("[promotionService] GET /promotion (active)");
    const response = await axiosInstance.get("/promotion");
    const allPromotions = response.data as PromotionResponseDto[];
    return allPromotions.filter((p) => p.status === "Active");
  },
};

export default promotionService;

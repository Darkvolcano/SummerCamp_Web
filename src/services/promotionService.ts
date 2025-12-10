import axiosInstance from "../config/axios";

export interface PromotionTypeDto {
  id: number;
  name: string;
}

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
  promotionType: PromotionTypeDto;
  code: string;
}

export interface PromotionRequestDto {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  percent: number;
  maxDiscountAmount: number;
  promotionTypeId: number;
  code: string;
}

export interface PromotionTypeRequestDto {
  name: string;
}

export interface PromotionTypeResponseDto {
  id: number;
  name: string;
}

const promotionService = {
  getAllPromotions: async (): Promise<PromotionResponseDto[]> => {
    console.log("[promotionService] GET /promotion");
    const response = await axiosInstance.get("/promotion");
    return response.data as PromotionResponseDto[];
  },

  getPromotionById: async (id: number): Promise<PromotionResponseDto> => {
    console.log(`[promotionService] GET /promotion/${id}`);
    const response = await axiosInstance.get(`/promotion/${id}`);
    return response.data as PromotionResponseDto;
  },

  createPromotion: async (data: PromotionRequestDto): Promise<PromotionResponseDto> => {
    console.log("[promotionService] POST /promotion", data);
    const response = await axiosInstance.post("/promotion", data);
    return response.data as PromotionResponseDto;
  },

  updatePromotion: async (id: number, data: PromotionRequestDto): Promise<PromotionResponseDto> => {
    console.log(`[promotionService] PUT /promotion/${id}`, data);
    const response = await axiosInstance.put(`/promotion/${id}`, data);
    return response.data as PromotionResponseDto;
  },

  deletePromotion: async (id: number): Promise<void> => {
    console.log(`[promotionService] DELETE /promotion/${id}`);
    await axiosInstance.delete(`/promotion/${id}`);
  },

  getValidPromotions: async (): Promise<PromotionResponseDto[]> => {
    console.log("[promotionService] GET /promotion/valid");
    const response = await axiosInstance.get("/promotion/valid");
    return response.data as PromotionResponseDto[];
  },

  getAllPromotionTypes: async (): Promise<PromotionTypeResponseDto[]> => {
    console.log("[promotionService] GET /promotionType");
    const response = await axiosInstance.get("/promotionType");
    return response.data as PromotionTypeResponseDto[];
  },

  getPromotionTypeById: async (id: number): Promise<PromotionTypeResponseDto> => {
    console.log(`[promotionService] GET /promotionType/${id}`);
    const response = await axiosInstance.get(`/promotionType/${id}`);
    return response.data as PromotionTypeResponseDto;
  },

  createPromotionType: async (data: PromotionTypeRequestDto): Promise<PromotionTypeResponseDto> => {
    console.log("[promotionService] POST /promotionType", data);
    const response = await axiosInstance.post("/promotionType", data);
    return response.data as PromotionTypeResponseDto;
  },

  updatePromotionType: async (id: number, data: PromotionTypeRequestDto): Promise<PromotionTypeResponseDto> => {
    console.log(`[promotionService] PUT /promotionType/${id}`, data);
    const response = await axiosInstance.put(`/promotionType/${id}`, data);
    return response.data as PromotionTypeResponseDto;
  },

  deletePromotionType: async (id: number): Promise<void> => {
    console.log(`[promotionService] DELETE /promotionType/${id}`);
    await axiosInstance.delete(`/promotionType/${id}`);
  },
};

export default promotionService;

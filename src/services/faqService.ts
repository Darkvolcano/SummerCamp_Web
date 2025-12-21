import axiosInstance from "../config/axios";

export interface FAQRequestDto {
    question: string;
    answer: string;
}

export interface FAQResponseDto {
    faqId: number;
    question: string;
    answer: string;
}

const faqService = {
    /** GET /api/FAQ */
    getAllFaqs: async (): Promise<FAQResponseDto[]> => {
        console.log("[faqService] GET /FAQ");
        const response = await axiosInstance.get("/FAQ");
        return response.data as FAQResponseDto[];
    },

    /** GET /api/FAQ/{id} */
    getFaqById: async (id: number): Promise<FAQResponseDto> => {
        console.log(`[faqService] GET /FAQ/${id}`);
        const response = await axiosInstance.get(`/FAQ/${id}`);
        return response.data as FAQResponseDto;
    },

    /** POST /api/FAQ */
    createFaq: async (data: FAQRequestDto): Promise<FAQResponseDto> => {
        console.log("[faqService] POST /FAQ", data);
        const response = await axiosInstance.post("/FAQ", data);
        return response.data as FAQResponseDto;
    },

    /** PUT /api/FAQ/{id} */
    updateFaq: async (id: number, data: FAQRequestDto): Promise<FAQResponseDto> => {
        console.log(`[faqService] PUT /FAQ/${id}`, data);
        const response = await axiosInstance.put(`/FAQ/${id}`, data);
        return response.data as FAQResponseDto;
    },

    /** DELETE /api/FAQ/{id} */
    deleteFaq: async (id: number): Promise<void> => {
        console.log(`[faqService] DELETE /FAQ/${id}`);
        await axiosInstance.delete(`/FAQ/${id}`);
    },
};

export default faqService;
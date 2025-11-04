import axiosInstance from "../config/axios";

export interface CampType {
    campTypeId: number;
    name: string;
    description: string;
    isActive: boolean;
}

// Request DTO (for POST/PUT)
export interface CampTypeRequestDto {
    name: string;
    description: string;
}

// Response DTO (from GET)
export interface CampTypeResponseDto {
    campTypeId: number;
    name: string;
    description: string;
    isActive: boolean;
}
const campTypeService = {
    // Get all camp types
    getAllCampTypes: async (): Promise<CampTypeResponseDto[]> => {
        console.log("[campTypeService] GET /camptype");
        const response = await axiosInstance.get("/camptype");
        return response.data as CampTypeResponseDto[];
    },

    // Get camp type by ID
    getCampTypeById: async (id: number): Promise<CampTypeResponseDto> => {
        console.log(`[campTypeService] GET /camptype/${id}`);
        const response = await axiosInstance.get(`/camptype/${id}`);
        return response.data as CampTypeResponseDto;
    },

    // Create camp type
    createCampType: async (campType: CampTypeRequestDto): Promise<CampTypeResponseDto> => {
        console.log("[campTypeService] POST /camptype");
        const requestPayload = {
            name: campType.name,
            description: campType.description,
        };

        const response = await axiosInstance.post("/camptype", requestPayload);
        return response.data as CampTypeResponseDto;
    },

    // Update camp type
    updateCampType: async (id: number, campType: CampTypeRequestDto): Promise<CampTypeResponseDto> => {
        console.log(`[campTypeService] PUT /camptype/${id}`);
        const requestPayload = {
            name: campType.name,
            description: campType.description,
        };

        const response = await axiosInstance.put(`/camptype/${id}`, requestPayload);
        return response.data as CampTypeResponseDto;
    },

    // Delete camp type
    deleteCampType: async (id: number): Promise<void> => {
        console.log(`[campTypeService] DELETE /camptype/${id}`);
        await axiosInstance.delete(`/camptype/${id}`);
    },
};

export default campTypeService;

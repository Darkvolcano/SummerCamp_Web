import axiosInstance from "../config/axios";

export interface Guardian {
    guardianId: number;
    camperId: number;
    userId: number;
    fullName?: string | null;
    title?: string | null;
    gender?: string | null;
    dob?: string | null;
    answer?: string | null;
    category?: string | null;
    isActive: boolean;
}

// Request DTO (for POST)
export interface GuardianCreateDto {
    fullName?: string | null;
    title?: string | null;
    gender?: string | null;
    dob?: string | null;
    answer?: string | null;
    category?: string | null;
}

// Request DTO (for PUT)
export interface GuardianUpdateDto {
    fullName?: string | null;
    title?: string | null;
    gender?: string | null;
    dob?: string | null;
    answer?: string | null;
    category?: string | null;
    isActive: boolean;
}

// Response DTO (from GET)
export interface GuardianResponseDto {
    guardianId: number;
    camperId: number;
    userId: number;
    fullName?: string | null;
    title?: string | null;
    gender?: string | null;
    dob?: string | null;
    answer?: string | null;
    category?: string | null;
    isActive: boolean;
}

const guardianService = {
    // Get all guardians
    getAllGuardians: async (): Promise<GuardianResponseDto[]> => {
        console.log("[guardianService] GET /Guardian");
        const response = await axiosInstance.get("/Guardian");
        return response.data as GuardianResponseDto[];
    },

    // Get guardian by ID
    getGuardianById: async (id: number): Promise<GuardianResponseDto> => {
        console.log(`[guardianService] GET /Guardian/${id}`);
        const response = await axiosInstance.get(`/Guardian/${id}`);
        return response.data as GuardianResponseDto;
    },

    // Create guardian for a camper
    createGuardianForCamper: async (camperId: number, guardian: GuardianCreateDto): Promise<GuardianResponseDto> => {
        console.log(`[guardianService] POST /Guardian/campers/${camperId}`);
        const requestPayload = {
            fullName: guardian.fullName || null,
            title: guardian.title || null,
            gender: guardian.gender || null,
            dob: guardian.dob || null,
            answer: guardian.answer || null,
            category: guardian.category || null,
        };

        const response = await axiosInstance.post(`/Guardian/campers/${camperId}`, requestPayload);
        return response.data as GuardianResponseDto;
    },

    // Update guardian
    updateGuardian: async (id: number, guardian: GuardianUpdateDto): Promise<GuardianResponseDto> => {
        console.log(`[guardianService] PUT /Guardian/${id}`);
        const requestPayload = {
            fullName: guardian.fullName || null,
            title: guardian.title || null,
            gender: guardian.gender || null,
            dob: guardian.dob || null,
            answer: guardian.answer || null,
            category: guardian.category || null,
            isActive: guardian.isActive,
        };

        const response = await axiosInstance.put(`/Guardian/${id}`, requestPayload);
        return response.data as GuardianResponseDto;
    },

    // Delete guardian
    deleteGuardian: async (id: number): Promise<void> => {
        console.log(`[guardianService] DELETE /Guardian/${id}`);
        await axiosInstance.delete(`/Guardian/${id}`);
    },
};

export default guardianService;

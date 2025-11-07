import axiosInstance from "../config/axios";

export interface Camper {
    camperId: number;
    camperName: string;
    gender: string;
    dob: string;
    groupId?: number | null;
    avatar?: string | null;
    userId: number;
    isActive: boolean;
}

export interface CamperRequestDto {
    camperName: string;
    gender: string;
    dob: string;
    groupId?: number | null;
    avatar?: string | null;
    healthRecord?: HealthRecordCreateDto;
}

export interface CamperResponseDto {
    camperId: number;
    camperName: string;
    gender: string;
    dob: string;
    groupId?: number | null;
    avatar?: string | null;
    userId: number;
    isActive: boolean;
}

export interface HealthRecordCreateDto {
    [key: string]: any;
}

const camperService = {
    // Get all campers
    getAllCampers: async (): Promise<CamperResponseDto[]> => {
        console.log("[camperService] GET /Camper");
        const response = await axiosInstance.get("/Camper");
        return response.data as CamperResponseDto[];
    },

    // Get camper by ID
    getCamperById: async (id: number): Promise<CamperResponseDto> => {
        console.log(`[camperService] GET /Camper/${id}`);
        const response = await axiosInstance.get(`/Camper/${id}`);
        return response.data as CamperResponseDto;
    },

    // Create camper
    createCamper: async (camper: CamperRequestDto): Promise<CamperResponseDto> => {
        console.log("[camperService] POST /Camper");
        const requestPayload = {
            camperName: camper.camperName,
            gender: camper.gender,
            dob: camper.dob,
            groupId: camper.groupId || null,
            avatar: camper.avatar || null,
            healthRecord: camper.healthRecord,
        };

        const response = await axiosInstance.post("/Camper", requestPayload);
        return response.data as CamperResponseDto;
    },

    // Update camper
    updateCamper: async (id: number, camper: CamperRequestDto): Promise<CamperResponseDto> => {
        console.log(`[camperService] PUT /Camper/${id}`);
        const requestPayload = {
            camperName: camper.camperName,
            gender: camper.gender,
            dob: camper.dob,
            groupId: camper.groupId || null,
            avatar: camper.avatar || null,
            healthRecord: camper.healthRecord,
        };

        const response = await axiosInstance.put(`/Camper/${id}`, requestPayload);
        return response.data as CamperResponseDto;
    },

    // Delete camper
    deleteCamper: async (id: number): Promise<void> => {
        console.log(`[camperService] DELETE /Camper/${id}`);
        await axiosInstance.delete(`/Camper/${id}`);
    },

    // Get campers by camp ID
    getCampersByCampId: async (campId: number): Promise<CamperResponseDto[]> => {
        console.log(`[camperService] GET /Camper/camp/${campId}`);
        const response = await axiosInstance.get(`/Camper/camp/${campId}`);
        return response.data as CamperResponseDto[];
    },

    // Get my campers (current user's campers)
    getMyCampers: async (): Promise<CamperResponseDto[]> => {
        console.log("[camperService] GET /Camper/my-campers");
        const response = await axiosInstance.get("/Camper/my-campers");
        return response.data as CamperResponseDto[];
    },

    // Get guardians of a camper
    getCamperGuardians: async (camperId: number): Promise<any[]> => {
        console.log(`[camperService] GET /Camper/${camperId}/guardians`);
        const response = await axiosInstance.get(`/Camper/${camperId}/guardians`);
        return response.data as any[];
    },

    // Get campers by activity schedule ID
    getCampersByActivityScheduleId: async (id: number): Promise<CamperResponseDto[]> => {
        console.log(`[camperService] GET /Camper/activityScheduleId${id}`);
        const response = await axiosInstance.get(`/Camper/activityScheduleId${id}`);
        return response.data as CamperResponseDto[];
    },
};

export default camperService;
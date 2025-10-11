import axiosInstance from "../config/axios";

// DTOs matching backend structure
export interface CampRequestDto {
    name: string;
    description: string;
    place: string;
    address: string;
    minParticipants: number;
    maxParticipants: number;
    startDate: string; // Format: "YYYY-MM-DD"
    endDate: string; // Format: "YYYY-MM-DD"
    image: string;
    campTypeId: number | null;
    locationId: number | null;
    price: number;
}

export interface CampResponseDto {
    campId: number;
    name: string;
    description: string;
    place: string;
    address: string;
    minParticipants: number;
    maxParticipants: number;
    startDate: string;
    endDate: string;
    image: string;
    campTypeId: number | null;
    locationId: number | null;
    price: number;
    status: string;
}

// API Service
const campService = {
    // Get all camps
    getAllCamps: async (): Promise<CampResponseDto[]> => {
        const response = await axiosInstance.get<CampResponseDto[]>("/camp");
        return response.data;
    },

    // Get camp by ID
    getCampById: async (id: number): Promise<CampResponseDto> => {
        const response = await axiosInstance.get<CampResponseDto>(`/camp/${id}`);
        return response.data;
    },

    // Create camp
    createCamp: async (camp: CampRequestDto): Promise<CampResponseDto> => {
        // Convert to PascalCase for backend
        const requestPayload = {
            Name: camp.name,
            Description: camp.description,
            Place: camp.place,
            Address: camp.address,
            MinParticipants: camp.minParticipants,
            MaxParticipants: camp.maxParticipants,
            StartDate: camp.startDate,
            EndDate: camp.endDate,
            image: camp.image,
            CampTypeId: camp.campTypeId,
            LocationId: camp.locationId,
            Price: camp.price,
        };

        const response = await axiosInstance.post<CampResponseDto>(
            "/camp",
            requestPayload
        );
        return response.data;
    },

    // Update camp
    updateCamp: async (
        id: number,
        camp: CampRequestDto
    ): Promise<CampResponseDto> => {
        // Convert to PascalCase for backend
        const requestPayload = {
            Name: camp.name,
            Description: camp.description,
            Place: camp.place,
            Address: camp.address,
            MinParticipants: camp.minParticipants,
            MaxParticipants: camp.maxParticipants,
            StartDate: camp.startDate,
            EndDate: camp.endDate,
            image: camp.image,
            CampTypeId: camp.campTypeId,
            LocationId: camp.locationId,
            Price: camp.price,
        };

        const response = await axiosInstance.put<CampResponseDto>(
            `/camp/${id}`,
            requestPayload
        );
        return response.data;
    },

    // Delete camp
    deleteCamp: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/camp/${id}`);
    },
};

export default campService;

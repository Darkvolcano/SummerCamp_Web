import axiosInstance from "../config/axios";

export interface CampType {
    campTypeId: number;
    name: string;
    description: string;
    isActive: boolean;
}
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

// Backend returns camelCase from database model (GET endpoints)
interface BackendCampModel {
    campId: number;
    name: string;
    description: string;
    place: string;
    address: string;
    startDate: string;
    endDate: string;
    image: string;
    campTypeId: number | null;
    locationId: number | null;
    price: number;
    minParticipants?: number | null;
    maxParticipants?: number | null;
    status?: string | null;
}

// Backend returns PascalCase from DTOs (POST/PUT endpoints)
interface BackendCampDto {
    CampId: number;
    Name: string;
    Description: string;
    Place: string;
    Address: string;
    StartDate: string;
    EndDate: string;
    image: string;
    CampTypeId: number | null;
    LocationId: number | null;
    Price: number;
    MinParticipants?: number;
    MaxParticipants?: number;
    Status?: string;
}

// Map backend responses to consistent frontend format
const mapBackendToFrontend = (data: BackendCampModel | BackendCampDto): CampResponseDto => {
    // Check if it's PascalCase (DTO) or camelCase (Model)
    const isPascalCase = 'CampId' in data;

    if (isPascalCase) {
        const dto = data as BackendCampDto;
        return {
            campId: dto.CampId,
            name: dto.Name,
            description: dto.Description,
            place: dto.Place,
            address: dto.Address,
            startDate: dto.StartDate,
            endDate: dto.EndDate,
            image: dto.image,
            campTypeId: dto.CampTypeId,
            locationId: dto.LocationId,
            price: dto.Price,
            minParticipants: dto.MinParticipants ?? 0,
            maxParticipants: dto.MaxParticipants ?? 0,
            status: dto.Status || "pending",
        };
    } else {
        const model = data as BackendCampModel;
        return {
            campId: model.campId,
            name: model.name,
            description: model.description,
            place: model.place,
            address: model.address,
            startDate: model.startDate,
            endDate: model.endDate,
            image: model.image,
            campTypeId: model.campTypeId,
            locationId: model.locationId,
            price: model.price,
            minParticipants: model.minParticipants ?? 0,
            maxParticipants: model.maxParticipants ?? 0,
            status: model.status || "pending",
        };
    }
};

// API Service
const campService = {
    // Get all camps
    getAllCamps: async (): Promise<CampResponseDto[]> => {
        const response = await axiosInstance.get("/camp");
        console.log("[campService] GET /camp raw response:", response.data);
        const mapped = (response.data as Array<BackendCampModel | BackendCampDto>).map(mapBackendToFrontend);
        console.log("[campService] GET /camp mapped:", mapped);
        return mapped;
    },

    // Get camp by ID
    getCampById: async (id: number): Promise<CampResponseDto> => {
        const response = await axiosInstance.get(`/camp/${id}`);
        console.log(`[campService] GET /camp/${id} raw response:`, response.data);
        const mapped = mapBackendToFrontend(response.data as BackendCampModel | BackendCampDto);
        console.log(`[campService] GET /camp/${id} mapped:`, mapped);
        return mapped;
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

        console.log("[campService] POST /camp request payload:", requestPayload);
        const response = await axiosInstance.post("/camp", requestPayload);
        console.log("[campService] POST /camp raw response:", response.data);
        const mapped = mapBackendToFrontend(response.data as BackendCampDto);
        console.log("[campService] POST /camp mapped:", mapped);
        return mapped;
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

        console.log(`[campService] PUT /camp/${id} request payload:`, requestPayload);
        const response = await axiosInstance.put(`/camp/${id}`, requestPayload);
        console.log(`[campService] PUT /camp/${id} raw response:`, response.data);
        const mapped = mapBackendToFrontend(response.data as BackendCampDto);
        console.log(`[campService] PUT /camp/${id} mapped:`, mapped);
        return mapped;
    },

    // Delete camp
    deleteCamp: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/camp/${id}`);
    },


    // Camp types
    getAllCampTypes: async (): Promise<CampType[]> => {
        const response = await axiosInstance.get("/camptype");
        return response.data as CampType[];
    },

    getCampTypeById: async (id: number): Promise<CampType> => {
        const response = await axiosInstance.get(`/camptype/${id}`);
        return response.data as CampType;
    }

};

export default campService;

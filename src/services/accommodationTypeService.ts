import axiosInstance from "../config/axios";

export interface AccommodationType {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface AccommodationTypeRequestDto {
  name: string;
  description: string;
}

export interface AccommodationTypeResponseDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

const accommodationTypeService = {
  // Get all accommodation types
  getAllAccommodationTypes: async (): Promise<AccommodationTypeResponseDto[]> => {
    console.log("[accommodationTypeService] GET /AccommodationType");
    const response = await axiosInstance.get("/AccommodationType");
    return response.data as AccommodationTypeResponseDto[];
  },

  // Get accommodation type by ID
  getAccommodationTypeById: async (id: number): Promise<AccommodationTypeResponseDto> => {
    console.log(`[accommodationTypeService] GET /AccommodationType/${id}`);
    const response = await axiosInstance.get(`/AccommodationType/${id}`);
    return response.data as AccommodationTypeResponseDto;
  },

  // Create accommodation type
  createAccommodationType: async (accommodationType: AccommodationTypeRequestDto): Promise<AccommodationTypeResponseDto> => {
    console.log("[accommodationTypeService] POST /AccommodationType");
    const requestPayload = {
      name: accommodationType.name,
      description: accommodationType.description,
    };

    const response = await axiosInstance.post("/AccommodationType", requestPayload);
    return response.data as AccommodationTypeResponseDto;
  },

  // Update accommodation type
  updateAccommodationType: async (id: number, accommodationType: AccommodationTypeRequestDto): Promise<AccommodationTypeResponseDto> => {
    console.log(`[accommodationTypeService] PUT /AccommodationType/${id}`);
    const requestPayload = {
      name: accommodationType.name,
      description: accommodationType.description,
    };

    const response = await axiosInstance.put(`/AccommodationType/${id}`, requestPayload);
    return response.data as AccommodationTypeResponseDto;
  },

  // Delete accommodation type
  deleteAccommodationType: async (id: number): Promise<void> => {
    console.log(`[accommodationTypeService] DELETE /AccommodationType/${id}`);
    await axiosInstance.delete(`/AccommodationType/${id}`);
  },
};

export default accommodationTypeService;

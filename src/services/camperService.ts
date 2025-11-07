import axiosInstance from "../config/axios";

export interface HealthRecord {
  createAt: string;
  condition: string;
  allergies: string;
  isAllergy: boolean;
  note: string;
}

export interface CamperResponseDto {
  camperId: number;
  camperName: string;
  gender: string;
  dob: string;
  age: number;
  groupId: number | null;
  avatar: string | null;
  healthRecord: HealthRecord | null;
}

const camperService = {
  getMyCampers: async (): Promise<CamperResponseDto[]> => {
    console.log("📤 [camperService] GET /camper/my");
    const response = await axiosInstance.get("/Camper");
    console.log("✅ [camperService] GET /camper/my response:", response.data);
    return response.data as CamperResponseDto[];
  },
};

export default camperService;

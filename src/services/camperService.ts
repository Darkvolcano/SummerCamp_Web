import axiosInstance from "../config/axios";

export interface Camper {
  camperId: number;
  camperName: string;
  gender: string;
  dob: string;
  age?: number;
  groupId?: number | null;
  avatar?: string | null;
  userId?: number;
  isActive?: boolean;
  healthRecord?: HealthRecord;
}

export interface CamperRequestDto {
  camperName: string;
  gender: string;
  dob?: string;
  avatar?: File | null;
  healthRecord?: HealthRecordCreateDto;
}

export interface CamperUpdateRequestDto {
  camperName: string;
  gender: string;
  dob?: string;
  avatar?: File | null;
  healthRecord?: HealthRecordCreateDto;
}

export interface CamperResponseDto {
  camperId: number;
  camperName: string;
  gender: string;
  dob: string;
  age?: number;
  avatar?: string | null;
  healthRecord?: HealthRecord | null;
}

export interface CamperCampResponseDto {
  camperId: number;
  camperName: string;
  gender: string;
  dob: string;
  avatar?: string | null;
  camperRegistrationStatus?: string;
}

export interface CamperActivityResponseDto {
  camperId: number;
  camperName: string;
  gender: string;
  dob: string;
  avatar?: string | null;
  attendanceLogId?: number;
  status?: string;
}

export interface CamperGuardianResponseDto {
  camperId: number;
  camperName: string;
  guardians: Guardian[];
}

export interface Guardian {
  guardianId: number;
  fullName: string;
  title: string;
  gender: string;
  email?: string | null;
  phoneNumber?: string | null;
}

export interface HealthRecord {
  createAt?: string;
  condition?: string;
  allergies?: string;
  isAllergy?: boolean;
  note?: string;
}

export interface HealthRecordCreateDto {
  condition?: string;
  allergies?: string;
  isAllergy?: boolean;
  note?: string;
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
  createCamper: async (
    camper: CamperRequestDto
  ): Promise<CamperResponseDto> => {
    console.log("[camperService] POST /Camper (multipart/form-data)");
    const formData = new FormData();

    formData.append("camperName", camper.camperName);
    formData.append("gender", camper.gender);
    if (camper.dob) {
      formData.append("dob", camper.dob);
    }

    if (camper.avatar) {
      formData.append("avatar", camper.avatar);
    }

    if (camper.healthRecord) {
      if (camper.healthRecord.condition) {
        formData.append(
          "healthRecord.condition",
          camper.healthRecord.condition
        );
      }
      if (camper.healthRecord.allergies) {
        formData.append(
          "healthRecord.allergies",
          camper.healthRecord.allergies
        );
      }
      if (camper.healthRecord.isAllergy !== undefined) {
        formData.append(
          "healthRecord.isAllergy",
          camper.healthRecord.isAllergy.toString()
        );
      }
      if (camper.healthRecord.note) {
        formData.append("healthRecord.note", camper.healthRecord.note);
      }
    }

    const response = await axiosInstance.post("/Camper", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as CamperResponseDto;
  },

  // Update camper
  updateCamper: async (
    id: number,
    camper: CamperUpdateRequestDto
  ): Promise<CamperResponseDto> => {
    console.log(`[camperService] PUT /Camper/${id}`);

    // Build query parameters for text fields
    const params: any = {
      camperName: camper.camperName,
      gender: camper.gender,
    };

    if (camper.dob) {
      params.dob = camper.dob;
    }

    if (camper.healthRecord) {
      if (camper.healthRecord.condition) {
        params["healthRecord.condition"] = camper.healthRecord.condition;
      }
      if (camper.healthRecord.allergies) {
        params["healthRecord.allergies"] = camper.healthRecord.allergies;
      }
      if (camper.healthRecord.isAllergy !== undefined) {
        params["healthRecord.isAllergy"] = camper.healthRecord.isAllergy;
      }
      if (camper.healthRecord.note) {
        params["healthRecord.note"] = camper.healthRecord.note;
      }
    }

    // Create FormData only for avatar file
    const formData = new FormData();
    if (camper.avatar) {
      formData.append("avatar", camper.avatar);
    }

    const response = await axiosInstance.put(`/Camper/${id}`, formData, {
      params,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as CamperResponseDto;
  },

  // Delete camper
  deleteCamper: async (id: number): Promise<void> => {
    console.log(`[camperService] DELETE /Camper/${id}`);
    await axiosInstance.delete(`/Camper/${id}`);
  },

  // Get campers by camp ID
  getCampersByCampId: async (
    campId: number
  ): Promise<CamperCampResponseDto[]> => {
    console.log(`[camperService] GET /Camper/camp/${campId}`);
    const response = await axiosInstance.get(`/Camper/camp/${campId}`);
    return response.data as CamperCampResponseDto[];
  },

  // Get my campers (current user's campers)
  getMyCampers: async (): Promise<CamperResponseDto[]> => {
    console.log("[camperService] GET /Camper/my-campers");
    const response = await axiosInstance.get("/Camper/my-campers");
    return response.data as CamperResponseDto[];
  },

  // Get guardians of a camper
  getCamperGuardians: async (
    camperId: number
  ): Promise<CamperGuardianResponseDto[]> => {
    console.log(`[camperService] GET /Camper/${camperId}/guardians`);
    const response = await axiosInstance.get(`/Camper/${camperId}/guardians`);
    return response.data as CamperGuardianResponseDto[];
  },

  // DEPRECATED: This endpoint doesn't exist in swagger12
  // Use getCampersByOptionalActivityId or getCampersByCoreActivityId instead
  // getCampersByActivityScheduleId: async (
  //   id: number
  // ): Promise<CamperActivityResponseDto[]> => {
  //   console.log(`[camperService] GET /Camper/activityScheduleId${id}`);
  //   const response = await axiosInstance.get(`/Camper/activityScheduleId${id}`);
  //   return response.data as CamperActivityResponseDto[];
  // },

  // Get camper by ID and camp ID
  getCamperByIdAndCampId: async (
    camperId: number,
    campId: number
  ): Promise<CamperCampResponseDto> => {
    console.log(`[camperService] GET /Camper/${camperId}/camp/${campId}`);
    const response = await axiosInstance.get(
      `/Camper/${camperId}/camp/${campId}`
    );
    return response.data as CamperCampResponseDto;
  },

  // Get campers by optional activity ID
  getCampersByOptionalActivityId: async (
    optionalActivityId: number
  ): Promise<CamperActivityResponseDto[]> => {
    console.log(
      `[camperService] GET /Camper/optionalActivities/${optionalActivityId}/campers`
    );
    const response = await axiosInstance.get(
      `/Camper/optionalActivities/${optionalActivityId}/campers`
    );
    return response.data as CamperActivityResponseDto[];
  },

  // Get campers by core activity ID
  getCampersByCoreActivityId: async (
    coreActivityId: number
  ): Promise<CamperActivityResponseDto[]> => {
    console.log(
      `[camperService] GET /Camper/coreActivities/${coreActivityId}/campers`
    );
    const response = await axiosInstance.get(
      `/Camper/coreActivities/${coreActivityId}/campers`
    );
    return response.data as CamperActivityResponseDto[];
  },
};

export default camperService;

import axiosInstance from "../config/axios";

export interface CamperGroup {
  camperGroupId: number;
  groupName: string;
  description: string;
  maxSize: number;
  supervisorId: number;
  supervisorName: string;
  campId: number;
  minAge: number;
  maxAge: number;
}

export interface CamperGroupRequestDto {
  groupName: string;
  description: string;
  maxSize: number;
  supervisorId: number;
  campId: number;
  minAge: number;
  maxAge: number;
}

export interface CamperGroupResponseDto {
  camperGroupId: number;
  groupName: string;
  description: string;
  maxSize: number;
  supervisorId: number;
  supervisorName: string;
  campId: number;
  minAge: number;
  maxAge: number;
}

const camperGroupService = {
  // Get all camper groups
  getAllCamperGroups: async (): Promise<CamperGroupResponseDto[]> => {
    console.log("[camperGroupService] GET /campergroup");
    const response = await axiosInstance.get("/campergroup");
    return response.data as CamperGroupResponseDto[];
  },

  // Get camper group by ID
  getCamperGroupById: async (id: number): Promise<CamperGroupResponseDto> => {
    console.log(`[camperGroupService] GET /campergroup/${id}`);
    const response = await axiosInstance.get(`/campergroup/${id}`);
    return response.data as CamperGroupResponseDto;
  },

  // Get camper groups by activity schedule ID
  getCamperGroupsByActivityScheduleId: async (id: number): Promise<CamperGroupResponseDto[]> => {
    console.log(`[camperGroupService] GET /campergroup/activityScheduleId/${id}`);
    const response = await axiosInstance.get(`/campergroup/activityScheduleId/${id}`);
    return response.data as CamperGroupResponseDto[];
  },

  // Get camper groups by camp ID
  getCamperGroupsByCampId: async (campId: number): Promise<CamperGroupResponseDto[]> => {
    console.log(`[camperGroupService] GET /campergroup/camp/${campId}`);
    const response = await axiosInstance.get(`/campergroup/camp/${campId}`);
    return response.data as CamperGroupResponseDto[];
  },

  // Create camper group
  createCamperGroup: async (group: CamperGroupRequestDto): Promise<CamperGroupResponseDto> => {
    console.log("[camperGroupService] POST /campergroup");
    const requestPayload = {
      groupName: group.groupName,
      description: group.description,
      maxSize: group.maxSize,
      supervisorId: group.supervisorId,
      campId: group.campId,
      minAge: group.minAge,
      maxAge: group.maxAge,
    };

    const response = await axiosInstance.post("/campergroup", requestPayload);
    return response.data as CamperGroupResponseDto;
  },

  // Update camper group
  updateCamperGroup: async (id: number, group: CamperGroupRequestDto): Promise<CamperGroupResponseDto> => {
    console.log(`[camperGroupService] PUT /campergroup/${id}`);
    const requestPayload = {
      groupName: group.groupName,
      description: group.description,
      maxSize: group.maxSize,
      supervisorId: group.supervisorId,
      campId: group.campId,
      minAge: group.minAge,
      maxAge: group.maxAge,
    };

    const response = await axiosInstance.put(`/campergroup/${id}`, requestPayload);
    return response.data as CamperGroupResponseDto;
  },

  // Delete camper group
  deleteCamperGroup: async (id: number): Promise<void> => {
    console.log(`[camperGroupService] DELETE /campergroup/${id}`);
    await axiosInstance.delete(`/campergroup/${id}`);
  },

  // Assign staff to camper group
  assignStaffToCamperGroup: async (camperGroupId: number, staffId: number): Promise<CamperGroupResponseDto> => {
    console.log(`[camperGroupService] PUT /campergroup/${camperGroupId}/assign-staff/${staffId}`);
    const response = await axiosInstance.put(`/campergroup/${camperGroupId}/assign-staff/${staffId}`);
    return response.data as CamperGroupResponseDto;
  },
};

export default camperGroupService;

import axiosInstance from "../config/axios";

// DTOs
export interface CamperGroupRequestDto {
  camperId: number;
  groupId: number;
}

export interface CamperGroupResponseDto {
  camperGroupId: number;
  camperName: {
    camperId: number;
    camperName: string;
  };
  groupName: {
    groupId: number;
    groupName: string;
    currentSize: number;
  };
  status: string;
}

// Query parameters for GET /campergroup
export interface CamperGroupQueryParams {
  camperId?: number;
  groupId?: number;
  campId?: number;
  camperName?: string;
}

const camperGroupService = {
  // GET /api/campergroup - Get list of Camper Group based on search criteria
  getCamperGroups: async (params?: CamperGroupQueryParams): Promise<CamperGroupResponseDto[]> => {
    console.log("[camperGroupService] GET /campergroup", params);
    const response = await axiosInstance.get("/campergroup", { params });
    return response.data as CamperGroupResponseDto[];
  },

  // GET /api/campergroup/pending-assign - Get list of campers waiting for manual group assignment
  getPendingAssignCampers: async (campId?: number): Promise<any[]> => {
    console.log("[camperGroupService] GET /campergroup/pending-assign", { campId });
    const response = await axiosInstance.get("/campergroup/pending-assign", {
      params: { campId },
    });
    return response.data;
  },

  // POST /api/campergroup - Manual Add Camper Into Group (for pending assign group state)
  addCamperToGroup: async (data: CamperGroupRequestDto): Promise<CamperGroupResponseDto> => {
    console.log("[camperGroupService] POST /campergroup", data);
    const response = await axiosInstance.post("/campergroup", data);
    return response.data as CamperGroupResponseDto;
  },

  // PUT /api/campergroup/{id} - Manual Update Group
  updateCamperGroup: async (id: number, data: CamperGroupRequestDto): Promise<CamperGroupResponseDto> => {
    console.log(`[camperGroupService] PUT /campergroup/${id}`, data);
    const response = await axiosInstance.put(`/campergroup/${id}`, data);
    return response.data as CamperGroupResponseDto;
  },

  // DELETE /api/campergroup/{id} - Soft Delete Group
  deleteCamperGroup: async (id: number): Promise<void> => {
    console.log(`[camperGroupService] DELETE /campergroup/${id}`);
    await axiosInstance.delete(`/campergroup/${id}`);
  },
};

export default camperGroupService;

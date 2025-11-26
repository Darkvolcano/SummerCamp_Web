import axiosInstance from "../config/axios";

export interface Activity {
  activityId: number;
  activityType: "Core" | "Optional" | "Resting" | "CheckIn" | "CheckOut";
  name: string;
  description: string | null;
  campId: number;
}

export interface ActivityCreateDto {
  activityType: "Core" | "Optional" | "Resting" | "CheckIn" | "CheckOut";
  name: string;
  description: string | null;
  campId: number;
}

export interface ActivityResponseDto {
  activityId: number;
  activityType: "Core" | "Optional" | "Resting" | "CheckIn" | "CheckOut";
  name: string;
  description: string | null;
  campId: number;
}

const activityService = {
  // Get all activities
  getAllActivities: async (): Promise<ActivityResponseDto[]> => {
    console.log("[activityService] GET /Activity");
    const response = await axiosInstance.get("/Activity");
    return response.data as ActivityResponseDto[];
  },

  // Get activity by ID
  getActivityById: async (id: number): Promise<ActivityResponseDto> => {
    console.log(`[activityService] GET /Activity/${id}`);
    const response = await axiosInstance.get(`/Activity/${id}`);
    return response.data as ActivityResponseDto;
  },

  // Get activities by camp ID
  getActivitiesByCampId: async (campId: number): Promise<ActivityResponseDto[]> => {
    console.log(`[activityService] GET /Activity/camp/${campId}`);
    const response = await axiosInstance.get(`/Activity/camp/${campId}`);
    return response.data as ActivityResponseDto[];
  },

  // Get main activities by camp ID (excluding Optional type)
  getMainActivityByCamp: async (campId: number): Promise<ActivityResponseDto[]> => {
    console.log(`[activityService] GET /Activity/camp/${campId} (excluding Optional type)`);
    const response = await axiosInstance.get(`/Activity/camp/${campId}`);
    return (response.data as ActivityResponseDto[]).filter(activity => activity.activityType !== "Optional");
  },

  // Get optional activities by camp ID
  getOptionalActivityByCamp: async (campId: number): Promise<ActivityResponseDto[]> => {
    console.log(`[activityService] GET /Activity/camp/${campId} (Optional type only)`);
    const response = await axiosInstance.get(`/Activity/camp/${campId}`);
    return (response.data as ActivityResponseDto[]).filter(activity => activity.activityType === "Optional");
  },

  // Get optional activities
  getOptionalActivities: async (): Promise<ActivityResponseDto[]> => {
    console.log("[activityService] GET /Activity/optional");
    const response = await axiosInstance.get("/Activity/optional");
    return response.data as ActivityResponseDto[];
  },

  // Create activity
  createActivity: async (activity: ActivityCreateDto): Promise<ActivityResponseDto> => {
    console.log("[activityService] POST /Activity");
    const requestPayload = {
      activityType: activity.activityType,
      name: activity.name,
      description: activity.description,
      campId: activity.campId,
    };

    const response = await axiosInstance.post("/Activity", requestPayload);
    return response.data as ActivityResponseDto;
  },

  // Update activity
  updateActivity: async (id: number, activity: ActivityCreateDto): Promise<ActivityResponseDto> => {
    console.log(`[activityService] PUT /Activity/${id}`);
    const requestPayload = {
      activityType: activity.activityType,
      name: activity.name,
      description: activity.description,
      campId: activity.campId,
    };

    const response = await axiosInstance.put(`/Activity/${id}`, requestPayload);
    return response.data as ActivityResponseDto;
  },

  // Delete activity
  deleteActivity: async (id: number): Promise<void> => {
    console.log(`[activityService] DELETE /Activity/${id}`);
    await axiosInstance.delete(`/Activity/${id}`);
  },
};

export default activityService;

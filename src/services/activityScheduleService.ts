import axiosInstance from "../config/axios";

export type ActivityScheduleStatus = "NotYet" | "Completed" | "Cancelled" | "PendingAttendance";

export interface ActivityInfo {
  name: string;
  activityType: "Core" | "Optional";
}

export interface ActivitySchedule {
  activityScheduleId: number;
  activity: ActivityInfo | null;
  staffId: number;
  startTime: string;
  endTime: string;
  status: ActivityScheduleStatus;
  isLivestream: boolean;
  roomId: number | null;
  maxCapacity: number | null;
  isOptional: boolean;
  locationId: number;
  currentCapacity: number | null;
}

export interface ActivityScheduleCreateDto {
  activityId: number;
  staffId: number;
  startTime: string;
  endTime: string;
  isLivestream: boolean;
  roomId?: number | null;
  maxCapacity?: number | null;
  locationId: number;
}

export interface OptionalScheduleCreateDto {
  activityId: number;
  startTime: string;
  endTime: string;
  isLivestream: boolean;
  roomId?: number | null;
  maxCapacity?: number | null;
  locationId: number;
}

export interface ActivityScheduleResponseDto {
  activityScheduleId: number;
  activity: ActivityInfo | null;
  staffId: number;
  startTime: string;
  endTime: string;
  status: ActivityScheduleStatus;
  isLivestream: boolean;
  roomId: number | null;
  maxCapacity: number | null;
  isOptional: boolean;
  locationId: number;
  currentCapacity: number | null;
}

const activityScheduleService = {
  // Get all activity schedules
  getAllActivitySchedules: async (): Promise<ActivityScheduleResponseDto[]> => {
    console.log("[activityScheduleService] GET /ActivitySchedule");
    const response = await axiosInstance.get("/ActivitySchedule");
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get activity schedules with pending attendance by camp ID
  getAttendancesByCampId: async (campId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/attendances/camps/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/attendances/camps/${campId}`);
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get activity schedules by camper and camp
  getActivitySchedulesByCamperAndCamp: async (camperId: number, campId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/camper/${camperId}/camp/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/camper/${camperId}/camp/${campId}`);
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get optional activity schedules by camp
  getOptionalSchedulesByCamp: async (campId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/optional/camp/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/optional/camp/${campId}`);
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get core activity schedules by camp
  getCoreSchedulesByCamp: async (campId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/core/camp/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/core/camp/${campId}`);
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get all activity schedules by camp
  getActivitySchedulesByCamp: async (campId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/camp/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/camp/${campId}`);
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get activity schedules by date range
  getActivitySchedulesByDateRange: async (fromDate: string, toDate: string): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/date-range`);
    const response = await axiosInstance.get("/ActivitySchedule/date-range", {
      params: { fromDate, toDate },
    });
    return response.data as ActivityScheduleResponseDto[];
  },

  // Create core activity schedule
  createCoreActivitySchedule: async (schedule: ActivityScheduleCreateDto): Promise<ActivityScheduleResponseDto> => {
    console.log("[activityScheduleService] POST /ActivitySchedule/core");
    const requestPayload = {
      activityId: schedule.activityId,
      staffId: schedule.staffId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isLivestream: schedule.isLivestream,
      roomId: schedule.roomId ?? null,
      maxCapacity: schedule.maxCapacity ?? null,
      locationId: schedule.locationId,
    };

    const response = await axiosInstance.post("/ActivitySchedule/core", requestPayload);
    return response.data as ActivityScheduleResponseDto;
  },

  // Create optional activity schedule
  createOptionalActivitySchedule: async (coreScheduleId: number, schedule: OptionalScheduleCreateDto): Promise<ActivityScheduleResponseDto> => {
    console.log(`[activityScheduleService] POST /ActivitySchedule/optional/${coreScheduleId}`);
    const requestPayload = {
      activityId: schedule.activityId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isLivestream: schedule.isLivestream,
      roomId: schedule.roomId ?? null,
      maxCapacity: schedule.maxCapacity ?? null,
      locationId: schedule.locationId,
    };

    const response = await axiosInstance.post(`/ActivitySchedule/optional/${coreScheduleId}`, requestPayload);
    return response.data as ActivityScheduleResponseDto;
  },

  // Update core activity schedule
  updateCoreActivitySchedule: async (id: number, schedule: ActivityScheduleCreateDto): Promise<ActivityScheduleResponseDto> => {
    console.log(`[activityScheduleService] PUT /ActivitySchedule/core/${id}`);
    const requestPayload = {
      activityId: schedule.activityId,
      staffId: schedule.staffId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isLivestream: schedule.isLivestream,
      roomId: schedule.roomId ?? null,
      maxCapacity: schedule.maxCapacity ?? null,
      locationId: schedule.locationId,
    };

    const response = await axiosInstance.put(`/ActivitySchedule/core/${id}`, requestPayload);
    return response.data as ActivityScheduleResponseDto;
  },

  // Update activity schedule status
  updateActivityScheduleStatus: async (activityScheduleId: number, status: ActivityScheduleStatus): Promise<void> => {
    console.log(`[activityScheduleService] PUT /ActivitySchedule/${activityScheduleId}/status`);
    await axiosInstance.put(`/ActivitySchedule/${activityScheduleId}/status`, null, {
      params: { status },
    });
  },
};

export default activityScheduleService;

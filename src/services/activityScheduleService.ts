import axiosInstance from "../config/axios";
import { ActivitySchedule as ActivityScheduleStatus } from "../enums/activitySechedule-status.enum";

export interface ActivityInfo {
  activityId?: number;
  name: string;
  description?: string | null;
  activityType: "Core" | "Optional" | "Resting" | "CheckIn" | "CheckOut";
}

export interface StaffInfo {
  userId: number;
  fullName: string;
}

export interface LocationInfo {
  id: number;
  name: string;
}

export interface LiveStreamInfo {
  livestreamId: number;
  roomId: string;
  title: string;
  hostId: number;
}

export interface ActivitySchedule {
  activityScheduleId: number;
  activity: ActivityInfo | null;
  staff: StaffInfo | null;
  startTime: string;
  endTime: string;
  status: string;
  isLivestream: boolean;
  liveStream: LiveStreamInfo | null;
  maxCapacity: number | null;
  isOptional: boolean;
  location: LocationInfo | null;
  currentCapacity?: number | null;
}

export interface ActivityScheduleCreateDto {
  activityId: number;
  staffId?: number | null;
  locationId?: number | null;
  startTime: string;
  endTime: string;
  isLiveStream?: boolean | null;
  isRepeat?: boolean;
  groupIds?: number[] | null;
}

export interface RepeatDayOfWeek {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
}

export interface ActivityScheduleTemplateDto {
  activityId: number;
  staffId?: number | null;
  locationId?: number | null;
  isLiveStream?: boolean | null;
  startTime: string; // format: time (e.g., "09:00:00")
  endTime: string;   // format: time (e.g., "17:00:00")
  isDaily?: boolean;
  repeatDays?: RepeatDayOfWeek[] | null;
}

export interface OptionalScheduleCreateDto {
  activityId: number;
  staffId?: number | null;
  locationId?: number | null;
  startTime: string;
  endTime: string;
  isLiveStream?: boolean | null;
  isRepeat?: boolean;
}

export interface RestingScheduleCreateDto {
  activityId: number;
  startTime: string;
  endTime: string;
  isRepeat?: boolean;
}

export interface ActivityScheduleResponseDto {
  activityScheduleId: number;
  activity: ActivityInfo | null;
  staff: StaffInfo | null;
  startTime: string;
  endTime: string;
  status: string;
  isLivestream: boolean;
  liveStream: LiveStreamInfo | null;
  maxCapacity: number | null;
  isOptional: boolean;
  location: LocationInfo | null;
  currentCapacity?: number | null;
}

export interface ActivityScheduleBatchResponseDto {
  successes: ActivityScheduleResponseDto[];
  errors: Array<string | {
    message: string;
    [key: string]: any;
  }>;
}

const activityScheduleService = {
  // Get all activity schedules
  getAllActivitySchedules: async (): Promise<ActivityScheduleResponseDto[]> => {
    console.log("[activityScheduleService] GET /ActivitySchedule");
    const response = await axiosInstance.get("/ActivitySchedule");
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get activity schedule by ID
  getActivityScheduleById: async (id: number): Promise<ActivityScheduleResponseDto> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/${id}`);
    const response = await axiosInstance.get(`/ActivitySchedule/${id}`);
    return response.data as ActivityScheduleResponseDto;
  },

  // Get activity schedules with pending attendance by camp ID
  getAttendancesByCampId: async (campId: number, staffId?: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/attendances/camps/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/attendances/camps/${campId}`, {
      params: staffId ? { staffId } : {},
    });
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get activity schedules for check-in/check-out attendance by camp ID
  getAttendancesCheckinCheckoutByCampId: async (campId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/attendances-checkin-checkout/camps/${campId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/attendances-checkin-checkout/camps/${campId}`);
    return response.data as ActivityScheduleResponseDto[];
  },

  // Get activity schedules by camper and camp
  getActivitySchedulesByCamperAndCamp: async (campId: number, camperId: number): Promise<ActivityScheduleResponseDto[]> => {
    console.log(`[activityScheduleService] GET /ActivitySchedule/camp/${campId}/camper/${camperId}`);
    const response = await axiosInstance.get(`/ActivitySchedule/camp/${campId}/camper/${camperId}`);
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
  createCoreActivitySchedule: async (schedule: ActivityScheduleCreateDto): Promise<ActivityScheduleBatchResponseDto> => {
    console.log("[activityScheduleService] POST /ActivitySchedule/core");
    const requestPayload = {
      activityId: schedule.activityId,
      staffId: schedule.staffId ?? null,
      locationId: schedule.locationId ?? null,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isLiveStream: schedule.isLiveStream ?? null,
      isRepeat: schedule.isRepeat ?? false,
      groupIds: schedule.groupIds ?? null,
    };

    const response = await axiosInstance.post("/ActivitySchedule/core", requestPayload);
    return response.data as ActivityScheduleBatchResponseDto;
  },

  // Create core activity schedule from template
  createCoreActivityScheduleFromTemplate: async (template: ActivityScheduleTemplateDto): Promise<ActivityScheduleResponseDto> => {
    console.log("[activityScheduleService] POST /ActivitySchedule/core-template");
    const requestPayload = {
      activityId: template.activityId,
      staffId: template.staffId ?? null,
      locationId: template.locationId ?? null,
      isLiveStream: template.isLiveStream ?? null,
      startTime: template.startTime,
      endTime: template.endTime,
      isDaily: template.isDaily ?? false,
      repeatDays: template.repeatDays ?? null,
    };

    const response = await axiosInstance.post("/ActivitySchedule/core-template", requestPayload);
    return response.data as ActivityScheduleResponseDto;
  },

  // Create optional activity schedule
  createOptionalActivitySchedule: async (schedule: OptionalScheduleCreateDto): Promise<ActivityScheduleBatchResponseDto> => {
    console.log("[activityScheduleService] POST /ActivitySchedule/optional");
    const requestPayload = {
      activityId: schedule.activityId,
      staffId: schedule.staffId ?? null,
      locationId: schedule.locationId ?? null,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isLiveStream: schedule.isLiveStream ?? null,
      isRepeat: schedule.isRepeat ?? false,
    };

    const response = await axiosInstance.post("/ActivitySchedule/optional", requestPayload);
    return response.data as ActivityScheduleBatchResponseDto;
  },

  // Create resting activity schedule
  createRestingActivitySchedule: async (schedule: RestingScheduleCreateDto): Promise<ActivityScheduleBatchResponseDto> => {
    console.log("[activityScheduleService] POST /ActivitySchedule/resting");
    const requestPayload = {
      activityId: schedule.activityId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isRepeat: schedule.isRepeat ?? false,
    };

    const response = await axiosInstance.post("/ActivitySchedule/resting", requestPayload);
    return response.data as ActivityScheduleBatchResponseDto;
  },

  // Update core activity schedule
  updateCoreActivitySchedule: async (id: number, schedule: ActivityScheduleCreateDto): Promise<ActivityScheduleResponseDto> => {
    console.log(`[activityScheduleService] PUT /ActivitySchedule/core/${id}`);
    const requestPayload = {
      activityId: schedule.activityId,
      staffId: schedule.staffId ?? null,
      locationId: schedule.locationId ?? null,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isLiveStream: schedule.isLiveStream ?? null,
      isRepeat: schedule.isRepeat ?? false,
      groupIds: schedule.groupIds ?? null,
    };

    const response = await axiosInstance.put(`/ActivitySchedule/core/${id}`, requestPayload);
    return response.data as ActivityScheduleResponseDto;
  },

  // Auto change status (scheduled job trigger)
  changeStatusAuto: async (): Promise<void> => {
    console.log("[activityScheduleService] PUT /ActivitySchedule/change-status-auto");
    await axiosInstance.put("/ActivitySchedule/change-status-auto");
  },

  // Change status to pending attendance
  changeStatusToPendingAttendance: async (): Promise<void> => {
    console.log("[activityScheduleService] PUT /ActivitySchedule/change-status-to-pending-attendance");
    await axiosInstance.put("/ActivitySchedule/change-status-to-pending-attendance");
  },

  // Update activity schedule status
  updateActivityScheduleStatus: async (activityScheduleId: number, status: ActivityScheduleStatus): Promise<void> => {
    console.log(`[activityScheduleService] PUT /ActivitySchedule/${activityScheduleId}/status`);
    await axiosInstance.put(`/ActivitySchedule/${activityScheduleId}/status`, null, {
      params: { status: status },
    });
  },

  // Update live stream status
  updateLiveStreamStatus: async (activityScheduleId: number, isLiveStream: boolean): Promise<void> => {
    console.log(`[activityScheduleService] PUT /ActivitySchedule/${activityScheduleId}/liveStreamStatus`);
    await axiosInstance.put(`/ActivitySchedule/${activityScheduleId}/liveStreamStatus`, null, {
      params: { isLiveStream: isLiveStream },
    });
  },

  // Delete activity schedule
  deleteActivitySchedule: async (activityScheduleId: number): Promise<void> => {
    console.log(`[activityScheduleService] DELETE /ActivitySchedule/${activityScheduleId}`);
    await axiosInstance.delete(`/ActivitySchedule/${activityScheduleId}`);
  },
};

export default activityScheduleService;

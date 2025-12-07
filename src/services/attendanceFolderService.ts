import axiosInstance from "../config/axios";
import axios from "axios";

export interface AttendanceFolderCheckResponse {
  exists: boolean;
  campId: number;
  message?: string;
}

export interface AttendanceFolderCreateResponse {
  success: boolean;
  campId: number;
  message?: string;
}

export interface AttendanceFolderScheduleResponse {
  success: boolean;
  jobId?: string;
  campId: number;
  message?: string;
}

export interface PreloadFaceDatabaseResponse {
  success: boolean;
  campId: number;
  message?: string;
  alreadyLoaded?: boolean;
}

const attendanceFolderService = {
  // Manually triggers folder creation for a specific camp (for testing/admin purposes)
  createFolders: async (campId: number): Promise<AttendanceFolderCreateResponse> => {
    try {
      const response = await axiosInstance.post(`/AttendanceFolder/create-folders/${campId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to create attendance folders"
        );
      }
      throw error;
    }
  },

  // Checks if attendance folders already exist for a camp (idempotency check)
  checkFolders: async (campId: number): Promise<AttendanceFolderCheckResponse> => {
    try {
      const response = await axiosInstance.get(`/AttendanceFolder/check-folders/${campId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to check attendance folders"
        );
      }
      throw error;
    }
  },

  // Schedules a Hangfire job to create folders immediately (for testing)
  scheduleJob: async (campId: number): Promise<AttendanceFolderScheduleResponse> => {
    try {
      const response = await axiosInstance.post(`/AttendanceFolder/schedule-job/${campId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to schedule folder creation job"
        );
      }
      throw error;
    }
  },

  // Manually preload face database for a specific camp (triggers immediate job execution)
  preloadFaceDatabase: async (campId: number, forceReload: boolean = false): Promise<PreloadFaceDatabaseResponse> => {
    try {
      const response = await axiosInstance.post(`/admin/ai/preload/${campId}`, null, {
        params: { forceReload }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to preload face database"
        );
      }
      throw error;
    }
  },
};

export default attendanceFolderService;

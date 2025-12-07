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
};

export default attendanceFolderService;

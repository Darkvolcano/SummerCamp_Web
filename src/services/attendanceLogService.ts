import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

export type ParticipationStatus =
  | "Present"
  | "Absent"
  | "Excused"
  | "Late"
  | "LeftEarly";

export interface AttendanceLogUpdateRequest {
  attendanceLogId: number;
  participantStatus: ParticipationStatus;
  note?: string | null;
}

export interface AttendanceLogListRequestDto {
  activityScheduleId: number;
  camperIds?: number[] | null;
  participantStatus: ParticipationStatus;
  note?: string | null;
}

const attendanceLogService = {
  // Get all attendance logs
  getAttendanceLogs: async () => {
    try {
      const response = await axiosInstance.get("/AttendanceLog");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch attendance logs"
        );
      }
      throw error;
    }
  },

  // Get attendance log by ID
  getAttendanceLogById: async (id: number) => {
    try {
      const response = await axiosInstance.get(`/AttendanceLog/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch attendance log"
        );
      }
      throw error;
    }
  },

  // Update attendance logs (batch update)
  updateAttendanceLogs: async (
    updates: AttendanceLogUpdateRequest[]
  ): Promise<void> => {
    try {
      await axiosInstance.put("/AttendanceLog", updates);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to update attendance logs"
        );
      }
      throw error;
    }
  },

  // Check-in/Check-out attendance log for activity
  checkInCheckOutActivity: async (
    status: ParticipationStatus,
    data: AttendanceLogListRequestDto
  ): Promise<void> => {
    try {
      const params = new URLSearchParams();
      params.append("status", status);

      await axiosInstance.post(
        `/AttendanceLog/checkin_checkout-activity?${params.toString()}`,
        data
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Failed to process check-in/check-out"
        );
      }
      throw error;
    }
  },

  // Create logs for registration closed camps
  createLogsForRegistrationClosedCamps: async (): Promise<void> => {
    try {
      await axiosInstance.post("/AttendanceLog/create-logs-for-registrationClosed-camps");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Failed to create attendance logs for closed camps"
        );
      }
      throw error;
    }
  },
};

// React Query Hooks
export const useAttendanceLogs = () => {
  return useQuery({
    queryKey: ["attendanceLogs"],
    queryFn: () => attendanceLogService.getAttendanceLogs(),
  });
};

export const useAttendanceLogById = (id: number) => {
  return useQuery({
    queryKey: ["attendanceLog", id],
    queryFn: () => attendanceLogService.getAttendanceLogById(id),
    enabled: !!id,
  });
};

export const useUpdateAttendanceLogs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: AttendanceLogUpdateRequest[]) =>
      attendanceLogService.updateAttendanceLogs(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceLog"] });
    },
  });
};

export const useCheckInCheckOutActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      status,
      data,
    }: {
      status: ParticipationStatus;
      data: AttendanceLogListRequestDto;
    }) => attendanceLogService.checkInCheckOutActivity(status, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceLog"] });
    },
  });
};

export const useCreateLogsForClosedCamps = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      attendanceLogService.createLogsForRegistrationClosedCamps(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceLogs"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceLog"] });
    },
  });
};

export default attendanceLogService;

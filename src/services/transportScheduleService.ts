import axiosInstance from "../config/axios";
import { TransportScheduleStatus } from "../enums/transportSchedule-status.enum";

export interface RouteNameDto {
  routeId: number;
  routeName: string | null;
}

export interface DriverNameDto {
  driverId: number;
  fullName: string | null;
}

export interface VehicleNameDto {
  vehicleId: number;
  vehicleName: string | null;
}

export interface CampNameDto {
  campId: number;
  name: string | null;
  startDate: string;
  endDate: string;
}

// Request DTOs
export interface TransportScheduleRequestDto {
  campId: number;
  routeId: number;
  driverId: number;
  vehicleId: number;
  date: string; 
  startTime: string; 
  endTime: string; 
  transportType: string;
}

export interface TransportScheduleStatusUpdateDto {
  status: TransportScheduleStatus;
  cancelReasons?: string | null;
}

// Response DTO
export interface TransportScheduleResponseDto {
  transportScheduleId: number;
  campName: CampNameDto;
  routeName: RouteNameDto;
  driverFullName: DriverNameDto;
  vehicleName: VehicleNameDto;
  date: string;
  startTime: string;
  endTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  status: TransportScheduleStatus;
  transportType: string | null;
  cancelReasons: string | null;
}

// Search params interface
export interface TransportScheduleSearchParams {
  campId?: number;
  vehicleId?: number;
  driverId?: number;
  routeId?: number;
  date?: string; // format: "YYYY-MM-DD"
  startDate?: string;
  endDate?: string;
  status?: string;
}

const transportScheduleService = {
  // GET /api/transportschedules - get list or search
  getTransportSchedules: async (
    params?: TransportScheduleSearchParams
  ): Promise<TransportScheduleResponseDto[]> => {
    console.log("[transportScheduleService] GET /transportschedules");
    const response = await axiosInstance.get("/transportschedules", { params });
    return response.data as TransportScheduleResponseDto[];
  },

  // GET /api/transportschedules/{id}
  getTransportScheduleById: async (
    id: number
  ): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] GET /transportschedules/${id}`);
    const response = await axiosInstance.get(`/transportschedules/${id}`);
    return response.data as TransportScheduleResponseDto;
  },

  // POST /api/transportschedules
  createTransportSchedule: async (
    data: TransportScheduleRequestDto
  ): Promise<TransportScheduleResponseDto> => {
    console.log("[transportScheduleService] POST /transportschedules");
    const response = await axiosInstance.post("/transportschedules", data);
    return response.data as TransportScheduleResponseDto;
  },

  // PUT /api/transportschedules/{id}
  updateTransportSchedule: async (
    id: number,
    data: TransportScheduleRequestDto
  ): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PUT /transportschedules/${id}`);
    const response = await axiosInstance.put(`/transportschedules/${id}`, data);
    return response.data as TransportScheduleResponseDto;
  },

  // DELETE /api/transportschedules/{id}
  deleteTransportSchedule: async (id: number): Promise<void> => {
    console.log(`[transportScheduleService] DELETE /transportschedules/${id}`);
    await axiosInstance.delete(`/transportschedules/${id}`);
  },

  // GET /api/transportschedules/driver-schedule
  getDriverSchedule: async (): Promise<TransportScheduleResponseDto[]> => {
    console.log("[transportScheduleService] GET /transportschedules/driver-schedule");
    const response = await axiosInstance.get("/transportschedules/driver-schedule");
    return response.data as TransportScheduleResponseDto[];
  },

  // PATCH /api/transportschedules/{id}/status - Update status (NotYet, Rejected, Canceled)
  updateTransportScheduleStatus: async (
    id: number,
    data: TransportScheduleStatusUpdateDto
  ): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PATCH /transportschedules/${id}/status`);
    const response = await axiosInstance.patch(
      `/transportschedules/${id}/status`,
      data
    );
    return response.data as TransportScheduleResponseDto;
  },

  // PATCH /api/transportschedules/{id}/start-trip - Update actual start time
  startTrip: async (id: number): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PATCH /transportschedules/${id}/start-trip`);
    const response = await axiosInstance.patch(
      `/transportschedules/${id}/start-trip`
    );
    return response.data as TransportScheduleResponseDto;
  },

  // PATCH /api/transportschedules/{id}/end-trip - Update actual end time
  endTrip: async (id: number): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PATCH /transportschedules/${id}/end-trip`);
    const response = await axiosInstance.patch(
      `/transportschedules/${id}/end-trip`
    );
    return response.data as TransportScheduleResponseDto;
  },
};

export default transportScheduleService;

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

export interface CamperInScheduleResponseDto {
  camperId: number;
  camperName: string | null;
  status: string | null;
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
  // GET /api/transport-schedules - get list or search
  getTransportSchedules: async (
    params?: TransportScheduleSearchParams
  ): Promise<TransportScheduleResponseDto[]> => {
    console.log("[transportScheduleService] GET /transport-schedules");
    const response = await axiosInstance.get("/transport-schedules", { params });
    return response.data as TransportScheduleResponseDto[];
  },

  // GET /api/transport-schedules/{id}
  getTransportScheduleById: async (
    id: number
  ): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] GET /transport-schedules/${id}`);
    const response = await axiosInstance.get(`/transport-schedules/${id}`);
    return response.data as TransportScheduleResponseDto;
  },

  // POST /api/transport-schedules
  createTransportSchedule: async (
    data: TransportScheduleRequestDto
  ): Promise<TransportScheduleResponseDto> => {
    console.log("[transportScheduleService] POST /transport-schedules");
    const response = await axiosInstance.post("/transport-schedules", data);
    return response.data as TransportScheduleResponseDto;
  },

  // PUT /api/transport-schedules/{id}
  updateTransportSchedule: async (
    id: number,
    data: TransportScheduleRequestDto
  ): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PUT /transport-schedules/${id}`);
    const response = await axiosInstance.put(`/transport-schedules/${id}`, data);
    return response.data as TransportScheduleResponseDto;
  },

  // DELETE /api/transport-schedules/{id}
  deleteTransportSchedule: async (id: number): Promise<void> => {
    console.log(`[transportScheduleService] DELETE /transport-schedules/${id}`);
    await axiosInstance.delete(`/transport-schedules/${id}`);
  },

  // GET /api/transport-schedules/driver-schedule
  getDriverSchedule: async (): Promise<TransportScheduleResponseDto[]> => {
    console.log("[transportScheduleService] GET /transport-schedules/driver-schedule");
    const response = await axiosInstance.get("/transport-schedules/driver-schedule");
    return response.data as TransportScheduleResponseDto[];
  },

  // GET /api/transport-schedules/{id}/campers - Get list camper in one transport schedule
  getCampersByScheduleId: async (id: number): Promise<CamperInScheduleResponseDto[]> => {
    console.log(`[transportScheduleService] GET /transport-schedules/${id}/campers`);
    const response = await axiosInstance.get(`/transport-schedules/${id}/campers`);
    return response.data as CamperInScheduleResponseDto[];
  },

  // GET /api/transport-schedules/camper/{camperId} - Get camper transport schedule
  getSchedulesByCamperId: async (camperId: number): Promise<TransportScheduleResponseDto[]> => {
    console.log(`[transportScheduleService] GET /transport-schedules/camper/${camperId}`);
    const response = await axiosInstance.get(`/transport-schedules/camper/${camperId}`);
    return response.data as TransportScheduleResponseDto[];
  },

  // PATCH /api/transport-schedules/{id}/status - Update status (NotYet, Rejected, Canceled)
  updateTransportScheduleStatus: async (
    id: number,
    data: TransportScheduleStatusUpdateDto
  ): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PATCH /transport-schedules/${id}/status`);
    const response = await axiosInstance.patch(
      `/transport-schedules/${id}/status`,
      data
    );
    return response.data as TransportScheduleResponseDto;
  },

  // PATCH /api/transport-schedules/{id}/start-trip - Update actual start time
  startTrip: async (id: number): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PATCH /transport-schedules/${id}/start-trip`);
    const response = await axiosInstance.patch(
      `/transport-schedules/${id}/start-trip`
    );
    return response.data as TransportScheduleResponseDto;
  },

  // PATCH /api/transport-schedules/{id}/end-trip - Update actual end time
  endTrip: async (id: number): Promise<TransportScheduleResponseDto> => {
    console.log(`[transportScheduleService] PATCH /transport-schedules/${id}/end-trip`);
    const response = await axiosInstance.patch(
      `/transport-schedules/${id}/end-trip`
    );
    return response.data as TransportScheduleResponseDto;
  },
};

export default transportScheduleService;

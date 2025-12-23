import axiosInstance from "../config/axios";

export interface CamperDto {
  camperId: number;
  camperName: string | null;
}

export interface LocationDto {
  id: number;
  name: string | null;
}

export interface CamperTransportResponseDto {
  camperTransportId: number;
  transportScheduleId: number;
  camper: CamperDto;
  location: LocationDto;
  isAbsent: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  note: string | null;
}

export interface CamperTransportUpdateDto {
  status?: string;
  note?: string | null;
}

export interface CamperTransportAttendanceDto {
  camperTransportId: number;
  note?: string | null;
}

export interface CamperTransportSearchParams {
  transportScheduleId?: number;
  camperId?: number;
}

const camperTransportService = {
  // GET /api/camper-transport - Get all camper transports
  getAllCamperTransports: async (): Promise<CamperTransportResponseDto[]> => {
    console.log("[camperTransportService] GET /camper-transport");
    const response = await axiosInstance.get("/camper-transport");
    return response.data as CamperTransportResponseDto[];
  },

  // GET /api/camper-transport/schedule/{transportScheduleId} - Get camper transports by schedule
  getCamperTransportsBySchedule: async (
    transportScheduleId: number,
    camperId?: number
  ): Promise<CamperTransportResponseDto[]> => {
    console.log(`[camperTransportService] GET /camper-transport/schedule/${transportScheduleId}`);
    const params = camperId ? { camperId } : undefined;
    const response = await axiosInstance.get(
      `/camper-transport/schedule/${transportScheduleId}`,
      { params }
    );
    return response.data as CamperTransportResponseDto[];
  },

  // GET /api/camper-transport/schedule/{transportScheduleId}/active - Get active camper transports
  getActiveCamperTransports: async (
    transportScheduleId: number
  ): Promise<CamperTransportResponseDto[]> => {
    console.log(`[camperTransportService] GET /camper-transport/schedule/${transportScheduleId}/active`);
    const response = await axiosInstance.get(
      `/camper-transport/schedule/${transportScheduleId}/active`
    );
    return response.data as CamperTransportResponseDto[];
  },

  // POST /api/camper-transport/schedule/{transportScheduleId}/generate - Auto generate camperTransport list
  generateCamperTransports: async (
    transportScheduleId: number
  ): Promise<CamperTransportResponseDto[]> => {
    console.log(`[camperTransportService] POST /camper-transport/schedule/${transportScheduleId}/generate`);
    const response = await axiosInstance.post(
      `/camper-transport/schedule/${transportScheduleId}/generate`
    );
    return response.data as CamperTransportResponseDto[];
  },

  // PUT /api/camper-transport/{id} - Update CamperTransport Status
  updateCamperTransport: async (
    id: number,
    data: CamperTransportUpdateDto
  ): Promise<CamperTransportResponseDto> => {
    console.log(`[camperTransportService] PUT /camper-transport/${id}`);
    const response = await axiosInstance.put(`/camper-transport/${id}`, data);
    return response.data as CamperTransportResponseDto;
  },

  // PATCH /api/camper-transport/check-in - Check-in Camper
  checkInCamper: async (
    data: CamperTransportAttendanceDto
  ): Promise<CamperTransportResponseDto> => {
    console.log("[camperTransportService] PATCH /camper-transport/check-in");
    const response = await axiosInstance.patch("/camper-transport/check-in", data);
    return response.data as CamperTransportResponseDto;
  },

  // PATCH /api/camper-transport/check-out - Check-out Camper
  checkOutCamper: async (
    data: CamperTransportAttendanceDto
  ): Promise<CamperTransportResponseDto> => {
    console.log("[camperTransportService] PATCH /camper-transport/check-out");
    const response = await axiosInstance.patch("/camper-transport/check-out", data);
    return response.data as CamperTransportResponseDto;
  },

  // PATCH /api/camper-transport/absent - Mark Camper Absence
  markCamperAbsent: async (
    data: CamperTransportAttendanceDto
  ): Promise<CamperTransportResponseDto> => {
    console.log("[camperTransportService] PATCH /camper-transport/absent");
    const response = await axiosInstance.patch("/camper-transport/absent", data);
    return response.data as CamperTransportResponseDto;
  },
};

export default camperTransportService;

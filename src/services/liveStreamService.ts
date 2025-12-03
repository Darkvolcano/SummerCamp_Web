import axiosInstance from "../config/axios";

export interface LivestreamRequestDto {
  title: string;
  roomId: string;
  hostId?: number;
}

export interface LivestreamResponseDto {
  livestreamId: number;
  roomId: string;
  title: string;
  hostId: number;
}

const liveStreamService = {
  // Get all livestreams
  getAllLiveStreams: async (): Promise<LivestreamResponseDto[]> => {
    console.log("[liveStreamService] GET /LiveStream");
    const response = await axiosInstance.get("/LiveStream");
    return response.data as LivestreamResponseDto[];
  },

  // Create livestream
  createLiveStream: async (data: LivestreamRequestDto): Promise<LivestreamResponseDto> => {
    console.log("[liveStreamService] POST /LiveStream");
    const response = await axiosInstance.post("/LiveStream", data);
    return response.data as LivestreamResponseDto;
  },

  // Get livestreams by date range
  getLiveStreamsByDateRange: async (startDate: string, endDate: string): Promise<LivestreamResponseDto[]> => {
    console.log(`[liveStreamService] GET /LiveStream/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    const response = await axiosInstance.get("/LiveStream/by-date-range", {
      params: { startDate, endDate },
    });
    return response.data as LivestreamResponseDto[];
  },

  // Get livestream by ID
  getLiveStreamById: async (id: number): Promise<LivestreamResponseDto> => {
    console.log(`[liveStreamService] GET /LiveStream/${id}`);
    const response = await axiosInstance.get(`/LiveStream/${id}`);
    return response.data as LivestreamResponseDto;
  },

  // Update livestream
  updateLiveStream: async (id: number, data: LivestreamRequestDto): Promise<LivestreamResponseDto> => {
    console.log(`[liveStreamService] PUT /LiveStream/${id}`);
    const response = await axiosInstance.put(`/LiveStream/${id}`, data);
    return response.data as LivestreamResponseDto;
  },

  // Delete livestream
  deleteLiveStream: async (id: number): Promise<void> => {
    console.log(`[liveStreamService] DELETE /LiveStream/${id}`);
    await axiosInstance.delete(`/LiveStream/${id}`);
  },
};

export default liveStreamService;

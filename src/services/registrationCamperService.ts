import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

export interface CampSummaryDto {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface RegistrationCamperResponseDto {
  registrationId: number;
  camperId: number;
  status: string | null;
  requestTransport: boolean;
  camp: CampSummaryDto;
}

const registrationCamperService = {
  getRegistrationCampers: async (
    camperId?: number,
    campId?: number,
    status?: string,
    requestTransport?: boolean
  ): Promise<RegistrationCamperResponseDto[]> => {
    try {
      const params = new URLSearchParams();
      if (camperId) params.append("camperId", camperId.toString());
      if (campId) params.append("campId", campId.toString());
      if (status) params.append("status", status);
      if (requestTransport !== undefined)
        params.append("requestTransport", requestTransport.toString());

      const response = await axiosInstance.get(
        `/RegistrationCamper?${params.toString()}`
      );
      return Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Failed to fetch registration campers"
        );
      }
      throw error;
    }
  },

  getCampByCamper: async (
    camperId: number
  ): Promise<RegistrationCamperResponseDto[]> => {
    try {
      const response = await axiosInstance.get(
        `/RegistrationCamper?camperId=${camperId}`
      );
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      return data
        .filter(
          (item: RegistrationCamperResponseDto) =>
            item.status !== "PendingApproval" && item.status !== "Canceled"
        )
        .sort(
          (a: RegistrationCamperResponseDto, b: RegistrationCamperResponseDto) =>
            new Date(a.camp.startDate).getTime() -
            new Date(b.camp.startDate).getTime()
        );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Failed to fetch camps for camper"
        );
      }
      throw error;
    }
  },
};

export const useRegistrationCampers = (
  camperId?: number,
  campId?: number,
  status?: string,
  requestTransport?: boolean
) => {
  return useQuery<RegistrationCamperResponseDto[], Error>({
    queryKey: [
      "registrationCampers",
      camperId,
      campId,
      status,
      requestTransport,
    ],
    queryFn: () =>
      registrationCamperService.getRegistrationCampers(
        camperId,
        campId,
        status,
        requestTransport
      ),
  });
};

export default registrationCamperService;

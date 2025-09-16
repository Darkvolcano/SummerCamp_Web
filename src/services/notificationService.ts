import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../config/axios";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await axiosInstance.get<Notification[]>("notifications");
  return response.data;
};

export const useGetNotifications = () => {
  return useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
};

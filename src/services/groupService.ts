import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import axios from "axios";

export interface GroupRequestDto {
  campId: number;
  groupName: string;
  description?: string | null;
  supervisorId?: number | null;
  maxSize?: number | null;
  minAge: number;
  maxAge: number;
}

export interface GroupResponseDto {
  groupId: number;
  groupName: string;
  description: string | null;
  maxSize: number;
  supervisorId: number | null;
  supervisorName: string | null;
  campId: number;
  minAge: number;
  maxAge: number;
}

const groupService = {
  // Get all groups
  getAllGroups: async (): Promise<GroupResponseDto[]> => {
    try {
      const response = await axiosInstance.get("/group");
      return response.data as GroupResponseDto[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch groups"
        );
      }
      throw error;
    }
  },

  // Get group by ID
  getGroupById: async (id: number): Promise<GroupResponseDto> => {
    try {
      const response = await axiosInstance.get(`/group/${id}`);
      return response.data as GroupResponseDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to fetch group");
      }
      throw error;
    }
  },

  // Create group
  createGroup: async (group: GroupRequestDto): Promise<GroupResponseDto> => {
    try {
      const response = await axiosInstance.post("/group", group);
      return response.data as GroupResponseDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to create group"
        );
      }
      throw error;
    }
  },

  // Update group
  updateGroup: async (id: number, group: GroupRequestDto): Promise<GroupResponseDto> => {
    try {
      const response = await axiosInstance.put(`/group/${id}`, group);
      return response.data as GroupResponseDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to update group"
        );
      }
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/group/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to delete group"
        );
      }
      throw error;
    }
  },

  // Get groups by activity schedule ID
  getGroupsByActivityScheduleId: async (id: number): Promise<GroupResponseDto[]> => {
    try {
      const response = await axiosInstance.get(`/group/activityScheduleId/${id}`);
      return response.data as GroupResponseDto[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Failed to fetch groups by activity schedule"
        );
      }
      throw error;
    }
  },

  // Get groups by camp ID
  getGroupsByCampId: async (campId: number): Promise<GroupResponseDto[]> => {
    try {
      const response = await axiosInstance.get(`/group/camp/${campId}`);
      return response.data as GroupResponseDto[];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch groups by camp"
        );
      }
      throw error;
    }
  },

  // Assign staff to group
  assignStaffToGroup: async (
    groupId: number,
    staffId: number
  ): Promise<GroupResponseDto> => {
    try {
      const response = await axiosInstance.put(
        `/group/${groupId}/assign-staff/${staffId}`
      );
      return response.data as GroupResponseDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to assign staff to group"
        );
      }
      throw error;
    }
  },
};

// React Query Hooks
export const useAllGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => groupService.getAllGroups(),
  });
};

export const useGroupById = (id: number) => {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => groupService.getGroupById(id),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (group: GroupRequestDto) => groupService.createGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, group }: { id: number; group: GroupRequestDto }) =>
      groupService.updateGroup(id, group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => groupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useGroupsByActivityScheduleId = (id: number) => {
  return useQuery({
    queryKey: ["groupsByActivitySchedule", id],
    queryFn: () => groupService.getGroupsByActivityScheduleId(id),
    enabled: !!id,
  });
};

export const useGroupsByCampId = (campId: number) => {
  return useQuery({
    queryKey: ["groupsByCamp", campId],
    queryFn: () => groupService.getGroupsByCampId(campId),
    enabled: !!campId,
  });
};

export const useAssignStaffToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, staffId }: { groupId: number; staffId: number }) =>
      groupService.assignStaffToGroup(groupId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
};

export default groupService;

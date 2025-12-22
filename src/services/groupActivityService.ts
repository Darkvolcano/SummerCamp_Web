import axiosInstance from "../config/axios";

// ==================== REQUEST/RESPONSE DTOs ====================

/**
 * DTO for creating group activity assignment
 */
export interface GroupActivityDto {
  groupId: number;
  activityScheduleId: number;
}

// ==================== SERVICE ====================

const groupActivityService = {
  /**
   * POST /api/group-activity
   * Create group activity assignment
   */
  createGroupActivity: async (
    data: GroupActivityDto
  ): Promise<void> => {
    console.log("[groupActivityService] POST /group-activity");
    await axiosInstance.post("/group-activity", data);
  },

  /**
   * DELETE /api/group-activity/{id}
   * Delete group activity assignment
   */
  deleteGroupActivity: async (id: number): Promise<void> => {
    console.log(`[groupActivityService] DELETE /group-activity/${id}`);
    await axiosInstance.delete(`/group-activity/${id}`);
  },
};

export default groupActivityService;

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
   * DELETE /api/group-activity
   * Delete group activity assignment by groupId and activityScheduleId
   */
  deleteGroupActivity: async (
    groupId: number,
    activityScheduleId: number
  ): Promise<void> => {
    console.log(`[groupActivityService] DELETE /group-activity?groupId=${groupId}&activityScheduleId=${activityScheduleId}`);
    await axiosInstance.delete("/group-activity", {
      params: { groupId, activityScheduleId }
    });
  },
};

export default groupActivityService;

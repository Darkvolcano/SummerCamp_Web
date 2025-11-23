import axiosInstance from "../config/axios";

export interface StaffInfo {
  userId: number;
  fullName: string;
  role: "Staff" | "Manager";
}

const staffService = {
  // Get camps for staff
  getStaffCamps: async (): Promise<any[]> => {
    console.log("[staffService] GET /Staff/my-camps");
    const response = await axiosInstance.get("/Staff/my-camps");
    return response.data;
  },

  // Get activities for staff in a camp
  getCampActivities: async (campId: number): Promise<any[]> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/activities`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/activities`);
    return response.data;
  },

  // Get groups for staff in a camp
  getCampGroups: async (campId: number): Promise<any[]> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/group`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/group`);
    return response.data;
  },

  // Get accommodations for staff in a camp
  getCampAccommodations: async (campId: number): Promise<any[]> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/accomodation`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/accomodation`);
    return response.data;
  },

  // Get available staff for activity assignment
  getAvailableActivityStaff: async (
    campId: number,
    activityScheduleId: number
  ): Promise<StaffInfo[]> => {
    console.log(
      `[staffService] GET /Staff/camps/${campId}/available-activity-staff/${activityScheduleId}`
    );
    const response = await axiosInstance.get(
      `/Staff/camps/${campId}/available-activity-staff/${activityScheduleId}`
    );
    return response.data as StaffInfo[];
  },

  // Get available staff for group assignment
  getAvailableGroupStaff: async (campId: number): Promise<StaffInfo[]> => {
    console.log(
      `[staffService] GET /Staff/camps/${campId}/available-group-staff`
    );
    const response = await axiosInstance.get(
      `/Staff/camps/${campId}/available-group-staff`
    );
    return response.data as StaffInfo[];
  },

  // Get available staff for accommodation assignment
  getAvailableAccommodationStaff: async (
    campId: number
  ): Promise<StaffInfo[]> => {
    console.log(
      `[staffService] GET /Staff/camps/${campId}/available-accomodation-staff`
    );
    const response = await axiosInstance.get(
      `/Staff/camps/${campId}/available-accomodation-staff`
    );
    return response.data as StaffInfo[];
  },

  // Get available staff in a time range
  getAvailableStaffInTime: async (
    campId: number,
    startTime: string,
    endTime: string
  ): Promise<StaffInfo[]> => {
    console.log(
      `[staffService] GET /Staff/camps/${campId}/available-in-time`
    );
    const response = await axiosInstance.get(
      `/Staff/camps/${campId}/available-in-time`,
      {
        params: {
          startTime,
          endTime,
        },
      }
    );
    return response.data as StaffInfo[];
  },
};

export default staffService;

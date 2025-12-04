import axiosInstance from "../config/axios";

export interface StaffInfo {
  userId: number;
  fullName: string;
  role: "Staff" | "Manager";
}

export interface StaffCampResponseDto {
  campId: number;
  name: string;
  description: string | null;
  place: string | null;
  address: string | null;
  minParticipants: number;
  maxParticipants: number;
  minAge: number;
  maxAge: number;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
  image: string | null;
  createBy: number;
  registrationStartDate: string;
  registrationEndDate: string;
  campType: any | null;
  location: any | null;
  promotion: any | null;
}

export interface ActivityScheduleInfo {
  activityScheduleId: number;
  activityName: string;
  activityType: string;
  startTime: string;
  endTime: string;
  status: string;
  isLivestream: boolean;
  location: string | null;
}

export interface CampActivitiesResponseDto {
  campId: number;
  campName: string;
  activities: ActivityScheduleInfo[];
}

export interface CampGroupResponseDto {
  campId: number;
  campName: string;
  groupId: number;
  groupName: string;
  minAge: number;
  maxAge: number;
}

export interface ActivityInfo {
  name: string;
  activityType: string;
}

export interface StaffBasicInfo {
  userId: number;
  fullName: string;
}

export interface LiveStreamInfo {
  livestreamId: number;
  roomId: string;
  title: string;
  hostId: number;
}

export interface LocationInfo {
  id: number;
  name: string;
}

export interface GroupStaffActivityResponseDto {
  activityScheduleId: number;
  coreActivityId: number | null;
  activity: ActivityInfo;
  staff: StaffBasicInfo | null;
  startTime: string;
  endTime: string;
  status: string;
  isLivestream: boolean;
  liveStream: LiveStreamInfo | null;
  maxCapacity: number | null;
  isOptional: boolean;
  location: LocationInfo | null;
}

export interface SupervisorInfo {
  userId: number;
  fullName: string;
}

export interface CampAccommodationResponseDto {
  accommodationId: number;
  campId: number;
  accommodationTypeId: number;
  name: string;
  capacity: number;
  isActive: boolean;
  supervisor: SupervisorInfo | null;
}

const staffService = {
  // Get camps for staff
  getStaffCamps: async (): Promise<StaffCampResponseDto[]> => {
    console.log("[staffService] GET /Staff/my-camps");
    const response = await axiosInstance.get("/Staff/my-camps");
    return response.data as StaffCampResponseDto[];
  },

  // Get activities for staff in a camp
  getCampActivities: async (campId: number): Promise<CampActivitiesResponseDto> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/activities`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/activities`);
    return response.data as CampActivitiesResponseDto;
  },

  // Get group staff activities with full details
  getGroupStaffActivities: async (campId: number): Promise<GroupStaffActivityResponseDto[]> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/group-staff-activities`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/group-staff-activities`);
    return response.data as GroupStaffActivityResponseDto[];
  },

  // Get groups for staff in a camp
  getCampGroups: async (campId: number): Promise<CampGroupResponseDto> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/group`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/group`);
    return response.data as CampGroupResponseDto;
  },

  // Get accommodations for staff in a camp
  getCampAccommodations: async (campId: number): Promise<CampAccommodationResponseDto> => {
    console.log(`[staffService] GET /Staff/camps/${campId}/accomodation`);
    const response = await axiosInstance.get(`/Staff/camps/${campId}/accomodation`);
    return response.data as CampAccommodationResponseDto;
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

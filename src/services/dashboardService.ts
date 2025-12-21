import axiosInstance from "../config/axios";

// ==================== Manager Dashboard DTOs ====================

export interface OccupancyDto {
  current: number;
  max: number;
  percentage: number;
}

export interface ManagerSummaryResponseDto {
  totalRevenue: number;
  totalCampers: number;
  pendingApprovals: number;
  cancellationRate: number;
  occupancy: OccupancyDto;
}

export interface RegistrationTrendDto {
  date: string; // format: YYYY-MM-DD
  count: number;
  revenue: number;
}

export interface StatusDistributionDto {
  [status: string]: number; // e.g., "Canceled": 1, "Confirmed": 3
}

export interface GenderDistributionDto {
  [gender: string]: number; // e.g., "Female": 1, "Male": 3
}

export interface AgeGroupsDto {
  [age: string]: number; // e.g., "4": 1, "5": 1
}

export interface CamperProfileDto {
  gender: GenderDistributionDto;
  ageGroups: AgeGroupsDto;
}

export interface ManagerAnalyticsResponseDto {
  registrationTrend: RegistrationTrendDto[];
  statusDistribution: StatusDistributionDto;
  camperProfile: CamperProfileDto;
}

export interface RecentRegistrationDto {
  registrationId: number;
  camperName: string;
  registrationDate: string; // format: date-time
  status: string;
  amount: number;
  avatar: string;
}

export interface ManagerOperationsResponseDto {
  capacityAlerts: any[]; // Type depends on alert structure
  recentRegistrations: RecentRegistrationDto[];
}

// ==================== Admin Dashboard DTOs ====================

export interface MetricWithGrowthDto {
  value: number;
  growth: number | null;
  label: string;
}

export interface AdminSummaryResponseDto {
  totalRevenue: MetricWithGrowthDto;
  totalCustomers: MetricWithGrowthDto;
  totalWorkforce: MetricWithGrowthDto;
  totalActiveCamps: number;
}

export interface WorkforceDistributionDto {
  Driver: number;
  Manager: number;
  Staff: number;
}

export interface NewCustomerGrowthDto {
  date: string; // format: YYYY-MM-DD
  count: number;
}

export interface AdminUserAnalyticsResponseDto {
  workforceDistribution: WorkforceDistributionDto;
  newCustomerGrowth: NewCustomerGrowthDto[];
}

export interface TopLocationDto {
  locationId: number;
  name: string;
  campCount: number;
  activeCamps: number;
}

export interface AdminLocationAnalyticsResponseDto {
  topLocationsByCampCount: TopLocationDto[];
}

export interface CampStatusOverviewDto {
  [status: string]: number; // e.g., "Active": 1, "Completed": 7
}

export interface MonthlyRevenueDto {
  month: string; // format: MM/YYYY
  revenue: number;
}

export interface AdminCampAnalyticsResponseDto {
  statusOverview: CampStatusOverviewDto;
  monthlyRevenue: MonthlyRevenueDto[];
}

export interface PendingCampDto {
  campId: number;
  name: string;
  managerName: string;
  submittedDate: string; // format: date-time
  status: string;
}

export interface RecentUserDto {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  registeredDate: string; // format: date-time
}

export interface AdminPriorityActionsResponseDto {
  pendingCamps: PendingCampDto[];
  recentUsers: RecentUserDto[];
}

// ==================== Dashboard Service ====================

const dashboardService = {
  // ==================== Manager Dashboard ====================

  /**
   * Get summary statistics for a specific camp
   * @param campId - The camp ID
   * @returns Summary statistics including revenue, campers, approvals, and occupancy
   */
  getManagerSummary: async (
    campId: number
  ): Promise<ManagerSummaryResponseDto> => {
    console.log(
      `[dashboardService] Fetching manager summary for camp ${campId}`
    );
    const response = await axiosInstance.get(
      `/Dashboard/manager/${campId}/summary`
    );
    return response.data;
  },

  /**
   * Get analytics data for a specific camp
   * @param campId - The camp ID
   * @returns Analytics including registration trends, status distribution, and camper profiles
   */
  getManagerAnalytics: async (
    campId: number
  ): Promise<ManagerAnalyticsResponseDto> => {
    console.log(
      `[dashboardService] Fetching manager analytics for camp ${campId}`
    );
    const response = await axiosInstance.get(
      `/Dashboard/manager/${campId}/analytics`
    );
    return response.data;
  },

  /**
   * Get operational data for a specific camp
   * @param campId - The camp ID
   * @returns Operations data including capacity alerts and recent registrations
   */
  getManagerOperations: async (
    campId: number
  ): Promise<ManagerOperationsResponseDto> => {
    console.log(
      `[dashboardService] Fetching manager operations for camp ${campId}`
    );
    const response = await axiosInstance.get(
      `/Dashboard/manager/${campId}/operations`
    );
    return response.data;
  },

  // ==================== Admin Dashboard ====================

  /**
   * Get system-wide KPI summary for admin
   * @returns System-wide summary including revenue, customers, workforce, and active camps
   */
  getAdminSummary: async (): Promise<AdminSummaryResponseDto> => {
    console.log(`[dashboardService] Fetching admin summary`);
    const response = await axiosInstance.get(`/Dashboard/admin/summary`);
    return response.data;
  },

  /**
   * Get user analytics for admin
   * @returns User analytics including workforce distribution and customer growth
   */
  getAdminUserAnalytics: async (): Promise<AdminUserAnalyticsResponseDto> => {
    console.log(`[dashboardService] Fetching admin user analytics`);
    const response = await axiosInstance.get(
      `/Dashboard/admin/user-analytics`
    );
    return response.data;
  },

  /**
   * Get location analytics for admin
   * @returns Location analytics including top locations by camp count
   */
  getAdminLocationAnalytics: async (): Promise<AdminLocationAnalyticsResponseDto> => {
    console.log(`[dashboardService] Fetching admin location analytics`);
    const response = await axiosInstance.get(
      `/Dashboard/admin/location-analytics`
    );
    return response.data;
  },

  /**
   * Get camp analytics for admin
   * @returns Camp analytics including status overview and monthly revenue
   */
  getAdminCampAnalytics: async (): Promise<AdminCampAnalyticsResponseDto> => {
    console.log(`[dashboardService] Fetching admin camp analytics`);
    const response = await axiosInstance.get(
      `/Dashboard/admin/camp-analytics`
    );
    return response.data;
  },

  /**
   * Get priority actions for admin
   * @returns Priority actions including pending camps and recent users
   */
  getAdminPriorityActions: async (): Promise<AdminPriorityActionsResponseDto> => {
    console.log(`[dashboardService] Fetching admin priority actions`);
    const response = await axiosInstance.get(
      `/Dashboard/admin/priority-actions`
    );
    return response.data;
  },
};

export default dashboardService;

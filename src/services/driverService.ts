import axiosInstance from "../config/axios";

export enum DriverStatus {
  PendingUpload = "PendingUpload",
  PendingApproval = "PendingApproval",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface DriverResponseDto {
  driverId: number;
  userId: number;
  licenseNumber: string | null;
  licenseExpiry: string;
  driverAddress: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
}

export interface DriverRegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string | null;
  dob?: string | null;
  licenseNumber: string;
  licenseExpiry: string;
  driverAddress: string;
}

export interface DriverRequestDto {
  licenseNumber?: string | null;
  licenseExpiry: string;
  driverAddress?: string | null;
}

const driverService = {
  // Get available drivers
  getAvailableDrivers: async (
    date?: string,
    startTime?: string,
    endTime?: string
  ): Promise<DriverResponseDto[]> => {
    console.log("[driverService] GET /driver/available");
    const response = await axiosInstance.get("/driver/available", {
      params: { date, startTime, endTime },
    });
    return response.data as DriverResponseDto[];
  },

  // Register new driver
  registerDriver: async (data: DriverRegisterDto): Promise<void> => {
    console.log("[driverService] POST /driver/register");
    await axiosInstance.post("/driver/register", data);
  },

  // Upload license photo (authenticated)
  uploadLicensePhoto: async (file: File): Promise<void> => {
    console.log("[driverService] PUT /driver/upload-photo");
    const formData = new FormData();
    formData.append("licensePhoto", file);
    await axiosInstance.put("/driver/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Upload license photo by token (unauthenticated)
  uploadLicensePhotoByToken: async (
    uploadToken: string,
    file: File
  ): Promise<void> => {
    console.log("[driverService] POST /driver/upload-photo-by-token");
    const formData = new FormData();
    formData.append("uploadToken", uploadToken);
    formData.append("licensePhoto", file);
    await axiosInstance.post("/driver/upload-photo-by-token", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Get all drivers
  getAllDrivers: async (): Promise<DriverResponseDto[]> => {
    console.log("[driverService] GET /driver");
    const response = await axiosInstance.get("/driver");
    return response.data as DriverResponseDto[];
  },

  // Get driver by user ID
  getDriverByUserId: async (userId: number): Promise<DriverResponseDto> => {
    console.log(`[driverService] GET /driver/user/${userId}`);
    const response = await axiosInstance.get(`/driver/user/${userId}`);
    return response.data as DriverResponseDto;
  },

  // Get drivers by status
  getDriversByStatus: async (
    status?: string
  ): Promise<DriverResponseDto[]> => {
    console.log("[driverService] GET /driver/status");
    const response = await axiosInstance.get("/driver/status", {
      params: { status },
    });
    return response.data as DriverResponseDto[];
  },

  // Update driver
  updateDriver: async (
    driverId: number,
    data: DriverRequestDto
  ): Promise<void> => {
    console.log(`[driverService] PUT /driver/${driverId}`);
    await axiosInstance.put(`/driver/${driverId}`, data);
  },

  // Delete driver
  deleteDriver: async (driverId: number): Promise<void> => {
    console.log(`[driverService] DELETE /driver/${driverId}`);
    await axiosInstance.delete(`/driver/${driverId}`);
  },

  // Update driver status
  updateDriverStatus: async (
    driverId: number,
    status: DriverStatus
  ): Promise<void> => {
    console.log(`[driverService] PUT /driver/${driverId}/status`);
    await axiosInstance.put(`/driver/${driverId}/status`, null, {
      params: { status },
    });
  },
};

export default driverService;

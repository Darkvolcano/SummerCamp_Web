import axiosInstance from "../config/axios";

export interface UserAccountResponseDto {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
    avatar?: string | null;
    dateOfBirth?: string | null;
    role: string;
    isActive: boolean;
}

export interface UserProfileUpdateDto {
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
    avatar?: string | null;
    dob: string;
}

export interface UserAdminUpdateDto {
    role: string;
    isActive?: boolean;
}

export interface EmailUpdateRequestDto {
    newEmail: string;
    currentPassword: string;
}

export interface EmailUpdateVerificationDto {
    newEmail: string;
    otp: string;
}

export interface ChangePasswordRequestDto {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword?: string | null;
}

const userAccountService = {
    // Get current user profile
    getCurrentUser: async (): Promise<UserAccountResponseDto> => {
        console.log("[userAccountService] GET /api/user/me");
        const response = await axiosInstance.get("/user/me");
        return response.data as UserAccountResponseDto;
    },

    // Get all users
    getAllUsers: async (): Promise<UserAccountResponseDto[]> => {
        console.log("[userAccountService] GET /api/user");
        const response = await axiosInstance.get("/user");
        return response.data as UserAccountResponseDto[];
    },

    // Get user by ID
    getUserById: async (userId: number): Promise<UserAccountResponseDto> => {
        console.log(`[userAccountService] GET /api/user/${userId}`);
        const response = await axiosInstance.get(`/user/${userId}`);
        return response.data as UserAccountResponseDto;
    },

    // Update user profile (current user)
    updateUserProfile: async (updateData: UserProfileUpdateDto): Promise<UserAccountResponseDto> => {
        console.log("[userAccountService] PUT /api/user");
        const requestPayload = {
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            phoneNumber: updateData.phoneNumber || null,
            avatar: updateData.avatar || null,
            dob: updateData.dob,
        };
        const response = await axiosInstance.put("/user", requestPayload);
        return response.data as UserAccountResponseDto;
    },

    // Admin update user (role and status)
    adminUpdateUser: async (userId: number, updateData: UserAdminUpdateDto): Promise<UserAccountResponseDto> => {
        console.log(`[userAccountService] PATCH /api/user/${userId}/admin-update`);
        const requestPayload = {
            role: updateData.role,
            isActive: updateData.isActive ?? undefined,
        };
        const response = await axiosInstance.patch(`/user/${userId}/admin-update`, requestPayload);
        return response.data as UserAccountResponseDto;
    },

    // Delete user
    deleteUser: async (userId: number): Promise<void> => {
        console.log(`[userAccountService] DELETE /api/user/${userId}`);
        await axiosInstance.delete(`/user/${userId}`);
    },

    // Initiate email update (send OTP to new email)
    initiateEmailUpdate: async (emailData: EmailUpdateRequestDto): Promise<void> => {
        console.log("[userAccountService] POST /api/user/email/initiate-update");
        const requestPayload = {
            newEmail: emailData.newEmail,
            currentPassword: emailData.currentPassword,
        };
        await axiosInstance.post("/user/email/initiate-update", requestPayload);
    },

    // Verify email update (confirm with OTP)
    verifyEmailUpdate: async (verifyData: EmailUpdateVerificationDto): Promise<UserAccountResponseDto> => {
        console.log("[userAccountService] POST /api/user/email/verify-update");
        const requestPayload = {
            newEmail: verifyData.newEmail,
            otp: verifyData.otp,
        };
        const response = await axiosInstance.post("/user/email/verify-update", requestPayload);
        return response.data as UserAccountResponseDto;
    },

    // Change password
    changePassword: async (passwordData: ChangePasswordRequestDto): Promise<void> => {
        console.log("[userAccountService] POST /api/user/reset-password");
        const requestPayload = {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            confirmNewPassword: passwordData.confirmNewPassword || null,
        };
        await axiosInstance.post("/user/reset-password", requestPayload);
    },
};

export default userAccountService;

import axiosInstance from "../config/axios";

// Request DTO (for POST/PUT)
export interface BankUserRequestDto {
  bankCode: string; 
  bankName: string; 
  bankNumber: string; 
  isPrimary?: boolean;
}

// Response DTO (from .NET backend)
export interface BankUserResponseDto {
  bankUserId: number;
  userId: number;
  bankCode: string;
  bankName: string;
  bankNumber: string;
  isPrimary: boolean;
  isActive: boolean;
}

const bankUserService = {
  // Get my bank accounts
  getMyBankAccounts: async (): Promise<BankUserResponseDto[]> => {
    console.log("[bankUserService] GET /bank-user/my-accounts");
    const response = await axiosInstance.get("/bank-user/my-accounts");
    return response.data as BankUserResponseDto[];
  },

  // Create bank account
  createBankAccount: async (
    data: BankUserRequestDto
  ): Promise<BankUserResponseDto> => {
    console.log("[bankUserService] POST /bank-user", data);
    const response = await axiosInstance.post("/bank-user", data);
    return response.data as BankUserResponseDto;
  },

  // Update bank account
  updateBankAccount: async (
    id: number,
    data: BankUserRequestDto
  ): Promise<BankUserResponseDto> => {
    console.log(`[bankUserService] PUT /bank-user/${id}`, data);
    const response = await axiosInstance.put(`/bank-user/${id}`, data);
    return response.data as BankUserResponseDto;
  },

  // Delete bank account
  deleteBankAccount: async (id: number): Promise<void> => {
    console.log(`[bankUserService] DELETE /bank-user/${id}`);
    await axiosInstance.delete(`/bank-user/${id}`);
  },

  // Set bank account as primary
  setPrimaryBankAccount: async (id: number): Promise<BankUserResponseDto> => {
    console.log(`[bankUserService] PATCH /bank-user/${id}/set-primary`);
    const response = await axiosInstance.patch(`/bank-user/${id}/set-primary`);
    return response.data as BankUserResponseDto;
  },
};

export default bankUserService;

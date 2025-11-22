import axiosInstance from "../config/axios";

export interface TransactionResponseDto {
    transactionId: number;
    amount: number;
    status: string;
    type: string;
    transactionTime: string;
    method: string;
    transactionCode: string;
    registrationId: number;
    campName: string;
    userId: number;
}

const transactionService = {
    // Get all transactions for current user
    getUserTransactions: async (): Promise<TransactionResponseDto[]> => {
        console.log("[transactionService] GET /api/transaction/user");
        const response = await axiosInstance.get("/transaction/user");
        return response.data as TransactionResponseDto[];
    },

    // Get transactions for current user by registration ID
    getUserTransactionsByRegistration: async (registrationId: number): Promise<TransactionResponseDto[]> => {
        console.log(`[transactionService] GET /api/transaction/user/registration/${registrationId}`);
        const response = await axiosInstance.get(`/transaction/user/registration/${registrationId}`);
        return response.data as TransactionResponseDto[];
    },

    // Get all transactions (admin)
    getAllTransactions: async (): Promise<TransactionResponseDto[]> => {
        console.log("[transactionService] GET /api/transaction");
        const response = await axiosInstance.get("/transaction");
        return response.data as TransactionResponseDto[];
    },

    // Get transaction by ID
    getTransactionById: async (id: number): Promise<TransactionResponseDto> => {
        console.log(`[transactionService] GET /api/transaction/${id}`);
        const response = await axiosInstance.get(`/transaction/${id}`);
        return response.data as TransactionResponseDto;
    },

    // Get transactions by camp ID
    getTransactionsByCampId: async (campId: number): Promise<TransactionResponseDto[]> => {
        console.log(`[transactionService] GET /api/transaction/camp/${campId}`);
        const response = await axiosInstance.get(`/transaction/camp/${campId}`);
        return response.data as TransactionResponseDto[];
    },
};

export default transactionService;

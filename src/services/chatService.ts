import axiosInstance from "../config/axios";

// DTO Types matching backend exactly
export interface ChatRequestDto {
    conversationId?: number | null;
    message: string;
}

export interface ChatResponseDto {
    textResponse: string;
    conversationId: number;
    title: string;
}

export interface ChatMessageDto {
    messageId: number;
    role: string; // "user" or "model"
    content: string;
    sentAt: string;
}

export interface ChatConversationDto {
    conversationId: number;
    title: string;
    createdAt: string;
}

// Chat Service
class ChatService {
    /**
     * Send a message to the AI chatbot
     * @param message - The user's message
     * @param conversationId - Optional conversation ID (null for new conversation)
     * @returns The AI's response
     */
    async sendMessage(
        message: string,
        conversationId: number | null = null
    ): Promise<ChatResponseDto> {
        const response = await axiosInstance.post<ChatResponseDto>("/chat", {
            conversationId,
            message,
        });
        return response.data;
    }

    /**
     * Get the conversation history for the current user
     * @returns List of conversations
     */
    async getConversationHistory(): Promise<ChatConversationDto[]> {
        const response = await axiosInstance.get<ChatConversationDto[]>("/chat/history");
        return response.data;
    }

    /**
     * Get all messages in a specific conversation
     * @param conversationId - The conversation ID
     * @returns List of messages
     */
    async getConversationMessages(conversationId: number): Promise<ChatMessageDto[]> {
        const response = await axiosInstance.get<ChatMessageDto[]>(
            `/chat/conversation/${conversationId}`
        );
        return response.data;
    }

    /**
     * Delete a conversation
     * @param conversationId - The conversation ID to delete
     */
    async deleteConversation(conversationId: number): Promise<void> {
        await axiosInstance.delete(`/chat/${conversationId}`);
    }
}

export const chatService = new ChatService();

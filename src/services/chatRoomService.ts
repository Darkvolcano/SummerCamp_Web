import axios from '../config/axios';

export interface ChatRoomMessageDto {
    messageId: number;
    senderId: number;
    senderName: string;
    avatar: string;
    content: string;
    sentAt: string;
}

export interface ChatRoomDetailDto {
    chatRoomId: number;
    name: string;
    type: number; // 0 = private, 1 = group
    lastMessage?: string;
    lastMessageTime?: string;
    avatarUrl?: string;
}

export interface SendMessageDto {
    chatRoomId: number;
    content: string;
}

export interface CreateOrGetPrivateRoomRequestDto {
    recipientUserId: number;
}

export interface CreateOrGetPrivateRoomResponseDto {
    chatRoomId: number;
    isNewRoom: boolean;
    recipientName: string;
    recipientAvatar: string;
    recipientUserId: number;
}

const chatRoomService = {
    // Send a message to a chat room
    sendMessage: async (request: SendMessageDto): Promise<ChatRoomMessageDto> => {
        const response = await axios.post('/api/chat-rooms/send', request);
        return response.data;
    },

    // Get all chat rooms for current user
    getMyRooms: async (): Promise<ChatRoomDetailDto[]> => {
        const response = await axios.get('/api/chat-rooms/my-rooms');
        return response.data;
    },

    // Get message history for a room
    getMessagesByRoomId: async (roomId: number): Promise<ChatRoomMessageDto[]> => {
        const response = await axios.get(`/api/chat-rooms/${roomId}/messages`);
        return response.data;
    },

    // Create or get existing private room with a user
    createOrGetPrivateRoom: async (
        request: CreateOrGetPrivateRoomRequestDto
    ): Promise<CreateOrGetPrivateRoomResponseDto> => {
        const response = await axios.post('/api/chat-rooms/create-or-get-private', request);
        return response.data;
    },

    // Get room details
    getRoomDetails: async (roomId: number): Promise<ChatRoomDetailDto> => {
        const response = await axios.get(`/api/chat-rooms/${roomId}/details`);
        return response.data;
    }
};

export default chatRoomService;

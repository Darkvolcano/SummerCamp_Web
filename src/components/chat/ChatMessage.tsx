import React from 'react';
import { useAuthStore } from '../../services/userService';
import { formatMessageTimestamp } from '../../utils/dateUtils';

// Updated Message interface to match API structure
interface Message {
    id: number;
    senderId: number;
    senderName: string;
    senderRole: string;
    senderAvatar?: string;
    content: string;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const { user } = useAuthStore();
    const isOwnMessage = message.senderId === user?.id;

    return (
        <div className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${isOwnMessage ? 'bg-blue-50/50' : ''}`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                <img
                    src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
                    alt={message.senderName}
                    className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                />
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
                {/* Header with Name, Badge, and Timestamp */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                        {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatMessageTimestamp(message.timestamp, 'en-US')}
                    </span>
                </div>

                {/* Message Text */}
                <div className="text-sm text-gray-700 break-words">
                    {message.content}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
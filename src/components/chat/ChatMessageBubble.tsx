import React from 'react';
import { useAuthStore } from '../../services/userService';
import { formatMessageTimestamp } from '../../utils/dateUtils';

interface Message {
    id: number;
    senderId: number;
    senderName: string;
    senderRole: string;
    senderAvatar?: string;
    content: string;
    timestamp: Date;
}

interface ChatMessageBubbleProps {
    message: Message;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
    const { user } = useAuthStore();
    const isOwnMessage = message.senderId === user?.id;

    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
            <img
                src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
                alt={message.senderName}
                className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">
                        {isOwnMessage ? 'Bạn' : message.senderName}
                    </span>
                    <span className="text-xs text-gray-400">
                        {formatMessageTimestamp(message.timestamp, 'vi-VN')}
                    </span>
                </div>
                <div
                    className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatMessageBubble;

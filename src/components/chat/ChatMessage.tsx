import React from 'react';
import type { Message } from '../../data/mockChatData';

interface ChatMessageProps {
    message: Message;
    isOwnMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage = false }) => {
    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (days === 1) {
            return 'Yesterday ' + new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (days < 7) {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getRoleBadgeColor = (role: 'User' | 'Staff') => {
        return role === 'Staff'
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'bg-green-100 text-green-700 border-green-200';
    };

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
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor(message.senderRole)}`}>
                        {message.senderRole}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
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

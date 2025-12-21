import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import chatRoomService, { type ChatRoomMessageDto, type ChatRoomDetailDto } from '../../../services/chatRoomService';
import { useSignalRChat } from '../../../hooks/useSignalRChat';
import { useAuthStore } from '../../../services/userService';
import { PagePath } from '../../../enums/page-path.enum';
import { parseUTCTimestamp, formatMessageTimestamp } from '../../../utils/dateUtils';

interface UIMessage {
    id: number;
    senderId: number;
    senderName: string;
    senderAvatar?: string;
    content: string;
    timestamp: Date;
}

const transformMessage = (msg: ChatRoomMessageDto): UIMessage => ({
    id: msg.messageId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderAvatar: msg.avatar,
    content: msg.content,
    timestamp: parseUTCTimestamp(msg.sentAt)
});

const StaffChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<UIMessage[]>([]);
    const [roomDetails, setRoomDetails] = useState<ChatRoomDetailDto | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // SignalR integration
    const { isConnected, joinRoom, leaveRoom } = useSignalRChat({
        onMessageReceived: (message: ChatRoomMessageDto) => {
            console.log('[StaffChatRoom] Received message via SignalR:', {
                messageId: message.messageId,
                chatRoomId: message.chatRoomId,
                currentRoomId: roomId,
                isInCurrentRoom: roomId === message.chatRoomId.toString()
            });

            const uiMessage = transformMessage(message);

            // Only add messages that belong to the current room
            if (roomId && message.chatRoomId === parseInt(roomId)) {
                // Avoid duplicates - check if message already exists
                setMessages(prev => {
                    const exists = prev.some(msg =>
                        msg.id === uiMessage.id ||
                        (msg.content === uiMessage.content &&
                            msg.senderId === uiMessage.senderId &&
                            Math.abs(msg.timestamp.getTime() - uiMessage.timestamp.getTime()) < 2000)
                    );
                    return exists ? prev : [...prev, uiMessage];
                });
            }
        }
    });

    // Load room data on mount
    useEffect(() => {
        if (roomId) {
            loadRoomData(parseInt(roomId));
        }
    }, [roomId]);

    // Join SignalR room
    useEffect(() => {
        let retryTimeout: NodeJS.Timeout;

        const attemptJoinRoom = () => {
            if (roomId && isConnected) {
                console.log('[StaffChatRoom] Attempting to join room:', roomId, 'isConnected:', isConnected);
                joinRoom(parseInt(roomId));
            } else if (roomId && !isConnected) {
                console.log('[StaffChatRoom] Waiting for connection before joining room:', roomId);
                // Retry after a short delay
                retryTimeout = setTimeout(attemptJoinRoom, 1000);
            }
        };

        attemptJoinRoom();

        return () => {
            clearTimeout(retryTimeout);
            if (roomId) {
                console.log('[StaffChatRoom] Leaving room:', roomId);
                leaveRoom();
            }
        };
    }, [roomId, isConnected]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [messageInput]);

    const loadRoomData = async (id: number) => {
        try {
            setLoading(true);
            const [details, messageHistory] = await Promise.all([
                chatRoomService.getRoomDetails(id),
                chatRoomService.getMessagesByRoomId(id)
            ]);

            setRoomDetails(details);
            setMessages(messageHistory.map(transformMessage));
        } catch (error) {
            console.error('Failed to load room data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !roomId || !user) return;

        try {
            setSendingMessage(true);

            // Optimistic UI update - show message immediately
            const optimisticMessage: UIMessage = {
                id: -Date.now(), // Temporary negative ID
                senderId: user.id,
                senderName: user.fullName,
                senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                content: messageInput.trim(),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, optimisticMessage]);

            // Send to backend
            const response = await chatRoomService.sendMessage({
                chatRoomId: parseInt(roomId),
                content: messageInput.trim()
            });

            // Replace optimistic message with real one from server
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === optimisticMessage.id
                        ? transformMessage(response)
                        : msg
                )
            );

            setMessageInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id >= 0));
        } finally {
            setSendingMessage(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => navigate(PagePath.STAFF_CHAT)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-3 flex-1">
                    <img
                        src={roomDetails?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${roomId}`}
                        alt={roomDetails?.name || 'User'}
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 truncate">
                            {roomDetails?.name || 'Trò Chuyện'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-xs text-gray-500">
                                {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-sm">Chưa có tin nhắn</p>
                            <p className="text-xs mt-1">Gửi tin nhắn đầu tiên của bạn!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            const isOwnMessage = message.senderId === user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                                >
                                    <img
                                        src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
                                        alt={message.senderName}
                                        className="w-8 h-8 rounded-full flex-shrink-0"
                                    />
                                    <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-700">
                                                {isOwnMessage ? 'Bạn' : message.senderName}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatMessageTimestamp(message.timestamp, 'vi-VN')}
                                            </span>
                                        </div>
                                        <div
                                            className={`px-4 py-2 rounded-2xl ${isOwnMessage
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
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input Area */}
            <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex items-end gap-3 max-w-5xl mx-auto">
                    <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows={1}
                        style={{ maxHeight: '120px', minHeight: '48px' }}
                        disabled={sendingMessage}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendingMessage}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {sendingMessage ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffChatRoom;

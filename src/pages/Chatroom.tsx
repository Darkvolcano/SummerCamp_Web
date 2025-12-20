import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import ChatArea from '../components/chat/ChatArea';
import StaffSelectionModal from '../components/chat/StaffSelectionModal';
import Navbar from '../components/navbar/Navbar';
import { useSignalRChat } from '../hooks/useSignalRChat';
import chatRoomService, { type ChatRoomDetailDto, type ChatRoomMessageDto } from '../services/chatRoomService';
import { useAuthStore } from '../services/userService';

type ChatType = 'community' | 'private';

interface ActiveChat {
    type: ChatType;
    roomId?: number;
}

// Transform API message to UI message format
interface UIMessage {
    id: number;
    senderId: number;
    senderName: string;
    senderRole: string;
    senderAvatar?: string;
    content: string;
    timestamp: Date;
}

const transformMessage = (msg: ChatRoomMessageDto): UIMessage => ({
    id: msg.messageId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: 'User',
    senderAvatar: msg.avatar,
    content: msg.content,
    timestamp: new Date(msg.sentAt)
});

const Chatroom: React.FC = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const [activeChat, setActiveChat] = useState<ActiveChat>({ type: 'community' });
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [myRooms, setMyRooms] = useState<ChatRoomDetailDto[]>([]);
    const [currentMessages, setCurrentMessages] = useState<UIMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [initializing, setInitializing] = useState(false);

    // SignalR integration
    const { isConnected, joinRoom, leaveRoom } = useSignalRChat({
        onMessageReceived: (message: ChatRoomMessageDto) => {
            // Handle incoming real-time message
            const uiMessage = transformMessage(message);
            setCurrentMessages(prev => [...prev, uiMessage]);
        }
    });

    // Load user's chat rooms on mount
    useEffect(() => {
        loadMyRooms();
    }, []);

    // Handle navigation from staff detail page - auto-create/open private chat
    useEffect(() => {
        const navigationState = location.state as { staffId?: number } | null;
        if (navigationState?.staffId && !initializing) {
            handleSelectStaff(navigationState.staffId);
            // Clear the navigation state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Join/leave SignalR room when active chat changes
    useEffect(() => {
        if (activeChat.roomId && isConnected) {
            joinRoom(activeChat.roomId);
        }
        return () => {
            leaveRoom();
        };
    }, [activeChat.roomId, isConnected, joinRoom, leaveRoom]);

    const loadMyRooms = async () => {
        try {
            setLoading(true);
            const rooms = await chatRoomService.getMyRooms();
            setMyRooms(rooms);
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRoomMessages = async (roomId: number) => {
        try {
            const messages = await chatRoomService.getMessagesByRoomId(roomId);
            setCurrentMessages(messages.map(transformMessage));
        } catch (error) {
            console.error('Failed to load messages:', error);
            setCurrentMessages([]);
        }
    };

    // Get current messages based on active chat
    const getCurrentMessages = (): UIMessage[] => {
        return currentMessages;
    };

    // Get current chat title
    const getChatTitle = (): string => {
        if (activeChat.type === 'community') {
            return '#community-chat';
        } else if (activeChat.type === 'private' && activeChat.roomId) {
            const room = myRooms.find(r => r.chatRoomId === activeChat.roomId);
            return room?.name || 'Private Chat';
        }
        return 'Chat';
    };

    // Get current chat subtitle
    const getChatSubtitle = (): string | undefined => {
        if (activeChat.type === 'community') {
            return 'Community chat is coming soon!';
        } else if (activeChat.type === 'private') {
            return 'Private conversation';
        }
        return undefined;
    };

    // Handle sending messages
    const handleSendMessage = async (content: string) => {
        if (!activeChat.roomId) {
            console.error('No active room to send message');
            return;
        }

        try {
            setSendingMessage(true);
            await chatRoomService.sendMessage({
                chatRoomId: activeChat.roomId,
                content: content
            });
            // Message will be received via SignalR
        } catch (error) {
            console.error('Failed to send message:', error);
            // You might want to show a toast notification here
        } finally {
            setSendingMessage(false);
        }
    };

    // Handle staff selection for private chat
    const handleSelectStaff = async (staffId: number) => {
        try {
            setIsStaffModalOpen(false);
            setInitializing(true);
            setLoading(true);

            // Create or get existing private room
            const response = await chatRoomService.createOrGetPrivateRoom({
                recipientUserId: staffId
            });

            // Reload rooms to get the new/existing room
            await loadMyRooms();

            // Open the room
            setActiveChat({ type: 'private', roomId: response.chatRoomId });
            await loadRoomMessages(response.chatRoomId);
        } catch (error) {
            console.error('Failed to create/open private chat:', error);
        } finally {
            setLoading(false);
            setInitializing(false);
        }
    };

    // Handle opening private chat from list
    const handleOpenPrivateChat = async (roomId: number) => {
        setActiveChat({ type: 'private', roomId });
        await loadRoomMessages(roomId);
    };

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden">
            {/* Navbar */}
            <Navbar />

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex items-center justify-center bg-gray-100 mt-12">
                    <Spin size="large" />
                </div>
            )}

            {/* Chat Container - Account for navbar height */}
            {!loading && (
                <div className="flex-1 flex bg-gray-100 mt-12">
                    {/* Left Sidebar - Server/Community */}
                    <div className="w-20 bg-gray-900 flex flex-col items-center py-4 shadow-xl">
                        {/* Community Server Icon */}
                        <button
                            onClick={() => setActiveChat({ type: 'community' })}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all mb-3 hover:rounded-xl ${activeChat.type === 'community'
                                ? 'bg-blue-600 rounded-xl'
                                : 'bg-gray-700 hover:bg-blue-600'
                                }`}
                            title="Community Camp"
                        >
                            🏕️
                        </button>

                        {/* Divider */}
                        <div className="w-8 h-0.5 bg-gray-700 mb-3" />

                        {/* Help/Info */}
                        <button
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-gray-700 hover:bg-gray-600 hover:rounded-xl transition-all"
                            title="Help & Information"
                        >
                            ❓
                        </button>
                    </div>

                    {/* Channel/Chat Type Panel */}
                    <div className="w-64 bg-gray-800 flex flex-col shadow-xl">
                        {/* Server Header */}
                        <div className="h-16 px-4 flex items-center border-b border-gray-700 shadow-sm">
                            <h2 className="text-white font-semibold text-sm">Summer Camp Chat</h2>
                        </div>

                        {/* Channels Section */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Community Chat */}
                            <div className="px-2 py-4">
                                <div className="px-2 mb-2 text-gray-400 text-xs font-semibold uppercase tracking-wide">
                                    Text Channels
                                </div>
                                <button
                                    onClick={() => setActiveChat({ type: 'community' })}
                                    className={`w-full px-2 py-2 rounded flex items-center gap-2 text-gray-300 hover:bg-gray-700/50 transition-colors ${activeChat.type === 'community' ? 'bg-gray-700 text-white' : ''
                                        }`}
                                >
                                    <span className="text-gray-400">#</span>
                                    <span className="text-sm font-medium">community-chat</span>
                                    <span className="ml-auto text-xs text-yellow-500">Soon</span>
                                </button>
                            </div>

                            {/* Private Chats */}
                            <div className="px-2 py-4 border-t border-gray-700">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                                        Private Messages
                                    </div>
                                </div>

                                {/* Private Chat List */}
                                {myRooms.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-gray-500 text-xs">
                                        No private chats yet
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {myRooms.map((room) => (
                                            <button
                                                key={room.chatRoomId}
                                                onClick={() => handleOpenPrivateChat(room.chatRoomId)}
                                                className={`w-full px-2 py-2 rounded flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${activeChat.type === 'private' && activeChat.roomId === room.chatRoomId
                                                    ? 'bg-gray-700'
                                                    : ''
                                                    }`}
                                            >
                                                <img
                                                    src={room.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.chatRoomId}`}
                                                    alt={room.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="text-sm font-medium text-gray-300 truncate">
                                                        {room.name}
                                                    </div>
                                                    {room.lastMessage && (
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {room.lastMessage}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* User Panel */}
                        <div className="h-16 bg-gray-900 px-2 flex items-center gap-3 border-t border-gray-700">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                                alt={user?.fullName || 'User'}
                                className="w-9 h-9 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-semibold truncate">
                                    {user?.fullName || 'User'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
                                    <span className="text-gray-400 text-xs">{isConnected ? 'Online' : 'Connecting...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1">
                        {activeChat.type === 'community' ? (
                            <div className="h-full flex items-center justify-center bg-gray-50">
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4">🏕️</div>
                                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Community Chat</h3>
                                    <p className="text-gray-500">
                                        Community chat is coming soon! For now, you can chat with staff members privately.
                                    </p>
                                </div>
                            </div>
                        ) : activeChat.roomId ? (
                            <ChatArea
                                messages={getCurrentMessages()}
                                chatTitle={getChatTitle()}
                                chatSubtitle={getChatSubtitle()}
                                onSendMessage={handleSendMessage}
                                disabled={sendingMessage}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-50">
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4">💬</div>
                                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Chat</h3>
                                    <p className="text-gray-500">
                                        Select a conversation from the sidebar to start chatting
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        To chat with staff, visit their profile page and click "Nhắn tin với nhân viên"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Staff Selection Modal */}
                    <StaffSelectionModal
                        isOpen={isStaffModalOpen}
                        onClose={() => setIsStaffModalOpen(false)}
                        onSelectStaff={handleSelectStaff}
                    />
                </div>
            )}
        </div>
    );
};

export default Chatroom;

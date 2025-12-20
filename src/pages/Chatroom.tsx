import React, { useState, useEffect } from 'react';
import type { Message, PrivateChat, Staff } from '../data/mockChatData';
import {
    currentUser,
    mockCommunityMessages,
    getEligibleStaff,
    getPrivateMessages,
    getUserPrivateChats,
    getStaffById,
    addMessage
} from '../data/mockChatData';
import ChatArea from '../components/chat/ChatArea';
import StaffSelectionModal from '../components/chat/StaffSelectionModal';
type ChatType = 'community' | 'private';

interface ActiveChat {
    type: ChatType;
    staffId?: number;
}

const Chatroom: React.FC = () => {
    const [activeChat, setActiveChat] = useState<ActiveChat>({ type: 'community' });
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [communityMessages, setCommunityMessages] = useState<Message[]>(mockCommunityMessages);
    const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
    const [eligibleStaff] = useState<Staff[]>(getEligibleStaff(currentUser.id));

    // Load private chats on mount
    useEffect(() => {
        setPrivateChats(getUserPrivateChats(currentUser.id));
    }, []);

    // Get current messages based on active chat
    const getCurrentMessages = (): Message[] => {
        if (activeChat.type === 'community') {
            return communityMessages;
        } else if (activeChat.type === 'private' && activeChat.staffId) {
            return getPrivateMessages(currentUser.id, activeChat.staffId);
        }
        return [];
    };

    // Get current chat title
    const getChatTitle = (): string => {
        if (activeChat.type === 'community') {
            return '#community-chat';
        } else if (activeChat.type === 'private' && activeChat.staffId) {
            const staff = getStaffById(activeChat.staffId);
            return staff?.name || 'Private Chat';
        }
        return 'Chat';
    };

    // Get current chat subtitle
    const getChatSubtitle = (): string | undefined => {
        if (activeChat.type === 'community') {
            return 'Chat with all camp members and staff';
        } else if (activeChat.type === 'private' && activeChat.staffId) {
            return 'Private conversation';
        }
        return undefined;
    };

    // Handle sending messages
    const handleSendMessage = (content: string) => {
        const newMessage = addMessage({
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            senderAvatar: currentUser.avatar,
            content,
            chatType: activeChat.type,
            recipientId: activeChat.staffId
        });

        if (activeChat.type === 'community') {
            setCommunityMessages([...communityMessages, newMessage]);
        } else {
            // Refresh private chats to show new message
            setPrivateChats(getUserPrivateChats(currentUser.id));
        }
    };

    // Handle staff selection for private chat
    const handleSelectStaff = (staffId: number) => {
        setActiveChat({ type: 'private', staffId });

        // Add to private chats if not already exists
        const existingChat = privateChats.find(chat => chat.staffId === staffId);
        if (!existingChat) {
            setPrivateChats([...privateChats, {
                id: `${currentUser.id}-${staffId}`,
                userId: currentUser.id,
                staffId,
            }]);
        }
    };

    // Handle opening private chat from list
    const handleOpenPrivateChat = (staffId: number) => {
        setActiveChat({ type: 'private', staffId });
    };

    return (
        <div className="h-screen flex bg-gray-100">
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
                    <h2 className="text-white font-semibold text-sm">Community Camp</h2>
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
                        </button>
                    </div>

                    {/* Private Chats */}
                    <div className="px-2 py-4 border-t border-gray-700">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                                Private Messages
                            </div>
                            <button
                                onClick={() => setIsStaffModalOpen(true)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Start new private chat"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Private Chat List */}
                        {privateChats.length === 0 ? (
                            <div className="px-2 py-4 text-center text-gray-500 text-xs">
                                No private chats yet
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {privateChats.map((chat) => {
                                    const staff = getStaffById(chat.staffId);
                                    if (!staff) return null;

                                    return (
                                        <button
                                            key={chat.id}
                                            onClick={() => handleOpenPrivateChat(chat.staffId)}
                                            className={`w-full px-2 py-2 rounded flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${activeChat.type === 'private' && activeChat.staffId === chat.staffId
                                                ? 'bg-gray-700'
                                                : ''
                                                }`}
                                        >
                                            <img
                                                src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`}
                                                alt={staff.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="text-sm font-medium text-gray-300 truncate">
                                                    {staff.name}
                                                </div>
                                                {chat.lastMessage && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {chat.lastMessage.content}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Chat with Staff Button */}
                    <div className="px-2 pb-4">
                        <button
                            onClick={() => setIsStaffModalOpen(true)}
                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span>💬</span>
                            <span>Chat with Staff</span>
                        </button>
                    </div>
                </div>

                {/* User Panel */}
                <div className="h-16 bg-gray-900 px-2 flex items-center gap-3 border-t border-gray-700">
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                            {currentUser.name}
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-gray-400 text-xs">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1">
                <ChatArea
                    messages={getCurrentMessages()}
                    chatTitle={getChatTitle()}
                    chatSubtitle={getChatSubtitle()}
                    onSendMessage={handleSendMessage}
                />
            </div>

            {/* Staff Selection Modal */}
            <StaffSelectionModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                eligibleStaff={eligibleStaff}
                onSelectStaff={handleSelectStaff}
            />
        </div>
    );
};

export default Chatroom;

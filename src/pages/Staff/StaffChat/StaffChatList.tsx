import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import axios from '../../../config/axios';
import chatRoomService from '../../../services/chatRoomService';

interface User {
    userId: number;
    fullName: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface ExistingRoom {
    chatRoomId: number;
    name: string;
    avatarUrl?: string;
    lastMessage?: string;
    lastMessageTime?: string;
}

const StaffChatList: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [existingRooms, setExistingRooms] = useState<ExistingRoom[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [creatingChat, setCreatingChat] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersResponse, roomsResponse] = await Promise.all([
                axios.get('/user-account'),
                chatRoomService.getMyRooms()
            ]);

            // Filter only parents/users (not staff)
            const parentUsers = (usersResponse.data || []).filter(
                (user: User) => user.role?.toLowerCase() !== 'staff'
            );

            setUsers(parentUsers);
            setExistingRooms(roomsResponse);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (userId: number) => {
        try {
            setCreatingChat(userId);
            const response = await chatRoomService.createOrGetPrivateRoom({
                recipientUserId: userId
            });

            // Navigate to the staff chat room
            navigate(`/staff/chat/${response.chatRoomId}`);
        } catch (error) {
            console.error('Failed to create chat:', error);
        } finally {
            setCreatingChat(null);
        }
    };

    const handleRoomClick = (roomId: number) => {
        navigate(`/staff/chat/${roomId}`);
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={28} />
                        Trò Chuyện với Phụ Huynh
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tìm kiếm và bắt đầu trò chuyện với phụ huynh
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : (
                        <>
                            {/* Existing Conversations */}
                            {existingRooms.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Cuộc Trò Chuyện Gần Đây
                                    </h2>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                                        {existingRooms.map((room) => (
                                            <button
                                                key={room.chatRoomId}
                                                onClick={() => handleRoomClick(room.chatRoomId)}
                                                className="w-full px-6 py-4 hover:bg-blue-50 transition-colors text-left flex items-center gap-4"
                                            >
                                                <img
                                                    src={room.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.chatRoomId}`}
                                                    alt={room.name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {room.name}
                                                    </h3>
                                                    {room.lastMessage && (
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {room.lastMessage}
                                                        </p>
                                                    )}
                                                </div>
                                                <MessageSquare className="text-gray-400" size={20} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Parents */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Danh Sách Phụ Huynh
                                </h2>
                                {filteredUsers.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                                        <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
                                        <p className="text-gray-500">
                                            {searchQuery ? 'Không tìm thấy phụ huynh' : 'Chưa có phụ huynh nào'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.userId}
                                                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`}
                                                        alt={user.fullName}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {user.fullName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleStartChat(user.userId)}
                                                    disabled={creatingChat === user.userId}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    {creatingChat === user.userId ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={16} />
                                                            <span>Đang mở...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageSquare size={16} />
                                                            <span>Trò Chuyện</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffChatList;

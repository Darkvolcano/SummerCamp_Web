import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import chatRoomService from '../../../services/chatRoomService';

interface ExistingRoom {
    chatRoomId: number;
    name: string;
    avatarUrl?: string;
    lastMessage?: string;
    lastMessageTime?: string;
}

const StaffChatList: React.FC = () => {
    const navigate = useNavigate();
    const [existingRooms, setExistingRooms] = useState<ExistingRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const roomsResponse = await chatRoomService.getMyRooms();
            setExistingRooms(roomsResponse);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomClick = (roomId: number) => {
        navigate(`/staff/chat/${roomId}`);
    };

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
                                                className="w-full px-6 py-4 bg-white hover:bg-blue-50 transition-colors text-left flex items-center gap-4"
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
                                                        <p className="text-sm text-gray-600 truncate">
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



                            {/* Empty State */}
                            {existingRooms.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <MessageSquare className="text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-500 text-lg">Bạn chưa có cuộc trò chuyện nào</p>
                                </div>
                            )}

                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffChatList;

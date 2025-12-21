import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import axios from 'axios';

interface User {
    userId: number;
    fullName: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface StaffSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStaff: (staffId: number) => void;
}

const StaffSelectionModal: React.FC<StaffSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelectStaff
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/user-account');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStaffClick = (userId: number) => {
        onSelectStaff(userId);
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    💬 Start a Conversation
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Select a user to chat with
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* User List */}
                    <div className="overflow-y-auto max-h-[60vh]">
                        {loading ? (
                            <div className="p-8 flex justify-center">
                                <Spin size="large" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-3">🤷‍♂️</div>
                                <p className="text-sm">
                                    {searchQuery ? 'No users found' : 'No users available'}
                                </p>
                                <p className="text-xs mt-1">
                                    {searchQuery ? 'Try a different search' : 'Please check back later'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <button
                                        key={user.userId}
                                        onClick={() => handleStaffClick(user.userId)}
                                        className="w-full px-6 py-4 hover:bg-blue-50 transition-colors text-left flex items-center gap-4"
                                    >
                                        <img
                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`}
                                            alt={user.fullName}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 truncate">
                                                    {user.fullName}
                                                </h4>
                                                {user.role && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                        {user.role}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaffSelectionModal;

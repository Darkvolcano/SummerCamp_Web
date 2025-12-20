import React from 'react';
import type { Staff } from '../../data/mockChatData';
import { getCampById } from '../../data/mockChatData';

interface StaffSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    eligibleStaff: Staff[];
    onSelectStaff: (staffId: number) => void;
}

const StaffSelectionModal: React.FC<StaffSelectionModalProps> = ({
    isOpen,
    onClose,
    eligibleStaff,
    onSelectStaff
}) => {
    if (!isOpen) return null;

    const handleStaffClick = (staffId: number) => {
        onSelectStaff(staffId);
        onClose();
    };

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
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                💬 Chat with Staff
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Select a staff member from your camp
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

                    {/* Staff List */}
                    <div className="overflow-y-auto max-h-[60vh]">
                        {eligibleStaff.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-3">🤷‍♂️</div>
                                <p className="text-sm">No staff members available</p>
                                <p className="text-xs mt-1">Please check back later</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {eligibleStaff.map((staff) => {
                                    const camp = getCampById(staff.campId);
                                    return (
                                        <button
                                            key={staff.id}
                                            onClick={() => handleStaffClick(staff.id)}
                                            className="w-full p-4 flex items-center gap-4 hover:bg-blue-50 transition-colors text-left"
                                        >
                                            {/* Avatar */}
                                            <img
                                                src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.id}`}
                                                alt={staff.name}
                                                className="w-12 h-12 rounded-full ring-2 ring-white shadow-md"
                                            />

                                            {/* Staff Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        {staff.name}
                                                    </h4>
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                                        Staff
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {camp?.name || `Camp ${staff.campId}`}
                                                </p>
                                            </div>

                                            {/* Arrow Icon */}
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
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaffSelectionModal;

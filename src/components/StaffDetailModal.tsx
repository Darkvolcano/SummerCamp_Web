import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import userAccountService, {
  type UserAccountResponseDto,
} from '../services/userAccountService';
import { useNotification } from '../contexts/NotificationContext';

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const { toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserAccountResponseDto | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchStaffDetails();
    }
  }, [isOpen, userId]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const user = await userAccountService.getUserById(userId);
      setUserData(user);
    } catch (error: any) {
      console.error('Error fetching staff details:', error);
      let errorMsg = 'Failed to load staff details';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleClose = () => {
    setUserData(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <User size={20} className="text-[#6366F1]" />
          <span className="text-lg font-bold text-[#111827]">Staff Details</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading staff details..." />
        </div>
      ) : userData ? (
        <div className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6 pb-6 border-b border-[#E5E7EB]">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt={`${userData.firstName} ${userData.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#6366F1] shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center border-4 border-[#6366F1] shadow-lg">
                  <User size={40} className="text-white" />
                </div>
              )}
            </div>

            {/* Name and Role */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#111827] mb-2">
                {userData.firstName} {userData.lastName}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-[#6366F1]" />
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#EFF6FF] text-[#3B82F6]">
                  {userData.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userData.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Contact Information
            </h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Email</p>
                  <p className="text-sm text-[#111827] font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Phone Number</p>
                  <p className="text-sm text-[#111827] font-medium">
                    {userData.phoneNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6B7280] font-medium">Date of Birth</p>
                  <p className="text-sm text-[#111827] font-medium">
                    {formatDate(userData.dateOfBirth)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-[#6B7280]">
          No staff data available
        </div>
      )}
    </Modal>
  );
};

export default StaffDetailModal;

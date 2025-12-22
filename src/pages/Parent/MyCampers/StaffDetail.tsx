import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ArrowLeft, User, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import userAccountService, { type UserAccountResponseDto } from '../../../services/userAccountService';
import { useNotification } from '../../../contexts/NotificationContext';
import { PagePath } from '../../../enums/page-path.enum';

const StaffDetail: React.FC = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const { toastError } = useNotification();

  const [staff, setStaff] = useState<UserAccountResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffDetails = async () => {
      if (!staffId) return;

      try {
        setLoading(true);
        const staffData = await userAccountService.getUserById(parseInt(staffId));
        setStaff(staffData);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Không thể tải thông tin nhân viên';
        toastError('Cảnh báo', errorMessage);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, [staffId, toastError, navigate]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải thông tin nhân viên...
          </p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Không tìm thấy thông tin nhân viên</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          <span>Quay lại</span>
        </button>

        {/* Staff Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              {staff.avatar ? (
                <img
                  src={staff.avatar}
                  alt={`${staff.firstName} ${staff.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="text-6xl text-[#6366F1]" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {staff.firstName} {staff.lastName}
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              {staff.role === 'Staff' ? 'Nhân viên' : staff.role}
            </p>
          </div>

          {/* Contact Information */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-600">
              Thông tin liên hệ
            </h2>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-xl text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                  <p className="text-base text-gray-900 font-semibold">{staff.email}</p>
                </div>
              </div>

              {/* Phone Number */}
              {staff.phoneNumber && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="text-xl text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Số điện thoại</p>
                    <p className="text-base text-gray-900 font-semibold">{staff.phoneNumber}</p>
                  </div>
                </div>
              )}

              {/* Date of Birth */}
              {staff.dateOfBirth && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-xl text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">Ngày sinh</p>
                    <p className="text-base text-gray-900 font-semibold">
                      {formatDate(staff.dateOfBirth)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(PagePath.CHAT, { state: { staffId: parseInt(staffId!) } })}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <MessageSquare size={24} />
                <span className="text-lg">Nhắn tin với nhân viên</span>
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Bắt đầu cuộc trò chuyện trực tiếp với nhân viên
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetail;

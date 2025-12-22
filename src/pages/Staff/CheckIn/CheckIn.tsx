import React, { useEffect, useState } from "react";
import { Spin, Empty } from "antd";
import { CheckCircle, Clock, AlertCircle, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import { useStaffContext } from "../../../hooks/useStaffContext";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { toastError } = useNotification();
  const { selectedCampId } = useStaffContext();

  const [schedules, setSchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch check-in/check-out schedules when camp is selected
  useEffect(() => {
    if (!selectedCampId) return;

    const loadSchedules = async () => {
      try {
        setLoading(true);
        const data = await activityScheduleService.getAttendancesCheckinCheckoutByCampId(selectedCampId);
        setSchedules(data);
      } catch (error: any) {
        console.error("Failed to load check-in/check-out schedules:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.title || "Không thể tải lịch trình checkIn/Out";
        toastError('Cảnh báo', errorMessage);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [selectedCampId, toastError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" };
      case "PendingAttendance":
        return { icon: Clock, color: "text-orange-600", bg: "bg-orange-50" };
      case "Cancelled":
        return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" };
      default:
        return { icon: Clock, color: "text-gray-600", bg: "bg-gray-50" };
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "Checkin":
        return "text-green-600 bg-green-100";
      case "Checkout":
        return "text-red-600 bg-red-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Checkin":
        return <LogIn size={20} />;
      case "Checkout":
        return <LogOut size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckAttendance = (schedule: ActivityScheduleResponseDto) => {
    // Navigate to camper attendance list page (reusing the same page as attendance)
    navigate(`/staff/attendance/${schedule.activityScheduleId}/campers`, {
      state: { schedule },
    });
  };

  // If no camp selected
  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            Chọn Trại
          </h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Vui lòng chọn một chương trình trại từ menu bên trái để xem lịch checkIn/Out
          </p>
        </div>
      </div>
    );
  }

  if (loading && schedules.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải lịch trình..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Check In / Check Out
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Quản lý hoạt động checkIn và checkOut của trại viên
        </p>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-12">
          <Empty
            description="Không tìm thấy hoạt động checkIn/Out nào"
            style={{ marginTop: 0 }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const statusInfo = getStatusColor(schedule.status);
            const StatusIcon = statusInfo.icon;
            const activityTypeStyle = getActivityTypeColor(schedule.activity?.activityType || "");

            return (
              <div
                key={schedule.activityScheduleId}
                className={`bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow ${statusInfo.bg}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 ${statusInfo.color}`}>
                    <StatusIcon size={24} />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {schedule.activity?.name || "Untitled Activity"}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${activityTypeStyle}`}>
                        {getActivityIcon(schedule.activity?.activityType || "")}
                        {schedule.activity?.activityType}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>
                          {formatDateTime(schedule.startTime)} -{" "}
                          {formatDateTime(schedule.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Trạng thái:</span>
                        <span className={statusInfo.color}>{schedule.status}</span>
                      </div>
                      {schedule.location && (
                        <div className="col-span-full flex items-center gap-2">
                          <span className="font-medium">Địa điểm:</span>
                          <span>{schedule.location.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0 self-center">
                    <button
                      onClick={() => handleCheckAttendance(schedule)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {schedule.status === "Completed" ? "Xem Chi Tiết" : "Điểm Danh"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CheckIn;

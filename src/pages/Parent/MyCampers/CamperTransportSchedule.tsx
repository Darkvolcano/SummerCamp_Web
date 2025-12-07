import React, { useEffect, useState } from "react";
import { Spin, Empty, Badge, Card } from "antd";
import { ArrowLeftOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, CarOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import transportScheduleService, {
  type TransportScheduleResponseDto,
} from "../../../services/transportScheduleService";
import camperService, { type CamperResponseDto } from "../../../services/camperService";
import { TransportScheduleStatus } from "../../../enums/transportSchedule-status.enum";

const CamperTransportSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { camperId, campId } = useParams<{ camperId: string; campId: string }>();
  const { toastError } = useNotification();

  const [camper, setCamper] = useState<CamperResponseDto | null>(null);
  const [schedules, setSchedules] = useState<TransportScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch camper details and transport schedules
  useEffect(() => {
    const fetchData = async () => {
      if (!camperId || !campId) return;

      try {
        setLoading(true);
        const camperIdNum = parseInt(camperId);
        const campIdNum = parseInt(campId);

        // Fetch camper details
        const camperData = await camperService.getCamperById(camperIdNum);
        setCamper(camperData);

        // Fetch transport schedules for this camper
        const schedulesData = await transportScheduleService.getSchedulesByCamperId(camperIdNum);
        
        // Filter to only show schedules for the selected camp
        const filteredSchedules = schedulesData.filter(
          (schedule) => schedule.campName.campId === campIdNum
        );

        setSchedules(filteredSchedules);
      } catch (error: any) {
        console.error("Failed to load transport schedules:", error);
        const errorMessage =
          error.response?.data?.message || "Không thể tải lịch đưa đón";
        toastError("Lỗi", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [camperId, campId, toastError]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: TransportScheduleStatus) => {
    switch (status) {
      case TransportScheduleStatus.DRAFT:
        return "default";
      case TransportScheduleStatus.NOT_YET:
        return "default";
      case TransportScheduleStatus.REJECTED:
        return "error";
      case TransportScheduleStatus.CANCELED:
        return "error";
      case TransportScheduleStatus.IN_PROGRESS:
        return "processing";
      case TransportScheduleStatus.COMPLETED:
        return "success";
      default:
        return "default";
    }
  };

  // Get status text
  const getStatusText = (status: TransportScheduleStatus) => {
    switch (status) {
      case TransportScheduleStatus.DRAFT:
        return "Nháp";
      case TransportScheduleStatus.NOT_YET:
        return "Chưa bắt đầu";
      case TransportScheduleStatus.REJECTED:
        return "Bị từ chối";
      case TransportScheduleStatus.CANCELED:
        return "Đã hủy";
      case TransportScheduleStatus.IN_PROGRESS:
        return "Đang diễn ra";
      case TransportScheduleStatus.COMPLETED:
        return "Hoàn thành";
      default:
        return status;
    }
  };

  // Get transport type text
  const getTransportTypeText = (type: string | null) => {
    if (!type) return "N/A";
    return type === "PickUp" ? "Đón" : type === "DropOff" ? "Trả" : type;
  };

  // Get transport type color
  const getTransportTypeColor = (type: string | null) => {
    if (!type) return "#666";
    return type === "PickUp" ? "#52c41a" : type === "DropOff" ? "#1890ff" : "#666";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-[#6366F1] hover:text-[#4F46E5] transition-colors mb-4"
        >
          <ArrowLeftOutlined />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Lịch Đưa Đón
            </h1>
            {camper && (
              <p className="text-[#6B7280] text-sm mt-1">
                Camper: <span className="font-medium text-[#111827]">{camper.camperName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12">
          <Empty
            description={
              <span className="text-[#6B7280]">
                Chưa có lịch đưa đón nào cho trại này
              </span>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedules.map((schedule) => (
            <Card
              key={schedule.transportScheduleId}
              className="shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB]"
              bodyStyle={{ padding: "20px" }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left side - Main info */}
                <div className="flex-1">
                  {/* Transport Type Badge */}
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getTransportTypeColor(schedule.transportType)}15`,
                        color: getTransportTypeColor(schedule.transportType),
                      }}
                    >
                      <CarOutlined className="mr-1" />
                      {getTransportTypeText(schedule.transportType)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-[#111827] font-semibold mb-2">
                    <CalendarOutlined className="text-[#6366F1]" />
                    <span>{formatDate(schedule.date)}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-[#6B7280] mb-2">
                    <ClockCircleOutlined />
                    <span>
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                    {schedule.actualStartTime && schedule.actualEndTime && (
                      <span className="text-xs text-[#10B981] ml-2">
                        (Thực tế: {formatTime(schedule.actualStartTime)} - {formatTime(schedule.actualEndTime)})
                      </span>
                    )}
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 text-[#6B7280] mb-2">
                    <EnvironmentOutlined />
                    <span>
                      Tuyến đường: <span className="font-medium text-[#111827]">{schedule.routeName?.routeName || "N/A"}</span>
                    </span>
                  </div>

                  {/* Driver & Vehicle */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                    <div>
                      Tài xế: <span className="font-medium text-[#111827]">{schedule.driverFullName?.fullName || "N/A"}</span>
                    </div>
                    <div>
                      Xe: <span className="font-medium text-[#111827]">{schedule.vehicleName?.vehicleName || "N/A"}</span>
                    </div>
                  </div>

                  {/* Cancel Reason */}
                  {(schedule.status === TransportScheduleStatus.CANCELED || schedule.status === TransportScheduleStatus.REJECTED) && schedule.cancelReasons && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">
                          {schedule.status === TransportScheduleStatus.REJECTED ? "Lý do từ chối: " : "Lý do hủy: "}
                        </span>
                        {schedule.cancelReasons}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side - Status */}
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    status={getStatusColor(schedule.status)}
                    text={
                      <span className="text-sm font-medium">
                        {getStatusText(schedule.status)}
                      </span>
                    }
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && schedules.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Thống kê</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#6366F1]">{schedules.length}</p>
              <p className="text-sm text-[#6B7280]">Tổng chuyến</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#10B981]">
                {schedules.filter((s) => s.status === TransportScheduleStatus.COMPLETED).length}
              </p>
              <p className="text-sm text-[#6B7280]">Hoàn thành</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#F59E0B]">
                {schedules.filter((s) => s.status === TransportScheduleStatus.NOT_YET || s.status === TransportScheduleStatus.DRAFT).length}
              </p>
              <p className="text-sm text-[#6B7280]">Chưa diễn ra</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#EF4444]">
                {schedules.filter((s) => s.status === TransportScheduleStatus.CANCELED || s.status === TransportScheduleStatus.REJECTED).length}
              </p>
              <p className="text-sm text-[#6B7280]">Đã hủy/Từ chối</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CamperTransportSchedule;

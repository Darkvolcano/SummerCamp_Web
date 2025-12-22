import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../../services/activityScheduleService";
import campService, {
  type CampResponseDto,
} from "../../../../services/campService";
import { useNotification } from "../../../../contexts/NotificationContext";
import Calendar from "../../../../components/calander/Calendar";
import ScheduleDetail from "../../../../components/schedule/ScheduleDetail";

interface CampDetailScheduleProps {
  campId: number;
  campStatus?: string;
}

const CampDetailSchedule: React.FC<CampDetailScheduleProps> = ({
  campId,
  campStatus,
}) => {
  const { toastError } = useNotification();

  const [schedules, setSchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ActivityScheduleResponseDto | null>(null);

  // Fetch schedules
  useEffect(() => {
    if (!campId) {
      setSchedules([]);
      setCampData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedulesData, campInfo] = await Promise.all([
          activityScheduleService.getActivitySchedulesByCamp(campId),
          campService.getCampById(campId),
        ]);
        setSchedules(schedulesData);
        setCampData(campInfo);
      } catch (error) {
        console.error("Failed to load schedules:", error);
        toastError('Cảnh báo', "Không thể tải lịch trình hoạt động");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campId, toastError]);

  // Handle view schedule detail
  const handleViewSchedule = (event: any) => {
    const scheduleId = parseInt(event.id, 10);
    const selectedSchedule = schedules.find(
      (s) => s.activityScheduleId === scheduleId
    );

    if (selectedSchedule) {
      setSelectedSchedule(selectedSchedule);
      setShowScheduleDetail(true);
    } else {
      toastError('Cảnh báo', "Không tìm thấy lịch trình");
    }
  };

  if (campStatus === "Draft" || campStatus === "DRAFT") {
    return (
      <div className="pb-12">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              Trại chưa được thiết lập
            </h3>
            <p className="text-blue-700 mb-4">
              Trại của bạn vẫn đang ở trạng thái 'Draft'. Vui lòng hoàn thành thiết lập trại để tiếp tục.
            </p>
            <p className="text-sm text-blue-600">
              Vui lòng chỉ định một quản lý và chờ họ thiết lập trại để tiếp tục.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && schedules.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  // Convert schedules to calendar activity format
  const calendarActivities = schedules.map((schedule) => ({
    id: schedule.activityScheduleId.toString(),
    title: schedule.activity?.name || "Chưa đặt tên",
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    type: (schedule.activity?.activityType || "Core") as
      | "Core"
      | "Optional"
      | "Resting"
      | "Checkin"
      | "Checkout",
    description: `Trạng thái: ${schedule.status}`,
    location: schedule.location?.name || "Không có địa điểm",
    participants: schedule.currentCapacity || 0,
    isOptional: schedule.isOptional,
  }));

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Lịch trình hoạt động
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Xem lịch trình hoạt động cho trại này (Chỉ xem)
        </p>
      </div>

      <div className="activity-schedule-calendar">
        <Calendar
          activities={calendarActivities}
          campInfo={
            campData
              ? {
                campId: campData.campId,
                name: campData.name,
                startDate: campData.startDate,
                endDate: campData.endDate,
              }
              : undefined
          }
          userRole="admin"
          onSelectSchedule={handleViewSchedule}
        // No onAddClick - Admin cannot add schedules
        // No onSelectSlot - Admin cannot select slots to create
        // No onCreateOptional - Admin cannot create optional activities
        />
      </div>

      {/* Schedule Detail Modal - Read-only for Admin */}
      {showScheduleDetail && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          userRole="admin"
          onClose={() => {
            setShowScheduleDetail(false);
            setSelectedSchedule(null);
          }}
        // No onEdit - Admin cannot edit
        // No onDelete - Admin cannot delete
        />
      )}
    </div>
  );
};

export default CampDetailSchedule;

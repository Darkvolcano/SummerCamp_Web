import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useManagerContext } from "../../../hooks/useManagerContext";
import activityService, {
  type ActivityResponseDto,
} from "../../../services/activityService";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";
import campService, {
  type CampResponseDto,
} from "../../../services/campService";
import { useNotification } from "../../../contexts/NotificationContext";
import Calendar from "../../../components/calander/Calendar";
import ScheduleForm from "../../../components/schedule/ScheduleForm";
import ScheduleDetail from "../../../components/schedule/ScheduleDetail";

const ActivityScheduleManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastError, toastSuccess } = useNotification();

  const [activities, setActivities] = useState<ActivityResponseDto[]>([]);
  const [schedules, setSchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ActivityScheduleResponseDto | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: Date;
    endTime: Date;
  } | null>(null);

  // Fetch activities and schedules
  useEffect(() => {
    if (!selectedCampId) {
      setActivities([]);
      setSchedules([]);
      setCampData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesData, schedulesData, campInfo] = await Promise.all([
          activityService.getActivitiesByCampId(selectedCampId),
          activityScheduleService.getActivitySchedulesByCamp(selectedCampId),
          campService.getCampById(selectedCampId),
        ]);
        setActivities(activitiesData);
        setSchedules(schedulesData);
        setCampData(campInfo);
      } catch (error) {
        console.error("Failed to load activities and schedules:", error);
        toastError("Lỗi", "Không thể tải hoạt động và lịch trình");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId, toastError]);

  // Handle add schedule
  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setSelectedSlot(null);
    setShowScheduleForm(true);
  };

  // Handle slot selection from calendar
  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    view: string;
  }) => {
    setSelectedSchedule(null);
    setSelectedSlot({
      startTime: slotInfo.start,
      endTime: slotInfo.end,
    });
    setShowScheduleForm(true);
  };

  // Handle view schedule detail
  const handleViewSchedule = (event: any) => {
    // Calendar passes Activity object with id field
    // We need to find the actual schedule from schedules array by ID
    const scheduleId = parseInt(event.id, 10);
    const selectedSchedule = schedules.find(
      (s) => s.activityScheduleId === scheduleId
    );

    if (selectedSchedule) {
      setSelectedSchedule(selectedSchedule);
      setShowScheduleDetail(true);
    } else {
      toastError("Lỗi", "Không tìm thấy lịch trình");
    }
  };

  // Handle edit schedule
  const handleEditSchedule = () => {
    setShowScheduleDetail(false);
    setShowScheduleForm(true);
  };

  // Handle save schedule
  const handleSaveSchedule = async (scheduleData: any) => {
    try {
      setLoading(true);

      if (!selectedCampId) {
        toastError("Lỗi", "Chưa chọn trại hè");
        return;
      }

      setSchedules((prev) => [...prev, scheduleData]);
      setShowScheduleForm(false);
      setSelectedSchedule(null);

      const updatedSchedules = await activityScheduleService.getActivitySchedulesByCamp(selectedCampId);
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toastError("Lỗi", "Không thể lưu lịch trình");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      setLoading(true);
      
      // Call API to delete schedule
      await activityScheduleService.deleteActivitySchedule(scheduleId);
      
      toastSuccess("Thành công", "Đã huỷ lịch trình hoạt động");
      
      // Refresh schedules list
      if (selectedCampId) {
        const updatedSchedules = await activityScheduleService.getActivitySchedulesByCamp(selectedCampId);
        setSchedules(updatedSchedules);
      }
      
      setShowScheduleDetail(false);
    } catch (error: any) {
      console.error("Failed to delete schedule:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Không thể huỷ lịch trình";
      toastError("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            Chọn Trại
          </h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Vui lòng chọn một trại từ thanh bên trái để quản lý hoạt động
          </p>
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
    title: schedule.activity?.name || "Untitled",
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    type: (schedule.activity?.activityType || "Core") as
      | "Core"
      | "Optional"
      | "Resting"
      | "Checkin"
      | "Checkout",
    description: `Status: ${schedule.status}`,
    location: schedule.location?.name || "No location",
    participants: schedule.currentCapacity || 0,
    isOptional: schedule.isOptional,
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Quản Lý Lịch Trình Hoạt Động
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Tạo và quản lý lịch trình hoạt động cho trại của bạn
        </p>
        
        {/* Camp Date Info */}
        {campData && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold text-blue-700">Camp Period:</span>
            <span className="text-xs font-medium text-blue-900">
              {new Date(campData.startDate).toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {' → '}
              {new Date(campData.endDate).toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
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
          userRole="manager"
          onSelectSchedule={handleViewSchedule}
          onAddClick={handleAddSchedule}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <ScheduleForm
          schedule={selectedSchedule}
          activities={activities}
          campId={selectedCampId}
          initialStartTime={selectedSlot?.startTime}
          initialEndTime={selectedSlot?.endTime}
          onClose={() => {
            setShowScheduleForm(false);
            setSelectedSchedule(null);
            setSelectedSlot(null);
          }}
          onSave={handleSaveSchedule}
          onActivityCreated={(newActivity) => {
            setActivities((prev) => [...prev, newActivity]);
          }}
        />
      )}

      {/* Schedule Detail Modal */}
      {showScheduleDetail && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          userRole="manager"
          onClose={() => {
            setShowScheduleDetail(false);
            setSelectedSchedule(null);
          }}
          onEdit={handleEditSchedule}
          onDelete={() => {
            handleDeleteSchedule(selectedSchedule.activityScheduleId);
            setShowScheduleDetail(false);
          }}
        />
      )}
    </div>
  );
};

export default ActivityScheduleManagement;

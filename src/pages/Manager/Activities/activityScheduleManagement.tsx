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
  const { toastError } = useNotification();

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteSchedule = async (_scheduleId: number) => {
    try {
      setLoading(true);
      // await activityScheduleService.deleteActivitySchedule(scheduleId);
      // TODO: Implement delete method in activityScheduleService
      toastError("Chưa Triển Khai", "Chức năng xóa lịch trình chưa khả dụng. Vui lòng liên hệ quản trị viên.");
      setShowScheduleDetail(false);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      toastError("Lỗi", "Không thể xóa lịch trình");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            Select Camp
          </h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Please select a camp from the left sidebar to manage activities
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
      | "CheckIn"
      | "CheckOut",
    description: `Status: ${schedule.status}`,
    location: schedule.location?.name || "Không có địa điểm",
    participants: schedule.currentCapacity || 0,
    isOptional: schedule.isOptional,
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Activity Schedule Management
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Create and manage activity schedules for your camp
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

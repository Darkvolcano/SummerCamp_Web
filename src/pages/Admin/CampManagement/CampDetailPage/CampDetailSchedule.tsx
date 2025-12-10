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
        toastError("Error", "Unable to load activity schedules");
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
      toastError("Error", "Schedule not found");
    }
  };

  if (campStatus === "Draft" || campStatus === "DRAFT") {
    return (
      <div className="pb-12">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              Camp Not Set Up Yet
            </h3>
            <p className="text-blue-700 mb-4">
              Your camp is still in Draft status. Please complete camp setup to
              continue.
            </p>
            <p className="text-sm text-blue-600">
              Please assign a manager and wait for them to set up the camp to
              continue.
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
    location: schedule.location?.name || "No location",
    participants: schedule.currentCapacity || 0,
    isOptional: schedule.isOptional,
  }));

  return (
    <div className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Activity Schedule
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          View activity schedules for this camp (Read-only)
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

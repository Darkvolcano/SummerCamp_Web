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
  const { toastSuccess, toastError } = useNotification();

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
  const [scheduleFormMode, setScheduleFormMode] = useState<
    "create-core" | "create-optional"
  >("create-core");
  const [selectedCoreScheduleId, setSelectedCoreScheduleId] = useState<
    string | null
  >(null);

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
        toastError("Error", "Unable to load activities and schedules");
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
      toastError("Error", "Schedule not found");
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

      const activityId = scheduleData.activityId;

      // Create or update the schedule
      if (selectedSchedule) {
        // Update existing schedule
        const updatedData: any = {
          activityId,
          staffId: scheduleData.staffId,
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          isLivestream: scheduleData.isLivestream,
          roomId: scheduleData.roomId,
          maxCapacity: scheduleData.maxCapacity,
          locationId: scheduleData.locationId,
        };

        await activityScheduleService.updateCoreActivitySchedule(
          selectedSchedule.activityScheduleId,
          updatedData
        );
        setSchedules((prev) =>
          prev.map((s) =>
            s.activityScheduleId === selectedSchedule.activityScheduleId
              ? { ...s, ...updatedData }
              : s
          )
        );
        toastSuccess("Success", "Schedule updated successfully");
      } else {
        // Create new schedule
        const newScheduleData: any = {
          activityId,
          staffId: scheduleData.staffId,
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          isLivestream: scheduleData.isLivestream,
          roomId: scheduleData.roomId,
          maxCapacity: scheduleData.maxCapacity,
          locationId: scheduleData.locationId,
        };

        const newSchedule =
          await activityScheduleService.createCoreActivitySchedule(
            newScheduleData
          );
        setSchedules((prev) => [...prev, newSchedule]);
        toastSuccess("Success", "Schedule created successfully");
      }

      setShowScheduleForm(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toastError("Error", "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      setLoading(true);
      await activityScheduleService.deleteActivitySchedule(scheduleId);
      setSchedules((prev) =>
        prev.filter((s) => s.activityScheduleId !== scheduleId)
      );
      setShowScheduleDetail(false);
      toastSuccess("Success", "Schedule deleted successfully");
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      toastError("Error", "Failed to delete schedule");
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
    location: schedule.location?.name || "No location",
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
          onCreateOptional={(coreScheduleId: string) => {
            setSelectedCoreScheduleId(coreScheduleId);
            setScheduleFormMode("create-optional");
            setSelectedSchedule(null);
            setSelectedSlot(null);
            setShowScheduleForm(true);
          }}
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
          mode={scheduleFormMode}
          coreScheduleId={selectedCoreScheduleId || undefined}
          onClose={() => {
            setShowScheduleForm(false);
            setSelectedSchedule(null);
            setSelectedSlot(null);
            setScheduleFormMode("create-core");
            setSelectedCoreScheduleId(null);
          }}
          onSave={handleSaveSchedule}
          onActivityCreated={(newActivity) => {
            // Update activities list
            setActivities((prev) => [...prev, newActivity]);
            // Refresh schedules for optional creation
            if (
              selectedCoreScheduleId &&
              scheduleFormMode === "create-optional"
            ) {
              if (!selectedCampId) return;
              activityScheduleService
                .getActivitySchedulesByCamp(selectedCampId)
                .then((updatedSchedules) => {
                  setSchedules(updatedSchedules);
                })
                .catch((error) => {
                  console.error("Failed to refresh schedules:", error);
                });
            }
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

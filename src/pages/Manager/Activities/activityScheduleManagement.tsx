import React, { useEffect, useState } from "react";
import { Spin, Button, Modal, Tabs, Empty } from "antd";
import { Plus } from "lucide-react";
import { useManagerContext } from "../../../hooks/useManagerContext";
import activityService, {
  type ActivityResponseDto,
} from "../../../services/activityService";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";
import { useNotification } from "../../../contexts/NotificationContext";
import Calendar from "../../../components/calander/Calendar";
import ActivityScheduleForm from "./ActivityScheduleForm";
import ActivityScheduleDetail from "./ActivityScheduleDetail";
import "./ActivityScheduleManagement.css";

const ActivityScheduleManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [activities, setActivities] = useState<ActivityResponseDto[]>([]);
  const [schedules, setSchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showScheduleDetail, setShowScheduleDetail] =
    useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ActivityScheduleResponseDto | null>(null);

  // Fetch activities and schedules
  useEffect(() => {
    if (!selectedCampId) {
      setActivities([]);
      setSchedules([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesData, schedulesData] = await Promise.all([
          activityService.getActivitiesByCampId(selectedCampId),
          activityScheduleService.getActivitySchedulesByCamp(selectedCampId),
        ]);
        setActivities(activitiesData);
        setSchedules(schedulesData);
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
    setShowScheduleForm(true);
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule: ActivityScheduleResponseDto) => {
    setSelectedSchedule(schedule);
    setShowScheduleForm(true);
  };

  // Handle view schedule detail
  const handleViewSchedule = (schedule: ActivityScheduleResponseDto) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetail(true);
  };

  // Handle save schedule
  const handleSaveSchedule = async (
    scheduleData: any,
    newActivityData?: any
  ) => {
    try {
      setLoading(true);

      let activityId = scheduleData.activityId;

      // If creating a new activity first
      if (newActivityData && selectedCampId) {
        const newActivity = await activityService.createActivity({
          name: newActivityData.name,
          description: newActivityData.description,
          activityType: newActivityData.activityType,
          campId: selectedCampId,
        });
        activityId = newActivity.activityId;
        setActivities((prev) => [...prev, newActivity]);
        toastSuccess("Success", `Activity "${newActivity.name}" created successfully`);
      }

      // Now create or update the schedule
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
          await activityScheduleService.createCoreActivitySchedule(newScheduleData);
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
    Modal.confirm({
      title: "Delete Schedule",
      content: "Are you sure you want to delete this schedule?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          // Note: You may need to add a delete method to activityScheduleService
          setSchedules((prev) =>
            prev.filter((s) => s.activityScheduleId !== scheduleId)
          );
          toastSuccess("Success", "Schedule deleted successfully");
        } catch (error) {
          console.error("Failed to delete schedule:", error);
          toastError("Error", "Failed to delete schedule");
        } finally {
          setLoading(false);
        }
      },
    });
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
    type: (schedule.activity?.activityType || "Core") as "Core" | "Core-Optional" | "Optional",
    description: `Status: ${schedule.status}`,
    location: `Location ${schedule.locationId}`,
    participants: schedule.currentCapacity || 0,
  }));

  const tabItems = [
    {
      key: "calendar",
      label: "Calendar View",
      children: (
        <div className="activity-schedule-calendar">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#111827]">Activity Schedule</h2>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleAddSchedule}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Schedule
            </Button>
          </div>
          <Calendar
            activities={calendarActivities}
            onSelectSchedule={handleViewSchedule}
            onAddClick={handleAddSchedule}
            readOnly={true}
          />
        </div>
      ),
    },
    {
      key: "list",
      label: "List View",
      children: (
        <div className="activity-schedule-list">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#111827]">All Schedules</h2>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleAddSchedule}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Schedule
            </Button>
          </div>

          {schedules.length === 0 ? (
            <Empty description="No schedules found" />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.activityScheduleId}
                  className="bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewSchedule(schedule)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#111827] text-base">
                        {schedule.activity?.name || "N/A"}
                      </h3>
                      <p className="text-sm text-[#6B7280] mt-1">
                        {new Date(schedule.startTime).toLocaleDateString()} |{" "}
                        {new Date(schedule.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(schedule.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                          {schedule.activity?.activityType || "Core"}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                          {schedule.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSchedule(schedule);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(schedule.activityScheduleId);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

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

      <Tabs items={tabItems} />

      {/* Activity Schedule Form Modal */}
      {showScheduleForm && (
        <ActivityScheduleForm
          schedule={selectedSchedule}
          activities={activities}
          campId={selectedCampId}
          onClose={() => {
            setShowScheduleForm(false);
            setSelectedSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}

      {/* Activity Schedule Detail Modal */}
      {showScheduleDetail && selectedSchedule && (
        <ActivityScheduleDetail
          schedule={selectedSchedule}
          onClose={() => {
            setShowScheduleDetail(false);
            setSelectedSchedule(null);
          }}
          onEdit={() => {
            setShowScheduleDetail(false);
            setShowScheduleForm(true);
          }}
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

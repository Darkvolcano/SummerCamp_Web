import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { useStaffContext } from "../../../hooks/useStaffContext";
import { useNotification } from "../../../contexts/NotificationContext";
import staffService from "../../../services/staffService";
import activityScheduleService from "../../../services/activityScheduleService";
import campService, { type CampResponseDto } from "../../../services/campService";
import Calendar from "../../../components/calander/Calendar";
import ScheduleDetail from "../../../components/schedule/ScheduleDetail";
// import { useNavigate } from "react-router-dom";
// For future live stream implementation

const MyCalendar: React.FC = () => {
  const { selectedCampId } = useStaffContext();
  const { toastError, toastSuccess } = useNotification();
  // const navigate = useNavigate();

  const [campData, setCampData] = useState<CampResponseDto | null>(null);
  const [campActivities, setCampActivities] = useState<any[]>([]);
  const [groupStaffActivities, setGroupStaffActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showScheduleDetail, setShowScheduleDetail] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  // Fetch camp data
  useEffect(() => {
    if (!selectedCampId) {
      setCampData(null);
      return;
    }

    const fetchCampData = async () => {
      try {
        setLoading(true);
        const data = await campService.getCampById(selectedCampId);
        setCampData(data);
      } catch (error) {
        console.error("Failed to load camp:", error);
        toastError("Error", "Unable to load camp details");
      } finally {
        setLoading(false);
      }
    };

    fetchCampData();
  }, [selectedCampId, toastError]);

  // Fetch activities and schedules
  useEffect(() => {
    if (!selectedCampId) {
      setCampActivities([]);
      setGroupStaffActivities([]);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);

        const [campActivitiesData, groupActivitiesData] = await Promise.all([
          staffService.getCampActivities(selectedCampId),
          staffService.getGroupStaffActivities(selectedCampId),
        ]);

        setCampActivities(campActivitiesData.activities || []);
        setGroupStaffActivities(groupActivitiesData || []);
      } catch (error) {
        console.error("Failed to load activities:", error);
        toastError("Error", "Unable to load calendar activities");
        setCampActivities([]);
        setGroupStaffActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [selectedCampId, toastError]);

  const handleViewSchedule = async (event: any) => {
    const activityScheduleId = parseInt(event.id, 10);

    try {
      setLoading(true);
      const schedule = await activityScheduleService.getActivityScheduleById(activityScheduleId);
      setSelectedSchedule(schedule);
      setShowScheduleDetail(true);
    } catch (error) {
      console.error("Failed to load schedule details:", error);
      toastError("Error", "Unable to load schedule details");
    } finally {
      setLoading(false);
    }
  };

  const handleStartLiveStream = async () => {
    if (!selectedSchedule) return;

    try {
      setLoading(true);
      let roomId: string;

      if (selectedSchedule.liveStream?.roomId) {
        roomId = selectedSchedule.liveStream.roomId;
        toastSuccess("Info", "Using existing livestream room");
      } else {
        const videoSDKService = (await import("../../../services/videoSDKService")).default;
        roomId = await videoSDKService.createRoom();

        if (selectedSchedule.liveStream?.livestreamId) {
          const liveStreamService = (await import("../../../services/liveStreamService")).default;
          await liveStreamService.updateLiveStream(
            selectedSchedule.liveStream.livestreamId,
            {
              title: selectedSchedule.liveStream.title,
              roomId: roomId,
              hostId: selectedSchedule.liveStream.hostId,
            }
          );
          toastSuccess("Success", "Livestream room created and updated");
        }
      }

      setTimeout(() => {
        window.location.href = `/staff/livestream/host/${roomId}`;
      }, 1500);
    } catch (error) {
      console.error("[MyCalendar] Error starting livestream:", error);
      toastError("Error", "Unable to start livestream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If no camp selected
  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            Select Camp
          </h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Please select a camp from the left sidebar to view your calendar
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && campActivities.length === 0 && groupStaffActivities.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  // Combine both activity lists and convert to calendar format
  const allActivities = [
    ...campActivities.map((activity) => ({
      id: activity.activityScheduleId.toString(),
      title: activity.activityName || "Untitled",
      start: new Date(activity.startTime),
      end: new Date(activity.endTime),
      type: activity.activityType as "Core" | "Optional" | "Resting" | "CheckIn" | "CheckOut",
      description: `Status: ${activity.status}`,
      location: activity.location || "No location",
      participants: 0,
      isOptional: activity.activityType === "Optional",
    })),
    ...groupStaffActivities.map((activity) => ({
      id: activity.activityScheduleId.toString(),
      title: activity.activity?.name || "Untitled",
      start: new Date(activity.startTime),
      end: new Date(activity.endTime),
      type: activity.activity?.activityType as "Core" | "Optional" | "Resting" | "CheckIn" | "CheckOut",
      description: `Status: ${activity.status}`,
      location: activity.location?.name || "No location",
      participants: activity.maxCapacity || 0,
      isOptional: activity.isOptional || false,
    })),
  ];

  // Remove duplicates by activityScheduleId
  const uniqueActivities = allActivities.filter(
    (activity, index, self) =>
      index === self.findIndex((a) => a.id === activity.id)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          My Calendar
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          View your assigned activity schedules on calendar
        </p>
      </div>

      <div className="staff-calendar">
        <Calendar
          activities={uniqueActivities}
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
          userRole="staff"
          onSelectSchedule={handleViewSchedule}
          // Staff cannot add or create schedules
          onAddClick={undefined}
          onSelectSlot={undefined}
          onCreateOptional={undefined}
        />
      </div>

      {/* Schedule Detail Modal */}
      {showScheduleDetail && selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          userRole="staff"
          onClose={() => {
            setShowScheduleDetail(false);
            setSelectedSchedule(null);
          }}
          onStartLiveStream={handleStartLiveStream}
        />
      )}
    </div>
  );
};

export default MyCalendar;

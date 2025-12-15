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
  const [campGroups, setCampGroups] = useState<any | null>(null);
  const [campAccommodations, setCampAccommodations] = useState<any[]>([]);
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
      } catch (error: any) {
        console.error("Failed to load camp:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.title || "Unable to load camp details";
        toastError("Error", errorMessage);
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
      } catch (error: any) {
        console.error("Failed to load activities:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.title || "Unable to load calendar activities";
        toastError("Error", errorMessage);
        setCampActivities([]);
        setGroupStaffActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [selectedCampId, toastError]);

  useEffect(() => {
    if (!selectedCampId) {
      setCampGroups(null);
      setCampAccommodations([]);
      return;
    }

    const fetchGroupsAndAccommodations = async () => {
      try {
        const groupsData = await staffService.getCampGroups(selectedCampId);
        console.log('[MyCalendar] Groups Response:', groupsData);
        setCampGroups(groupsData);
      } catch (error) {
        console.error("Failed to load groups:", error);
        setCampGroups(null);
      }

      try {
        const accommodationsData = await staffService.getCampAccommodations(selectedCampId);
        console.log('[MyCalendar] Accommodations Response:', accommodationsData);
        setCampAccommodations(Array.isArray(accommodationsData) ? accommodationsData : [accommodationsData]);
      } catch (error) {
        console.error("Failed to load accommodations:", error);
        setCampAccommodations([]);
      }
    };

    fetchGroupsAndAccommodations();
  }, [selectedCampId]);

  const handleViewSchedule = async (event: any) => {
    const activityScheduleId = parseInt(event.id, 10);

    try {
      setLoading(true);
      const schedule = await activityScheduleService.getActivityScheduleById(activityScheduleId);
      setSelectedSchedule(schedule);
      setShowScheduleDetail(true);
    } catch (error: any) {
      console.error("Failed to load schedule details:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Unable to load schedule details";
      toastError("Error", errorMessage);
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
    } catch (error: any) {
      console.error("[MyCalendar] Error starting livestream:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.title || "Unable to start livestream. Please try again.";
      toastError("Error", errorMessage);
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

      {/* Staff Assignment Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm text-gray-700">
              <span className="font-medium">Supervising Group:</span> {campGroups?.groupName || "Unassigned"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm text-gray-700">
              <span className="font-medium">Supervising Accommodations:</span>{" "}
              {campAccommodations.length > 0 ? campAccommodations.map((acc) => acc.name).join(", ") : "Unassigned"}
            </span>
          </div>
        </div>
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

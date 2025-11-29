import React, { useEffect, useState } from "react";
import { Spin, Empty, Badge, Button } from "antd";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";
import campService, { type CampResponseDto } from "../../../services/campService";

const AttendanceChecking: React.FC = () => {
  const navigate = useNavigate();
  const { toastError } = useNotification();

  const [camps, setCamps] = useState<CampResponseDto[]>([]);
  const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<ActivityScheduleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch camps on mount
  useEffect(() => {
    const loadCamps = async () => {
      try {
        setLoading(true);
        const campsData = await campService.getAllCamps();
        setCamps(campsData);
        if (campsData.length > 0) {
          setSelectedCampId(campsData[0].campId);
        }
      } catch (error) {
        console.error("Failed to load camps:", error);
        toastError("Error", "Unable to load camps");
      } finally {
        setLoading(false);
      }
    };

    loadCamps();
  }, [toastError]);

  // Fetch attendances when camp is selected
  useEffect(() => {
    if (!selectedCampId) return;

    const loadAttendances = async () => {
      try {
        setLoading(true);
        const attendancesData = await activityScheduleService.getAttendancesByCampId(selectedCampId);
        setSchedules(attendancesData);
      } catch (error) {
        console.error("Failed to load attendances:", error);
        toastError("Error", "Unable to load attendance schedules");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendances();
  }, [selectedCampId, toastError]);


  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "Core":
        return "blue";
      case "Optional":
        return "gold";
      case "Resting":
        return "purple";
      case "CheckIn":
        return "green";
      case "CheckOut":
        return "red";
      default:
        return "default";
    }
  };

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
    // Navigate to camper attendance list page
    navigate(`/staff/attendance/${schedule.activityScheduleId}/campers`, {
      state: { schedule },
    });
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Loading attendance schedules..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">
          Attendance Checking
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Check and manage your assigned activity schedules requiring attendance
        </p>
      </div>

      {/* Camp Selection */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Camp
        </label>
        <select
          value={selectedCampId || ""}
          onChange={(e) => setSelectedCampId(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">-- Select a camp --</option>
          {camps.map((camp) => (
            <option key={camp.campId} value={camp.campId}>
              {camp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-12">
          <Empty
            description="No attendance schedules found"
            style={{ marginTop: 0 }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const statusInfo = getStatusColor(schedule.status);
            const StatusIcon = statusInfo.icon;

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
                      <Badge
                        color={getActivityTypeColor(schedule.activity?.activityType || "Core")}
                        text={schedule.activity?.activityType || "Core"}
                      />
                      <Badge
                        status={schedule.status === "Completed" ? "success" : schedule.status === "Cancelled" ? "error" : "processing"}
                        text={schedule.status}
                      />
                    </div>

                    {/* Time Info */}
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Start Time</p>
                        <p className="text-gray-900 font-mono">
                          {formatDateTime(schedule.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">End Time</p>
                        <p className="text-gray-900 font-mono">
                          {formatDateTime(schedule.endTime)}
                        </p>
                      </div>
                    </div>

                    {/* Location and Staff */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Location</p>
                        <p className="text-gray-900">
                          {schedule.location?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Assigned Staff</p>
                        <p className="text-gray-900">
                          {schedule.staff?.fullName || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {schedule.status === "PendingAttendance" && (
                      <Button
                        type="primary"
                        style={{ backgroundColor: "#10b981" }}
                        size="small"
                        onClick={() => handleCheckAttendance(schedule)}
                      >
                        Check Attendance
                      </Button>
                    )}
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

export default AttendanceChecking;

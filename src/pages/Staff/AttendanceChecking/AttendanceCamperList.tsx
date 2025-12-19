import React, { useEffect, useState } from "react";
import { Spin, Empty, Badge, Button, Radio, Tooltip } from "antd";
import { ArrowLeft, Send } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import camperService, {
  type CamperActivityResponseDto,
} from "../../../services/camperService";
import attendanceLogService, {
  type AttendanceLogUpdateRequest,
  type ParticipationStatus,
} from "../../../services/attendanceLogService";
import type { ActivityScheduleResponseDto } from "../../../services/activityScheduleService";

const AttendanceCamperList: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toastSuccess, toastError } = useNotification();

  const schedule = location.state?.schedule as ActivityScheduleResponseDto | undefined;

  const [campers, setCampers] = useState<CamperActivityResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<number, ParticipationStatus | null>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!scheduleId) return;
    fetchCampers();
  }, [scheduleId]);

  const fetchCampers = async () => {
    if (!scheduleId) return;

    try {
      setLoading(true);

      const campersData = await camperService.getCampersByActivityScheduleId(
        parseInt(scheduleId)
      );

      setCampers(campersData);

      // Initialize attendance data with existing status or null
      const initialData: Record<number, ParticipationStatus | null> = {};
      campersData.forEach((camper) => {
        initialData[camper.camperId] = (camper.status as ParticipationStatus) || null;
      });
      setAttendanceData(initialData);
    } catch (error) {
      console.error("Lỗi tải danh sách trại viên:", error);
      toastError("Lỗi", "Không thể tải danh sách trại viên cho hoạt động này");
      setCampers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (camperId: number, status: ParticipationStatus | null) => {
    setAttendanceData((prev) => ({
      ...prev,
      [camperId]: status,
    }));
    setHasChanges(true);
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);

      // Build update requests for changed records
      const updates: AttendanceLogUpdateRequest[] = campers
        .filter((camper) => attendanceData[camper.camperId] !== null)
        .map((camper) => ({
          attendanceLogId: camper.attendanceLogId || 0,
          participantStatus: attendanceData[camper.camperId] as ParticipationStatus,
          note: undefined,
        }));

      if (updates.length === 0) {
        toastError("Xác thực", "Vui lòng điểm danh ít nhất một trại viên");
        return;
      }

      await attendanceLogService.updateAttendanceLogsV2({
        attendanceLogs: updates,
      });
      toastSuccess("Thành công", "Cập nhật điểm danh thành công");
      setHasChanges(false);

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Lỗi cập nhật điểm danh:", error);
      toastError("Lỗi", "Không thể cập nhật điểm danh");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải danh sách trại viên..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Điểm danh
            </h1>
            <p className="text-[#6B7280] text-sm mt-1">
              {schedule?.activity?.name || "Activity"} - Điểm danh trại viên
            </p>
          </div>
        </div>
      </div>

      {/* Activity Info Card */}
      {schedule && (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Activity Type</p>
              <Badge
                color={getActivityTypeColor(schedule.activity?.activityType || "Core")}
                text={schedule.activity?.activityType || "Core"}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Start Time</p>
              <p className="text-gray-900 font-mono text-sm">
                {new Date(schedule.startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">End Time</p>
              <p className="text-gray-900 font-mono text-sm">
                {new Date(schedule.endTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Location</p>
              <p className="text-gray-900">{schedule.location?.name || "Không có"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Campers List */}
      {campers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-12">
          <Empty
            description="No campers found for this activity"
            style={{ marginTop: 0 }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              {/* Table Header */}
              <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-1/4">
                    Camper Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-1/8">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-1/6">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-1/6">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-1/4">
                    Attendance
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {campers.map((camper, index) => {
                  const currentStatus = attendanceData[camper.camperId];
                  const isChanged =
                    currentStatus !== null &&
                    currentStatus !== (camper.status as ParticipationStatus);
                  const hasNoAttendanceLog = camper.attendanceLogId === null;

                  return (
                    <tr
                      key={camper.camperId}
                      className={`border-b border-[#E5E7EB] hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${isChanged ? "bg-blue-50" : ""} ${hasNoAttendanceLog ? "bg-yellow-50" : ""}`}
                    >
                      <td className="px-6 py-4 text-sm w-1/4">
                        <div className="flex items-center gap-3">
                          {camper.avatar && (
                            <img
                              src={camper.avatar}
                              alt={camper.camperName}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <span className="font-medium text-gray-900 truncate">
                            {camper.camperName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 w-1/8">
                        {camper.gender === "M" ? "Male" : "Female"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono w-1/6">
                        {new Date(camper.dob).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-sm w-1/6">
                        {hasNoAttendanceLog ? (
                          <Badge color="orange" text="Chưa có dữ liệu" />
                        ) : (
                          <Badge
                            color={getStatusColor(currentStatus || "NotYet")}
                            text={currentStatus || "NotYet"}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm w-1/4">
                        {hasNoAttendanceLog ? (
                          <span className="text-gray-500 italic text-xs">
                            Chưa có dữ liệu điểm danh
                          </span>
                        ) : (
                          <Radio.Group
                            value={currentStatus}
                            onChange={(e) =>
                              handleAttendanceChange(
                                camper.camperId,
                                e.target.value as ParticipationStatus | null
                              )
                            }
                          >
                            <Tooltip title="Mark as present">
                              <Radio value="Present" className="mr-4">
                                Present
                              </Radio>
                            </Tooltip>
                            <Tooltip title="Mark as absent">
                              <Radio value="Absent">Absent</Radio>
                            </Tooltip>
                          </Radio.Group>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {campers.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            type="primary"
            style={{ backgroundColor: "#10b981", color: "white" }}
            size="large"
            icon={<Send size={18} />}
            onClick={handleSubmitAttendance}
            disabled={!hasChanges}
            loading={submitting}
          >
            Send Attendance Data
          </Button>
        </div>
      )}
    </div>
  );
};

function getActivityTypeColor(type: string): string {
  switch (type) {
    case "Core":
      return "blue";
    case "Optional":
      return "gold";
    case "Resting":
      return "purple";
    case "Checkin":
      return "green";
    case "Checkout":
      return "red";
    default:
      return "default";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Present":
      return "green";
    case "Absent":
      return "red";
    case "Excused":
      return "orange";
    case "Late":
      return "orange";
    case "LeftEarly":
      return "orange";
    case "NotYet":
      return "blue";
    default:
      return "default";
  }
}

export default AttendanceCamperList;

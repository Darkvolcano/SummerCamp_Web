import React, { useEffect, useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Spin, Empty, Modal, Button } from "antd";
import { ArrowLeftOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import activityScheduleService, {
  type ActivityScheduleResponseDto,
} from "../../../services/activityScheduleService";
import campService, { type CampResponseDto } from "../../../services/campService";
import { ActivitiyType } from "../../../enums/activityType.enum";

// Setup localizer for react-big-calendar với dayjs
const localizer = dayjsLocalizer(dayjs);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    activityName: string;
    locationName: string;
    attendanceStatus: string | null;
    activityType: string;
    isLivestream: boolean;
  };
}

const CamperSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { camperId, campId } = useParams<{ camperId: string; campId: string }>();
  const { toastError } = useNotification();

  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ActivityScheduleResponseDto | null>(null);
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState<string | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Fetch camp details and activity schedules
  useEffect(() => {
    const fetchData = async () => {
      if (!camperId || !campId) return;

      try {
        setLoading(true);
        const camperIdNum = parseInt(camperId);
        const campIdNum = parseInt(campId);

        // Fetch camp details
        const campData = await campService.getCampById(campIdNum);
        setCamp(campData);

        // Set current date to camp start date
        setCurrentDate(new Date(campData.startDate));

        // Fetch activity schedules
        const schedulesData = await activityScheduleService.getActivitySchedulesByCamperAndCamp(
          campIdNum,
          camperIdNum
        );

        // Transform schedules to calendar events
        const calendarEvents: CalendarEvent[] = schedulesData.map((schedule) => {
          // Get participantStatus from attendanceLogs
          let attendanceStatus: string | null = null;
          if (schedule.attendanceLogs && schedule.attendanceLogs.length > 0) {
            // Get the first attendance log's participantStatus
            attendanceStatus = schedule.attendanceLogs[0].participantStatus;
          } else {
            // If no attendance logs, set to "NotYet"
            attendanceStatus = "NotYet";
          }

          return {
            id: schedule.activityScheduleId,
            title: schedule.activity?.name || "Hoạt động",
            start: new Date(schedule.startTime),
            end: new Date(schedule.endTime),
            resource: {
              activityName: schedule.activity?.name || "Không có",
              locationName: schedule.location?.name || "Không có",
              attendanceStatus: attendanceStatus,
              activityType: schedule.activity?.activityType || "Core",
              isLivestream: schedule.isLivestream || false,
            },
          };
        });

        setEvents(calendarEvents);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể tải lịch hoạt động";
        toastError('Cảnh báo', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [camperId, campId, toastError]);

  // Handle event click
  const handleEventClick = async (event: CalendarEvent) => {
    try {
      setScheduleLoading(true);
      setIsModalVisible(true);
      setSelectedAttendanceStatus(event.resource.attendanceStatus);

      const scheduleDetail = await activityScheduleService.getActivityScheduleById(event.id);
      setSelectedSchedule(scheduleDetail);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể tải thông tin chi tiết";
      toastError('Cảnh báo', errorMessage);
      setIsModalVisible(false);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedSchedule(null);
    setSelectedAttendanceStatus(null);
  };

  // Handle join livestream
  const handleJoinLivestream = () => {
    if (selectedSchedule?.liveStream?.roomId) {
      navigate(`/parent/livestream/view/${selectedSchedule.liveStream.roomId}`);
    }
  };

  // Custom event style
  const eventStyleGetter = (event: CalendarEvent) => {
    const activityType = event.resource.activityType;
    let backgroundColor = "#3174ad";

    // Color based on activity type
    switch (activityType) {
      case ActivitiyType.CORE:
        backgroundColor = "#1890ff"; // Blue
        break;
      case ActivitiyType.OPTIONAL:
        backgroundColor = "#52c41a"; // Green
        break;
      case ActivitiyType.RESTING:
        backgroundColor = "#faad14"; // Orange
        break;
      case ActivitiyType.CHECKIN:
      case ActivitiyType.CHECKOUT:
        backgroundColor = "#722ed1"; // Purple
        break;
      default:
        backgroundColor = "#3174ad"; // Default blue
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "1px solid #6b7280",
        display: "block",
        fontSize: "13px",
        padding: "4px 6px",
      },
    };
  };

  // Custom event component with tooltip
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    return (
      <div
        title={`${event.resource.activityName}\n${event.resource.locationName}\nLoại: ${getActivityTypeDisplay(event.resource.activityType)}\nTrạng thái: ${event.resource.attendanceStatus || "Chưa có"}${event.resource.isLivestream ? '\n🔴 Có livestream' : ''}`}
        className="cursor-pointer relative"
      >
        {event.resource.isLivestream && (
          <div className="absolute -top-1 -right-5">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        )}
        <div className="font-semibold text-xs">{event.resource.activityName}</div>
        <div className="text-xs opacity-90">{event.resource.locationName}</div>
        {event.resource.attendanceStatus && (
          <div className="text-xs opacity-90 font-medium">
            {getAttendanceStatusDisplay(event.resource.attendanceStatus)}
          </div>
        )}
      </div>
    );
  };

  // Get activity type display
  const getActivityTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      Core: "Hoạt động chính",
      Optional: "Hoạt động tự chọn",
      Resting: "Nghỉ ngơi",
      Checkin: "Check-in",
      Checkout: "Check-out",
    };
    return typeMap[type] || type;
  };

  // Get attendance status display
  const getAttendanceStatusDisplay = (status: string) => {
    return status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 font-medium">
            Đang tải lịch hoạt động...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex bg-[#FF8F50] text-white items-center gap-2 hover:text-[#ffffff] font-semibold group px-6 py-2 rounded-full hover:shadow-lg hover:bg-[#ff7e3d] transition-all mb-6"
          >
            <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lịch hoạt động</h1>
          {camp && (
            <div className="text-gray-600 space-y-1">
              <p className="text-lg font-semibold">{camp.name}</p>
              <p className="text-sm">
                📅 {dayjs(camp.startDate).format("DD/MM/YYYY HH:mm")} - {dayjs(camp.endDate).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          )}
        </div>

        {/* Calendar */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Empty description="Không có hoạt động nào trong lịch" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                view="week"
                views={["week"]}
                onView={() => { }}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                onSelectEvent={handleEventClick}
                eventPropGetter={eventStyleGetter}
                components={{
                  event: EventComponent,
                  toolbar: (props) => {
                    return (
                      <div className="rbc-toolbar">
                        <span className="rbc-btn-group">
                          <button type="button" onClick={() => props.onNavigate("PREV")}>
                            Trước
                          </button>
                          <button type="button" onClick={() => props.onNavigate("NEXT")}>
                            Sau
                          </button>
                        </span>
                        <span className="rbc-toolbar-label">{props.label}</span>
                      </div>
                    );
                  },
                }}
                messages={{
                  week: "Tuần",
                  today: "Hôm nay",
                  previous: "Trước",
                  next: "Sau",
                  showMore: (total) => `+${total} thêm`,
                }}
                formats={{
                  timeGutterFormat: "HH:mm",
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(end, "HH:mm", culture)}`,
                  agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(end, "HH:mm", culture)}`,
                  dayHeaderFormat: (date, culture, localizer) =>
                    localizer?.format(date, "dddd, DD/MM/YYYY", culture) || "",
                }}
              />
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Chú thích loại hoạt động:</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#1890ff" }}></div>
                  <span className="text-sm text-gray-700">Hoạt động chính</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#52c41a" }}></div>
                  <span className="text-sm text-gray-700">Hoạt động tự chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#faad14" }}></div>
                  <span className="text-sm text-gray-700">Nghỉ ngơi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#722ed1" }}></div>
                  <span className="text-sm text-gray-700">Check-in / Check-out</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Activity Detail Modal */}
      <Modal
        title="Chi tiết hoạt động"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        {scheduleLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : selectedSchedule ? (
          <div className="space-y-4">
            {/* Activity Name */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Tên hoạt động</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedSchedule.activity?.name || "Không có"}
              </p>
            </div>

            {/* Activity Type */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Loại hoạt động</p>
              <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {getActivityTypeDisplay(selectedSchedule.activity?.activityType || "")}
              </span>
            </div>

            {/* Staff Name */}
            {selectedSchedule.staff && (
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Nhân viên phụ trách</p>
                <p className="text-base text-gray-900">{selectedSchedule.staff.fullName}</p>
              </div>
            )}

            {/* Time */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Thời gian</p>
              <p className="text-base text-gray-900">
                🕐 {dayjs(selectedSchedule.startTime).format("HH:mm DD/MM/YYYY")} - {dayjs(selectedSchedule.endTime).format("HH:mm DD/MM/YYYY")}
              </p>
            </div>

            {/* Location */}
            {selectedSchedule.location && (
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Địa điểm</p>
                <p className="text-base text-gray-900">📍 {selectedSchedule.location.name}</p>
              </div>
            )}

            {/* Attendance Status */}
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Trạng thái điểm danh</p>
              <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {getAttendanceStatusDisplay(selectedAttendanceStatus || "NotYet")}
              </span>
            </div>

            {/* Livestream Button */}
            {selectedSchedule.isLivestream && selectedSchedule.liveStream && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="primary"
                  size="large"
                  icon={<VideoCameraOutlined />}
                  block
                  className="bg-red-500 border-red-500 hover:bg-red-600 font-semibold"
                  onClick={handleJoinLivestream}
                >
                  🔴 Tham gia Livestream
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CamperSchedule;

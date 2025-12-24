import React, { useState, useEffect } from "react";
import { Descriptions, Badge, Button, Tag, Spin } from "antd";
import { Edit, Check, X, Video } from "lucide-react";
import { useAuthStore } from "../../services/userService";
import type { ActivityScheduleResponseDto } from "../../services/activityScheduleService";
import groupService, { type GroupResponseDto } from "../../services/groupService";
import DeletePopover from "../DeletePopover";
import "./ScheduleDetail.css";

interface ScheduleDetailProps {
  schedule: ActivityScheduleResponseDto;
  userRole?: 'manager' | 'staff' | 'driver' | 'admin';
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onStartLiveStream?: () => void;
}

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({
  schedule,
  userRole = 'admin',
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onStartLiveStream,
}) => {
  const { user } = useAuthStore();
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const [assignedGroups, setAssignedGroups] = useState<GroupResponseDto[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  const canManage = userRole === 'manager';
  const canApprove = false; // Admin cannot approve/reject schedules - read-only access
  
  const canStartLiveStream = 
    schedule.isLivestream === true && 
    schedule.staff?.userId === user?.id &&
    userRole === 'staff' &&
    onStartLiveStream !== undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "green";
      case "NotYet":
        return "blue";
      case "Cancelled":
        return "red";
      case "PendingAttendance":
        return "orange";
      default:
        return "default";
    }
  };

  const getActivityTypeColor = (type: string) => {
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
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Fetch assigned groups for Core activities
  useEffect(() => {
    const fetchAssignedGroups = async () => {
      if (schedule.activity?.activityType !== "Core" || !schedule.activityScheduleId) {
        return;
      }

      try {
        setLoadingGroups(true);
        const groups = await groupService.getGroupsByActivityScheduleId(schedule.activityScheduleId);
        setAssignedGroups(groups);
      } catch (error) {
        console.error("Failed to fetch assigned groups:", error);
        setAssignedGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchAssignedGroups();
  }, [schedule]);

  return (
    <div className="schedule-detail-sidebar">
      <div className="schedule-detail-header">
        <h2>Chi Tiết Lịch Trình</h2>
        <div className="header-actions">
          <button className="icon-btn close-btn" onClick={onClose} style={{ width: '36px', height: '36px' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="schedule-detail-content">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID Lịch Trình Hoạt Động">
          <span className="font-mono">#{schedule.activityScheduleId}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Tên Hoạt Động">
          {schedule.activity?.name ? (
            <span className="font-medium">{schedule.activity.name}</span>
          ) : (
            <strong>N/A</strong>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Loại Hoạt Động">
          <Badge
            color={getActivityTypeColor(schedule.activity?.activityType || "Core")}
            text={schedule.activity?.activityType || "Core"}
          />
        </Descriptions.Item>

        {schedule.activity?.description && (
          <Descriptions.Item label="Mô Tả">
            <span className="text-sm">{schedule.activity.description}</span>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Trạng Thái">
          <Badge
            color={getStatusColor(schedule.status)}
            text={schedule.status}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Thời Gian Bắt Đầu">
          <span className="font-mono">
            {formatDateTime(schedule.startTime)}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Thời Gian Kết Thúc">
          <span className="font-mono">
            {formatDateTime(schedule.endTime)}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="ID Nhân Viên">
          {schedule.staff?.userId ? (
            <span className="font-mono">#{schedule.staff.userId}</span>
          ) : (
            <strong>N/A</strong>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Tên Nhân Viên">
          {schedule.staff?.fullName ? (
            <span className="font-medium">{schedule.staff.fullName}</span>
          ) : (
            <strong>N/A</strong>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="ID Địa Điểm">
          {schedule.location?.id ? (
            <span className="font-mono">#{schedule.location.id}</span>
          ) : (
            <strong>N/A</strong>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Tên Địa Điểm">
          {schedule.location?.name ? (
            <span className="font-medium">{schedule.location.name}</span>
          ) : (
            <strong>N/A</strong>
          )}
        </Descriptions.Item>

        {schedule.liveStream?.roomId && (
          <Descriptions.Item label="ID Phòng">
            <span className="font-mono">#{schedule.liveStream.roomId}</span>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Livestream">
          <Badge
            color={schedule.isLivestream ? "green" : "red"}
            text={schedule.isLivestream ? "Yes" : "No"}
          />
        </Descriptions.Item>

        {schedule.maxCapacity && (
          <Descriptions.Item label="Sức Chứa Tối Đa">
            <span className="font-medium">{schedule.maxCapacity} people</span>
          </Descriptions.Item>
        )}

        {schedule.currentCapacity !== null && schedule.activity?.activityType === "Optional" && (
          <Descriptions.Item label="Số Trại Viên Tham Gia">
            <span className="font-medium">
              {schedule.currentCapacity}
            </span>
          </Descriptions.Item>
        )}

        {/* Display assigned groups for Core activities */}
        {schedule.activity?.activityType === "Core" && (
          <Descriptions.Item label="Nhóm">
            {loadingGroups ? (
              <div className="flex items-center gap-2">
                <Spin size="small" />
                <span className="text-sm text-gray-500">Đang tải...</span>
              </div>
            ) : assignedGroups.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assignedGroups.map((group) => (
                  <Tag key={group.groupId} color="blue">
                    {group.groupName}
                  </Tag>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Chưa phân nhóm
              </span>
            )}
          </Descriptions.Item>
        )}
      </Descriptions>
      </div>

      <div className="schedule-detail-footer">
        <Button onClick={onClose}>Đóng</Button>
        {canStartLiveStream && (
          <Button
            type="primary"
            style={{ backgroundColor: "#ef4444" }}
            icon={<Video size={16} />}
            onClick={onStartLiveStream}
          >
            Start Live Stream
          </Button>
        )}
        {canManage && (
          <>
            <Button
              type="primary"
              icon={<Edit size={16} />}
              onClick={onEdit}
            >
              Sửa
            </Button>
            {!['PendingAttendance', 'AttendanceChecked', 'Completed'].includes(schedule.status) && (
              <DeletePopover
                onConfirm={() => {
                  onDelete?.();
                  setDeletePopoverOpen(false);
                }}
                onCancel={() => setDeletePopoverOpen(false)}
                title="Huỷ Lịch Trình"
                message="Bạn có chắc chắn muốn huỷ lịch trình hoạt động này không?"
                confirmText="Huỷ"
                cancelText="Không"
                buttonText="Huỷ"
                buttonSize="middle"
                isOpen={deletePopoverOpen}
                onOpenChange={setDeletePopoverOpen}
              />
            )}
          </>
        )}
        {canApprove && (
          <>
            <Button
              type="primary"
              style={{ backgroundColor: "#10b981" }}
              icon={<Check size={16} />}
              onClick={onApprove}
            >
              Duyệt
            </Button>
            <Button danger icon={<X size={16} />} onClick={onReject}>
              Từ Chối
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleDetail;

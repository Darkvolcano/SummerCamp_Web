import React from "react";
import { Descriptions, Badge, Button } from "antd";
import { Edit, Trash2, Check, X } from "lucide-react";
import type { ActivityScheduleResponseDto } from "../../services/activityScheduleService";
import "./ScheduleDetail.css";

interface ScheduleDetailProps {
  schedule: ActivityScheduleResponseDto;
  userRole?: 'manager' | 'staff' | 'driver' | 'admin';
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({
  schedule,
  userRole = 'admin',
  onClose,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  // Determine permissions
  const canManage = userRole === 'manager';
  const canApprove = userRole === 'admin';

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
      case "CheckIn":
        return "green";
      case "CheckOut":
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

  return (
    <div className="schedule-detail-sidebar">
      <div className="schedule-detail-header">
        <h2>Schedule Details</h2>
        <div className="header-actions">
          <button className="icon-btn close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="schedule-detail-content">
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Activity Schedule ID">
          <span className="font-mono">#{schedule.activityScheduleId}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Activity Name">
          <span className="font-medium">{schedule.activity?.name || "N/A"}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Activity Type">
          <Badge
            color={getActivityTypeColor(schedule.activity?.activityType || "Core")}
            text={schedule.activity?.activityType || "Core"}
          />
        </Descriptions.Item>

        {schedule.activity?.description && (
          <Descriptions.Item label="Description">
            <span className="text-sm">{schedule.activity.description}</span>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Status">
          <Badge
            status={getStatusColor(schedule.status) as any}
            text={schedule.status}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Start Time">
          <span className="font-mono">
            {formatDateTime(schedule.startTime)}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="End Time">
          <span className="font-mono">
            {formatDateTime(schedule.endTime)}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Staff ID">
          <span className="font-mono">#{schedule.staff?.userId || "N/A"}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Staff Name">
          <span className="font-medium">{schedule.staff?.fullName || "N/A"}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Location ID">
          <span className="font-mono">#{schedule.location?.id || "N/A"}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Location Name">
          <span className="font-medium">{schedule.location?.name || "N/A"}</span>
        </Descriptions.Item>

        {schedule.liveStream?.roomId && (
          <Descriptions.Item label="Room ID">
            <span className="font-mono">#{schedule.liveStream.roomId}</span>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Livestream">
          <Badge
            color={schedule.isLivestream ? "green" : "red"}
            text={schedule.isLivestream ? "Yes" : "No"}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Is Optional">
          <Badge
            color={schedule.isOptional ? "gold" : "blue"}
            text={schedule.isOptional ? "Yes" : "No"}
          />
        </Descriptions.Item>

        {schedule.maxCapacity && (
          <Descriptions.Item label="Max Capacity">
            <span className="font-medium">{schedule.maxCapacity} people</span>
          </Descriptions.Item>
        )}

        {schedule.currentCapacity !== null && (
          <Descriptions.Item label="Current Capacity">
            <span className="font-medium">
              {schedule.currentCapacity} / {schedule.maxCapacity || "Unlimited"}
            </span>
          </Descriptions.Item>
        )}
      </Descriptions>
      </div>

      <div className="schedule-detail-footer">
        <Button onClick={onClose}>Close</Button>
        {canManage && (
          <>
            <Button
              type="primary"
              icon={<Edit size={16} />}
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button danger icon={<Trash2 size={16} />} onClick={onDelete}>
              Delete
            </Button>
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
              Approve
            </Button>
            <Button danger icon={<X size={16} />} onClick={onReject}>
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleDetail;

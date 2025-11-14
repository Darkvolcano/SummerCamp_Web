import React from "react";
import { Modal, Button, Descriptions, Badge, Space } from "antd";
import { Edit, Trash2 } from "lucide-react";
import type { ActivityScheduleResponseDto } from "../../../services/activityScheduleService";

interface ActivityScheduleDetailProps {
  schedule: ActivityScheduleResponseDto;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActivityScheduleDetail: React.FC<ActivityScheduleDetailProps> = ({
  schedule,
  onClose,
  onEdit,
  onDelete,
}) => {
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
      default:
        return "default";
    }
  };

  return (
    <Modal
      title="Activity Schedule Details"
      open={true}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="edit"
          type="primary"
          icon={<Edit size={16} />}
          onClick={onEdit}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Edit
        </Button>,
        <Button
          key="delete"
          danger
          icon={<Trash2 size={16} />}
          onClick={onDelete}
        >
          Delete
        </Button>,
      ]}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Activity Name">
          <span className="font-medium">{schedule.activity?.name || "N/A"}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Activity Type">
          <Badge
            color={getActivityTypeColor(schedule.activity?.activityType || "Core")}
            text={schedule.activity?.activityType || "Core"}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Badge
            status={getStatusColor(schedule.status) as any}
            text={schedule.status}
          />
        </Descriptions.Item>

        <Descriptions.Item label="Start Time">
          <span className="font-mono">
            {new Date(schedule.startTime).toLocaleString()}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="End Time">
          <span className="font-mono">
            {new Date(schedule.endTime).toLocaleString()}
          </span>
        </Descriptions.Item>

        <Descriptions.Item label="Staff ID">
          <span className="font-mono">#{schedule.staffId}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Location ID">
          <span className="font-mono">#{schedule.locationId}</span>
        </Descriptions.Item>

        {schedule.roomId && (
          <Descriptions.Item label="Room ID">
            <span className="font-mono">#{schedule.roomId}</span>
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Livestream">
          <Badge
            color={schedule.isLivestream ? "green" : "red"}
            text={schedule.isLivestream ? "Yes" : "No"}
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

        <Descriptions.Item label="Activity Type">
          <Badge
            color={schedule.isOptional ? "gold" : "blue"}
            text={schedule.isOptional ? "Optional" : "Mandatory"}
          />
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ActivityScheduleDetail;

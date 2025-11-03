import React from "react";
import { X, Calendar, Clock, MapPin, Users, Copy, Trash2, Edit } from "lucide-react";
import type { Activity } from "./Calendar";
import "./ActivityDetail.css";

interface ActivityDetailProps {
  activity: Activity;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({
  activity,
  onClose,
  onEdit,
  onDelete,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (start: Date, end: Date) => {
    const startTime = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(start);
    const endTime = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(end);
    return `${startTime} - ${endTime}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Core":
        return "#3b82f6";
      case "Core-Optional":
        return "#10b981";
      case "Optional":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="activity-detail-sidebar">
      <div className="activity-detail-header">
        <h2>{activity.title}</h2>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => navigator.clipboard.writeText(activity.id)}>
            <Copy size={18} />
          </button>
          <button className="icon-btn" onClick={() => onDelete(activity.id)}>
            <Trash2 size={18} />
          </button>
          <button className="icon-btn" onClick={() => onEdit(activity)}>
            <Edit size={18} />
          </button>
          <button className="icon-btn close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="activity-detail-content">
        <div className="detail-item">
          <Calendar size={18} />
          <span>{formatDate(activity.start)}</span>
        </div>

        <div className="detail-item">
          <Clock size={18} />
          <span>{formatTime(activity.start, activity.end)}</span>
        </div>

        {activity.location && (
          <div className="detail-item">
            <MapPin size={18} />
            <span>{activity.location}</span>
          </div>
        )}

        <div className="detail-item">
          <Users size={18} />
          <span>
            {activity.participants} participants
            {activity.type === "Core-Optional" && " (5 yes, 1 awaiting)"}
          </span>
        </div>

        <div className="detail-section">
          <h3>Activity Type</h3>
          <span
            className="activity-type-badge"
            style={{ backgroundColor: getTypeColor(activity.type) }}
          >
            {activity.type}
          </span>
        </div>

        {activity.description && (
          <div className="detail-section">
            <h3>About this event</h3>
            <p>{activity.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Activity } from "./Calendar";
import "./ActivityForm.css";

interface ActivityFormProps {
  activity: Activity | null;
  initialDate: { start: Date; end: Date } | null;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  initialDate,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "Core" as "Core" | "Core-Optional" | "Optional",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    description: "",
    participants: 0,
  });

  useEffect(() => {
    if (activity) {
      const start = new Date(activity.start);
      const end = new Date(activity.end);
      setFormData({
        title: activity.title,
        type: activity.type,
        startDate: start.toISOString().split("T")[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split("T")[0],
        endTime: end.toTimeString().slice(0, 5),
        location: activity.location || "",
        description: activity.description || "",
        participants: activity.participants || 0,
      });
    } else if (initialDate) {
      const start = new Date(initialDate.start);
      const end = new Date(initialDate.end);
      setFormData((prev) => ({
        ...prev,
        startDate: start.toISOString().split("T")[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split("T")[0],
        endTime: end.toTimeString().slice(0, 5),
      }));
    }
  }, [activity, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);

    const newActivity: Activity = {
      id: activity?.id || Date.now().toString(),
      title: formData.title,
      type: formData.type,
      start,
      end,
      location: formData.location,
      description: formData.description,
      participants: formData.participants,
    };

    onSave(newActivity);
  };

  return (
    <div className="activity-form-sidebar">
      <div className="form-header">
        <h2>{activity ? "Edit Activity" : "Add Activity"}</h2>
        <button className="icon-btn close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form className="activity-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Activity Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Product demo"
            required
          />
        </div>

        <div className="form-group">
          <label>Activity Type *</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as "Core" | "Core-Optional" | "Optional",
              })
            }
          >
            <option value="Core">Core Activity</option>
            <option value="Core-Optional">Core - Optional</option>
            <option value="Optional">Optional</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Start Time *</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>End Time *</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Zoom Meeting, Camp Ground A"
          />
        </div>

        <div className="form-group">
          <label>Expected Participants</label>
          <input
            type="number"
            value={formData.participants}
            onChange={(e) =>
              setFormData({ ...formData, participants: parseInt(e.target.value) || 0 })
            }
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the activity..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-save">
            {activity ? "Update" : "Create"} Activity
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
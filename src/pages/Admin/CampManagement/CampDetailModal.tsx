import { useEffect } from "react";
import {
  X,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Tag,
} from "lucide-react";
import type { CampResponseDto } from "../../../services/campService";
import "./CampDetailModal.css";

interface CampDetailModalProps {
  camp: CampResponseDto;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CampDetailModal({
  camp,
  onClose,
  onEdit,
  onDelete,
}: CampDetailModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate duration
  const getDuration = () => {
    const start = new Date(camp.startDate);
    const end = new Date(camp.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase();
    return <span className={`status-badge ${statusClass}`}>{status}</span>;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content camp-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <h2>{camp.name}</h2>
            {getStatusBadge(camp.status)}
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="detail-scroll">
          {/* Image */}
          {camp.image && (
            <div className="detail-image">
              <img src={camp.image} alt={camp.name} />
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="quick-info-grid">
            <div className="info-card">
              <div className="info-icon calendar">
                <Calendar size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Duration</p>
                <p className="info-value">{getDuration()} Days</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon location">
                <MapPin size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Location</p>
                <p className="info-value">{camp.place}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon users">
                <Users size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Capacity</p>
                <p className="info-value">
                  {camp.minParticipants} - {camp.maxParticipants}
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon price">
                <DollarSign size={24} />
              </div>
              <div className="info-content">
                <p className="info-label">Price</p>
                <p className="info-value">{formatPrice(camp.price)}</p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="detail-section">
            <h3 className="section-title">Description</h3>
            <p className="section-content">{camp.description}</p>
          </div>

          {/* Dates Section */}
          <div className="detail-section">
            <h3 className="section-title">
              <Calendar size={20} />
              Dates & Schedule
            </h3>
            <div className="dates-grid">
              <div className="date-item">
                <p className="date-label">Start Date</p>
                <p className="date-value">{formatDate(camp.startDate)}</p>
              </div>
              <div className="date-item">
                <p className="date-label">End Date</p>
                <p className="date-value">{formatDate(camp.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="detail-section">
            <h3 className="section-title">
              <MapPin size={20} />
              Location Details
            </h3>
            <div className="location-details">
              <div className="location-item">
                <p className="location-label">Place Name</p>
                <p className="location-value">{camp.place}</p>
              </div>
              <div className="location-item">
                <p className="location-label">Full Address</p>
                <p className="location-value">{camp.address}</p>
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className="detail-section">
            <h3 className="section-title">
              <Users size={20} />
              Participant Information
            </h3>
            <div className="participants-details">
              <div className="participant-stat">
                <p className="stat-label">Minimum Required</p>
                <p className="stat-value">{camp.minParticipants} people</p>
              </div>
              <div className="participant-stat">
                <p className="stat-label">Maximum Capacity</p>
                <p className="stat-value">{camp.maxParticipants} people</p>
              </div>
              <div className="participant-stat">
                <p className="stat-label">Available Spots</p>
                <p className="stat-value highlight">
                  {camp.maxParticipants - camp.minParticipants} spots
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(camp.campType?.id || camp.location?.id) && (
            <div className="detail-section">
              <h3 className="section-title">
                <Tag size={20} />
                Additional Information
              </h3>
              <div className="additional-info">
                {camp.campType?.id && (
                  <div className="info-item">
                    <span className="info-key">Camp Type ID:</span>
                    <span className="info-val">{camp.campType.id}</span>
                  </div>
                )}
                {camp.location?.id && (
                  <div className="info-item">
                    <span className="info-key">Location ID:</span>
                    <span className="info-val">{camp.location.id}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-key">Camp ID:</span>
                  <span className="info-val">#{camp.campId}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn-delete" onClick={onDelete}>
            <Trash2 size={20} />
            Delete Camp
          </button>
          <button className="btn-edit" onClick={onEdit}>
            <Edit2 size={20} />
            Edit Camp
          </button>
        </div>
      </div>
    </div>
  );
}

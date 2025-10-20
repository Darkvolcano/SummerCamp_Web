import { useEffect } from "react";
import {
    X,
    Edit2,
    Trash2,
    Truck,
    Tag,
    Users,
    Hash,
    AlertCircle,
    Calendar,
    Clock,
    Shield,
    Fuel,
    Gauge,
    MapPin,
} from "lucide-react";
import type { VehicleResponseDto } from "../../../services/vehicleService";
import "./VehicleDetailModal.css";

interface VehicleDetailModalProps {
    vehicle: VehicleResponseDto;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function VehicleDetailModal({
    vehicle,
    onClose,
    onEdit,
    onDelete,
}: VehicleDetailModalProps) {
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

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusClass = status?.toLowerCase() || '';
        return <span className={`status-badge ${statusClass}`}>{status || 'N/A'}</span>;
    };

    // Get status icon
    const getStatusIcon = () => {
        const status = vehicle.status?.toLowerCase() || '';
        if (status === "available") {
            return <AlertCircle size={24} className="status-icon-available" />;
        } else if (status === "in use") {
            return <AlertCircle size={24} className="status-icon-in-use" />;
        } else if (status === "maintenance") {
            return <AlertCircle size={24} className="status-icon-maintenance" />;
        }
        return <AlertCircle size={24} className="status-icon-inactive" />;
    };

    return (
        <div className="vehicle-detail-modal-overlay" onClick={onClose}>
            <div className="vehicle-detail-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="header-left">
                        <h2>{vehicle.vehicleName}</h2>
                        {getStatusBadge(vehicle.status)}
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="detail-scroll">
                    {/* Vehicle Icon */}
                    <div className="vehicle-icon-container">
                        <div className="vehicle-icon-large">
                            <Truck size={64} />
                        </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="quick-info-grid">
                        <div className="info-card">
                            <div className="info-icon number">
                                <Hash size={24} />
                            </div>
                            <div className="info-content">
                                <p className="info-label">Vehicle Number</p>
                                <p className="info-value">{vehicle.vehicleNumber}</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon type">
                                <Tag size={24} />
                            </div>
                            <div className="info-content">
                                <p className="info-label">Type</p>
                                <p className="info-value">
                                    {vehicle.vehicleTypeNavigation?.name || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon capacity">
                                <Users size={24} />
                            </div>
                            <div className="info-content">
                                <p className="info-label">Capacity</p>
                                <p className="info-value">{vehicle.capacity} Passengers</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon status-info">
                                {getStatusIcon()}
                            </div>
                            <div className="info-content">
                                <p className="info-label">Current Status</p>
                                <p className="info-value">{vehicle.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="detail-section">
                        <h3 className="section-title">
                            <Truck size={20} />
                            Vehicle Information
                        </h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Hash size={16} />
                                    Vehicle ID
                                </span>
                                <span className="detail-value">{vehicle.vehicleId}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Truck size={16} />
                                    Vehicle Name
                                </span>
                                <span className="detail-value">{vehicle.vehicleName}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Hash size={16} />
                                    Vehicle Number
                                </span>
                                <span className="detail-value vehicle-number-badge">{vehicle.vehicleNumber}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Users size={16} />
                                    Passenger Capacity
                                </span>
                                <span className="detail-value">{vehicle.capacity} passengers</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Tag size={16} />
                                    Vehicle Type
                                </span>
                                <span className="detail-value">
                                    {vehicle.vehicleTypeNavigation?.name || "Not assigned"}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <AlertCircle size={16} />
                                    Current Status
                                </span>
                                <span className="detail-value">{getStatusBadge(vehicle.status)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="detail-section">
                        <h3 className="section-title">
                            <Shield size={20} />
                            Additional Information
                        </h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="detail-label">
                                    <MapPin size={16} />
                                    Current Location
                                </span>
                                <span className="detail-value text-muted">Camp Parking Area</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Fuel size={16} />
                                    Fuel Status
                                </span>
                                <span className="detail-value text-success">Full Tank</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Gauge size={16} />
                                    Total Mileage
                                </span>
                                <span className="detail-value">25,480 km</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Calendar size={16} />
                                    Last Maintenance
                                </span>
                                <span className="detail-value">Oct 10, 2025</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Clock size={16} />
                                    Next Service Due
                                </span>
                                <span className="detail-value text-warning">Nov 15, 2025</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <Shield size={16} />
                                    Insurance Status
                                </span>
                                <span className="detail-value text-success">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Type Description Section */}
                    {vehicle.vehicleTypeNavigation?.description && (
                        <div className="detail-section description-section">
                            <h3 className="section-title">
                                <Tag size={20} />
                                Vehicle Type Description
                            </h3>
                            <p className="section-content">
                                {vehicle.vehicleTypeNavigation.description}
                            </p>
                        </div>
                    )}

                    {/* Usage Statistics */}
                    <div className="detail-section stats-section">
                        <h3 className="section-title">
                            <Gauge size={20} />
                            Usage Statistics
                        </h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-icon trips">
                                    <MapPin size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">156</span>
                                    <span className="stat-label">Total Trips</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon distance">
                                    <Truck size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">2,480 km</span>
                                    <span className="stat-label">Distance This Month</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon hours">
                                    <Clock size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">89 hrs</span>
                                    <span className="stat-label">Active Hours</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon efficiency">
                                    <Fuel size={20} />
                                </div>
                                <div className="stat-content">
                                    <span className="stat-value">98%</span>
                                    <span className="stat-label">Efficiency Rate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button className="btn-edit" onClick={onEdit}>
                        <Edit2 size={18} />
                        <span>Edit Vehicle</span>
                    </button>
                    <button className="btn-delete" onClick={onDelete}>
                        <Trash2 size={18} />
                        <span>Delete Vehicle</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import vehicleService, {
    type VehicleResponseDto,
    type VehicleRequestDto,
    type VehicleType,
} from "../../../services/vehicleService";
import { message } from "antd";
import "./VehicleFormModal.css";

interface VehicleFormModalProps {
    vehicle: VehicleResponseDto | null;
    isEditing: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function VehicleFormModal({
    vehicle,
    isEditing,
    onClose,
    onSuccess,
}: VehicleFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [formData, setFormData] = useState<VehicleRequestDto>({
        vehicleName: "",
        vehicleNumber: "",
        capacity: 0,
        status: "Available",
        vehicleType: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch vehicle types
    useEffect(() => {
        const fetchVehicleTypes = async () => {
            try {
                const data = await vehicleService.getActiveVehicleTypes();
                setVehicleTypes(data);
            } catch (error) {
                console.error("Error fetching vehicle types:", error);
                message.error("Failed to load vehicle types");
            }
        };
        fetchVehicleTypes();
    }, []);

    // Initialize form data
    useEffect(() => {
        if (vehicle && isEditing) {
            console.log("🔄 [VehicleFormModal] Initializing form with vehicle:", vehicle);
            console.log("🔑 [VehicleFormModal] vehicle.vehicleType:", vehicle.vehicleType);
            console.log("📦 [VehicleFormModal] vehicle.vehicleTypeNavigation:", vehicle.vehicleTypeNavigation);

            setFormData({
                vehicleName: vehicle.vehicleName,
                vehicleNumber: vehicle.vehicleNumber,
                capacity: vehicle.capacity,
                status: vehicle.status,
                vehicleType: vehicle.vehicleType,
            });

            console.log("✅ [VehicleFormModal] Form data set to:", {
                vehicleName: vehicle.vehicleName,
                vehicleNumber: vehicle.vehicleNumber,
                capacity: vehicle.capacity,
                status: vehicle.status,
                vehicleType: vehicle.vehicleType,
            });
        }
    }, [vehicle, isEditing]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.vehicleName || !formData.vehicleName.trim()) {
            newErrors.vehicleName = "Vehicle name is required";
        }

        if (!formData.vehicleNumber || !formData.vehicleNumber.trim()) {
            newErrors.vehicleNumber = "Vehicle number is required";
        }

        if (!formData.capacity || formData.capacity <= 0) {
            newErrors.capacity = "Capacity must be greater than 0";
        }

        if (!formData.status || !formData.status.trim()) {
            newErrors.status = "Status is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("📝 [VehicleFormModal] Form submitted");
        console.log("📋 [VehicleFormModal] Current formData:", formData);

        if (!validate()) {
            message.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && vehicle) {
                console.log("🔄 [VehicleFormModal] Updating vehicle ID:", vehicle.vehicleId);
                console.log("📤 [VehicleFormModal] Update payload:", formData);

                await vehicleService.updateVehicle(vehicle.vehicleId, formData);
                message.success("Vehicle updated successfully");
            } else {
                console.log("➕ [VehicleFormModal] Creating new vehicle");
                console.log("📤 [VehicleFormModal] Create payload:", formData);

                await vehicleService.createVehicle(formData);
                message.success("Vehicle created successfully");
            }
            onSuccess();
        } catch (error: any) {
            console.error("❌ [VehicleFormModal] Error saving vehicle:", error);
            console.error("❌ [VehicleFormModal] Error response:", error.response?.data);
            message.error(error.response?.data?.message || "Failed to save vehicle");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof VehicleRequestDto, value: any) => {
        console.log(`🔄 [VehicleFormModal] Field "${field}" changed to:`, value);
        console.log(`📊 [VehicleFormModal] Value type:`, typeof value);

        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            console.log(`✅ [VehicleFormModal] New formData after ${field} change:`, newData);
            return newData;
        });

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>{isEditing ? "Edit Vehicle" : "Add New Vehicle"}</h2>
                    <button className="btn-close" onClick={onClose} disabled={loading}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        {/* Vehicle Name */}
                        <div className="form-group full-width">
                            <label htmlFor="vehicleName">
                                Vehicle Name <span className="required">*</span>
                            </label>
                            <input
                                id="vehicleName"
                                type="text"
                                placeholder="e.g., School Bus #1"
                                value={formData.vehicleName}
                                onChange={(e) => handleChange("vehicleName", e.target.value)}
                                className={errors.vehicleName ? "error" : ""}
                                disabled={loading}
                            />
                            {errors.vehicleName && (
                                <span className="error-message">{errors.vehicleName}</span>
                            )}
                        </div>

                        {/* Vehicle Number */}
                        <div className="form-group">
                            <label htmlFor="vehicleNumber">
                                Vehicle Number <span className="required">*</span>
                            </label>
                            <input
                                id="vehicleNumber"
                                type="text"
                                placeholder="e.g., ABC-1234"
                                value={formData.vehicleNumber}
                                onChange={(e) => handleChange("vehicleNumber", e.target.value)}
                                className={errors.vehicleNumber ? "error" : ""}
                                disabled={loading}
                            />
                            {errors.vehicleNumber && (
                                <span className="error-message">{errors.vehicleNumber}</span>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="form-group">
                            <label htmlFor="capacity">
                                Capacity <span className="required">*</span>
                            </label>
                            <input
                                id="capacity"
                                type="number"
                                placeholder="e.g., 45"
                                value={formData.capacity || ""}
                                onChange={(e) =>
                                    handleChange("capacity", parseInt(e.target.value) || 0)
                                }
                                className={errors.capacity ? "error" : ""}
                                disabled={loading}
                                min="1"
                            />
                            {errors.capacity && (
                                <span className="error-message">{errors.capacity}</span>
                            )}
                        </div>

                        {/* Vehicle Type */}
                        <div className="form-group">
                            <label htmlFor="vehicleType">Vehicle Type</label>
                            <select
                                id="vehicleType"
                                value={formData.vehicleType || ""}
                                onChange={(e) =>
                                    handleChange(
                                        "vehicleType",
                                        e.target.value ? parseInt(e.target.value) : null
                                    )
                                }
                                disabled={loading}
                            >
                                <option value="">Select Vehicle Type</option>
                                {vehicleTypes.map((type) => (
                                    <option key={type.vehicleTypeId} value={type.vehicleTypeId}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            <p className="field-hint">Optional: Categorize this vehicle</p>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label htmlFor="status">
                                Status <span className="required">*</span>
                            </label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className={errors.status ? "error" : ""}
                                disabled={loading}
                            >
                                <option value="Available">Available</option>
                                <option value="In Use">In Use</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            {errors.status && (
                                <span className="error-message">{errors.status}</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spinning" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{isEditing ? "Update" : "Create"} Vehicle</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

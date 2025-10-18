import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import vehicleService, { type VehicleType } from "../../../services/vehicleService";
import { message } from "antd";
import "./VehicleTypeFormModal.css";

interface VehicleTypeFormModalProps {
    vehicleType: VehicleType | null;
    isEditing: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function VehicleTypeFormModal({
    vehicleType,
    isEditing,
    onClose,
    onSuccess,
}: VehicleTypeFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (vehicleType && isEditing) {
            setFormData({
                name: vehicleType.name,
                description: vehicleType.description || "",
                isActive: vehicleType.isActive ?? true,
            });
        }
    }, [vehicleType, isEditing]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || !formData.name.trim()) {
            newErrors.name = "Type name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            message.error("Please fix the errors in the form");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && vehicleType) {
                await vehicleService.updateVehicleType(vehicleType.vehicleTypeId, {
                    vehicleTypeId: vehicleType.vehicleTypeId,
                    ...formData,
                });
                message.success("Vehicle type updated successfully");
            } else {
                await vehicleService.createVehicleType(formData);
                message.success("Vehicle type created successfully");
            }
            onSuccess();
        } catch (error: any) {
            console.error("Error saving vehicle type:", error);
            message.error(error.response?.data?.message || "Failed to save vehicle type");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <h2>{isEditing ? "Edit Vehicle Type" : "Create Vehicle Type"}</h2>
                    <button className="btn-close" onClick={onClose} disabled={loading}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        {/* Type Name */}
                        <div className="form-group full-width">
                            <label htmlFor="name">
                                Type Name <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="e.g., Bus, Van, Mini Van"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={errors.name ? "error" : ""}
                                disabled={loading}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        {/* Description */}
                        <div className="form-group full-width">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter vehicle type description..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={4}
                                disabled={loading}
                            />
                        </div>

                        {/* Is Active */}
                        <div className="form-group full-width">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange("isActive", e.target.checked)}
                                    disabled={loading}
                                />
                                <span>Active</span>
                            </label>
                            <p className="field-hint">
                                Active vehicle types can be assigned to vehicles
                            </p>
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
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spinning" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{isEditing ? "Update" : "Create"} Type</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

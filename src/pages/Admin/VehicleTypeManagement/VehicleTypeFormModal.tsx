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
            message.error("Vui lòng sửa lỗi trong biểu mẫu");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && vehicleType) {
                await vehicleService.updateVehicleType(vehicleType.vehicleTypeId, {
                    vehicleTypeId: vehicleType.vehicleTypeId,
                    ...formData,
                });
                message.success("Cập nhật loại phương tiện thành công");
            } else {
                await vehicleService.createVehicleType(formData);
                message.success("Tạo loại phương tiện thành công");
            }
            onSuccess();
        } catch (error: any) {
            console.error("Error saving vehicle type:", error);
            message.error(error.response?.data?.message || "Không thể lưu loại phương tiện");
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
                    <h2>{isEditing ? "Chỉnh Sửa Loại Phương Tiện" : "Tạo Loại Phương Tiện"}</h2>
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
                                Tên Loại <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Ví dụ: Xe Buýt, Xe Van, Xe 16 Chỗ"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={errors.name ? "error" : ""}
                                disabled={loading}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        {/* Description */}
                        <div className="form-group full-width">
                            <label htmlFor="description">Mô Tả</label>
                            <textarea
                                id="description"
                                placeholder="Nhập mô tả loại phương tiện..."
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
                                <span>Hoạt động</span>
                            </label>
                            <p className="field-hint">
                                Loại phương tiện hoạt động có thể được gán cho các phương tiện
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
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spinning" />
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{isEditing ? "Cập Nhật" : "Tạo"} Loại</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

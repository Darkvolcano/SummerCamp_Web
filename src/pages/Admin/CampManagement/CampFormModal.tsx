import { useState, useEffect } from "react";
import {
  X,
  Save,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import campService, {
  type CampRequestDto,
  type CampResponseDto,
} from "../../../services/campService";
import { message } from "antd";
import "./CampFormModal.css";

interface CampFormModalProps {
  camp: CampResponseDto | null;
  isEditing: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CampFormModal({
  camp,
  isEditing,
  onClose,
  onSuccess,
}: CampFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampRequestDto>({
    name: "",
    description: "",
    place: "",
    address: "",
    minParticipants: 10,
    maxParticipants: 50,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    image: "",
    campTypeId: null,
    locationId: null,
    price: 0,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CampRequestDto, string>>
  >({});

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

  // Load camp data if editing
  useEffect(() => {
    if (isEditing && camp) {
      // Format dates to YYYY-MM-DD for date inputs
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setFormData({
        name: camp.name || "",
        description: camp.description || "",
        place: camp.place || "",
        address: camp.address || "",
        minParticipants: camp.minParticipants || 10,
        maxParticipants: camp.maxParticipants || 50,
        startDate: formatDateForInput(camp.startDate),
        endDate: formatDateForInput(camp.endDate),
        image: camp.image || "",
        campTypeId: camp.campType?.id ?? null,
        locationId: camp.location?.id ?? null,
        price: camp.price || 0,
      });
    }
  }, [isEditing, camp]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "minParticipants" || name === "maxParticipants"
          ? value === ""
            ? 0
            : Number(value) // Convert empty to 0, not null
          : name === "price" || name === "campTypeId" || name === "locationId"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof CampRequestDto]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CampRequestDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Camp name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.place.trim()) {
      newErrors.place = "Place is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (formData.minParticipants < 1) {
      newErrors.minParticipants = "Minimum participants must be at least 1";
    }

    if (formData.maxParticipants < formData.minParticipants) {
      newErrors.maxParticipants = "Maximum must be greater than minimum";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (formData.price < 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      message.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && camp) {
        await campService.updateCamp(camp.campId, formData);
        message.success("Camp updated successfully");
      } else {
        await campService.createCamp(formData);
        message.success("Camp created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving camp:", error);
      message.error(error.response?.data?.message || "Failed to save camp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content camp-form-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>{isEditing ? "Edit Camp" : "Create New Camp"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="camp-form">
          <div className="form-scroll">
            {/* Camp Name */}
            <div className="form-group">
              <label htmlFor="name">
                Camp Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Summer Adventure Camp 2024"
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the camp activities, goals, and unique features..."
                rows={4}
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            {/* Place & Address */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="place">
                  <MapPin size={16} />
                  Place <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="place"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  placeholder="e.g., Mountain View Resort"
                  className={errors.place ? "error" : ""}
                />
                {errors.place && (
                  <span className="error-message">{errors.place}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <MapPin size={16} />
                  Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  className={errors.address ? "error" : ""}
                />
                {errors.address && (
                  <span className="error-message">{errors.address}</span>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="minParticipants">
                  <Users size={16} />
                  Min Participants <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="minParticipants"
                  name="minParticipants"
                  value={formData.minParticipants}
                  onChange={handleChange}
                  min="1"
                  className={errors.minParticipants ? "error" : ""}
                />
                {errors.minParticipants && (
                  <span className="error-message">
                    {errors.minParticipants}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">
                  <Users size={16} />
                  Max Participants <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  className={errors.maxParticipants ? "error" : ""}
                />
                {errors.maxParticipants && (
                  <span className="error-message">
                    {errors.maxParticipants}
                  </span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  <Calendar size={16} />
                  Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? "error" : ""}
                />
                {errors.startDate && (
                  <span className="error-message">{errors.startDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  <Calendar size={16} />
                  End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? "error" : ""}
                />
                {errors.endDate && (
                  <span className="error-message">{errors.endDate}</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">
                <DollarSign size={16} />
                Price (VND) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1000"
                placeholder="0"
                className={errors.price ? "error" : ""}
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label htmlFor="image">
                <ImageIcon size={16} />
                Image URL
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="campTypeId">Camp Type ID (Optional)</label>
                <input
                  type="number"
                  id="campTypeId"
                  name="campTypeId"
                  value={formData.campTypeId || ""}
                  onChange={handleChange}
                  placeholder="Leave empty if not applicable"
                />
              </div>

              <div className="form-group">
                <label htmlFor="locationId">Location ID (Optional)</label>
                <input
                  type="number"
                  id="locationId"
                  name="locationId"
                  value={formData.locationId || ""}
                  onChange={handleChange}
                  placeholder="Leave empty if not applicable"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditing ? "Update Camp" : "Create Camp"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

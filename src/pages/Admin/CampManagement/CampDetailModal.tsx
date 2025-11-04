import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import campService, {
  type CampResponseDto,
  type CampRequestDto,
} from "../../../services/campService";
import campTypeService, {
  type CampTypeResponseDto,
} from "../../../services/campTypeService";
import locationService, {
  type LocationResponseDto,
} from "../../../services/LocationService";
import { message } from "antd";
import "./CampDetailModal.css";
import AddLocationModal from "./AddLocationModal";

interface CampDetailModalProps {
  camp: CampResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const CampDetailModal: React.FC<CampDetailModalProps> = ({
  camp,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const [formData, setFormData] = useState<CampRequestDto>({
    name: "",
    description: "",
    place: "",
    address: "",
    minParticipants: 0,
    maxParticipants: 0,
    minAge: 0,
    maxAge: 0,
    startDate: "",
    endDate: "",
    image: "",
    campTypeId: null,
    locationId: null,
    promotionId: null,
    price: 0,
    status: "PENDING_APPOVAL",
    registrationStartDate: "",
    registrationEndDate: "",
  });

  // Fetch camp types and locations on mount
  useEffect(() => {
    if (isOpen) {
      fetchCampTypes();
      fetchLocations();
    }
  }, [isOpen]);

  // Set form data when camp is selected
  useEffect(() => {
    if (camp && isOpen) {
      setFormData({
        name: camp.name,
        description: camp.description,
        place: camp.place,
        address: camp.address,
        minParticipants: camp.minParticipants,
        maxParticipants: camp.maxParticipants,
        minAge: camp.minAge,
        maxAge: camp.maxAge,
        startDate: camp.startDate,
        endDate: camp.endDate,
        image: camp.image,
        campTypeId: camp.campType?.id || null,
        locationId: camp.location?.id || null,
        promotionId: camp.promotion?.id || null,
        price: camp.price,
        status: camp.status,
        registrationStartDate: camp.registrationStartDate,
        registrationEndDate: camp.registrationEndDate,
      });
      setIsEditing(false);
    }
  }, [camp, isOpen]);

  const fetchCampTypes = async () => {
    try {
      const data = await campTypeService.getAllCampTypes();
      setCampTypes(data);
    } catch (error) {
      console.error("Error fetching camp types:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await locationService.getCampLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "campTypeId" ||
        name === "locationId" ||
        name === "promotionId" ||
        name === "minParticipants" ||
        name === "maxParticipants" ||
        name === "minAge" ||
        name === "maxAge" ||
        name === "price"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  const handleUpdate = async () => {
    if (!camp) return;

    try {
      setLoading(true);
      await campService.updateCamp(camp.campId, formData);
      message.success("Camp updated successfully!");
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating camp:", error);
      message.error("Failed to update camp");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!camp) return;

    if (window.confirm("Are you sure you want to delete this camp?")) {
      try {
        setLoading(true);
        await campService.deleteCamp(camp.campId);
        message.success("Camp deleted successfully!");
        onClose();
        onUpdate();
      } catch (error) {
        console.error("Error deleting camp:", error);
        message.error("Failed to delete camp");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddLocationSuccess = async () => {
    setShowAddLocation(false);
    await fetchLocations();
  };

  if (!isOpen || !camp) return null;

  return (
    <>
      <div className="camp-detail-modal-overlay" onClick={onClose}>
        <div className="camp-detail-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="camp-detail-modal-header">
            <h2 className="camp-detail-modal-title">Camp Details</h2>
            <button
              onClick={onClose}
              className="camp-detail-modal-close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="camp-detail-modal-body">
            {/* Camp Image */}
            <div className="camp-detail-image-container">
              <img
                src={formData.image}
                alt={formData.name}
                className="camp-detail-image"
              />
            </div>

            {/* Form Fields */}
            <div className="camp-detail-form">
              {/* Basic Info */}
              <div className="camp-detail-section">
                <h3 className="camp-detail-section-title">Basic Information</h3>

                <div className="camp-detail-form-group">
                  <label className="camp-detail-label">Camp Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="camp-detail-input"
                  />
                </div>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Place *</label>
                    <input
                      type="text"
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                </div>

                <div className="camp-detail-form-group">
                  <label className="camp-detail-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="camp-detail-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="camp-detail-section">
                <h3 className="camp-detail-section-title">Program Dates</h3>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                </div>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Registration Start *</label>
                    <input
                      type="date"
                      name="registrationStartDate"
                      value={formData.registrationStartDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Registration End *</label>
                    <input
                      type="date"
                      name="registrationEndDate"
                      value={formData.registrationEndDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                </div>
              </div>

              {/* Participants & Age */}
              <div className="camp-detail-section">
                <h3 className="camp-detail-section-title">Participants</h3>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Min Participants *</label>
                    <input
                      type="number"
                      name="minParticipants"
                      value={formData.minParticipants}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Max Participants *</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                </div>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Min Age *</label>
                    <input
                      type="number"
                      name="minAge"
                      value={formData.minAge}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Max Age *</label>
                    <input
                      type="number"
                      name="maxAge"
                      value={formData.maxAge}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>
                </div>
              </div>

              {/* Camp Type & Location */}
              <div className="camp-detail-section">
                <h3 className="camp-detail-section-title">Classification</h3>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Camp Type *</label>
                    <select
                      name="campTypeId"
                      value={formData.campTypeId || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-select"
                    >
                      <option value="">Select Camp Type</option>
                      {campTypes.map((type) => (
                        <option key={type.campTypeId} value={type.campTypeId}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Location *</label>
                    <div className="camp-detail-location-wrapper">
                      <select
                        name="locationId"
                        value={formData.locationId || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="camp-detail-select"
                      >
                        <option value="">Select Location</option>
                        {locations.map((loc) => (
                          <option key={loc.locationId} value={loc.locationId}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                      {isEditing && (
                        <button
                          onClick={() => setShowAddLocation(true)}
                          className="camp-detail-add-location-btn"
                          title="Add new location"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Status */}
              <div className="camp-detail-section">
                <h3 className="camp-detail-section-title">Pricing & Status</h3>

                <div className="camp-detail-form-row">
                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-input"
                    />
                  </div>

                  <div className="camp-detail-form-group">
                    <label className="camp-detail-label">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="camp-detail-select"
                    >
                      <option value="PENDING_APPOVAL">Pending Approval</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="OPEN_FOR_REGISTRATION">Open for Registration</option>
                      <option value="CLOSED">Closed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="camp-detail-modal-footer">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="camp-detail-btn-cancel"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="camp-detail-btn-save"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className="camp-detail-btn-delete"
                  disabled={loading}
                >
                  Delete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="camp-detail-btn-update"
                  disabled={loading}
                >
                  Update
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddLocation}
        onClose={() => setShowAddLocation(false)}
        onSuccess={handleAddLocationSuccess}
      />
    </>
  );
};

export default CampDetailModal;

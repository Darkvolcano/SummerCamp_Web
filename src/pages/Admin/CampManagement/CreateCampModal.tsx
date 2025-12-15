import React, { useState, useEffect } from "react";
import { X, Plus, Upload, Loader } from "lucide-react";
import { DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import { useNotification } from "../../../contexts/NotificationContext";
import campService, {
  type CampRequestDto,
} from "../../../services/campService";
import campTypeService, {
  type CampTypeResponseDto,
} from "../../../services/campTypeService";
import locationService, {
  type LocationResponseDto,
} from "../../../services/LocationService";
import promotionService, {
  type PromotionResponseDto,
} from "../../../services/promotionService";
import {
  uploadGenericImage,
  validateImageFile,
} from "../../../services/uploadService";
import AddLocationModal from "./AddLocationModal";

interface CreateCampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCampModal: React.FC<CreateCampModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponseDto[]>([]);
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
    registrationStartDate: "",
    registrationEndDate: "",
  });

  // Fetch camp types, locations, and promotions on mount
  useEffect(() => {
    if (isOpen) {
      fetchCampTypes();
      fetchLocations();
      fetchPromotions();
    }
  }, [isOpen]);

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

  const fetchPromotions = async () => {
    try {
      const data = await promotionService.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
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

  const handleCreate = async () => {
    // Validation
    if (
      !formData.name.trim() ||
      !formData.place.trim() ||
      !formData.address.trim() ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.registrationStartDate ||
      !formData.registrationEndDate ||
      !formData.price || formData.price <= 0 ||
      !formData.campTypeId ||
      !formData.locationId
    ) {
      toastError("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await campService.createCamp(formData);

      toastSuccess("Success", "Camp created successfully!");
      handleClose();
      onSuccess();
    } catch (error: any) {
      // Get error message
      let errorMsg = "Failed to create camp. Please try again.";

      if (error.response?.status === 401) {
        errorMsg = "Session expired. Please login again.";
      } else if (error.response?.status === 400) {
        errorMsg =
          error.response.data?.message ||
          "Validation error. Please check your input.";
      } else if (error.response?.status === 403) {
        errorMsg = "You don't have permission to create camps.";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      // Show error notification
      toastError("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
      registrationStartDate: "",
      registrationEndDate: "",
    });
    setImagePreview("");
    onClose();
  };

  const handleAddLocationSuccess = async () => {
    setShowAddLocation(false);
    await fetchLocations();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file, 5); // Max 5MB
      if (!validation.valid) {
        toastError(
          "Validation Error",
          validation.error || "Invalid image file"
        );
        return;
      }

      try {
        setImageUploading(true);

        // Upload to backend
        const result = await uploadGenericImage(file);

        // Show preview with uploaded image
        setImagePreview(result.url);

        // Store image URL in formData
        setFormData((prev) => ({
          ...prev,
          image: result.url,
        }));
      } catch (error: any) {
        let errorMsg = "Failed to upload image";
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        toastError("Upload Error", errorMsg);
        console.error("Image upload error:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    // Clear preview and form data
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  return (
    <>
      <Modal
        title="Create New Camp"
        open={isOpen}
        onCancel={handleClose}
        width={1000}
        footer={null}
        centered
        styles={{
          body: {
            maxHeight: "calc(100vh - 220px)",
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            padding: "16px 16px",
          },
        }}
        classNames={{
          header: "!pb-3",
          content: "create-camp-modal",
        }}
      >
        <style>{`
          .ant-modal-body::-webkit-scrollbar {
            display: none;
          }
          .create-camp-modal .ant-modal-header {
            border-bottom: none;
          }
          .create-camp-modal .ant-modal-title {
            font-size: 18px;
            font-weight: 600;
          }
        `}</style>
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Basic Information
            </h3>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter camp name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place *
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    placeholder="e.g., Mountain Area, Beach"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter camp description"
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Image
                </label>
                <div className="space-y-3">
                  {/* Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={imageUploading}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label
                    className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    style={{
                      pointerEvents: imageUploading ? "none" : "auto",
                      opacity: imageUploading ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {imageUploading ? (
                        <>
                          <Loader
                            size={18}
                            className="text-blue-500 animate-spin"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {imagePreview ? "Change Image" : "Upload Image"}
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Program Dates
            </h3>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <DatePicker
                    showTime
                    value={
                      formData.startDate ? dayjs(formData.startDate) : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        startDate: date ? date.toISOString() : "",
                      })
                    }
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <DatePicker
                    showTime
                    value={
                      formData.endDate ? dayjs(formData.endDate) : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        endDate: date ? date.toISOString() : "",
                      })
                    }
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Start *
                  </label>
                  <DatePicker
                    showTime
                    value={
                      formData.registrationStartDate
                        ? dayjs(formData.registrationStartDate)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        registrationStartDate: date
                          ? date.toISOString()
                          : "",
                      })
                    }
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration End *
                  </label>
                  <DatePicker
                    showTime
                    value={
                      formData.registrationEndDate
                        ? dayjs(formData.registrationEndDate)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        registrationEndDate: date ? date.toISOString() : "",
                      })
                    }
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Participants & Age */}
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Participants
            </h3>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Participants *
                  </label>
                  <input
                    type="number"
                    name="minParticipants"
                    value={formData.minParticipants}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants *
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Age *
                  </label>
                  <input
                    type="number"
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Age *
                  </label>
                  <input
                    type="number"
                    name="maxAge"
                    value={formData.maxAge}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Camp Type & Location */}
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Classification
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Type *
                </label>
                <select
                  name="campTypeId"
                  value={formData.campTypeId || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Camp Type</option>
                  {campTypes.map((type) => (
                    <option key={type.campTypeId} value={type.campTypeId}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="flex gap-2">
                  <select
                    name="locationId"
                    value={formData.locationId || ""}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.locationId} value={loc.locationId}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddLocation(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                    title="Add new location"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b-2 border-blue-600 inline-block">
              Pricing
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price ?? 0}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion (Optional)
                </label>
                <select
                  name="promotionId"
                  value={formData.promotionId ? formData.promotionId : ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">No Promotion</option>
                  {promotions.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name} ({promo.percent}% off)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Camp"}
          </button>
        </div>
      </Modal>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={showAddLocation}
        onClose={() => setShowAddLocation(false)}
        onSuccess={handleAddLocationSuccess}
      />
    </>
  );
};

export default CreateCampModal;

import React, { useState, useEffect } from "react";
import {
  X,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Plus,
  Loader,
} from "lucide-react";
import { DatePicker, Popover, Button, Spin } from "antd";
import dayjs from "dayjs";
import { useNotification } from "../../../../contexts/NotificationContext";
import campService, {
  type CampResponseDto,
  type CampRequestDto,
} from "../../../../services/campService";
import campTypeService, {
  type CampTypeResponseDto,
} from "../../../../services/campTypeService";
import locationService, {
  type LocationResponseDto,
} from "../../../../services/LocationService";
import promotionService, {
  type PromotionResponseDto,
} from "../../../../services/promotionService";
import attendanceLogService from "../../../../services/attendanceLogService";
import attendanceFolderService from "../../../../services/attendanceFolderService";
import {
  uploadImageToCloudinary,
  validateImageFile,
  deleteImageFromCloudinary,
} from "../../../../services/uploadService";
import { CampStatus } from "../../../../enums/camp-status.enum";
import AddLocationModal from "../AddLocationModal";

interface CampDetailOverviewProps {
  campId: number;
  onBack: () => void;
  onUpdate?: () => void;
}

const CampDetailOverview: React.FC<CampDetailOverviewProps> = ({
  campId,
  onBack,
  onUpdate,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedImagePublicId, setUploadedImagePublicId] =
    useState<string>("");
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponseDto[]>([]);
  const [openDeletePopover, setOpenDeletePopover] = useState(false);
  const [openApprovePopover, setOpenApprovePopover] = useState(false);
  const [openRejectPopover, setOpenRejectPopover] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const [campStatus, setCampStatus] = useState<string>("");
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

  // Fetch camp data and related data
  useEffect(() => {
    fetchCampData();
  }, [campId]);

  const fetchCampData = async () => {
    try {
      setLoading(true);
      const [campData, typesData, locationsData, promotionsData] =
        await Promise.all([
          campService.getCampById(campId),
          campTypeService.getAllCampTypes(),
          locationService.getAllLocations(),
          promotionService.getAllPromotions(),
        ]);

      setCamp(campData);
      setCampTypes(typesData);
      setLocations(locationsData);
      setPromotions(promotionsData);
      setImagePreview(""); // Reset preview when loading new camp

      // Set form data (without status)
      setFormData({
        name: campData.name,
        description: campData.description,
        place: campData.place,
        address: campData.address,
        minParticipants: campData.minParticipants,
        maxParticipants: campData.maxParticipants,
        minAge: campData.minAge,
        maxAge: campData.maxAge,
        startDate: campData.startDate,
        endDate: campData.endDate,
        image: campData.image,
        campTypeId: campData.campType?.id || null,
        locationId: campData.location?.id || null,
        promotionId: campData.promotion?.id || null,
        price: campData.price,
        registrationStartDate: campData.registrationStartDate,
        registrationEndDate: campData.registrationEndDate,
      });
      // Set status separately (for display only, not sent to server)
      setCampStatus(campData.status);
    } catch (error) {
      console.error("Error fetching camp data:", error);
      toastError("Error", "Failed to load camp details");
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    try {
      if (
        !formData.name.trim() ||
        !formData.place.trim() ||
        !formData.address.trim() ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.price || formData.price <= 0
      ) {
        toastError("Validation Error", "Please fill in all required fields");
        return;
      }

      await campService.updateCamp(campId, formData);
      toastSuccess("Success", "Camp updated successfully!");
      setIsEditing(false);
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = "Failed to update camp";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError("Error", errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this camp?")) return;

    try {
      await campService.deleteCamp(campId);
      toastSuccess("Success", "Camp deleted successfully!");
      onBack();
    } catch (error: any) {
      let errorMsg = "Failed to delete camp";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError("Error", errorMsg);
    }
  };

  const handleApprove = async () => {
    try {
      await campService.approveCamp(campId);
      toastSuccess('Success', 'Camp approved and published successfully!');
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = 'Failed to approve camp';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleReject = async () => {
    try {
      await campService.rejectCamp(campId);
      toastSuccess('Success', 'Camp rejected successfully!');
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = 'Failed to reject camp';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleOpenRegistration = async () => {
    try {
      await campService.updateCampStatusTest(campId, CampStatus.OPEN_FOR_REGISTRATION);
      toastSuccess('Success', 'Camp registration opened successfully!');
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = 'Failed to open registration';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleCloseRegistration = async () => {
    try {
      await campService.updateCampStatusTest(campId, CampStatus.REGISTRATION_CLOSED);
      toastSuccess('Success', 'Camp registration closed successfully!');
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = 'Failed to close registration';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleCreateAttendanceLogs = async () => {
    try {
      await attendanceLogService.createLogsForRegistrationClosedCamps();
      toastSuccess('Success', 'Attendance logs created successfully!');
    } catch (error: any) {
      let errorMsg = 'Failed to create attendance logs';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleCreateFolders = async () => {
    try {
      await attendanceFolderService.createFolders(campId);
      toastSuccess('Success', 'Attendance folders created successfully!');
    } catch (error: any) {
      let errorMsg = 'Failed to create folders';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handlePreloadFaceDatabase = async () => {
    try {
      await attendanceFolderService.preloadFaceDatabase(campId, false);
      toastSuccess('Success', 'Face database preloaded successfully!');
    } catch (error: any) {
      let errorMsg = 'Failed to preload face database';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Error', errorMsg);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 10);
      if (!validation.valid) {
        toastError(
          "Validation Error",
          validation.error || "Invalid image file"
        );
        return;
      }

      try {
        setImageUploading(true);
        const imageId = `camp_image_${Date.now()}`;

        const result = await uploadImageToCloudinary(file, "camp", imageId, 3);

        setImagePreview(result.url);
        setUploadedImagePublicId(result.publicId);

        setFormData((prev) => ({
          ...prev,
          image: result.url,
        }));
      } catch (error: any) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to upload image";
        toastError("Upload Error", errorMsg);
        console.error("Image upload error:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImagePublicId) {
      try {
        await deleteImageFromCloudinary(uploadedImagePublicId);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    setImagePreview("");
    setUploadedImagePublicId("");
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handleAddLocationSuccess = async () => {
    setShowAddLocation(false);
    await locationService.getAllLocations().then(setLocations);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading camp details..." />
      </div>
    );
  }

  if (!camp) {
    return <div className="p-6 text-center text-[#6B7280]">Camp not found</div>;
  }

  return (
    <>
      <div className="pb-12">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 justify-end">
          {camp.status === CampStatus.PENDING_APPOVAL && (
            <>
              <Popover
                content={
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Approve this camp?</p>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        type="primary"
                        danger={false}
                        onClick={() => {
                          handleApprove();
                          setOpenApprovePopover(false);
                        }}
                      >
                        Yes
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setOpenApprovePopover(false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                }
                title="Confirm Approval"
                trigger="click"
                open={openApprovePopover}
                onOpenChange={setOpenApprovePopover}
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium">
                  <CheckCircle size={18} />
                  Approve & Publish
                </button>
              </Popover>

              <Popover
                content={
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Reject this camp?</p>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        danger
                        onClick={() => {
                          handleReject();
                          setOpenRejectPopover(false);
                        }}
                      >
                        Yes
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setOpenRejectPopover(false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                }
                title="Confirm Rejection"
                trigger="click"
                open={openRejectPopover}
                onOpenChange={setOpenRejectPopover}
              >
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium">
                  <XCircle size={18} />
                  Reject
                </button>
              </Popover>
            </>
          )}
          {!isEditing &&
            [
              CampStatus.DRAFT,
              CampStatus.PENDING_APPOVAL,
              CampStatus.CANCELED,
            ].includes(camp.status as CampStatus) && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  <Edit2 size={18} />
                  Update
                </button>
                <Popover
                  content={
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Cancel this camp?</p>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          danger
                          onClick={() => {
                            handleDelete();
                            setOpenDeletePopover(false);
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setOpenDeletePopover(false)}
                        >
                          No
                        </Button>
                      </div>
                    </div>
                  }
                  title="Confirm Delete"
                  trigger="click"
                  open={openDeletePopover}
                  onOpenChange={setOpenDeletePopover}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium">
                    <Trash2 size={18} />
                    Cancel
                  </button>
                </Popover>
              </>
            )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchCampData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Camp Image */}
        {formData.image && !isEditing && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={formData.image}
              alt={formData.name}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-6">
          {/* Basic Information */}
          <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-3 border-b-2 border-blue-600 inline-block">
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
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={campStatus}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camp Image
                  </label>
                  <div className="space-y-3">
                    {/* Preview */}
                    {(imagePreview || formData.image) && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={imagePreview || formData.image || ""}
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
                              {imagePreview || formData.image
                                ? "Change Image"
                                : "Upload Image"}
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
              )}
            </div>
          </div>

          {/* Program Dates */}
          <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-3 border-b-2 border-blue-600 inline-block">
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
                    disabled={!isEditing}
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
                    value={formData.endDate ? dayjs(formData.endDate) : null}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        endDate: date ? date.toISOString() : "",
                      })
                    }
                    disabled={!isEditing}
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
                        registrationStartDate: date ? date.toISOString() : "",
                      })
                    }
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    format="YYYY-MM-DD HH:mm:ss"
                    className="w-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Participants & Age */}
          <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-3 border-b-2 border-blue-600 inline-block">
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
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isEditing}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-3 border-b-2 border-blue-600 inline-block">
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
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      type="button"
                      onClick={() => setShowAddLocation(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                      title="Add new location"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-3 border-b-2 border-blue-600 inline-block">
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
                  disabled={!isEditing}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
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

        {/* Registration Control Buttons */}
        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            TEST
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handleOpenRegistration}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Open
            </button>
            <button
              onClick={handleCloseRegistration}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm"
            >
              <XCircle size={16} />
              Close
            </button>
            <button
              onClick={handleCreateAttendanceLogs}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Create Logs
            </button>
            <button
              onClick={handleCreateFolders}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Create Folders
            </button>
            <button
              onClick={handlePreloadFaceDatabase}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Preload Face DB
            </button>
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

export default CampDetailOverview;

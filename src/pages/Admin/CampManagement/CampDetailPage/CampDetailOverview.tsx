import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Edit2,
  CheckCircle,
  XCircle,

  Upload,
  Plus,
  Loader,
} from "lucide-react";
import { DatePicker, Spin } from "antd";
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
  uploadGenericImage,
  validateImageFile,
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
  onUpdate,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [camp, setCamp] = useState<CampResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [campTypes, setCampTypes] = useState<CampTypeResponseDto[]>([]);
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [promotions, setPromotions] = useState<PromotionResponseDto[]>([]);

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

  const fetchCampData = useCallback(async () => {
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
      console.error("Lỗi khi tải dữ liệu trại:", error);
      toastError("Lỗi", "Không thể tải chi tiết trại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [campId, toastError]);

  // Fetch camp data and related data
  useEffect(() => {
    fetchCampData();
  }, [fetchCampData]);

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
        toastError("Lỗi", "Vui lòng điền vào tất cả các trường bắt buộc.");
        return;
      }

      await campService.updateCamp(campId, formData);
      toastSuccess("Thành công", "Cập nhật trại thành công!");
      setIsEditing(false);
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = "Không thể cập nhật trại";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError("Lỗi", errorMsg);
    }
  };





  const handleOpenRegistration = async () => {
    try {
      await campService.updateCampStatusTest(campId, CampStatus.OPEN_FOR_REGISTRATION);
      toastSuccess('Thành công', 'Mở đăng ký trại thành công!');
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = 'Không thể mở đăng ký';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    }
  };

  const handleCloseRegistration = async () => {
    try {
      await campService.updateCampStatusTest(campId, CampStatus.REGISTRATION_CLOSED);
      toastSuccess('Thành công', 'Đóng đăng ký trại thành công!');
      fetchCampData();
      onUpdate?.();
    } catch (error: any) {
      let errorMsg = 'Không thể đóng đăng ký';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    }
  };

  const handleCreateAttendanceLogs = async () => {
    try {
      await attendanceLogService.createLogsForRegistrationClosedCamps();
      toastSuccess('Thành công', 'Tạo nhật ký điểm danh thành công!');
    } catch (error: any) {
      let errorMsg = 'Không thể tạo nhật ký điểm danh';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    }
  };

  const handleCreateFolders = async () => {
    try {
      await attendanceFolderService.createFolders(campId);
      toastSuccess('Thành công', 'Tạo thư mục điểm danh thành công!');
    } catch (error: any) {
      let errorMsg = 'Không thể tạo thư mục điểm danh';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    }
  };

  const handlePreloadFaceDatabase = async () => {
    try {
      await attendanceFolderService.preloadFaceDatabase(campId, false);
      toastSuccess('Thành công', 'Tải trước cơ sở dữ liệu khuôn mặt thành công!');
    } catch (error: any) {
      let errorMsg = 'Không thể tải trước cơ sở dữ liệu khuôn mặt';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    }
  };

  const handleCheckLoadedCamps = async () => {
    try {
      const response = await attendanceFolderService.getLoadedCampsStats();

      if (response.totalCamps === 0) {
        toastError('Không có trại nào được tải', 'Hiện không có trại nào được tải trong dịch vụ AI Python.');
        return;
      }

      const campsList = Object.entries(response.data)
        .map(([campId, faceCount]) => `Trại ${campId}: ${faceCount} khuôn mặt`)
        .join(', ');

      toastSuccess(
        'Thống kê trại đã tải',
        `Tổng: ${response.totalCamps} trại, ${response.totalFaces} khuôn mặt. ${campsList}`
      );
    } catch (error: any) {
      let errorMsg = 'Không thể lấy thống kê trại đã tải';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError('Lỗi', errorMsg);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file, 5); // Max 5MB
      if (!validation.valid) {
        toastError(
          "Lỗi xác thực hình ảnh",
          validation.error || "Tệp hình ảnh không hợp lệ"
        );
        return;
      }

      try {
        setImageUploading(true);

        const result = await uploadGenericImage(file);

        setImagePreview(result.url);

        setFormData((prev) => ({
          ...prev,
          image: result.url,
        }));
      } catch (error: any) {
        let errorMsg = "Không thể tải lên hình ảnh";
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        toastError("Lỗi tải lên", errorMsg);
        console.error("Lỗi khi tải lên hình ảnh", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
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
        <Spin size="large" tip="Đang tải chi tiết trại..." />
      </div>
    );
  }

  if (!camp) {
    return <div className="p-6 text-center text-[#6B7280]">Không tìm thấy trại</div>;
  }

  return (
    <>
      <div className="pb-12">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 justify-end">

          {!isEditing &&
            [
              CampStatus.DRAFT,
              CampStatus.REJECTED,
            ].includes(camp.status as CampStatus) && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  <Edit2 size={18} />
                  Cập nhật thông tin trại
                </button>
            )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchCampData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all font-medium"
              >
                Hủy
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
              Thông tin cơ bản
            </h3>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên trại *
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
                    Địa điểm *
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
                    Địa chỉ *
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
                  Mô tả
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
                  Trạng thái
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
                    Hình ảnh trại
                  </label>
                  <div className="space-y-3">
                    {/* Preview */}
                    {(imagePreview || formData.image) && (
                      <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300">
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
                              Đang tải lên...
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {imagePreview || formData.image
                                ? "Thay đổi hình ảnh"
                                : "Tải lên hình ảnh trại"}
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
              Thiết lập ngày tháng
            </h3>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
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
                    Ngày kết thúc *
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
                    Ngày mở đăng ký *
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
                    Ngày kết thúc đăng ký *
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
              Trại viên
            </h3>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số trại viên tối thiểu *
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
                    Số trại viên tối đa *
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
                    Độ tuổi tối thiểu *
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
                    Độ tuổi tối đa *
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
              Phân loại
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại trại *
                </label>
                <select
                  name="campTypeId"
                  value={formData.campTypeId || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn loại trại</option>
                  {campTypes.map((type) => (
                    <option key={type.campTypeId} value={type.campTypeId}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm *
                </label>
                <div className="flex gap-2">
                  <select
                    name="locationId"
                    value={formData.locationId || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn địa điểm</option>
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
                      title="Thêm địa điểm mới"
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
              Giá cả
            </h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá *
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
                  Khuyến mãi (Tùy chọn)
                </label>
                <select
                  name="promotionId"
                  value={formData.promotionId ? formData.promotionId : ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Không khuyến mãi</option>
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
            KIỂM THỎ
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handleOpenRegistration}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Mở đăng ký
            </button>
            <button
              onClick={handleCloseRegistration}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium text-sm"
            >
              <XCircle size={16} />
              Đóng đăng ký
            </button>
            <button
              onClick={handleCreateAttendanceLogs}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Tạo nhật ký điểm danh
            </button>
            <button
              onClick={handleCreateFolders}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Tạo thư mục
            </button>
            <button
              onClick={handlePreloadFaceDatabase}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Nạp dữ liệu khuôn mặt
            </button>
            <button
              onClick={handleCheckLoadedCamps}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-medium text-sm"
            >
              <CheckCircle size={16} />
              Kiểm tra trại đã nạp
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

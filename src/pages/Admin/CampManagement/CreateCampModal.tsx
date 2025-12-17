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
  type AvailableLocationDto,
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
  const [locations, setLocations] = useState<AvailableLocationDto[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsFetched, setLocationsFetched] = useState(false);
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

  // Fetch camp types and promotions on mount
  useEffect(() => {
    if (isOpen) {
      fetchCampTypes();
      fetchPromotions();
    }
  }, [isOpen]);



  // Auto-fetch locations when dates change
  useEffect(() => {
    // Reset flag when dates change
    setLocationsFetched(false);

    // Auto-fetch if both dates are present
    if (formData.startDate && formData.endDate) {
      fetchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate]);

  const fetchCampTypes = async () => {
    try {
      const data = await campTypeService.getAllCampTypes();
      setCampTypes(data);
    } catch (error) {
      console.error("Lỗi khi truy suất loại trại:", error);
    }
  };

  const fetchLocations = async () => {
    if (!formData.startDate || !formData.endDate) {
      toastError("Lỗi xác thực", "Vui lòng chọn ngày bắt đầu và ngày kết thúc trước");
      return;
    }

    // Skip if already fetched for current dates
    if (locationsFetched && locations.length > 0) {
      return;
    }

    try {
      setLocationsLoading(true);

      const data = await locationService.getAvailableCampLocationsByTime(
        formData.startDate,
        formData.endDate
      );

      setLocations(data);
      setLocationsFetched(true);
    } catch (error: any) {
      console.error("Lỗi khi truy suất địa điểm:", error);
      const errorMsg = error.response?.data?.message || "Không thể lấy địa điểm khả dụng";
      toastError("Lỗi", errorMsg);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const data = await promotionService.getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Lỗi khi truy suất khuyến mãi:", error);
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
      toastError("Lỗi xác thực", "Vui lòng điền tất cả các trường bắt buộc dấu *");
      return;
    }

    try {
      setLoading(true);
      await campService.createCamp(formData);

      toastSuccess("Thành công", "Tạo trại thành công!");
      handleClose();
      onSuccess();
    } catch (error: any) {
      // Get error message
      let errorMsg = "Không thể tạo trại. Vui lòng thử lại.";

      if (error.response?.status === 401) {
        errorMsg = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.response?.status === 400) {
        errorMsg =
          error.response.data?.message ||
          "Lỗi xác thực. Vui lòng kiểm tra lại thông tin nhập.";
      } else if (error.response?.status === 403) {
        errorMsg = "Bạn không có quyền tạo trại.";
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      // Show error notification
      toastError("Lỗi", errorMsg);
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
    setLocations([]);
    setLocationsFetched(false);  // Reset fetch flag
    onClose();
  };

  const handleAddLocationSuccess = async () => {
    setShowAddLocation(false);
    // Only fetch locations if dates are already selected
    if (formData.startDate && formData.endDate) {
      await fetchLocations();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file, 5); // Max 5MB
      if (!validation.valid) {
        toastError(
          "Lỗi xác thực",
          validation.error || "Tệp hình ảnh không hợp lệ"
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
        let errorMsg = "Không thể tải lên hình ảnh. Vui lòng thử lại.";
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        toastError("Lỗi tải lên", errorMsg);
        console.error("Lỗi tải lên hình ảnh:", error);
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
        title="Tạo trại mới"
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
                  placeholder="Nhập tên trại"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    placeholder="ví dụ: Khu vực miền núi, Bãi biển"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    placeholder="Nhập địa chỉ đầy đủ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  placeholder="Nhập mô tả về trại"
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh trại *
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
                        title="Xóa hình ảnh"
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
                            {imagePreview ? "Đổi hình ảnh" : "Tải hình ảnh"}
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
              Thiết lập ngày tháng
            </h3>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu Trại *
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
                    Ngày kết thúc Trại *
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
                    Ngày đóng đăng ký *
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
              Thiết lập Trại viên
            </h3>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng trại viên tối thiểu *
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
                    Số lượng trại viên tối đa *
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
                    Tuổi tối thiểu *
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
                    Tuổi tối đa *
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
              Phân loại Trại và Địa điểm
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Trại *
                </label>
                <select
                  name="campTypeId"
                  value={formData.campTypeId || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  Địa điểm * {locations.length > 0 && `(${locations.length} địa điểm khả dụng)`}
                </label>
                <div className="flex gap-2">
                  <select
                    name="locationId"
                    value={formData.locationId || ""}
                    onChange={handleInputChange}
                    onFocus={fetchLocations}
                    disabled={locationsLoading}
                    className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {locationsLoading ? "Đang tải địa điểm..." : "Chọn địa điểm"}
                    </option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddLocation(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                    title="Thêm địa điểm mới"
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
              Thiết lập giá
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
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Không có khuyến mãi</option>
                  {promotions.map((promo) => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name} (giảm {promo.percent}%)
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
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang tạo..." : "Tạo trại mới"}
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

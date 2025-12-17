import React, { useState } from "react";
import { Modal } from "antd";
import { useNotification } from "../../../contexts/NotificationContext";
import locationService, {
  type LocationCreateDto,
} from "../../../services/LocationService";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toastSuccess, toastError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      toastError("Lỗi xác thực", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const newLocation: LocationCreateDto = {
        name: formData.name,
        address: formData.address,
        locationType: "Camp",
        latitude: null,
        longitude: null,
        parentLocationId: null,
      };

      await locationService.createLocation(newLocation);
      toastSuccess("Thành công", "Đã thêm địa điểm thành công!");
      setFormData({ name: "", address: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating location:", error);
      let errorMsg = "Không thể thêm địa điểm";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toastError("Lỗi", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", address: "" });
    onClose();
  };

  return (
    <Modal
      title="Thêm Địa Điểm Trại Mới"
      open={isOpen}
      onCancel={handleClose}
      width={500}
      footer={null}
      centered
      classNames={{
        header: "!pb-3",
        content: "add-location-modal",
      }}
      styles={{
        body: {
          padding: "16px 16px",
        },
      }}
    >
      <style>{`
        .add-location-modal .ant-modal-header {
          border-bottom: none;
        }
        .add-location-modal .ant-modal-title {
          font-size: 16px;
          font-weight: 600;
        }
      `}</style>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên Địa Điểm *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ví dụ: Trại Núi, Trại Biển"
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa Chỉ *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Ví dụ: 123 Đường Chính, Thành Phố, Tỉnh, Quốc Gia"
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Footer with Action Buttons */}
      <div className="flex justify-end gap-3 mt-3">
        <button
          onClick={handleClose}
          disabled={loading}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang thêm..." : "Thêm Địa Điểm"}
        </button>
      </div>
    </Modal>
  );
};

export default AddLocationModal;

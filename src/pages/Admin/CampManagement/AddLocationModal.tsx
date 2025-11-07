import React, { useState } from "react";
import { X } from "lucide-react";
import locationService, {
  type LocationRequestDto,
} from "../../../services/LocationService";
import { message } from "antd";

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<LocationRequestDto, 'locationType' | 'latitude' | 'longitude'>>({
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
      message.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const newLocation: LocationRequestDto = {
        name: formData.name,
        address: formData.address,
        locationType: "Camp",
        latitude: null,
        longitude: null,
        parentLocationId: null,
      };

      await locationService.createLocation(newLocation);
      message.success("Location added successfully!");
      setFormData({ name: "", address: "" });
      onSuccess();
    } catch (error) {
      console.error("Error creating location:", error);
      message.error("Failed to add location");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", address: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1100" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md flex flex-col animate-in fade-in zoom-in-95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Camp Location</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Mountain Camp, Beach Camp"
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St, City, State, Country"
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;

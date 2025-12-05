import React, { useEffect, useState } from "react";
import { Spin, Modal, Form, Input } from "antd";
import { Search, Plus, Edit2 } from "lucide-react";
import { useManagerContext } from "../../../hooks/useManagerContext";
import { useNotification } from "../../../contexts/NotificationContext";
import DeletePopover from "../../../components/DeletePopover";
import campService, {
  type CampResponseDto,
} from "../../../services/campService";
import locationService, {
  type LocationResponseDto,
} from "../../../services/LocationService";

const InCampLocationManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();
  const [selectedCamp, setSelectedCamp] = useState<CampResponseDto | null>(
    null
  );
  const [parentLocationId, setParentLocationId] = useState<number | null>(null);
  const [inCampLocations, setInCampLocations] = useState<LocationResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [openDeletePopover, setOpenDeletePopover] = useState<number | null>(
    null
  );

  // Fetch camp and in-camp locations
  useEffect(() => {
    if (!selectedCampId) {
      setSelectedCamp(null);
      setInCampLocations([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Get camp details to get locationId
        const campData = await campService.getCampById(selectedCampId);
        setSelectedCamp(campData);

        // Get in-camp locations by parent location ID (campLocationId)
        const locId = campData.location?.id ?? null;
        setParentLocationId(locId);

        if (locId) {
          const locations = await locationService.getLocationsByParent(locId);
          const inCampLocs = locations.filter(
            (loc) => loc.locationType === "In_camp"
          );
          setInCampLocations(inCampLocs);
        } else {
          setInCampLocations([]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toastError("Error", "Unable to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId]);

  // Filter locations
  const filteredLocations = inCampLocations.filter((loc) => {
    if (!searchQuery) return true;
    return loc.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Show add modal
  const handleAddClick = () => {
    setEditingLocation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Show edit modal
  const handleEditClick = (location: LocationResponseDto) => {
    setEditingLocation(location);
    form.setFieldsValue({
      name: location.name,
      description: location.address || "",
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingLocation) {
        // Update location
        await locationService.updateLocation(editingLocation.locationId, {
          name: values.name,
          locationType: "In_camp",
          isActive: editingLocation.isActive,
          address: values.description || null,
          latitude: null,
          longitude: null,
          parentLocationId: parentLocationId,
        });
        toastSuccess(
          "Location Updated",
          "Location has been updated successfully"
        );
      } else {
        // Create new
        await locationService.createInCampLocation(
          values.name,
          values.description || null,
          parentLocationId
        );
        toastSuccess(
          "Location Added",
          "New location has been created successfully"
        );
      }

      // Refresh locations
      if (parentLocationId) {
        const locations = await locationService.getLocationsByParent(
          parentLocationId
        );
        const inCampLocs = locations.filter(
          (loc) => loc.locationType === "In_camp"
        );
        setInCampLocations(inCampLocs);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting location:", error);
      toastError("Error", "Failed to save location");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (locationId: number) => {
    try {
      setSubmitting(true);
      await locationService.deleteLocation(locationId);
      toastSuccess(
        "Location Deleted",
        "Location has been deleted successfully"
      );

      if (selectedCamp?.location?.id) {
        const locations = await locationService.getLocationsByParent(
          selectedCamp.location.id
        );
        const inCampLocs = locations.filter(
          (loc) => loc.locationType === "In_camp"
        );
        setInCampLocations(inCampLocs);
      }
      setOpenDeletePopover(null);
    } catch (error) {
      console.error("Error deleting location:", error);
      toastError(
        "Failed to Delete",
        "Unable to delete location. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">
            Select Camp
          </h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Please select a camp from the left sidebar to manage locations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              In-Camp Locations
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {selectedCamp?.name} - {selectedCamp?.location?.name}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Search */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
              <h3 className="text-lg font-bold text-[#111827] mb-4">Search</h3>

              {/* Search Input */}
              <div className="">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="By location name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                disabled={submitting}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Add Location
              </button>
            </div>
          </div>

          {/* Right Main Section - Table */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827]">
                  Found: {filteredLocations.length}
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredLocations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-[#6B7280]"
                        >
                          No in-camp locations found
                        </td>
                      </tr>
                    ) : (
                      filteredLocations.map((location, index) => (
                        <tr
                          key={location.locationId}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                            {location.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B7280] max-w-xs truncate">
                            {location.address || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                location.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {location.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(location)}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit Location"
                              >
                                <Edit2 size={16} />
                                Edit
                              </button>
                              <DeletePopover
                                onConfirm={() =>
                                  handleDelete(location.locationId)
                                }
                                message="Delete this location?"
                                disabled={submitting}
                                isOpen={
                                  openDeletePopover === location.locationId
                                }
                                onOpenChange={(open) =>
                                  setOpenDeletePopover(
                                    open ? location.locationId : null
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={
          editingLocation ? "Edit In-Camp Location" : "Add In-Camp Location"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingLocation(null);
        }}
        okText={editingLocation ? "Update" : "Add"}
        cancelText="Cancel"
        confirmLoading={submitting}
        centered
        styles={{
          body: {
            padding: "16px 16px",
          },
        }}
        classNames={{
          header: "!pb-3",
          content: "location-modal",
        }}
      >
        <style>{`
          .location-modal .ant-modal-header {
            border-bottom: none;
          }
          .location-modal .ant-modal-title {
            font-size: 16px;
            font-weight: 600;
          }
        `}</style>
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Location Name"
            name="name"
            rules={[{ required: true, message: "Please enter location name" }]}
          >
            <Input placeholder="e.g., Dining Area, Sports Field, etc." />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              placeholder="Enter description (optional)"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InCampLocationManagement;

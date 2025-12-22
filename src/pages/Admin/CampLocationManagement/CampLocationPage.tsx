import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2 } from "lucide-react";
import { Modal, Form, Input, Spin } from "antd";
import locationService, {
  type LocationResponseDto,
  type LocationCreateDto,
  type LocationUpdateDto,
} from "../../../services/LocationService";
import { useNotification } from "../../../contexts/NotificationContext";
import DeletePopover from "../../../components/DeletePopover";
import LocationMapPicker, { type LocationData } from "../../../components/common/LocationMapPicker";

const CampLocationPage: React.FC = () => {
  const { toastSuccess, toastError } = useNotification();
  const [campLocations, setCampLocations] = useState<LocationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  const [inCampLocations, setInCampLocations] = useState<LocationResponseDto[]>([]);
  const [inCampSearchQuery, setInCampSearchQuery] = useState("");
  const [isInCampModalVisible, setIsInCampModalVisible] = useState(false);
  const [editingInCampLocation, setEditingInCampLocation] = useState<LocationResponseDto | null>(null);
  const [inCampForm] = Form.useForm();
  const [inCampSubmitting, setInCampSubmitting] = useState(false);
  const [inCampDeletePopoverOpen, setInCampDeletePopoverOpen] = useState<number | null>(null);

  const fetchCampLocations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocationsByType("Camp");
      setCampLocations(data);
    } catch (error) {
      console.error("Error fetching camp locations:", error);
      toastError('Cảnh báo', "Không thể tải danh sách địa điểm trại");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const fetchInCampLocations = useCallback(async (parentLocationId: number) => {
    try {
      const locations = await locationService.getLocationsByParent(parentLocationId);
      const inCampLocs = locations.filter(loc => loc.locationType === "In_camp");
      setInCampLocations(inCampLocs);
    } catch (error) {
      console.error("Error fetching in-camp locations:", error);
      toastError('Cảnh báo', "Không thể tải danh sách địa điểm trong trại");
    }
  }, [toastError]);

  useEffect(() => {
    fetchCampLocations();
  }, [fetchCampLocations]);

  const filteredCampLocations = campLocations.filter((location) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        location.name.toLowerCase().includes(query) ||
        location.address?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleAddClick = () => {
    setEditingLocation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditClick = async (location: LocationResponseDto) => {
    setEditingLocation(location);
    form.setFieldsValue({
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setIsModalVisible(true);

    if (location.locationId) {
      await fetchInCampLocations(location.locationId);
    }
  };

  const handleLocationSelect = (data: LocationData) => {
    form.setFieldsValue({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  };

  const filteredInCampLocations = inCampLocations.filter((loc) => {
    if (!inCampSearchQuery) return true;
    return loc.name.toLowerCase().includes(inCampSearchQuery.toLowerCase());
  });

  const handleAddInCampClick = () => {
    setEditingInCampLocation(null);
    inCampForm.resetFields();
    setIsInCampModalVisible(true);
  };

  const handleEditInCampClick = (location: LocationResponseDto) => {
    setEditingInCampLocation(location);
    inCampForm.setFieldsValue({
      name: location.name,
      description: location.address || "",
    });
    setIsInCampModalVisible(true);
  };

  const handleInCampSubmit = async () => {
    try {
      const values = await inCampForm.validateFields();
      setInCampSubmitting(true);

      if (editingInCampLocation) {
        await locationService.updateLocation(editingInCampLocation.locationId, {
          name: values.name,
          locationType: "In_camp",
          isActive: editingInCampLocation.isActive,
          address: values.description || null,
          latitude: null,
          longitude: null,
          parentLocationId: editingLocation!.locationId,
        });
        toastSuccess("Thành công", "Cập nhật địa điểm trong trại thành công");
      } else {
        await locationService.createInCampLocation(
          values.name,
          values.description || null,
          editingLocation!.locationId
        );
        toastSuccess("Thành công", "Tạo địa điểm trong trại thành công");
      }

      if (editingLocation?.locationId) {
        await fetchInCampLocations(editingLocation.locationId);
      }

      setIsInCampModalVisible(false);
      inCampForm.resetFields();
    } catch (error) {
      console.error("Error submitting in-camp location:", error);
      toastError('Cảnh báo', "Không thể lưu địa điểm trong trại");
    } finally {
      setInCampSubmitting(false);
    }
  };

  const handleDeleteInCamp = async (locationId: number) => {
    try {
      await locationService.deleteLocation(locationId);
      toastSuccess("Thành công", "Xóa địa điểm trong trại thành công");

      if (editingLocation?.locationId) {
        await fetchInCampLocations(editingLocation.locationId);
      }
      setInCampDeletePopoverOpen(null);
    } catch (error) {
      console.error("Failed to delete in-camp location:", error);
      toastError('Cảnh báo', "Không thể xóa địa điểm trong trại");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingLocation) {
        const payload: LocationUpdateDto = {
          name: values.name,
          locationType: "Camp",
          isActive: editingLocation.isActive,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          parentLocationId: null,
        };

        await locationService.updateLocation(editingLocation.locationId, payload);
        toastSuccess("Thành công", "Cập nhật địa điểm trại thành công");
      } else {
        const payload: LocationCreateDto = {
          name: values.name,
          locationType: "Camp",
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          parentLocationId: null,
        };

        await locationService.createLocation(payload);
        toastSuccess("Thành công", "Tạo địa điểm trại thành công");
      }

      await fetchCampLocations();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting camp location:", error);
      toastError('Cảnh báo', "Không thể lưu địa điểm trại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (locationId: number) => {
    try {
      await locationService.deleteLocation(locationId);
      toastSuccess("Thành công", "Xóa địa điểm trại thành công");
      await fetchCampLocations();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error("Failed to delete camp location:", error);
      toastError('Cảnh báo', "Không thể xóa địa điểm trại");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Địa điểm trại</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Quản lý địa điểm trại cho các chương trình của bạn
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : campLocations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg mb-4">Không tìm thấy địa điểm trại</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Tạo địa điểm trại
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Bộ lọc</h3>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Tìm kiếm
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Theo tên hoặc địa chỉ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Tạo địa điểm trại
                </button>

                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Tổng: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {campLocations.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Tìm thấy: </span>
                      <span className="text-lg font-bold text-[#6366F1]">
                        {filteredCampLocations.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Hoạt động: </span>
                      <span className="text-lg font-bold text-[#10B981]">
                        {campLocations.filter((l) => l.isActive).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Tìm thấy: {filteredCampLocations.length}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Địa chỉ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Tọa độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredCampLocations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            Không tìm thấy địa điểm trại phù hợp với bộ lọc
                          </td>
                        </tr>
                      ) : (
                        filteredCampLocations.map((location, index) => (
                          <tr
                            key={location.locationId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {location.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="line-clamp-2">
                                {location.address || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {location.latitude && location.longitude
                                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                                : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${location.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {location.isActive ? "Hoạt động" : "Không hoạt động"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(location)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Chỉnh sửa địa điểm trại"
                                >
                                  <Edit2 size={16} />
                                  Chỉnh sửa
                                </button>
                                <DeletePopover
                                  onConfirm={() =>
                                    handleDelete(location.locationId)
                                  }
                                  title="Xóa địa điểm trại"
                                  message={`Bạn có chắc muốn xóa "${location.name}"?`}
                                  buttonText="Xóa"
                                  isOpen={deletePopoverOpen === location.locationId}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(
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
        </>
      )}

      <Modal
        title={editingLocation ? "Chỉnh sửa địa điểm trại" : "Tạo địa điểm trại"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingLocation(null);
          form.resetFields();
          setInCampLocations([]);
        }}
        confirmLoading={submitting}
        width={editingLocation ? 1200 : 800}
        okText={editingLocation ? "Cập nhật" : "Tạo"}
      >
        <div className="mt-4">
          <div className={editingLocation ? "grid grid-cols-2 gap-6" : ""}>
            <div className="space-y-4">
              <LocationMapPicker
                key={isModalVisible ? 'map-open' : 'map-closed'}
                onLocationSelect={handleLocationSelect}
                height="350px"
                initialLocation={
                  editingLocation && editingLocation.latitude && editingLocation.longitude
                    ? {
                      name: editingLocation.name,
                      address: editingLocation.address || '',
                      latitude: editingLocation.latitude,
                      longitude: editingLocation.longitude,
                    }
                    : null
                }
              />

              <Form form={form} layout="vertical">
                <Form.Item
                  label="Tên địa điểm"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên địa điểm!" },
                    { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
                    { max: 255, message: "Tên không được vượt quá 255 ký tự!" },
                  ]}
                >
                  <Input placeholder="VD: Địa điểm hội trại trung tâm" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[
                    { required: true, message: "Vui lòng nhập địa chỉ!" },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Địa chỉ của hội trại"
                    rows={2}
                  />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    label="Vĩ độ"
                    name="latitude"
                    rules={[
                      { required: true, message: "Vui lòng chọn vị trí trên bản đồ!" },
                    ]}
                  >
                    <Input placeholder="Vĩ độ" disabled />
                  </Form.Item>

                  <Form.Item
                    label="Kinh độ"
                    name="longitude"
                    rules={[
                      { required: true, message: "Vui lòng chọn vị trí trên bản đồ!" },
                    ]}
                  >
                    <Input placeholder="Kinh độ" disabled />
                  </Form.Item>
                </div>
              </Form>
            </div>

            {editingLocation && (
              <div className="border-l border-[#E5E7EB] pl-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-[#111827]">
                    Địa điểm trong trại ({inCampLocations.length})
                  </h3>
                  <button
                    onClick={handleAddInCampClick}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                  >
                    <Plus size={16} />
                    Thêm
                  </button>
                </div>

                <div className="mb-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm địa điểm trong trại..."
                      value={inCampSearchQuery}
                      onChange={(e) => setInCampSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden max-h-[700px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          STT
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Tên
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">
                          Trạng thái
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B7280] uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredInCampLocations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-8 text-center text-sm text-[#6B7280]">
                            Không tìm thấy địa điểm trong trại
                          </td>
                        </tr>
                      ) : (
                        filteredInCampLocations.map((loc, index) => (
                          <tr key={loc.locationId} className="hover:bg-[#F9FAFB]">
                            <td className="px-3 py-2 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-sm font-medium text-[#111827]">
                                {loc.name}
                              </div>
                              {loc.address && (
                                <div className="text-xs text-[#6B7280] truncate max-w-xs">
                                  {loc.address}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${loc.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                  }`}
                              >
                                {loc.isActive ? "Hoạt động" : "Không hoạt động"}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEditInCampClick(loc)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#F3F4F6] text-[#6B7280] rounded hover:bg-[#E5E7EB] transition-all text-xs font-medium"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <DeletePopover
                                  onConfirm={() => handleDeleteInCamp(loc.locationId)}
                                  message={`Xóa "${loc.name}"?`}
                                  buttonText="Xóa"
                                  isOpen={inCampDeletePopoverOpen === loc.locationId}
                                  onOpenChange={(open) =>
                                    setInCampDeletePopoverOpen(open ? loc.locationId : null)
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
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title={editingInCampLocation ? "Chỉnh sửa địa điểm trong trại" : "Thêm địa điểm trong trại"}
        open={isInCampModalVisible}
        onOk={handleInCampSubmit}
        onCancel={() => {
          setIsInCampModalVisible(false);
          inCampForm.resetFields();
          setEditingInCampLocation(null);
        }}
        okText={editingInCampLocation ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        confirmLoading={inCampSubmitting}
        width={500}
      >
        <Form form={inCampForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Tên địa điểm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên địa điểm" }]}
          >
            <Input placeholder="VD: Khu nhà ăn, Sân thể thao, v.v." />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả (tùy chọn)"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CampLocationPage;

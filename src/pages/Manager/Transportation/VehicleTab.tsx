import React, { useEffect, useState } from 'react';
import { Spin, Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { Search, Plus, Edit2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import vehicleService, {
  type VehicleResponseDto,
  type VehicleRequestDto,
  type VehicleType
} from '../../../services/vehicleService';
import DeletePopover from '../../../components/DeletePopover';

const VehicleTab: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [vehicles, setVehicles] = useState<VehicleResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleResponseDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // NEW: Track if modal is in edit mode
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Vehicle Type Modal
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [typeForm] = Form.useForm();
  const [typeSubmitting, setTypeSubmitting] = useState(false);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  // Fetch vehicles
  useEffect(() => {
    if (!selectedCampId) {
      setVehicles([]);
      return;
    }

    fetchVehicles();
  }, [selectedCampId]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      toastError('Lỗi', 'Không thể tải phương tiện');
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicle types when modal opens
  useEffect(() => {
    if (isModalVisible) {
      fetchVehicleTypes();
    }
  }, [isModalVisible]);

  const fetchVehicleTypes = async () => {
    try {
      const types = await vehicleService.getActiveVehicleTypes();
      setVehicleTypes(types);
    } catch (error) {
      console.error('Failed to load vehicle types:', error);
      toastError('Lỗi', 'Không thể tải loại phương tiện');
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !vehicle.vehicleName.toLowerCase().includes(query) &&
        !vehicle.vehicleNumber.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  // Handle add vehicle
  const handleAddClick = () => {
    setEditingVehicle(null);
    setIsEditMode(true); // Adding new vehicle = edit mode
    form.resetFields();
    form.setFieldsValue({ status: 'Active' });
    setIsModalVisible(true);
  };

  // Handle view vehicle details
  const handleViewClick = async (vehicle: VehicleResponseDto) => {
    try {
      const fullData = await vehicleService.getVehicleById(vehicle.vehicleId);
      setEditingVehicle(fullData);
      setIsEditMode(false); // Start in view mode
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to load vehicle details:', error);
      toastError('Lỗi', 'Không thể tải chi tiết phương tiện');
    }
  };

  // Handle enable edit mode
  const handleEnableEdit = async () => {
    if (!editingVehicle) return;

    // Fetch vehicle types before enabling edit
    await fetchVehicleTypes();

    // Set form values
    form.setFieldsValue({
      vehicleName: editingVehicle.vehicleName,
      vehicleNumber: editingVehicle.vehicleNumber,
      capacity: editingVehicle.capacity,
      status: editingVehicle.status,
      vehicleType: editingVehicle.vehicleType?.vehicleTypeId || null,
    });

    setIsEditMode(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: VehicleRequestDto = {
        vehicleName: values.vehicleName,
        vehicleNumber: values.vehicleNumber,
        capacity: values.capacity,
        status: values.status,
        vehicleType: values.vehicleType || null,
      };

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.vehicleId, payload);
        toastSuccess('Thành công', 'Cập nhật phương tiện thành công');
      } else {
        await vehicleService.createVehicle(payload);
        toastSuccess('Thành công', 'Tạo phương tiện thành công');
      }

      await fetchVehicles();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      toastError('Lỗi', 'Không thể lưu phương tiện');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete vehicle
  const handleDelete = async (vehicleId: number) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      toastSuccess('Thành công', 'Xóa phương tiện thành công');
      await fetchVehicles();
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      toastError('Lỗi', 'Không thể xóa phương tiện');
    }
  };

  // Handle add vehicle type
  const handleAddVehicleType = async () => {
    try {
      const values = await typeForm.validateFields();
      setTypeSubmitting(true);

      await vehicleService.createVehicleType({
        name: values.name,
        description: values.description,
        isActive: true,
      });

      toastSuccess('Thành công', 'Tạo loại phương tiện thành công');
      await fetchVehicleTypes();
      setIsTypeModalVisible(false);
      typeForm.resetFields();
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      toastError('Lỗi', 'Không thể tạo loại phương tiện');
    } finally {
      setTypeSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      Active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      Inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
              <h3 className="text-lg font-bold text-[#111827] mb-4">Bộ Lọc</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="text-xs font-medium text-[#6B7280] mb-1 block">Tìm Kiếm</label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Theo tên hoặc biển số..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6">
                <p className="text-xs font-medium text-[#6B7280] mb-1">Tổng Số Xe</p>
                <span className="text-2xl font-bold text-[#111827]">{vehicles.length}</span>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
              >
                <Plus size={16} />
                Thêm Phương Tiện
              </button>
            </div>
          </div>

          {/* Right Main Section - Table */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827]">
                  Tìm Thấy: {filteredVehicles.length}
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Tên Xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Biển Số
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Loại Xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Sức Chứa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Trạng Thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-[#6B7280]"
                        >
                          Không tìm thấy phương tiện nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((vehicle, index) => (
                        <tr
                          key={vehicle.vehicleId}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                            {vehicle.vehicleName}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                            {vehicle.vehicleNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#374151]">
                            {vehicle.vehicleType?.name || (
                              <span className="text-[#9CA3AF]">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B7280]">
                            {vehicle.capacity} chỗ
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getStatusBadge(vehicle.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewClick(vehicle)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                title="Xem Chi Tiết"
                              >
                                <Edit2 size={16} />
                                Chi Tiết
                              </button>
                              <DeletePopover
                                onConfirm={() => handleDelete(vehicle.vehicleId)}
                                title="Xóa Phương Tiện"
                                message={`Bạn có chắc muốn xóa "${vehicle.vehicleName}"?`}
                                buttonText="Xóa"
                                isOpen={deletePopoverOpen === vehicle.vehicleId}
                                onOpenChange={(open) =>
                                  setDeletePopoverOpen(open ? vehicle.vehicleId : null)
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

      {/* Vehicle Detail/Edit Modal */}
      <Modal
        title={editingVehicle ? (isEditMode ? 'Sửa Phương Tiện' : 'Chi Tiết Phương Tiện') : 'Thêm Phương Tiện Mới'}
        open={isModalVisible}
        onOk={isEditMode ? handleSubmit : undefined}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingVehicle(null);
          setIsEditMode(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={600}
        footer={
          editingVehicle && !isEditMode ? (
            // Detail view footer
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingVehicle(null);
                setIsEditMode(false);
              }}>
                Đóng
              </Button>
              <Button type="primary" onClick={handleEnableEdit}>
                Sửa
              </Button>
            </div>
          ) : (
            // Edit mode footer (default)
            undefined
          )
        }
      >
        {editingVehicle && !isEditMode ? (
          // Detail View
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Tên Xe</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{editingVehicle.vehicleName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Biển Số</label>
                <p className="text-sm font-mono text-gray-900 mt-1">{editingVehicle.vehicleNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Loại Xe</label>
                <p className="text-sm text-gray-900 mt-1">
                  {editingVehicle.vehicleType?.name || <span className="text-gray-400">N/A</span>}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Sức Chứa</label>
                <p className="text-sm text-gray-900 mt-1">{editingVehicle.capacity} chỗ</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">Trạng Thái</label>
              <div className="mt-1">{getStatusBadge(editingVehicle.status)}</div>
            </div>
          </div>
        ) : (
          // Edit Form
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              label="Tên Xe"
              name="vehicleName"
              rules={[{ required: true, message: 'Vui lòng nhập tên xe!' }]}
            >
              <Input placeholder="ví dụ: Bus A1" />
            </Form.Item>

            <Form.Item
              label="Biển Số"
              name="vehicleNumber"
              rules={[{ required: true, message: 'Vui lòng nhập biển số!' }]}
            >
              <Input placeholder="ví dụ: 50A-12345" />
            </Form.Item>

            <div className="flex gap-2">
              <Form.Item
                label="Loại Xe"
                name="vehicleType"
                className="flex-1 mb-0"
              >
                <Select
                  placeholder="Chọn loại xe (tùy chọn)"
                  allowClear
                  options={vehicleTypes.map((type) => ({
                    label: type.name,
                    value: type.vehicleTypeId,
                  }))}
                />
              </Form.Item>
              <Button
                icon={<Plus size={16} />}
                onClick={() => setIsTypeModalVisible(true)}
                title="Thêm Loại Xe Mới"
                style={{ marginTop: '30px' }}
              >
                Thêm Loại
              </Button>
            </div>

            <Form.Item
              label="Sức Chứa"
              name="capacity"
              rules={[
                { required: true, message: 'Vui lòng nhập sức chứa!' },
                { type: 'number', min: 1, message: 'Sức chứa phải ít nhất là 1!' },
              ]}
            >
              <InputNumber min={1} placeholder="ví dụ: 45" className="w-full" />
            </Form.Item>

            <Form.Item
              name="status"
              initialValue="Active"
              hidden
            >
              <Input />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Add Vehicle Type Modal */}
      <Modal
        title="Thêm Loại Xe Mới"
        open={isTypeModalVisible}
        onOk={handleAddVehicleType}
        onCancel={() => {
          setIsTypeModalVisible(false);
          typeForm.resetFields();
        }}
        confirmLoading={typeSubmitting}
        width={500}
      >
        <Form form={typeForm} layout="vertical" className="mt-4">
          <Form.Item
            label="Tên Loại"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại xe!' }]}
          >
            <Input placeholder="ví dụ: Bus, Van, Minibus" />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
          >
            <Input.TextArea placeholder="Mô tả tùy chọn" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VehicleTab;

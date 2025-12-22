import React, { useEffect, useState } from 'react';
import { Spin, Modal, Form, Input, InputNumber, Select } from 'antd';
import { Search, Plus, Eye, Edit2, Check, } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import accommodationService, { type AccommodationResponseDto, type AccommodationRequestDto } from '../../../services/accommodationService';
import accommodationTypeService, { type AccommodationTypeResponseDto } from '../../../services/accommodationTypeService';
import staffService, { type StaffInfo } from '../../../services/staffService';
import campService, { type CampResponseDto } from '../../../services/campService';
import camperAccommodationService, { type CamperAccommodationResponseDto } from '../../../services/camperAccommodationService';
import DeletePopover from '../../../components/DeletePopover';

const AccommodationManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [accommodations, setAccommodations] = useState<AccommodationResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationTypeResponseDto[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<AccommodationResponseDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Type modal state
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [typeForm] = Form.useForm();
  const [typeSubmitting, setTypeSubmitting] = useState(false);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  // Accommodation members (for detail view)
  const [accommodationMembers, setAccommodationMembers] = useState<CamperAccommodationResponseDto[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Selected new accommodations for existing members (camperId -> accommodationId)
  const [selectedNewAccommodations, setSelectedNewAccommodations] = useState<Record<number, number>>({});

  // Fetch accommodations and types on mount/camp change
  useEffect(() => {
    if (!selectedCampId) {
      setAccommodations([]);
      setCampData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch accommodations
        const accommodationsData = await accommodationService.getAccommodationsByCampId(selectedCampId);
        setAccommodations(accommodationsData);

        // Fetch accommodation types
        const typesData = await accommodationTypeService.getAllAccommodationTypes();
        setAccommodationTypes(typesData);

        const campInfo = await campService.getCampById(selectedCampId);
        setCampData(campInfo);
      } catch (error) {
        console.error('Failed to load data:', error);
        toastError('Lỗi', 'Không thể tải nơi ở');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId, toastError]);

  // Fetch available staff when modal opens
  useEffect(() => {
    if (isModalVisible && selectedCampId) {
      const fetchStaff = async () => {
        try {
          const staffData = await staffService.getAvailableAccommodationStaff(selectedCampId);
          setStaffList(staffData);
        } catch (error) {
          console.error('Failed to load staff:', error);
          toastError('Lỗi', 'Không thể tải người giám sát');
        }
      };

      fetchStaff();
    }
  }, [isModalVisible, selectedCampId, toastError]);

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Chọn Trại</h3>
          <p className="text-indigo-700 text-base leading-relaxed">Vui lòng chọn một trại từ thanh bên trái để xem nơi ở</p>
        </div>
      </div>
    );
  }

  // Filter accommodations
  const filteredAccommodations = accommodations.filter((accommodation) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!accommodation.name.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  // Handle add accommodation
  const handleAddClick = () => {
    setEditingAccommodation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle view accommodation details
  const handleViewDetails = async (accommodation: AccommodationResponseDto) => {
    try {
      // Fetch complete accommodation data including supervisor details
      const fullAccommodationData = await accommodationService.getAccommodationById(
        accommodation.accommodationId
      );
      setEditingAccommodation(fullAccommodationData);
      form.setFieldsValue({
        name: fullAccommodationData.name,
        accommodationTypeId: fullAccommodationData.accommodationTypeId,
        capacity: fullAccommodationData.capacity,
        supervisorId: fullAccommodationData.supervisor?.userId,
      });

      // Fetch accommodation members
      setLoadingMembers(true);
      try {
        const members = await camperAccommodationService.getCamperAccommodations({ 
          accommodationId: accommodation.accommodationId 
        });
        setAccommodationMembers(Array.isArray(members) ? members : []);
      } catch (error) {
        console.error('Failed to load accommodation members:', error);
        setAccommodationMembers([]);
      } finally {
        setLoadingMembers(false);
      }

      setIsEditMode(false); // Start in view mode
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to load accommodation details:', error);
      toastError('Lỗi', 'Không thể tải chi tiết nơi ở');
    }
  };

  // Get accommodation type name by ID
  const getAccommodationTypeName = (typeId: number) => {
    const type = accommodationTypes.find((t) => t.id === typeId);
    return type?.name || 'N/A';
  };

  // Get supervisor name by ID
  const getSupervisorName = (userId: number) => {
    const supervisor = staffList.find((staff) => staff.userId === userId);
    if (supervisor) {
      return supervisor.fullName;
    }
    // If not in staff list, try to get from editing accommodation
    if (editingAccommodation?.supervisor?.userId === userId) {
      return editingAccommodation.supervisor.fullName;
    }
    return '';
  };

  // Calculate total capacity of accommodations
  const getTotalCapacity = () => {
    return accommodations.reduce((sum, acc) => sum + acc.capacity, 0);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: AccommodationRequestDto = {
        campId: selectedCampId,
        accommodationTypeId: values.accommodationTypeId,
        name: values.name,
        capacity: values.capacity,
        supervisorId: values.supervisorId,
      };

      if (editingAccommodation) {
        // Update accommodation
        await accommodationService.updateAccommodation(editingAccommodation.accommodationId, payload);
        toastSuccess('Thành công', 'Cập nhật nơi ở thành công');
      } else {
        // Create new accommodation
        await accommodationService.createAccommodation(payload);
        toastSuccess('Thành công', 'Tạo nơi ở thành công');
      }

      // Refresh accommodations
      if (selectedCampId) {
        const accommodationsData = await accommodationService.getAccommodationsByCampId(selectedCampId);
        setAccommodations(accommodationsData);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error('Error submitting accommodation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lưu nơi ở';
      toastError('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deactivate/activate accommodation
  const handleToggleStatus = async (accommodationId: number, isActive: boolean) => {
    try {
      const newStatus = !isActive;
      await accommodationService.updateAccommodationStatus(accommodationId, newStatus);
      toastSuccess('Thành công', `Nơi ở đã được ${newStatus ? 'kích hoạt' : 'hủy kích hoạt'} thành công`);
      // Refresh accommodations
      if (selectedCampId) {
        const accommodationsData = await accommodationService.getAccommodationsByCampId(selectedCampId);
        setAccommodations(accommodationsData);
      }
      setDeletePopoverOpen(null);
    } catch (error: any) {
      console.error('Failed to toggle accommodation status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái nơi ở';
      toastError('Lỗi', errorMessage);
    }
  };

  // Handle create accommodation type
  const handleCreateType = async () => {
    try {
      const values = await typeForm.validateFields();
      setTypeSubmitting(true);

      const newType = await accommodationTypeService.createAccommodationType({
        name: values.name,
        description: values.description || '',
      });

      toastSuccess('Thành công', 'Tạo loại nơi ở thành công');

      // Làm mới loại nơi ở
      const typesData = await accommodationTypeService.getAllAccommodationTypes();
      setAccommodationTypes(typesData);

      // Set the newly created type as selected
      form.setFieldValue('accommodationTypeId', newType.id);

      setIsTypeModalVisible(false);
      typeForm.resetFields();
    } catch (error: any) {
      console.error('Error creating accommodation type:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo loại nơi ở';
      toastError('Lỗi', errorMessage);
    } finally {
      setTypeSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Quản Lý Nơi Ở</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Quản lý và sắp xếp nơi ở cho trại
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Tìm Kiếm</h3>

                {/* Search */}
                <div className="mb-6">

                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Theo tên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Capacity Info */}
                {campData && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Sức Chứa</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-[#111827]">{getTotalCapacity()}</span>
                      <span className="text-xs text-[#6B7280]">/ {campData.maxParticipants} sức chứa trại</span>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Thêm Nơi Ở
                </button>


              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Tìm Thấy: {filteredAccommodations.length}
                  </h2>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ tableLayout: 'fixed', minWidth: '1200px' }}>
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '60px' }}>
                          STT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '100px' }}>
                          Tên Nơi Ở
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '100px' }}>
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '70px' }}>
                          Sức Chứa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '100px' }}>
                          Người Giám Sát
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '80px' }}>
                          Trạng Thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider" style={{ width: '200px' }}>
                          Thao Tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredAccommodations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            Không tìm thấy nơi ở nào phù hợp
                          </td>
                        </tr>
                      ) : (
                        filteredAccommodations.map((accommodation, index) => (
                          <tr
                            key={accommodation.accommodationId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280] whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              <div className="truncate" title={accommodation.name}>
                                {accommodation.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                                {getAccommodationTypeName(accommodation.accommodationTypeId)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {accommodation.capacity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {accommodation.supervisor?.fullName ? (
                                <div className="truncate" title={accommodation.supervisor.fullName}>
                                  {accommodation.supervisor.fullName}
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 whitespace-nowrap">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accommodation.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {accommodation.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewDetails(accommodation)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm whitespace-nowrap"
                                  title="Xem Chi Tiết"
                                  style={{ minWidth: '110px' }}
                                >
                                  <Eye size={16} />
                                  Chi tiết
                                </button>
                                {accommodation.isActive ? (
                                  <DeletePopover
                                    onConfirm={() => handleToggleStatus(accommodation.accommodationId, accommodation.isActive)}
                                    title="Hủy Kích Hoạt Nơi Ở"
                                    message={`Bạn có chắc muốn hủy kích hoạt "${accommodation.name}"?`}
                                    buttonText="Hủy Kích Hoạt"
                                    isOpen={deletePopoverOpen === accommodation.accommodationId}
                                    onOpenChange={(open) =>
                                      setDeletePopoverOpen(open ? accommodation.accommodationId : null)
                                    }
                                  />
                                ) : (
                                  <button
                                    onClick={() => handleToggleStatus(accommodation.accommodationId, accommodation.isActive)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-medium text-sm whitespace-nowrap"
                                    title="Kích Hoạt Nơi Ở"
                                    style={{ minWidth: '110px' }}
                                  >
                                    <Check size={16} />
                                    Kích Hoạt
                                  </button>
                                )}
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

      {/* Add/Edit/Detail Modal */}
      <Modal
        title={
          !editingAccommodation ? 'Thêm Nơi Ở Mới' :
          isEditMode ? 'Sửa Nơi Ở' :
          'Chi Tiết Nơi Ở'
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingAccommodation(null);
          setIsEditMode(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={600}
        centered
        footer={
          editingAccommodation && !isEditMode ? (
            // Detail mode footer
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingAccommodation(null);
                  setIsEditMode(false);
                  form.resetFields();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <Edit2 size={16} />
                Sửa
              </button>
            </div>
          ) : undefined
        }
        styles={{
          body: {
            padding: "16px 16px",
          },
        }}
        classNames={{
          header: "!pb-3",
          content: "accommodation-modal",
        }}
      >
        <style>{`
          .accommodation-modal .ant-modal-header {
            border-bottom: none;
          }
          .accommodation-modal .ant-modal-title {
            font-size: 16px;
            font-weight: 600;
          }
        `}</style>
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            label="Tên Nơi Ở"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nơi ở!' },
              { min: 1, message: 'Tên không được để trống!' },
            ]}
          >
            <Input placeholder="ví dụ: Ký túc xá A, Căn hộ 1" disabled={!!(editingAccommodation && !isEditMode)} />
          </Form.Item>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại Nơi Ở *
            </label>
            <div className="flex gap-2">
              <Form.Item
                name="accommodationTypeId"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại nơi ở!' },
                ]}
                className="flex-1 mb-0"
              >
                <Select
                  placeholder="Chọn loại nơi ở"
                  disabled={!!(editingAccommodation && !isEditMode)}
                  options={accommodationTypes.map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                />
              </Form.Item>
              <button
                type="button"
                onClick={() => setIsTypeModalVisible(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
                title="Tạo loại nơi ở mới"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <Form.Item
            label="Sức Chứa"
            name="capacity"
            rules={[
              { required: true, message: 'Vui lòng nhập sức chứa!' },
              { type: 'number', min: 1, message: 'Sức chứa phải ít nhất là 1!' },
            ]}
          >
            <InputNumber min={1} placeholder="ví dụ: 50" className="w-full" disabled={!!(editingAccommodation && !isEditMode)} />
          </Form.Item>

          <Form.Item
            label="Người Giám Sát"
            name="supervisorId"
            rules={[
              { required: true, message: 'Vui lòng chọn người giám sát!' },
            ]}
            help={!editingAccommodation?.supervisor ? '⚠️ Chưa phân công người giám sát' : ''}
          >
            <Select
              placeholder="Chọn người giám sát"
              disabled={!!(editingAccommodation && !isEditMode)}
              optionLabelProp="label"
              options={staffList.map((staff) => ({
                label: staff.fullName,
                value: staff.userId,
              }))}
              labelRender={(props) => {
                if (props.value) {
                  return getSupervisorName(Number(props.value));
                }
                return props.label;
              }}
            />
          </Form.Item>

          {/* Accommodation Members Section */}
          {editingAccommodation && accommodationMembers && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Trại Viên ({accommodationMembers.length || 0})
                </h3>
                {loadingMembers && <Spin size="small" />}
              </div>
              {accommodationMembers.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {accommodationMembers.map((member, index) => (
                      <div
                        key={member.camperAccommodationId || index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
                      >
                        <div className="flex-shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {member.camperName || 'Không rõ'}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {member.camperId || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            placeholder="Chọn nơi ở mới"
                            value={selectedNewAccommodations[member.camperId]}
                            onChange={(value) => {
                              setSelectedNewAccommodations(prev => ({
                                ...prev,
                                [member.camperId]: value
                              }));
                            }}
                            className="w-40"
                            size="small"
                            options={accommodations
                              .filter(a => a.accommodationId !== editingAccommodation?.accommodationId && a.isActive)
                              .map(a => ({
                                label: a.name,
                                value: a.accommodationId
                              }))}
                          />
                          <button
                            onClick={async () => {
                              const newAccommodationId = selectedNewAccommodations[member.camperId];
                              if (!newAccommodationId) {
                                toastError('Lỗi', 'Vui lòng chọn nơi ở mới');
                                return;
                              }
                              try {
                                await camperAccommodationService.updateCamperAccommodation(member.camperAccommodationId, {
                                  camperId: member.camperId,
                                  accommodationId: newAccommodationId
                                });
                                toastSuccess('Thành công', 'Đã chuyển trại viên sang nơi ở mới');
                                // Clear selection
                                setSelectedNewAccommodations(prev => {
                                  const newState = { ...prev };
                                  delete newState[member.camperId];
                                  return newState;
                                });
                                // Refresh accommodation members
                                const members = await camperAccommodationService.getCamperAccommodations({ 
                                  accommodationId: editingAccommodation?.accommodationId 
                                });
                                setAccommodationMembers(Array.isArray(members) ? members : []);
                              } catch (error: any) {
                                console.error('Failed to change accommodation:', error);
                                const errorMsg = error.response?.data?.message || error.message || 'Không thể chuyển nơi ở';
                                toastError('Lỗi', errorMsg);
                              }
                            }}
                            disabled={!selectedNewAccommodations[member.camperId]}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1 rounded bg-white border border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            Thay đổi
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có trại viên nào được phân chỗ ở</p>
              )}
            </div>
          )}
        </Form>
      </Modal>

      {/* Create Accommodation Type Modal */}
      <Modal
        title="Têm Loại Nơi Ở Mới"
        open={isTypeModalVisible}
        onOk={handleCreateType}
        onCancel={() => {
          setIsTypeModalVisible(false);
          typeForm.resetFields();
        }}
        confirmLoading={typeSubmitting}
        width={500}
        centered
        styles={{
          body: {
            padding: "16px 16px",
          },
        }}
        classNames={{
          header: "!pb-3",
          content: "accommodation-type-modal",
        }}
      >
        <style>{`
          .accommodation-type-modal .ant-modal-header {
            border-bottom: none;
          }
          .accommodation-type-modal .ant-modal-title {
            font-size: 16px;
            font-weight: 600;
          }
        `}</style>
        <Form
          form={typeForm}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            label="Tên Loại"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại nơi ở!' },
              { min: 1, message: 'Tên không được để trống!' },
            ]}
          >
            <Input placeholder="ví dụ: Ký túc xá, Lều, Cabin" />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[
              { required: false },
            ]}
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

export default AccommodationManagement;

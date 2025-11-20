import React, { useEffect, useState } from 'react';
import { Spin, Modal, Form, Input, InputNumber, Select } from 'antd';
import { Search, Plus, Edit2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import accommodationService, { type AccommodationResponseDto, type AccommodationRequestDto } from '../../../services/accommodationService';
import accommodationTypeService, { type AccommodationTypeResponseDto } from '../../../services/accommodationTypeService';
import staffService, { type StaffInfo } from '../../../services/staffService';
import campService, { type CampResponseDto } from '../../../services/campService';
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
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Type modal state
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [typeForm] = Form.useForm();
  const [typeSubmitting, setTypeSubmitting] = useState(false);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

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
        toastError('Error', 'Unable to load accommodations');
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
          toastError('Error', 'Unable to load supervisors');
        }
      };

      fetchStaff();
    }
  }, [isModalVisible, selectedCampId, toastError]);

  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">Please select a camp from the left sidebar to view accommodations</p>
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

  // Handle edit accommodation
  const handleEditClick = async (accommodation: AccommodationResponseDto) => {
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
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to load accommodation details:', error);
      toastError('Error', 'Failed to load accommodation details');
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
        toastSuccess('Success', 'Accommodation updated successfully');
      } else {
        // Create new accommodation
        await accommodationService.createAccommodation(payload);
        toastSuccess('Success', 'Accommodation created successfully');
      }

      // Refresh accommodations
      if (selectedCampId) {
        const accommodationsData = await accommodationService.getAccommodationsByCampId(selectedCampId);
        setAccommodations(accommodationsData);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting accommodation:', error);
      toastError('Error', 'Failed to save accommodation');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete accommodation
  const handleDelete = async (accommodationId: number) => {
    try {
      await accommodationService.deactivateAccommodation(accommodationId);
      toastSuccess('Success', 'Accommodation deleted successfully');
      // Refresh accommodations
      if (selectedCampId) {
        const accommodationsData = await accommodationService.getAccommodationsByCampId(selectedCampId);
        setAccommodations(accommodationsData);
      }
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error('Failed to delete accommodation:', error);
      toastError('Error', 'Failed to delete accommodation');
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

      toastSuccess('Success', 'Accommodation type created successfully');

      // Refresh accommodation types
      const typesData = await accommodationTypeService.getAllAccommodationTypes();
      setAccommodationTypes(typesData);

      // Set the newly created type as selected
      form.setFieldValue('accommodationTypeId', newType.id);

      setIsTypeModalVisible(false);
      typeForm.resetFields();
    } catch (error) {
      console.error('Error creating accommodation type:', error);
      toastError('Error', 'Failed to create accommodation type');
    } finally {
      setTypeSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Accommodations</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage and organize camp accommodations
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
                <h3 className="text-lg font-bold text-[#111827] mb-4">Search</h3>

                {/* Search */}
                <div className="mb-6">

                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="By name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Capacity Info */}
                {campData && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Capacity</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-[#111827]">{getTotalCapacity()}</span>
                      <span className="text-xs text-[#6B7280]">/ {campData.maxParticipants} max capacity</span>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Add Accommodation
                </button>


              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Found: {filteredAccommodations.length}
                  </h2>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Supervisor
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
                      {filteredAccommodations.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No accommodations found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredAccommodations.map((accommodation, index) => (
                          <tr
                            key={accommodation.accommodationId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {accommodation.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {getAccommodationTypeName(accommodation.accommodationTypeId)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {accommodation.capacity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {accommodation.supervisor?.fullName ? (
                                accommodation.supervisor.fullName
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accommodation.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {accommodation.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(accommodation)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Edit Accommodation"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <DeletePopover
                                  onConfirm={() => handleDelete(accommodation.accommodationId)}
                                  title="Delete Accommodation"
                                  message={`Are you sure you want to delete "${accommodation.name}"?`}
                                  buttonText="Delete"
                                  isOpen={deletePopoverOpen === accommodation.accommodationId}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(open ? accommodation.accommodationId : null)
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

      {/* Add/Edit Modal */}
      <Modal
        title={editingAccommodation ? 'Edit Accommodation' : 'Add New Accommodation'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingAccommodation(null);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={600}
        centered
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
            label="Accommodation Name"
            name="name"
            rules={[
              { required: true, message: 'Please input accommodation name!' },
              { min: 1, message: 'Name cannot be empty!' },
            ]}
          >
            <Input placeholder="e.g., Dorm A, Cabin 1" />
          </Form.Item>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accommodation Type *
            </label>
            <div className="flex gap-2">
              <Form.Item
                name="accommodationTypeId"
                rules={[
                  { required: true, message: 'Please select accommodation type!' },
                ]}
                className="flex-1 mb-0"
              >
                <Select
                  placeholder="Select accommodation type"
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
                title="Create new accommodation type"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <Form.Item
            label="Capacity"
            name="capacity"
            rules={[
              { required: true, message: 'Please input capacity!' },
              { type: 'number', min: 1, message: 'Capacity must be at least 1!' },
            ]}
          >
            <InputNumber min={1} placeholder="e.g., 50" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Supervisor"
            name="supervisorId"
            rules={[
              { required: true, message: 'Please select a supervisor!' },
            ]}
            help={!editingAccommodation?.supervisor ? '⚠️ No supervisor assigned' : ''}
          >
            <Select
              placeholder="Select a supervisor"
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
        </Form>
      </Modal>

      {/* Create Accommodation Type Modal */}
      <Modal
        title="Create New Accommodation Type"
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
            label="Type Name"
            name="name"
            rules={[
              { required: true, message: 'Please input accommodation type name!' },
              { min: 1, message: 'Name cannot be empty!' },
            ]}
          >
            <Input placeholder="e.g., Dormitory, Cabin, Tent" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: false },
            ]}
          >
            <Input.TextArea
              placeholder="Enter type description (optional)"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccommodationManagement;

import React, { useEffect, useState } from 'react';
import { Spin, Modal, Form, Input, InputNumber, Select } from 'antd';
import { Search, Plus, Edit2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import accommodationService, { type AccommodationResponseDto, type AccommodationRequestDto } from '../../../services/accommodationService';
import accommodationTypeService, { type AccommodationTypeResponseDto } from '../../../services/accommodationTypeService';
import campStaffService, { type StaffInfo } from '../../../services/campStaffService';
import DeletePopover from '../../../components/DeletePopover';

const AccommodationManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [accommodations, setAccommodations] = useState<AccommodationResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationTypeResponseDto[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<AccommodationResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedCampId) {
      setAccommodations([]);
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

        // Fetch available staff
        const staffData = await campStaffService.getAvailableStaff(selectedCampId);
        setStaffList(staffData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toastError('Error', 'Unable to load accommodations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId, toastError]);

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
  const handleEditClick = (accommodation: AccommodationResponseDto) => {
    setEditingAccommodation(accommodation);
    form.setFieldsValue({
      name: accommodation.name,
      accommodationTypeId: accommodation.accommodationTypeId,
      capacity: accommodation.capacity,
      supervisorId: accommodation.supervisorId,
    });
    setIsModalVisible(true);
  };

  // Get accommodation type name by ID
  const getAccommodationTypeName = (typeId: number) => {
    const type = accommodationTypes.find((t) => t.id === typeId);
    return type?.name || 'N/A';
  };

  // Get staff name by ID
  const getStaffName = (staffId: number) => {
    const staff = staffList.find((s) => s.userId === staffId);
    return staff?.fullName || 'N/A';
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
      ) : accommodations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#6B7280] text-lg mb-4">No accommodations found for this camp</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
          >
            <Plus size={16} />
            Add Accommodation
          </button>
        </div>
      ) : (
        <>
          {/* Filters and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Filters</h3>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                    Search
                  </label>
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

                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Add Accommodation
                </button>

                {/* Summary Stats */}
                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#6B7280]">Total: </span>
                      <span className="text-lg font-bold text-[#111827]">
                        {accommodations.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#6B7280]">Found: </span>
                      <span className="text-lg font-bold text-[#6366F1]">
                        {filteredAccommodations.length}
                      </span>
                    </div>
                  </div>
                </div>
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
                              {getStaffName(accommodation.supervisorId)}
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
      >
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

          <Form.Item
            label="Accommodation Type"
            name="accommodationTypeId"
            rules={[
              { required: true, message: 'Please select accommodation type!' },
            ]}
          >
            <Select
              placeholder="Select accommodation type"
              options={accommodationTypes.map((type) => ({
                label: type.name,
                value: type.id,
              }))}
            />
          </Form.Item>

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
          >
            <Select
              placeholder="Select a supervisor"
              options={staffList.map((staff) => ({
                label: staff.fullName,
                value: staff.userId,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccommodationManagement;

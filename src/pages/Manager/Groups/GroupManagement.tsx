import React, { useEffect, useState } from 'react';
import { Spin, message, Modal, Form, Input, InputNumber, Select } from 'antd';
import { Search, Plus, Edit2 } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import camperGroupService, { type CamperGroupResponseDto, type CamperGroupRequestDto } from '../../../services/camperGroupService';
import staffService, { type StaffInfo } from '../../../services/staffService';
import campService, { type CampResponseDto } from '../../../services/campService';
import DeletePopover from '../../../components/DeletePopover';

const GroupManagement: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastSuccess, toastError } = useNotification();

  const [groups, setGroups] = useState<CamperGroupResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [campData, setCampData] = useState<CampResponseDto | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CamperGroupResponseDto | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Delete popover state
  const [deletePopoverOpen, setDeletePopoverOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedCampId) {
      setGroups([]);
      setCampData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch groups
        const groupsData = await camperGroupService.getCamperGroupsByCampId(selectedCampId);
        setGroups(groupsData);

        // Fetch camp data
        const campInfo = await campService.getCampById(selectedCampId);
        setCampData(campInfo);
      } catch (error) {
        console.error('Failed to load data:', error);
        message.error('Unable to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCampId]);

  // Fetch available staff when modal opens
  useEffect(() => {
    if (isModalVisible && selectedCampId) {
      const fetchStaff = async () => {
        try {
          const staffData = await staffService.getAvailableGroupStaff(selectedCampId);
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
          <p className="text-indigo-700 text-base leading-relaxed">Please select a camp from the left sidebar to view groups</p>
        </div>
      </div>
    );
  }

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!group.groupName.toLowerCase().includes(query) &&
          !group.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  // Handle add group
  const handleAddClick = () => {
    setEditingGroup(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle edit group
  const handleEditClick = async (group: CamperGroupResponseDto) => {
    try {
      // Fetch complete group data
      const fullGroupData = await camperGroupService.getCamperGroupById(group.camperGroupId);
      setEditingGroup(fullGroupData);
      form.setFieldsValue({
        groupName: fullGroupData.groupName,
        description: fullGroupData.description,
        maxSize: fullGroupData.maxSize,
        supervisorId: fullGroupData.supervisorId,
        minAge: fullGroupData.minAge,
        maxAge: fullGroupData.maxAge,
      });
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to load group details:', error);
      toastError('Error', 'Failed to load group details');
    }
  };

  // Calculate total max size of groups
  const getTotalMaxSize = () => {
    return groups.reduce((sum, group) => sum + group.maxSize, 0);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: CamperGroupRequestDto = {
        groupName: values.groupName,
        description: values.description,
        maxSize: values.maxSize,
        supervisorId: values.supervisorId,
        campId: selectedCampId,
        minAge: values.minAge,
        maxAge: values.maxAge,
      };

      if (editingGroup) {
        // Update group
        await camperGroupService.updateCamperGroup(editingGroup.camperGroupId, payload);
        toastSuccess('Success', 'Group updated successfully');
      } else {
        // Create new group
        await camperGroupService.createCamperGroup(payload);
        toastSuccess('Success', 'Group created successfully');
      }

      // Refresh groups
      if (selectedCampId) {
        const groupsData = await camperGroupService.getCamperGroupsByCampId(selectedCampId);
        setGroups(groupsData);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting group:', error);
      toastError('Error', 'Failed to save group');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete group
  const handleDelete = async (groupId: number) => {
    try {
      await camperGroupService.deleteCamperGroup(groupId);
      toastSuccess('Success', 'Group deleted successfully');
      // Refresh groups
      if (selectedCampId) {
        const groupsData = await camperGroupService.getCamperGroupsByCampId(selectedCampId);
        setGroups(groupsData);
      }
      setDeletePopoverOpen(null);
    } catch (error) {
      console.error('Failed to delete group:', error);
      toastError('Error', 'Failed to delete group');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Camper Groups</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Manage and organize camper groups
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
                      placeholder="By name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Max Size Info */}
                {campData && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-[#6B7280] mb-1">Capacity</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-[#111827]">{getTotalMaxSize()}</span>
                      <span className="text-xs text-[#6B7280]">/ {campData.maxParticipants} max</span>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={handleAddClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-medium text-sm"
                >
                  <Plus size={16} />
                  Add Group
                </button>

              </div>
            </div>

            {/* Right Main Section - Table */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Found: {filteredGroups.length}
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
                          Group Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Size / Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Supervisor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredGroups.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-[#6B7280]"
                          >
                            No groups found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredGroups.map((group, index) => (
                          <tr
                            key={group.camperGroupId}
                            className="hover:bg-[#F9FAFB] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {group.groupName}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#374151] max-w-xs truncate">
                              {group.description}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Max {group.maxSize}
                              </span>
                              <span className="ml-2 text-xs text-[#6B7280]">
                                ({group.minAge} - {group.maxAge} yrs)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {group.supervisorName ? (
                                group.supervisorName
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditClick(group)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg hover:bg-[#E5E7EB] transition-all font-medium text-sm"
                                  title="Edit Group"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <DeletePopover
                                  onConfirm={() => handleDelete(group.camperGroupId)}
                                  title="Delete Group"
                                  message={`Are you sure you want to delete "${group.groupName}"?`}
                                  buttonText="Delete"
                                  isOpen={deletePopoverOpen === group.camperGroupId}
                                  onOpenChange={(open) =>
                                    setDeletePopoverOpen(open ? group.camperGroupId : null)
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
        title={editingGroup ? 'Edit Group' : 'Add New Group'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGroup(null);
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
            label="Group Name"
            name="groupName"
            rules={[
              { required: true, message: 'Please input group name!' },
              { min: 1, message: 'Group name cannot be empty!' },
            ]}
          >
            <Input placeholder="e.g., Group A1, Group B2" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Please input description!' },
            ]}
          >
            <Input.TextArea placeholder="e.g., Group for elementary students" rows={3} />
          </Form.Item>

          <Form.Item
            label="Max Size"
            name="maxSize"
            rules={[
              { required: true, message: 'Please input max size!' },
              { type: 'number', min: 1, message: 'Max size must be at least 1!' },
            ]}
          >
            <InputNumber min={1} placeholder="e.g., 30" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Supervisor"
            name="supervisorId"
            rules={[
              { required: false },
            ]}
            help={!editingGroup?.supervisorName ? '⚠️ No supervisor assigned' : ''}
          >
            <Select
              placeholder="Select a supervisor (optional)"
              allowClear
              options={staffList.map((staff) => ({
                label: staff.fullName,
                value: staff.userId,
              }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Min Age"
              name="minAge"
              rules={[
                { required: true, message: 'Please input min age!' },
                { type: 'number', min: 0, message: 'Min age must be >= 0!' },
              ]}
            >
              <InputNumber min={0} placeholder="e.g., 5" className="w-full" />
            </Form.Item>

            <Form.Item
              label="Max Age"
              name="maxAge"
              rules={[
                { required: true, message: 'Please input max age!' },
                { type: 'number', min: 0, message: 'Max age must be >= 0!' },
              ]}
            >
              <InputNumber min={0} placeholder="e.g., 15" className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManagement;
